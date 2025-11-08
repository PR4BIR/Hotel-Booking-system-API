import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservation } from '../api/endpoints';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSummary from '../components/payment/PaymentSummary';
import type { Reservation } from '../types';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentType, setPaymentType] = useState<'advance' | 'full'>('full');
  
  // Get reservation data from location state
  const { reservation } = location.state as { reservation: Reservation } || {};
  
  if (!reservation) {
    // Redirect if no reservation is found
    navigate('/reservations');
    return null;
  }
  
  // Calculate advance amount (e.g., 20% of total)
  const advanceAmount = reservation.totalPrice * 0.2;
  const paymentAmount = paymentType === 'advance' ? advanceAmount : reservation.totalPrice;
  
  const confirmReservationMutation = useMutation({
    mutationFn: (paymentDetails: any) => updateReservation(reservation.id, { 
      status: 'confirmed',
      paymentStatus: paymentType === 'advance' ? 'advance_paid' : 'fully_paid',
      paymentDate: new Date().toISOString(),
      advanceAmount: paymentType === 'advance' ? advanceAmount : undefined,
      remainingAmount: paymentType === 'advance' ? (reservation.totalPrice - advanceAmount) : 0,
      paymentMethod: paymentDetails.paymentMethod
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
      setPaymentSuccess(true);
      
      // Redirect to confirmation after 2 seconds
      setTimeout(() => {
        navigate(`/reservations/${reservation.id}`, { 
          state: { paymentSuccess: true } 
        });
      }, 2000);
    },
  });
  
  const handlePayment = async (paymentData: any) => {
    console.log('Processing payment with data:', paymentData);
    
    // In a real app, you would call a payment API here
    // For this demo, we'll just simulate a successful payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update reservation status to confirmed
    confirmReservationMutation.mutate(paymentData);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="text-5xl mb-4 text-green-500">✓</div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="mb-4">
            {paymentType === 'advance' 
              ? 'Your advance payment has been processed and your reservation is now confirmed.' 
              : 'Your payment has been processed and your reservation is now fully paid.'}
          </p>
          <p className="text-sm text-gray-600">Redirecting to your reservation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Complete Your Reservation</h1>
      
      <PaymentSummary reservation={reservation} />
      
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Payment Options</h3>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              checked={paymentType === 'advance'}
              onChange={() => setPaymentType('advance')}
              className="mr-2"
            />
            Pay Advance (${advanceAmount.toFixed(2)})
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              checked={paymentType === 'full'}
              onChange={() => setPaymentType('full')}
              className="mr-2"
            />
            Pay Full Amount (${reservation.totalPrice.toFixed(2)})
          </label>
        </div>
      </div>
      
      <PaymentForm 
        onSubmit={handlePayment}
        totalAmount={paymentAmount}
        isProcessing={confirmReservationMutation.isPending}
      />
      
      <p className="mt-4 text-center text-sm text-gray-500">
        {paymentType === 'advance' 
          ? `Your payment method will be charged $${advanceAmount.toFixed(2)} as advance payment. Remaining amount of $${(reservation.totalPrice - advanceAmount).toFixed(2)} will be due at check-in.`
          : `Your payment method will be charged the full amount of $${reservation.totalPrice.toFixed(2)}.`}
      </p>
    </div>
  );
};

export default Payment;