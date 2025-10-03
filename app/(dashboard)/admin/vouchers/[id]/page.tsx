// Nama file: app/(dashboard)/admin/vouchers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { CustomButton, Checkbox } from '@/components';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EditVoucherPage() {
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    const fetchVoucherData = async () => {
      try {
        const response = await axios.get('/api/vouchers');
        const voucher = response.data.find((v: any) => v.id === id);
        if (voucher) {
          setCode(voucher.code);
          setDiscountAmount(voucher.discountAmount.toString());
          setDiscountType(voucher.discountType);
          setIsActive(voucher.isActive);
          if (voucher.expiryDate) {
            setExpiryDate(format(new Date(voucher.expiryDate), 'yyyy-MM-dd'));
          }
        }
      } catch (error) {
        toast.error('Gagal memuat data voucher.');
      } finally {
        setLoading(false);
      }
    };
    fetchVoucherData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const data = {
      code: code.toUpperCase(),
      discountAmount: parseFloat(discountAmount),
      discountType,
      expiryDate: expiryDate || null,
      isActive,
    };

    try {
      await axios.put(`/api/vouchers/${id}`, data);
      toast.success('Voucher berhasil diperbarui!');
      router.push('/admin/vouchers');
    } catch (error) {
      toast.error('Gagal memperbarui voucher.');
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="p-8 text-center">Memuat formulir...</div>;
  }

  return (
    <div className="p-4 md:p-8 text-black">
      <h1 className="text-xl md:text-3xl font-bold mb-6">Edit Voucher</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
        {/* Formulir sama persis dengan halaman 'Tambah' */}
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">Kode Voucher</label>
              <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label htmlFor="discountAmount" className="block text-sm font-medium mb-1">Jumlah Diskon</label>
              <input type="number" id="discountAmount" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label htmlFor="discountType" className="block text-sm font-medium mb-1">Tipe Diskon</label>
              <select id="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Tanggal Kedaluwarsa (Opsional)</label>
              <input type="date" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div className="flex items-center pt-2">
                <Checkbox isChecked={isActive} onCheckedChange={() => setIsActive(!isActive)} />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium cursor-pointer" onClick={() => setIsActive(!isActive)}>Voucher Aktif</label>
            </div>
            <div className="flex items-center gap-x-4 pt-4">
              <CustomButton type="submit" text={isSubmitting ? 'Memperbarui...' : 'Perbarui'} disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4" />
              <Link href="/admin/vouchers">
                <CustomButton type="button" text="Batal" className="bg-gray-200 hover:bg-gray-300 text-black !py-2 !px-4" />
              </Link>
            </div>
        </form>
      </div>
    </div>
  );
}