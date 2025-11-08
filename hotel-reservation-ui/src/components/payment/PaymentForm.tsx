import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Create separate schemas for different payment methods
const cardPaymentSchema = z.object({
  paymentMethod: z.literal('card'),
  cardName: z.string().min(3, 'Name on card is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

const upiPaymentSchema = z.object({
  paymentMethod: z.literal('upi'),
  upiId: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, 'Please enter a valid UPI ID'),
});

// Combine schemas with discriminated union
const paymentSchema = z.discriminatedUnion('paymentMethod', [
  cardPaymentSchema,
  upiPaymentSchema,
]);

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  totalAmount: number;
  isProcessing: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, totalAmount, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'card'
    }
  });

  // Update the paymentMethod field when the payment method changes
  React.useEffect(() => {
    setValue('paymentMethod', paymentMethod);
  }, [paymentMethod, setValue]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-bold">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Select Payment Method</h3>
        <div className="flex space-x-4">
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-all ${
              paymentMethod === 'card' 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setPaymentMethod('card')}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')} 
                  className="h-4 w-4 text-blue-600"
                />
              </div>
              <span>Credit/Debit Card</span>
            </div>
          </div>
          
          <div 
            className={`p-4 border rounded-md cursor-pointer transition-all ${
              paymentMethod === 'upi' 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setPaymentMethod('upi')}
          >
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center">
                <input 
                  type="radio" 
                  checked={paymentMethod === 'upi'} 
                  onChange={() => setPaymentMethod('upi')} 
                  className="h-4 w-4 text-blue-600"
                />
              </div>
              <span>UPI</span>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('paymentMethod')} />
        
        {paymentMethod === 'card' && (
          <>
            <div className="mb-4">
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                Name on Card
              </label>
              <input
                id="cardName"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
                {...register('cardName')}
              />
              {'cardName' in errors && (
                <p className="mt-1 text-red-600 text-sm">{(errors as any).cardName?.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890123456"
                maxLength={16}
                {...register('cardNumber')}
              />
              {'cardNumber' in errors && (
                <p className="mt-1 text-red-600 text-sm">{(errors as any).cardNumber?.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (MM/YY)
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MM/YY"
                  maxLength={5}
                  {...register('expiryDate')}
                />
                {'expiryDate' in errors && (
                  <p className="mt-1 text-red-600 text-sm">{(errors as any).expiryDate?.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                  maxLength={4}
                  {...register('cvv')}
                />
                {'cvv' in errors && (
                  <p className="mt-1 text-red-600 text-sm">{(errors as any).cvv?.message}</p>
                )}
              </div>
            </div>
          </>
        )}
        
        {paymentMethod === 'upi' && (
          <div className="mb-6">
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID
            </label>
            <input
              id="upiId"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="yourname@upi"
              {...register('upiId')}
            />
            {'upiId' in errors && (
              <p className="mt-1 text-red-600 text-sm">{(errors as any).upiId?.message}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Enter your UPI ID (e.g., yourname@paytm, name@okicici)
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isProcessing ? 'Processing Payment...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;