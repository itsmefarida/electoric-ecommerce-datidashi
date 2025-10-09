'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CustomButton } from '@/components';
import { FaEdit, FaTrash } from 'react-icons/fa';
// Mengganti react-toastify dengan react-hot-toast untuk konsistensi pop-up
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

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVouchers, setSelectedVouchers] = useState<Set<string>>(new Set());

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

  // Logika untuk menentukan status voucher: Active, Inactive, atau Expired.
  const getVoucherStatus = (voucher: Voucher) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (!voucher.isActive) {
      return { label: 'Inactive', colorClass: 'bg-red-100 text-red-800' };
    }

    if (voucher.expiryDate) {
      const expiry = new Date(voucher.expiryDate);
      expiry.setHours(0, 0, 0, 0); 
      
      if (expiry < today) {
        return { label: 'Expired', colorClass: 'bg-orange-100 text-orange-800' };
      }
    }
    
    return { label: 'Active', colorClass: 'bg-green-100 text-green-800' };
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // --- LOGIKA MULTI-SELEKSI ---

  // Fungsi untuk menangani seleksi per baris
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

  // Fungsi untuk menangani Seleksi Semua
  const handleSelectAll = () => {
    if (selectedVouchers.size === vouchers.length) {
      setSelectedVouchers(new Set()); // Hapus semua
    } else {
      setSelectedVouchers(new Set(vouchers.map(v => v.id))); // Pilih semua
    }
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
  const handleBulkDelete = async () => {
    // Pencegahan error jika tombol diklik saat disabled
    if (selectedVouchers.size === 0) {
      toast.error('Select at least one voucher to delete.'); 
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedVouchers.size} selected vouchers? This action cannot be undone.`)) { 
      try {
        // Menjalankan semua promise delete secara paralel
        await Promise.all(Array.from(selectedVouchers).map(id => 
          axios.delete(`/api/vouchers/${id}`)
        ));

        toast.success(`${selectedVouchers.size} vouchers successfully deleted!`); 
        setSelectedVouchers(new Set());
        fetchVouchers();
      } catch (error: any) {
        // Ini akan menangani error jika salah satu atau lebih panggilan API gagal
        const errorMessage = error.response?.data?.message || 'Failed to delete multiple vouchers. Please check your connection or permissions.'; 
        toast.error(errorMessage);
      }
    }
  };

  const isAllSelected = vouchers.length > 0 && selectedVouchers.size === vouchers.length;
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
        <div className="flex gap-x-3">
            {/* Tombol Bulk Delete: Diaktifkan/dinonaktifkan oleh isAnySelected */}
            <CustomButton
              buttonType="button"
              text={`Delete Selected (${selectedVouchers.size})`} 
              className={`!py-2 !px-4 ${isAnySelected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              disabled={!isAnySelected}
              onClick={handleBulkDelete}
              title="Delete all selected vouchers" 
            />
            {/* Tombol Tambah Voucher */}
            <Link href="/admin/vouchers/new">
              <CustomButton
                buttonType="button"
                text="Add New Voucher" 
                className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4"
                title="Navigate to the new voucher creation page" 
              />
            </Link>
        </div>
      </div>

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
                    title="Select/Deselect all vouchers" 
                 />
              </th>
              <th className="px-6 py-3 font-medium">Code</th> 
              <th className="px-6 py-3 font-medium">Discount Amount</th> 
              <th className="px-6 py-3 font-medium">Type</th> 
              <th className="px-6 py-3 font-medium">Expiry Date</th> 
              <th className="px-6 py-3 font-medium">Status</th> 
              <th className="px-6 py-3 font-medium text-right">Actions</th> 
            </tr>
          </thead>
          <tbody>
            {vouchers.length > 0 ? (
              vouchers.map((voucher) => (
                <tr 
                  key={voucher.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer" 
                  // Memungkinkan baris diklik untuk seleksi (UX improvement)
                  onClick={() => handleSelectVoucher(voucher.id)}
                >
                  {/* Data Checkbox individual */}
                  <td 
                      className="px-3 py-4 w-10" 
                      // Menghentikan event agar klik pada baris tidak mengganggu checkbox
                      onClick={(e) => e.stopPropagation()} 
                  >
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 border-gray-300 cursor-pointer"
                      checked={selectedVouchers.has(voucher.id)}
                      // Menggunakan onChange untuk memicu logika update state
                      onChange={() => handleSelectVoucher(voucher.id)}
                      // Juga menghentikan propagasi event pada input itu sendiri (Double check)
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
                          e.stopPropagation(); // Pastikan klik tombol ini tidak memicu event baris
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
                  No vouchers have been added yet. 
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
