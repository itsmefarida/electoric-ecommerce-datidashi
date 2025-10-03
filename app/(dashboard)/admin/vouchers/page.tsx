// Nama file: app/(dashboard)/admin/vouchers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { CustomButton } from '@/components'; // Menggunakan komponen kustom Anda
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('/api/vouchers');
      setVouchers(response.data);
    } catch (error) {
      toast.error('Gagal memuat data voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (voucherId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
      try {
        await axios.delete(`/api/vouchers/${voucherId}`);
        toast.success('Voucher berhasil dihapus!');
        fetchVouchers();
      } catch (error) {
        toast.error('Gagal menghapus voucher.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat data voucher...</div>;
  }

  return (
    <div className="p-4 md:p-8 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-3xl font-bold">Manajemen Voucher</h1>
        <Link href="/admin/vouchers/new">
          <CustomButton
            text="Tambah Voucher"
            className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4" // Sesuaikan styling jika perlu
          />
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 font-medium">Kode</th>
              <th className="px-6 py-3 font-medium">Jumlah Diskon</th>
              <th className="px-6 py-3 font-medium">Tipe</th>
              <th className="px-6 py-3 font-medium">Kedaluwarsa</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length > 0 ? (
              vouchers.map((voucher) => (
                <tr key={voucher.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{voucher.code}</td>
                  <td className="px-6 py-4">
                    {voucher.discountType === 'percentage'
                      ? `${voucher.discountAmount}%`
                      : `Rp${voucher.discountAmount.toLocaleString('id-ID')}`}
                  </td>
                  <td className="px-6 py-4 capitalize">{voucher.discountType}</td>
                  <td className="px-6 py-4">
                    {voucher.expiryDate
                      ? new Date(voucher.expiryDate).toLocaleDateString('id-ID')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        voucher.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {voucher.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Link href={`/admin/vouchers/${voucher.id}`}>
                      <button className="p-2 hover:bg-gray-200 rounded-md">
                        <FaEdit className="text-blue-500" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="p-2 hover:bg-gray-200 rounded-md"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  Belum ada voucher yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}