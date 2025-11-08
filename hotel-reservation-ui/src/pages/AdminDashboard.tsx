// If this file already exists, update it to include the AdminNav component

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReservations, fetchRooms } from '../api/endpoints';
import Spinner from '../components/common/Spinner';
import AdminNav from '../components/admin/AdminNav';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { data: reservations, isLoading: isLoadingReservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations
  });
  
  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });
  
  if (isLoadingReservations || isLoadingRooms) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }
  
  // Calculate statistics
  const totalReservations = reservations?.length || 0;
  const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter(r => r.availability).length || 0;
  
  // Calculate revenue
  const totalRevenue = reservations?.reduce((sum, reservation) => {
    if (reservation.status === 'canceled') return sum;
    if (reservation.paymentStatus === 'fully_paid') return sum + reservation.totalPrice;
    if (reservation.paymentStatus === 'advance_paid') return sum + (reservation.advanceAmount || 0);
    return sum;
  }, 0) || 0;
  
  // Get today's check-ins and check-outs
  const today = new Date().toISOString().split('T')[0];
  const todayCheckIns = reservations?.filter(r => 
    r.checkInDate.split('T')[0] === today && r.status !== 'canceled'
  ).length || 0;
  
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <AdminNav />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Reservations</h3>
          <p className="text-3xl font-bold">{totalReservations}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingReservations}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Today's Check-ins</h3>
          <p className="text-3xl font-bold text-green-600">{todayCheckIns}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Recent Reservations</h2>
            <Link to="/admin/reservations" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          
          {reservations && reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.slice(0, 5).map(reservation => (
                    <tr key={reservation.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{reservation.guestName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{reservation.roomType}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No reservations found.</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Room Status</h2>
            <Link to="/admin/rooms" className="text-sm text-blue-600 hover:underline">
              Manage Rooms
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-green-800 text-2xl font-bold">{availableRooms}</p>
              <p className="text-green-600">Available</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-800 text-2xl font-bold">{totalRooms - availableRooms}</p>
              <p className="text-red-600">Occupied</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Occupancy Rate</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0).toFixed(0)}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-600 mt-1">
              {(totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms) * 100 : 0).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;