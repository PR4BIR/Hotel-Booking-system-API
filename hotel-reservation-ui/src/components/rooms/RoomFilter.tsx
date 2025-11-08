import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface RoomFilterProps {
  onFilter: (filters: RoomFilterData) => void;
  onReset: () => void;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
}

interface RoomFilterData {
  checkIn: string;
  checkOut: string;
  priceRange: [number, number];
  capacity: number;
  roomType: string;
}

const RoomFilter: React.FC<RoomFilterProps> = ({ onFilter, onReset, defaultCheckIn, defaultCheckOut }) => {
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

export default RoomFilter;