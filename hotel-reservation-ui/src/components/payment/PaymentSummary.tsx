import React from 'react';
import type { Reservation } from '../../types';

interface PaymentSummaryProps {
  reservation: Reservation;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ reservation }) => {
  const checkInDate = new Date(reservation.checkInDate);
  const checkOutDate = new Date(reservation.checkOutDate);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="font-semibold mb-4">Reservation Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Room:</span>
          <span>{reservation.roomType}</span>
        </div>
        <div className="flex justify-between">
          <span>Check-in:</span>
          <span>{checkInDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Check-out:</span>
          <span>{checkOutDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Number of Nights:</span>
          <span>{nights}</span>
        </div>
        <div className="flex justify-between">
          <span>Price per Night:</span>
          <span>${(reservation.totalPrice / nights).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-medium">
          <span>Total Amount:</span>
          <span>${reservation.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;