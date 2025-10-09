// Nama file: app/(dashboard)/admin/vouchers/new/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CustomButton } from '@/components';
import { Checkbox } from '@/components';
import { DashboardSidebar } from '@/components';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewVoucherPage() {
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null); 
    setCodeError(null);
    
    const amount = parseFloat(discountAmount);

    // Error Prevention: Client-side validation
    if (!code.trim()) {
        setValidationError('Voucher code cannot be empty.'); // DITERJEMAHKAN
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        setValidationError('Discount amount must be a positive number.'); // DITERJEMAHKAN
        return;
    }
    if (discountType === 'percentage' && amount > 100) {
        setValidationError('Percentage discount cannot be more than 100%.'); // DITERJEMAHKAN
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (expiryDate && expiryDate < today) {
        setValidationError('Expiry date cannot be in the past.'); // DITERJEMAHKAN
        return;
    }


    if (isSubmitting) return;
    setIsSubmitting(true);

    const data = {
      code: code.toUpperCase(),
      discountAmount: amount,
      discountType,
      expiryDate: expiryDate || null,
      isActive,
    };

    try {
      await axios.post('/api/vouchers', data);
      toast.success('Voucher successfully added!'); // DITERJEMAHKAN
      router.push('/admin/vouchers');
    } catch (error: any) {
      setIsSubmitting(false);
      
      const apiMessage = error.response?.data?.message;

      // Recognize Error: Logika untuk mendiagnosis error duplikasi kode
      if (apiMessage && (apiMessage.toLowerCase().includes('duplicate') || apiMessage.toLowerCase().includes('unique') || apiMessage.toLowerCase().includes('v001'))) {
          // Jika pesan API mengindikasikan error duplikasi kode
          //setCodeError('This voucher code is already in use. Please use a different code.'); // DITERJEMAHKAN
          toast.error('Failed: Voucher Code already exists.'); // DITERJEMAHKAN
      } else {
          // Fallback ke error umum jika tidak terdeteksi sebagai error duplikasi
          const fallbackMessage = apiMessage || 'Failed to add voucher. The code may already be in use or there is a server issue.'; // DITERJEMAHKAN
          toast.error(fallbackMessage);
          setValidationError(fallbackMessage);
      }
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="p-4 md:p-8 text-black">
        <h1 className="text-xl md:text-3xl font-bold mb-6">Add New Voucher</h1> {/* DITERJEMAHKAN */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
            {/* Display general Validation Error */}
            {validationError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
                    <p className="font-bold">General Input Error:</p> 
                    <p className="text-sm">{validationError}</p>
                </div>
            )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">
                Voucher Code {/* DITERJEMAHKAN */}
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value);
                    if (validationError) setValidationError(null);
                    if (codeError) setCodeError(null); // Clear code error saat input berubah
                }}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 
                            ${codeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                required
                title="Enter a unique voucher code (Example: FREE10, DISKON50)" // DITERJEMAHKAN
              />
              {/* Pesan Error Spesifik di bawah field Kode (Recognize Error) */}
              {codeError && (
                  <p className="mt-1 text-xs text-red-500">
                      ⚠️ **Error: {codeError}** {/* DITERJEMAHKAN */}
                  </p>
              )}
            </div>
            <div>
              <label htmlFor="discountAmount" className="block text-sm font-medium mb-1">
                Discount Amount {/* DITERJEMAHKAN */}
              </label>
              <div className="relative flex items-center"> 
                {discountType === 'fixed' && (
                  <span className="absolute left-0 pl-3 py-2 text-gray-500 pointer-events-none">
                    Rp
                  </span>
                )}
                <input
                  type="number"
                  id="discountAmount"
                  value={discountAmount}
                  onChange={(e) => {
                      setDiscountAmount(e.target.value);
                      if (validationError) setValidationError(null);
                  }}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      discountType === 'fixed' ? 'pl-9' : 'pl-3' 
                  }`}
                  required
                  min="1"
                  title={`Enter the discount amount. If Percentage, enter 1-100. If Fixed Amount, enter the Rupiah value.`} // DITERJEMAHKAN
                />
                {discountType === 'percentage' && (
                  <span className="absolute right-0 pr-3 py-2 text-gray-500 pointer-events-none">
                    %
                  </span>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="discountType" className="block text-sm font-medium mb-1">
                Discount Type {/* DITERJEMAHKAN */}
              </label>
              <select
                id="discountType"
                value={discountType}
                onChange={(e) => {
                    setDiscountType(e.target.value);
                    if (validationError) setValidationError(null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Select whether the discount is a percentage or a fixed amount" // DITERJEMAHKAN
              >
                <option value="percentage">Percentage (%)</option> {/* DITERJEMAHKAN */}
                <option value="fixed">Fixed Amount (Rp)</option> {/* DITERJEMAHKAN */}
              </select>
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
                Expiry Date (Optional) {/* DITERJEMAHKAN */}
              </label>
              <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => {
                    setExpiryDate(e.target.value);
                    if (validationError) setValidationError(null);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
                title="Select the date after which the voucher cannot be used (Leave blank if there is no expiration)" // DITERJEMAHKAN
              />
            </div>
            <div className="flex items-center pt-2">
              <Checkbox 
                text="Active Voucher" // DITERJEMAHKAN
                stateValue={isActive} 
                setStateValue={setIsActive}
                id="isActive"
                title="Check to activate the voucher immediately after saving" // DITERJEMAHKAN
              />
            </div>
            <div className="flex items-center gap-x-4 pt-4">
              <CustomButton
                buttonType="submit"
                text={isSubmitting ? 'Saving...' : 'Save'} // DITERJEMAHKAN
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4"
                title="Save the new voucher to the system" // DITERJEMAHKAN
              />
              <Link href="/admin/vouchers">
                <CustomButton
                    buttonType="button"
                    text="Cancel" // DITERJEMAHKAN
                    className="bg-gray-200 hover:bg-gray-300 text-black !py-2 !px-4"
                    title="Cancel the process and return to the voucher list" // DITERJEMAHKAN
                  />
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}