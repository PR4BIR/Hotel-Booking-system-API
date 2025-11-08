import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservation, updateReservation, deleteReservation } from '../api/endpoints';
import Spinner from '../components/common/Spinner';

const ReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Check if we're coming from a successful payment
  const paymentSuccess = location.state?.paymentSuccess;
  
  const reservationId = parseInt(id || '0');
  
  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => getReservation(reservationId),
    enabled: !!reservationId,
  });
  
  const cancelMutation = useMutation({
    mutationFn: () => updateReservation(reservationId, { status: 'canceled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setShowCancelDialog(false);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: () => deleteReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      navigate('/reservations');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>Could not load the reservation details. The reservation may not exist or you don't have permission to view it.</p>
        <Link to="/reservations" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to reservations
        </Link>
      </div>
    );
  }

  const checkInDate = new Date(reservation.checkInDate);
  const checkOutDate = new Date(reservation.checkOutDate);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const canCancel = ['pending', 'confirmed'].includes(reservation.status);
  const canDelete = reservation.status === 'canceled';

  return (
    <div>
      {paymentSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Payment processed successfully! Your reservation has been updated.</p>
          </div>
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reservation Details</h1>
        <div className="space-x-2">
          {canCancel && (
            <button 
              onClick={() => setShowCancelDialog(true)}
              className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              Cancel Reservation
            </button>
          )}
          <Link 
            to="/reservations" 
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold">{reservation.roomType}</h2>
              <p className="text-gray-600">Room #{reservation.roomId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                reservation.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : reservation.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : reservation.status === 'canceled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
              
              {reservation.isCheckedIn && !reservation.isCheckedOut && (
                <span className="inline-block px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Checked In
                </span>
              )}
              
              {reservation.isCheckedOut && (
                <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                  Checked Out
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Reservation Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Booking Date</span>
                <span>{new Date(reservation.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Check-in Date</span>
                <span>{checkInDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Check-out Date</span>
                <span>{checkOutDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Number of Nights</span>
                <span>{nights}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Total Price</span>
                <span className="font-semibold">${reservation.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Guest Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Guest Name</span>
                <span>{reservation.guestName}</span>
              </div>
              
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Email</span>
                <span>{reservation.email}</span>
              </div>
            </div>
            
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-medium mb-2">Payment Status</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between mb-2">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    reservation.paymentStatus === 'fully_paid' 
                      ? 'text-green-600' 
                      : reservation.paymentStatus === 'advance_paid'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {reservation.paymentStatus === 'fully_paid' 
                      ? 'Fully Paid' 
                      : reservation.paymentStatus === 'advance_paid'
                      ? 'Advance Paid'
                      : 'Pending Payment'}
                  </span>
                </div>
                
                {reservation.advanceAmount && reservation.advanceAmount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Advance Paid:</span>
                    <span className="font-medium">${reservation.advanceAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {reservation.remainingAmount && reservation.remainingAmount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span>Remaining Amount:</span>
                    <span className="font-medium">${reservation.remainingAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span className="font-medium">${reservation.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 space-x-2 flex">
                  {(reservation.paymentStatus === 'fully_paid' || reservation.paymentStatus === 'advance_paid') && (
                    <Link 
                      to={`/invoice/${reservation.id}`} 
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Invoice
                    </Link>
                  )}
                  
                  {reservation.paymentStatus === 'advance_paid' && (
                    <Link 
                      to="/payment" 
                      state={{ reservation }} 
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Pay Remaining
                    </Link>
                  )}
                  
                  {(!reservation.paymentStatus || reservation.paymentStatus === 'pending') && (
                    <Link 
                      to="/payment" 
                      state={{ reservation }} 
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Make Payment
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {canCancel && (
              <div className="mt-6">
                <Link 
                  to={`/reservations/${reservation.id}/edit`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Modify Reservation
                </Link>
              </div>
            )}
            
            {canDelete && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently delete this reservation?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="block w-full text-center px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                >
                  Delete Reservation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Reservation</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                No, Keep It
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetail;