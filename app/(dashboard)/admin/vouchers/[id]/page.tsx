// Nama file: app/(dashboard)/admin/vouchers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { CustomButton, Checkbox } from '@/components';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function EditVoucherPage() {
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    const fetchVoucherData = async () => {
      try {
        const response = await axios.get(`/api/vouchers/${id}`);
        const voucher = response.data
        if (voucher) {
          setCode(voucher.code);
          setDiscountAmount(voucher.discountAmount.toString());
          setDiscountType(voucher.discountType);
          setIsActive(voucher.isActive);
          if (voucher.expiryDate) {
            setExpiryDate(format(new Date(voucher.expiryDate), 'yyyy-MM-dd'));
          } else {
            setExpiryDate('');
          }
        }
      } catch (error) {
        toast.error('Failed to load voucher data. Ensure the voucher ID is correct.'); // DITERJEMAHKAN
      } finally {
        setLoading(false);
      }
    };
    fetchVoucherData();
  }, [id]);

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
      await axios.patch(`/api/vouchers/${id}`, data);
      toast.success('Voucher successfully updated!'); // DITERJEMAHKAN
      router.push('/admin/vouchers');
    } catch (error: any) {
      setIsSubmitting(false);

      const apiMessage = error.response?.data?.message;

      // Recognize Error: Logika untuk mendiagnosis error duplikasi kode
      if (apiMessage && (apiMessage.toLowerCase().includes('duplicate') || apiMessage.toLowerCase().includes('unique') || apiMessage.toLowerCase().includes('v001'))) {
          // Jika pesan API mengindikasikan error duplikasi kode
          setCodeError('This voucher code is already used by another voucher. Please use a unique code.'); // DITERJEMAHKAN
          toast.error('Failed: Voucher Code not unique.'); // DITERJEMAHKAN
      } else {
          // Fallback ke error umum
          const fallbackMessage = apiMessage || 'Failed to update voucher. Please check the voucher code or other data.'; // DITERJEMAHKAN
          toast.error(fallbackMessage);
          setValidationError(fallbackMessage);
      }
    }
  };
  
  if (loading) {
    return <div className="p-8 text-center">Loading form...</div>; // DITERJEMAHKAN
  }

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
        <div className="p-4 md:p-8 text-black">
        <h1 className="text-xl md:text-3xl font-bold mb-6">Edit Voucher</h1> 
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
                <label htmlFor="code" className="block text-sm font-medium mb-1">Voucher Code</label> {/* DITERJEMAHKAN */}
                <input 
                    type="text" 
                    id="code" 
                    value={code} 
                    onChange={(e) => {
                        setCode(e.target.value);
                        if (validationError) setValidationError(null);
                        if (codeError) setCodeError(null);
                    }} 
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 
                                ${codeError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    required 
                    title="Voucher code. Change the code carefully as it may affect current users." // DITERJEMAHKAN
                />
                {/* Pesan Error Spesifik di bawah field Kode (Recognize Error) */}
                {codeError && (
                    <p className="mt-1 text-xs text-red-500">
                        ⚠️ **Error: {codeError}** {/* DITERJEMAHKAN */}
                    </p>
                )}
              </div>
              <div>
                <label htmlFor="discountAmount" className="block text-sm font-medium mb-1">Discount Amount</label> {/* DITERJEMAHKAN */}
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
                        className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
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
                <label htmlFor="discountType" className="block text-sm font-medium mb-1">Discount Type</label> {/* DITERJEMAHKAN */}
                <select 
                    id="discountType" 
                    value={discountType} 
                    onChange={(e) => {
                        setDiscountType(e.target.value);
                        if (validationError) setValidationError(null);
                    }} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    title="Select whether the discount is a percentage or a fixed amount" // DITERJEMAHKAN
                >
                  <option value="percentage">Percentage (%)</option> {/* DITERJEMAHKAN */}
                  <option value="fixed">Fixed Amount (Rp)</option> {/* DITERJEMAHKAN */}
                </select>
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Expiry Date (Optional)</label> {/* DITERJEMAHKAN */}
                <input 
                    type="date" 
                    id="expiryDate" 
                    value={expiryDate} 
                    onChange={(e) => {
                        setExpiryDate(e.target.value);
                        if (validationError) setValidationError(null);
                    }} 
                    className="w-full border border-gray-300 rounded-md px-3 py-2" 
                    title="Select a new expiry date (Leave blank to remove the expiry date)" // DITERJEMAHKAN
                />
              </div>
              <div className="flex items-center pt-2">
                  <Checkbox 
                    text="Active Voucher" // DITERJEMAHKAN
                    stateValue={isActive} 
                    setStateValue={setIsActive} 
                    id="isActive"
                    title="Check to activate the voucher, uncheck to deactivate." // DITERJEMAHKAN
                  />
              </div>
              <div className="flex items-center gap-x-4 pt-4">
                <CustomButton 
                    buttonType="submit" 
                    text={isSubmitting ? 'Updating...' : 'Update'} // DITERJEMAHKAN
                    disabled={isSubmitting} 
                    className="bg-blue-500 hover:bg-blue-600 text-white !py-2 !px-4" 
                    title="Apply changes to this voucher" // DITERJEMAHKAN
                />
                <Link href="/admin/vouchers">
                  <CustomButton 
                    buttonType="button" 
                    text="Cancel" // DITERJEMAHKAN
                    className="bg-gray-200 hover:bg-gray-300 text-black !py-2 !px-4"
                    title="Cancel changes and return to the voucher list" // DITERJEMAHKAN
                  />
                </Link>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}