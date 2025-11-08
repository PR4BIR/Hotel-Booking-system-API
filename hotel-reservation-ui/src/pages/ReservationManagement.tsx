import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReservations } from '../api/endpoints';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import ReservationActions from '../components/admin/ReservationActions';

const ReservationManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }
  
  const filteredReservations = reservations?.filter(reservation => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return reservation.status === 'confirmed' && !reservation.isCheckedOut;
    }
    if (filterStatus === 'pending') {
      return reservation.status === 'pending';
    }
    if (filterStatus === 'completed') {
      return reservation.status === 'completed' || reservation.isCheckedOut;
    }
    if (filterStatus === 'canceled') {
      return reservation.status === 'canceled';
    }
    return true;
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reservation Management</h1>
        
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Reservations</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservation ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations?.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/reservations/${reservation.id}`} 
                      className="text-blue-600 hover:underline"
                    >
                      #{reservation.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{reservation.guestName}</div>
                    <div className="text-sm text-gray-500">{reservation.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reservation.roomType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{new Date(reservation.checkInDate).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">to {new Date(reservation.checkOutDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reservation.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : reservation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : reservation.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {reservation.status}
                    </span>
                    {reservation.isCheckedIn && !reservation.isCheckedOut && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Checked In
                      </span>
                    )}
                    {reservation.isCheckedOut && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        Checked Out
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reservation.paymentStatus === 'fully_paid' 
                        ? 'bg-green-100 text-green-800' 
                        : reservation.paymentStatus === 'advance_paid'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.paymentStatus || 'Pending'}
                    </span>
                    {reservation.paymentStatus === 'advance_paid' && (
                      <div className="text-sm text-gray-500 mt-1">
                        ${reservation.remainingAmount?.toFixed(2)} due
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReservationActions 
                      reservation={reservation}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;