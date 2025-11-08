import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReservations } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: fetchReservations
  });

  const upcomingReservations = reservations?.filter(res => 
    new Date(res.checkInDate) >= new Date() && res.status !== 'canceled'
  ).slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.username}!</h2>
        <p className="text-gray-600 mb-4">
          This is your hotel reservation dashboard. Here you can manage your bookings,
          create new reservations, and view your account information.
        </p>
        <Link to="/reservations/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          New Reservation
        </Link>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Upcoming Reservations</h2>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          An error occurred while loading your reservations.
        </div>
      ) : upcomingReservations && upcomingReservations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingReservations.map(reservation => (
            <div key={reservation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold">{reservation.roomType}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reservation.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reservation.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                <span className="block mb-1">Check-in: {new Date(reservation.checkInDate).toLocaleDateString()}</span>
                <span className="block">Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}</span>
              </p>
              <Link to={`/reservations/${reservation.id}`} className="text-blue-600 text-sm hover:underline">
                View details
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You don't have any upcoming reservations.</p>
          <Link to="/reservations/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Book Now
          </Link>
        </div>
      )}
      
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/reservations" className="text-blue-600 hover:underline">View All Reservations</Link>
            </li>
            <li>
              <Link to="/profile" className="text-blue-600 hover:underline">Update Profile</Link>
            </li>
            <li>
              <Link to="/help" className="text-blue-600 hover:underline">Help Center</Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Account Summary</h3>
          <div className="space-y-2 text-gray-600">
            <p>Email: {user?.email}</p>
            <p>Account Type: {user?.role}</p>
            <p>Total Reservations: {reservations?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;