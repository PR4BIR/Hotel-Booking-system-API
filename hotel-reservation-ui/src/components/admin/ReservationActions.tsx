import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReservation } from '../../api/endpoints';
import type { Reservation } from '../../types';

interface ReservationActionsProps {
  reservation: Reservation;
  onSuccess?: () => void;
}

const ReservationActions: React.FC<ReservationActionsProps> = ({ 
  reservation, 
  onSuccess 
}) => {
  const queryClient = useQueryClient();
  
  const checkInMutation = useMutation({
    mutationFn: () => updateReservation(reservation.id, { isCheckedIn: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      if (onSuccess) onSuccess();
    }
  });
  
  const checkOutMutation = useMutation({
    mutationFn: () => updateReservation(reservation.id, { 
      isCheckedOut: true,
      status: 'completed'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      if (onSuccess) onSuccess();
    }
  });
  
  // Can only check in if confirmed and advance is paid
  const canCheckIn = reservation.status === 'confirmed' && 
                    (reservation.paymentStatus === 'advance_paid' || 
                     reservation.paymentStatus === 'fully_paid') && 
                    !reservation.isCheckedIn;
  
  // Can only check out if checked in
  const canCheckOut = reservation.isCheckedIn && !reservation.isCheckedOut;
  
  return (
    <div className="space-y-2">
      {canCheckIn && (
        <button
          onClick={() => checkInMutation.mutate()}
          disabled={checkInMutation.isPending}
          className="w-full px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
        >
          {checkInMutation.isPending ? 'Processing...' : 'Check In Guest'}
        </button>
      )}
      
      {canCheckOut && (
        <button
          onClick={() => checkOutMutation.mutate()}
          disabled={checkOutMutation.isPending}
          className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {checkOutMutation.isPending ? 'Processing...' : 'Check Out Guest'}
        </button>
      )}
      
      {reservation.paymentStatus === 'advance_paid' && (
        <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
          <p>Remaining payment: ${reservation.remainingAmount?.toFixed(2) || '0.00'}</p>
          <button className="text-blue-600 underline text-xs mt-1">
            Collect Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationActions;