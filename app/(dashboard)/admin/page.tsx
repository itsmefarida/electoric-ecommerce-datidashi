'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CustomButton } from '@/components';
import { FaEdit, FaTrash, FaSortUp, FaSortDown } from 'react-icons/fa';
import toast from 'react-hot-toast'; 
import { DashboardSidebar } from '@/components';
import { format } from 'date-fns';

interface Voucher {
  id: string;
  code: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  expiryDate?: string;
  isActive: boolean;
}

// Tipe untuk state sorting
type SortKey = keyof Voucher | 'status' | 'code';
type SortOrder = 'asc' | 'desc';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());
  
  // State untuk Sorting
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: SortOrder } | null>(null);

  // State untuk Filtering
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [searchTerm, setSearchTerm] = useState('');


  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers');
      setVouchers(response.data);
    } catch (error) {
      toast.error('Failed to load voucher data.'); 
    } finally {
      setLoading(false);
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (!voucher.isActive) {
      return { label: 'Inactive', value: 'inactive', colorClass: 'bg-red-100 text-red-800' };
    }

    if (voucher.expiryDate) {
      const expiry = new Date(voucher.expiryDate);
      expiry.setHours(0, 0, 0, 0); 
      
      if (expiry < today) {
        return { label: 'Expired', value: 'expired', colorClass: 'bg-orange-100 text-orange-800' };
      }
    }
    
    return { label: 'Active', value: 'active', colorClass: 'bg-green-100 text-green-800' };
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // --- LOGIKA SORTING & FILTERING ---

  const sortedAndFilteredVouchers = useMemo(() => {
    let filterableVouchers = [...vouchers];

    // 1. Filtering
    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        filterableVouchers = filterableVouchers.filter(v =>
            v.code.toLowerCase().includes(lowerCaseSearch) ||
            v.discountType.toLowerCase().includes(lowerCaseSearch) ||
            v.discountAmount.toString().includes(lowerCaseSearch)
        );
    }

    if (filterStatus !== 'all') {
        filterableVouchers = filterableVouchers.filter(v => 
            getVoucherStatus(v).value === filterStatus
        );
    }

    if (filterType !== 'all') {
        filterableVouchers = filterableVouchers.filter(v => v.discountType === filterType);
    }

    // 2. Sorting
    if (sortConfig !== null) {
      filterableVouchers.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'status') {
            aValue = getVoucherStatus(a).value;
            bValue = getVoucherStatus(b).value;
        } else if (sortConfig.key === 'expiryDate') {
            aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
            bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
        } else if (sortConfig.key === 'code' || sortConfig.key === 'discountType') {
            aValue = a[sortConfig.key].toLowerCase();
            bValue = b[sortConfig.key].toLowerCase();
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filterableVouchers;
  }, [vouchers, sortConfig, filterStatus, filterType, searchTerm]);

  const requestSort = (key: SortKey) => {
    let direction: SortOrder = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Fungsi DELETE SATU ITEM (Single Delete)
  const handleDelete = async (voucherId: string) => {
    if (window.confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) { 
      try {
        await axios.delete(`/api/vouchers/${voucherId}`);
        toast.success('Voucher successfully deleted!'); 
        fetchVouchers();
        setSelectedVouchers(prev => {
          const newSet = new Set(prev);
          newSet.delete(voucherId);
          return newSet;
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete voucher.'; 
        toast.error(errorMessage);
      }
    }
  };
  
  // Fungsi HAPUS MASAL (Bulk Delete)
  const handleSelectVoucher = (voucherId: string) => {
    setSelectedVouchers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(voucherId)) {
        newSet.delete(voucherId);
      } else {
        newSet.add(voucherId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedVouchers.size === sortedAndFilteredVouchers.length) {
      setSelectedVouchers(new Set());
    } else {
      setSelectedVouchers(new Set(sortedAndFilteredVouchers.map(v => v.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVouchers.size === 0) {
      toast.error('Select at least one voucher to delete.'); 
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedVouchers.size} selected vouchers? This action cannot be undone.`)) { 
      try {
        await Promise.all(Array.from(selectedVouchers).map(id => 
          axios.delete(`/api/vouchers/${id}`)
        ));

        toast.success(`${selectedVouchers.size} vouchers successfully deleted!`); 
        setSelectedVouchers(new Set());
        fetchVouchers();
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete multiple vouchers. Please check your connection or permissions.'; 
        toast.error(errorMessage);
      }
    }
  };
  
  // Helper untuk icon sorting
  const getSortIcon = (key: SortKey) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      if (sortConfig.direction === 'asc') return <FaSortUp className="ml-1 inline" />;
      return <FaSortDown className="ml-1 inline" />;
  };

  const isAllSelected = sortedAndFilteredVouchers.length > 0 && selectedVouchers.size === sortedAndFilteredVouchers.length;
  const isAnySelected = selectedVouchers.size > 0;

  if (loading) {
    return <div className="p-8 text-center">Loading voucher data...</div>; 
  }

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="flex-1 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-y-4">
          <h1 className="text-xl md:text-3xl font-bold">Voucher Management</h1> 
          <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Tombol Bulk Delete */}
              <CustomButton
                buttonType="button"
                text={`Delete Selected (${selectedVouchers.size})`} 
                className={`!py-2 !px-4 text-sm transition-colors ${isAnySelected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!isAnySelected}
                onClick={handleBulkDelete}
                title="Delete all selected vouchers" 
              />
              {/* Tombol Tambah Voucher */}
              <Link href="/admin/vouchers/new">
                <CustomButton
                  buttonType="button"
                  text="Add New Voucher" 
                  className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4 text-sm"
                  title="Navigate to the new voucher creation page" 
                />
              </Link>
          </div>
        </div>

        {/* --- Area Filter dan Pencarian --- */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <input 
                type="text"
                placeholder="Search by code, amount, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-auto flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {/* Filter Status */}
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'expired')}
                className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
                title="Filter by voucher status"
            >
                <option value="all">Filter by Status (All)</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
            </select>
            {/* Filter Type */}
            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'percentage' | 'fixed')}
                className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 text-sm"
                title="Filter by discount type"
            >
                <option value="all">Filter by Type (All)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rp)</option>
            </select>
        </div>
        {/* --- End Area Filter dan Pencarian --- */}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                {/* Kolom Checkbox All */}
                <th className="px-3 py-3 w-10"> 
                  <input 
                      type="checkbox" 
                      className="rounded text-blue-600 border-gray-300 cursor-pointer" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      title="Select/Deselect all visible vouchers" 
                  />
                </th>
                {/* Kolom Sortable: Code */}
                <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-200 transition-colors" 
                    onClick={() => requestSort('code')}
                >
                    Code {getSortIcon('code')}
                </th> 
                {/* Kolom Sortable: Discount Amount */}
                <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-200 transition-colors" 
                    onClick={() => requestSort('discountAmount')}
                >
                    Discount Amount {getSortIcon('discountAmount')}
                </th> 
                <th className="px-6 py-3 font-medium">Type</th> 
                {/* Kolom Sortable: Expiry Date */}
                <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => requestSort('expiryDate')}
                >
                    Expiry Date {getSortIcon('expiryDate')}
                </th> 
                {/* Kolom Sortable: Status */}
                <th 
                    className="px-6 py-3 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => requestSort('status')}
                >
                    Status {getSortIcon('status')}
                </th> 
                <th className="px-6 py-3 font-medium text-right">Actions</th> 
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredVouchers.length > 0 ? (
                sortedAndFilteredVouchers.map((voucher) => (
                  <tr 
                    key={voucher.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer" 
                    onClick={() => handleSelectVoucher(voucher.id)}
                  >
                    {/* Data Checkbox individual */}
                    <td 
                        className="px-3 py-4 w-10" 
                        onClick={(e) => e.stopPropagation()} 
                    >
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-600 border-gray-300 cursor-pointer"
                        checked={selectedVouchers.has(voucher.id)}
                        onChange={() => handleSelectVoucher(voucher.id)}
                        onClick={(e) => e.stopPropagation()} 
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{voucher.code}</td>
                    <td className="px-6 py-4">
                      {voucher.discountType === 'percentage'
                        ? `${voucher.discountAmount}%`
                        : `Rp${voucher.discountAmount.toLocaleString('id-ID')}`}
                    </td>
                    <td className="px-6 py-4 capitalize">{voucher.discountType}</td>
                    <td className="px-6 py-4">
                      {voucher.expiryDate
                        ? format(new Date(voucher.expiryDate), 'dd/MM/yyyy') 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getVoucherStatus(voucher).colorClass}`}>
                        {getVoucherStatus(voucher).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <Link href={`/admin/vouchers/${voucher.id}`} onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="p-2 hover:bg-gray-200 rounded-md" 
                          title="Edit Voucher"
                          aria-label="Edit Voucher"
                        > 
                          <FaEdit className="text-blue-500" />
                        </button>
                      </Link>
                      <button
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleDelete(voucher.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-md"
                        title="Delete Voucher" 
                        aria-label="Delete Voucher"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    {vouchers.length === 0 && !searchTerm && filterStatus === 'all' && filterType === 'all'
                        ? 'No vouchers have been added yet.'
                        : 'No vouchers match the current filter or search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
