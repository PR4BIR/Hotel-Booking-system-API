import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRooms } from '../api/endpoints';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import type { Room } from '../types/index';

type SortOption = 'price-asc' | 'price-desc' | 'name' | 'capacity';
type FilterOptions = {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
};

// Fallback sample rooms for demonstration if API fails
const fallbackRooms: Room[] = [
  {
    id: 1,
    name: 'Deluxe Ocean Suite',
    description: 'Luxury suite with breathtaking ocean views and premium amenities',
    price: 299,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 2,
    amenities: ['Ocean View', 'King Bed', 'WiFi', 'Mini Bar', 'Room Service'],
    type: 'Suite',
    availability: true
  },
  {
    id: 2,
    name: 'Premium City View',
    description: 'Elegant room with stunning city skyline views and modern furnishings',
    price: 199,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 2,
    amenities: ['City View', 'Queen Bed', 'WiFi', 'Work Desk', 'Air Conditioning'],
    type: 'Deluxe',
    availability: true
  },
  {
    id: 3,
    name: 'Comfort Standard Room',
    description: 'Comfortable and well-appointed room perfect for business or leisure',
    price: 129,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 2,
    amenities: ['WiFi', 'Double Bed', 'TV', 'Coffee Maker', 'Safe'],
    type: 'Standard',
    availability: true
  },
  {
    id: 4,
    name: 'Executive Business Suite',
    description: 'Spacious suite designed for business travelers with executive amenities',
    price: 349,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 3,
    amenities: ['Business Center', 'Meeting Room', 'WiFi', 'Executive Lounge', 'Concierge'],
    type: 'Executive',
    availability: true
  },
  {
    id: 5,
    name: 'Romantic Honeymoon Suite',
    description: 'Perfect romantic getaway with luxury amenities and intimate setting',
    price: 399,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 2,
    amenities: ['Jacuzzi', 'Champagne', 'Rose Petals', 'Private Balcony', 'Room Service'],
    type: 'Honeymoon',
    availability: true
  },
  {
    id: 6,
    name: 'Family Connect Room',
    description: 'Spacious connecting rooms ideal for families with children',
    price: 249,
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ],
    capacity: 4,
    amenities: ['Connecting Rooms', 'Kids Area', 'WiFi', 'Kitchenette', 'Game Console'],
    type: 'Family',
    availability: true
  }
];

const Rooms: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  const [usingFallback, setUsingFallback] = useState(false);

  const { data: rooms, isLoading, error } = useQuery<Room[]>({
    queryKey: ['rooms', filters],
    queryFn: fetchRooms,
    retry: 1
  });

  useEffect(() => {
    if (error) {
      setUsingFallback(true);
    }
  }, [error]);

  // Use fallback if error, otherwise use API data
  const displayRooms = rooms && !error ? rooms : fallbackRooms;

  // Extract unique room types from the data
  useEffect(() => {
    if (Array.isArray(displayRooms)) {
      const types = Array.from(new Set(displayRooms.map(room => room.type))) as string[];
      setAvailableRoomTypes(types);
    }
  }, [displayRooms]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[name as keyof FilterOptions];
      setFilters(newFilters);
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: name === 'type' ? value : Number(value)
      }));
    }
  };

  // Sort the rooms based on selected option
  const sortedRooms = React.useMemo(() => {
    if (!displayRooms) return [];
    let filtered = Array.isArray(displayRooms) ? [...displayRooms] : [];
    // Apply filters
    if (filters.type) filtered = filtered.filter(r => r.type === filters.type);
    if (filters.minPrice !== undefined) filtered = filtered.filter(r => r.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) filtered = filtered.filter(r => r.price <= filters.maxPrice!);
    if (filters.capacity !== undefined) filtered = filtered.filter(r => r.capacity >= filters.capacity!);

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'capacity':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });
  }, [displayRooms, filters, sortBy]);

  // Filter reset function
  const resetFilters = () => {
    setFilters({});
    setSortBy('price-asc');
  };

  if (isLoading && !usingFallback) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="text-center py-6 mb-6 bg-blue-50 rounded-lg border border-blue-100">
          <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h2 className="text-lg font-bold text-blue-800 mb-1">We're currently experiencing technical difficulties with our room data. Showing sample accommodations for demonstration.</h2>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
            <p className="text-gray-600 mt-1">Find your perfect stay from our selection of luxury rooms</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
                <option value="capacity">Capacity</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-5">
                {/* Room Type Filter */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={filters.type || ''}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Types</option>
                    {availableRoomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filters */}
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min="0"
                    value={filters.minPrice || ''}
                    onChange={handleFilterChange}
                    placeholder="Min price"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    min="0"
                    value={filters.maxPrice || ''}
                    onChange={handleFilterChange}
                    placeholder="Max price"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Capacity Filter */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    min="1"
                    value={filters.capacity || ''}
                    onChange={handleFilterChange}
                    placeholder="Guests"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Room listing */}
          <div className="lg:col-span-3">
            {sortedRooms.length === 0 ? (
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center">
                <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No rooms match your filters</h3>
                <p className="text-gray-600 mb-3">Try adjusting your search criteria or reset filters</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative">
                      <img
                        src={room.image || `https://placehold.co/600x400?text=${room.name}`}
                        alt={room.name}
                        className="w-full h-48 object-cover"
                        onError={e => {
                          e.currentTarget.src = `https://placehold.co/600x400?text=${room.name}`;
                        }}
                      />
                      <div className="absolute top-0 right-0 m-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                          {room.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
                      <p className="text-gray-600 my-2 line-clamp-2">{room.description}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Up to {room.capacity} guests
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                          </svg>
                          {(room as any).beds || 1} {(room as any).beds === 1 ? 'bed' : 'beds'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <span className="font-bold text-xl text-blue-700">${room.price}<span className="text-gray-500 text-sm font-normal">/night</span></span>
                        <Link
                          to={`/rooms/${room.id}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Rooms;