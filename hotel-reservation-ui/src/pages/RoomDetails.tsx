import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRoom } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const { isAuthenticated } = useAuth();
  
  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoom(id || ''),
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }
  
  if (error || !room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h2>
        <p className="text-gray-600 mb-6">The room you're looking for doesn't exist or there was an error loading the data.</p>
        <Link
          to="/rooms"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
        >
          Browse All Rooms
        </Link>
      </div>
    );
  }
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { 
        state: { 
          from: `/new-reservation?roomId=${room.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`,
          message: 'Please log in to book a reservation'
        } 
      });
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    navigate(`/new-reservation?roomId=${room.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
  };
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/rooms" className="text-blue-600 hover:underline">
          ← Back to all rooms
        </Link>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <img 
              src={room.image || `https://placehold.co/800x600?text=${room.name}`}
              alt={room.name}
              className="w-full h-80 object-cover"
            />
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{room.name}</h1>
              <p className="text-gray-600 mb-4">{room.description}</p>
              
              <h2 className="font-semibold mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities?.map((amenity, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold">${room.price}</span>
                <span className="text-gray-600">per night</span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
              >
                {isAuthenticated ? 'Book Now' : 'Login to Book'}
              </button>
              
              {!isAuthenticated && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  You need to be logged in to make a reservation
                </p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Room Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Type: {room.type}</li>
                <li>Capacity: {room.capacity} guests</li>
                <li>Size: Spacious</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;