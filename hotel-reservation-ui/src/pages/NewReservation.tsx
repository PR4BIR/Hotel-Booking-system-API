import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, createReservation } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

// Define form validation schema
const reservationSchema = z.object({
  roomId: z.string().min(1, 'Please select a room'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  guestName: z.string().min(3, 'Guest name must be at least 3 characters'),
}).refine(data => {
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  return checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// Define filter data interface
interface RoomFilterData {
  checkIn: string;
  checkOut: string;
  priceRange: [number, number];
  capacity: number;
  roomType: string;
}

// Room Filter Component - replace the existing RoomFilter component
const RoomFilter: React.FC<{
  onFilter: (filters: RoomFilterData) => void;
  onReset: () => void;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}> = ({ onFilter, onReset, defaultCheckIn, defaultCheckOut }) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const { register, handleSubmit, reset, setValue } = useForm<RoomFilterData>({
    defaultValues: {
      checkIn: defaultCheckIn || '',
      checkOut: defaultCheckOut || '',
      capacity: 1,
      roomType: ''
    }
  });
  
  useEffect(() => {
    if (defaultCheckIn) setValue('checkIn', defaultCheckIn);
    if (defaultCheckOut) setValue('checkOut', defaultCheckOut);
  }, [defaultCheckIn, defaultCheckOut, setValue]);
  
  const handleReset = () => {
    reset();
    setPriceRange([0, 1000]);
    onReset();
  };
  
  const onSubmit = (data: RoomFilterData) => {
    onFilter({
      ...data,
      priceRange
    });
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b border-gray-100 pb-2">Find Your Perfect Room</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="transition-all duration-200 hover:transform hover:scale-[1.02]">
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <div className="relative">
              <input
                id="checkIn"
                type="date"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
                {...register('checkIn')}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="transition-all duration-200 hover:transform hover:scale-[1.02]">
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <div className="relative">
              <input
                id="checkOut"
                type="date"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('checkOut')}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-5 bg-gray-50 p-4 rounded-lg transition-all duration-300 hover:bg-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range: <span className="text-blue-600 font-bold">${priceRange[0]} - ${priceRange[1]}</span>
          </label>
          <div className="flex space-x-4 px-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="w-full accent-blue-600"
            />
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="transition-all duration-200 hover:transform hover:scale-[1.02]">
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <div className="relative">
              <select
                id="capacity"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                {...register('capacity')}
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5+ People</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="transition-all duration-200 hover:transform hover:scale-[1.02]">
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <div className="relative">
              <select
                id="roomType"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                {...register('roomType')}
              >
                <option value="">Any Type</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="executive">Executive</option>
              </select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Available Rooms
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

const NewReservation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [filters, setFilters] = useState<RoomFilterData | null>(null);
  
  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });
  
  const createReservationMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      navigate('/reservations');
    },
  });
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestName: user?.username || '',
    }
  });
  
  // Watch form values to calculate total price
  const watchRoomId = watch('roomId');
  const watchCheckInDate = watch('checkInDate');
  const watchCheckOutDate = watch('checkOutDate');
  
  
// Update this useEffect around line 242
  
  useEffect(() => {
    if (!rooms) return;
    
    if (!filters) {
      setFilteredRooms(rooms);
      return;
    }
    
    const filtered = rooms.filter(room => {
      // Filter by price
      if (room.price < filters.priceRange[0] || room.price > filters.priceRange[1]) {
        return false;
      }
      
      // Filter by room type if specified
      if (filters.roomType && room.type !== filters.roomType) {
        return false;
      }
      
      // Filter by capacity if specified
      if (filters.capacity && room.capacity < parseInt(filters.capacity.toString())) {
        return false;
      }
      
      // Additional availability checks would go here
      
      return true;
    });
    
    setFilteredRooms(filtered); // Make sure this line is present
    
    // Update form values with filter dates
    if (filters.checkIn) setValue('checkInDate', filters.checkIn);
    if (filters.checkOut) setValue('checkOutDate', filters.checkOut);
    
  }, [filters, rooms, setValue]);
  
  // Set initial filtered rooms
  useEffect(() => {
    if (rooms) {
      setFilteredRooms(rooms);
    }
  }, [rooms]);
  
  useEffect(() => {
    if (watchRoomId && rooms) {
      const selectedRoom = rooms.find(room => room.id === parseInt(watchRoomId));
      if (selectedRoom) {
        setSelectedRoomPrice(selectedRoom.price);
      }
    }
  }, [watchRoomId, rooms]);
  
  useEffect(() => {
    if (watchCheckInDate && watchCheckOutDate && selectedRoomPrice) {
      const checkIn = new Date(watchCheckInDate);
      const checkOut = new Date(watchCheckOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        setTotalPrice(nights * selectedRoomPrice);
      }
    }
  }, [watchCheckInDate, watchCheckOutDate, selectedRoomPrice]);
  
  const handleFilter = (filterData: RoomFilterData) => {
    setFilters(filterData);
  };
  
  const handleResetFilter = () => {
    setFilters(null);
  };
  
  const onSubmit = async (data: ReservationFormData) => {
    try {
      if (!user) return;
      
      const roomId = parseInt(data.roomId);
      const selectedRoom = rooms?.find(room => room.id === roomId);
      
      if (!selectedRoom) return;
      
      await createReservationMutation.mutateAsync({
        roomId,
        roomType: selectedRoom.name,
        guestName: data.guestName,
        email: user.email,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        totalPrice,
        status: 'pending'
      });
    } catch (error) {
      console.error('Failed to create reservation:', error);
    }
  };
  
  if (isLoadingRooms) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Reservation</h1>
      
      {/* Add Room Filter Component */}
      <RoomFilter 
        onFilter={handleFilter} 
        onReset={handleResetFilter}
        defaultCheckIn={watchCheckInDate}
        defaultCheckOut={watchCheckOutDate}
      />
      
      {filteredRooms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
          <p>No rooms available with the selected criteria. Please adjust your filters.</p>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <div 
                key={room.id} 
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  watchRoomId === room.id.toString() ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setValue('roomId', room.id.toString())}
              >
                <img 
                  src={room.image || `https://placehold.co/600x400?text=${room.name}`} 
                  alt={room.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{room.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {room.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm my-2">{room.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">${room.price}/night</span>
                    <span className="text-sm text-gray-600">Capacity: {room.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Room Selection</h2>
              
              <div className="mb-4">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Room Type
                </label>
                <select
                  id="roomId"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('roomId')}
                >
                  <option value="">-- Select a room --</option>
                  {filteredRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - ${room.price}/night
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="mt-1 text-red-600 text-sm">{errors.roomId.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  id="checkInDate"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('checkInDate')}
                />
                {errors.checkInDate && (
                  <p className="mt-1 text-red-600 text-sm">{errors.checkInDate.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  id="checkOutDate"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={watchCheckInDate || new Date().toISOString().split('T')[0]}
                  {...register('checkOutDate')}
                />
                {errors.checkOutDate && (
                  <p className="mt-1 text-red-600 text-sm">{errors.checkOutDate.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Guest Information</h2>
              
              <div className="mb-4">
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name
                </label>
                <input
                  id="guestName"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('guestName')}
                />
                {errors.guestName && (
                  <p className="mt-1 text-red-600 text-sm">{errors.guestName.message}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <h3 className="font-medium mb-2">Reservation Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Room Price:</span>
                    <span>${selectedRoomPrice}/night</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="font-medium">Total Price:</span>
                    <span className="font-medium">${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isSubmitting || createReservationMutation.isPending}
            >
              {isSubmitting || createReservationMutation.isPending ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReservation;