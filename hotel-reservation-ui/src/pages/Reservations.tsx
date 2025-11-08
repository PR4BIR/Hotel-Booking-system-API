import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReservations } from '../api/endpoints';
import Spinner from '../components/common/Spinner';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'canceled' | 'completed';

const Reservations: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations
  });

  const filteredReservations = reservations?.filter(reservation => 
    filterStatus === 'all' || reservation.status === filterStatus
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Reservations</h1>
        <Link to="/reservations/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Reservation
        </Link>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setFilterStatus('canceled')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'canceled' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Canceled
            </button>
            <button 
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'completed' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="p-6 text-red-700">
            An error occurred while loading your reservations.
          </div>
        ) : filteredReservations && filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-gray-600 text-sm font-medium">Room</th>
                  <th className="px-6 py-3 text-gray-600 text-sm font-medium">Dates</th>
                  <th className="px-6 py-3 text-gray-600 text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-gray-600 text-sm font-medium">Price</th>
                  <th className="px-6 py-3 text-gray-600 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.map(reservation => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{reservation.roomType}</div>
                      <div className="text-sm text-gray-500">Room #{reservation.roomId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{new Date(reservation.checkInDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to</div>
                        <div>{new Date(reservation.checkOutDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        reservation.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : reservation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : reservation.status === 'canceled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${reservation.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/reservations/${reservation.id}`} 
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        View
                      </Link>
                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <Link 
                          to={`/reservations/${reservation.id}/edit`} 
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No reservations found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;