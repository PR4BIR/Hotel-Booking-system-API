import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchFeaturedRooms, fetchTestimonials, fetchPromotions } from '../api/endpoints';
import RoomFilter from '../components/rooms/RoomFilter';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

// Interface definitions
interface Room {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  capacity: number;
  amenities?: string[];
  type?: string;
  room_type?: string;
  price_per_night?: number;
  room_number?: string;
}

interface Testimonial {
  id: number;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  image?: string;
  code: string;
}

interface RoomFilterData {
  checkIn: string;
  checkOut: string;
  priceRange: [number, number];
  capacity: number;
  roomType: string;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [fallbackRoomsUsed, setFallbackRoomsUsed] = useState(false);
  
  // Fallback data for when API fails
  const fallbackRooms: Room[] = [
    {
      id: 'fallback-1',
      name: 'Deluxe Ocean Suite',
      description: 'Luxury suite with breathtaking ocean views and premium amenities',
      price: 299,
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 2,
      amenities: ['Ocean View', 'King Bed', 'WiFi', 'Mini Bar', 'Room Service'],
      type: 'Suite'
    },
    {
      id: 'fallback-2',
      name: 'Premium City View',
      description: 'Elegant room with stunning city skyline views and modern furnishings',
      price: 199,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 2,
      amenities: ['City View', 'Queen Bed', 'WiFi', 'Work Desk', 'Air Conditioning'],
      type: 'Deluxe'
    },
    {
      id: 'fallback-3',
      name: 'Comfort Standard Room',
      description: 'Comfortable and well-appointed room perfect for business or leisure',
      price: 129,
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 2,
      amenities: ['WiFi', 'Double Bed', 'TV', 'Coffee Maker', 'Safe'],
      type: 'Standard'
    },
    {
      id: 'fallback-4',
      name: 'Executive Business Suite',
      description: 'Spacious suite designed for business travelers with executive amenities',
      price: 349,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 3,
      amenities: ['Business Center', 'Meeting Room', 'WiFi', 'Executive Lounge', 'Concierge'],
      type: 'Executive'
    },
    {
      id: 'fallback-5',
      name: 'Romantic Honeymoon Suite',
      description: 'Perfect romantic getaway with luxury amenities and intimate setting',
      price: 399,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 2,
      amenities: ['Jacuzzi', 'Champagne', 'Rose Petals', 'Private Balcony', 'Room Service'],
      type: 'Honeymoon'
    },
    {
      id: 'fallback-6',
      name: 'Family Connect Room',
      description: 'Spacious connecting rooms ideal for families with children',
      price: 249,
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      capacity: 4,
      amenities: ['Connecting Rooms', 'Kids Area', 'WiFi', 'Kitchenette', 'Game Console'],
      type: 'Family'
    }
  ];
  
  // Fetch featured rooms with fallback
  const { data: apiRooms, isLoading: isLoadingRooms, error: roomsError } = useQuery<Room[]>({
    queryKey: ['featuredRooms'],
    queryFn: fetchFeaturedRooms,
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (roomsError) {
      console.log('🏨 Featured rooms API failed, using fallback data:', roomsError);
      setFallbackRoomsUsed(true);
    }
  }, [roomsError]);
  
  // Use API data if available, otherwise use fallback
  const featuredRooms = apiRooms || (roomsError ? fallbackRooms : []);
  
  // Fetch testimonials with fallback
  const { data: apiTestimonials } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    retry: 1
  });
  
  const fallbackTestimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'Absolutely incredible experience! The service was impeccable and the room was stunning.',
      date: '2024-12-15',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff'
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 5,
      comment: 'Perfect location and beautiful hotel. The staff went above and beyond our expectations.',
      date: '2024-12-10',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=3b82f6&color=fff'
    },
    {
      id: 3,
      name: 'Emma Williams',
      rating: 4,
      comment: 'Great value for money. Clean rooms, friendly staff, and excellent amenities.',
      date: '2024-12-05',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Williams&background=3b82f6&color=fff'
    }
  ];
  
  const testimonials = apiTestimonials || fallbackTestimonials;
  
  // Fetch promotions with fallback
  const { data: apiPromotions } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: fetchPromotions,
    retry: 1
  });
  
  const fallbackPromotions: Promotion[] = [
    {
      id: 1,
      title: 'Weekend Getaway Special',
      description: 'Book your weekend stay and enjoy 20% off our luxury accommodations',
      discount: 20,
      validUntil: '2025-12-31',
      code: 'WEEKEND20',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 2,
      title: 'Early Bird Discount',
      description: 'Book 30 days in advance and save 15% on your luxurious stay',
      discount: 15,
      validUntil: '2025-12-31',
      code: 'EARLY15',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  ];
  
  const promotions = apiPromotions || fallbackPromotions;
  
  // Auto-slide for the hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Debug log for room data
  useEffect(() => {
    console.log('🏠 Home component rooms data:', {
      apiRooms,
      roomsError,
      fallbackRoomsUsed,
      finalRooms: featuredRooms
    });
  }, [apiRooms, roomsError, fallbackRoomsUsed, featuredRooms]);
  
  // Handle room filtering
  const handleRoomFilter = (filters: RoomFilterData) => {
    const params = new URLSearchParams();
    
    if (filters.checkIn) params.append('checkIn', filters.checkIn);
    if (filters.checkOut) params.append('checkOut', filters.checkOut);
    if (filters.priceRange && filters.priceRange.length === 2) {
      params.append('minPrice', filters.priceRange[0].toString());
      params.append('maxPrice', filters.priceRange[1].toString());
    }
    if (filters.capacity) params.append('capacity', filters.capacity.toString());
    if (filters.roomType) params.append('roomType', filters.roomType);
    
    navigate({
      pathname: '/rooms',
      search: params.toString()
    });
  };
  
  const handleResetFilter = () => {
    // No action needed, the form will be reset in the component
  };
  
  // Handle testimonial scrolling
  const [testimonialsPosition, setTestimonialsPosition] = useState(0);
  
  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (!Array.isArray(testimonials) || testimonials.length === 0) return;
    
    if (direction === 'left') {
      setTestimonialsPosition(prev => Math.max(prev - 1, 0));
    } else {
      setTestimonialsPosition(prev => Math.min(prev + 1, (testimonials ?? []).length - 1));
    }
  };
  
  // Normalize room data to handle different API response formats
  const normalizeRoom = (room: Room): Room => {
    return {
      id: room.id,
      name: room.name || `${room.room_type || room.type || 'Room'} - ${room.room_number || room.id}`,
      description: room.description || `Beautiful ${(room.room_type || room.type || 'standard').toLowerCase()} room with modern amenities`,
      price: room.price || room.price_per_night || 0,
      image: room.image || `https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`,
      capacity: room.capacity || 2,
      amenities: room.amenities || ['WiFi', 'Air Conditioning', 'TV'],
      type: room.type || room.room_type || 'Standard'
    };
  };
  
  // Loading state - only show if actually loading and no fallback data
  if (isLoadingRooms && !fallbackRoomsUsed) {
    return (
      <div className="flex justify-center items-center p-12" data-testid="loading-indicator">
        <Spinner />
      </div>
    );
  }
  
  // Hero images
  const heroImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  ];
  
  const heroTitles = [
    'Experience Luxury Like Never Before',
    'Your Perfect Getaway Awaits',
    'Unforgettable Moments, Exceptional Service'
  ];
  
  const heroDescriptions = [
    'Indulge in our premium amenities and world-class service.',
    'Discover comfort and elegance in every corner of our hotel.',
    'Create lasting memories in our beautiful accommodations.'
  ];
  
  return (
    <div className="pb-12">
      {/* Show notification if using fallback data */}
      {fallbackRoomsUsed && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                We're currently experiencing technical difficulties with our room data. Showing sample accommodations for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Slideshow */}
      <div className="relative h-[80vh] overflow-hidden">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: activeSlide === index ? 1 : 0,
              scale: activeSlide === index ? 1 : 1.1
            }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          </motion.div>
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {heroTitles[activeSlide]}
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-center mb-8 max-w-3xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {heroDescriptions[activeSlide]}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to={user ? "/new-reservation" : "/rooms"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center"
            >
              <span>{user ? "Book Your Stay" : "Browse Rooms"}</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
        
        {/* Slideshow controls */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3">
          {[0, 1, 2].map(index => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-3 h-3 rounded-full ${
                activeSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
              } transition-all duration-300`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Welcome Message & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Luxury Hotel</h2>
                  <p className="text-gray-600 mb-4">
                    Experience the perfect blend of comfort, luxury, and exceptional service. Our hotel offers a 
                    unique experience that caters to both business and leisure travelers.
                  </p>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">5-star luxury experience</span>
                  </div>
                  
                  {user ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <p className="text-blue-800 font-medium">
                        Welcome back, {user.username}! We're delighted to see you again.
                      </p>
                      <Link 
                        to="/reservations" 
                        className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        View your reservations
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300">
                      <p className="text-gray-800">
                        Sign in to manage your reservations and get exclusive offers.
                      </p>
                      <Link 
                        to="/login" 
                        className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        Sign in
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
              
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <RoomFilter onFilter={handleRoomFilter} onReset={handleResetFilter} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Rooms</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of exceptional accommodations, each designed to provide 
            you with the ultimate comfort and luxury experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(featuredRooms) && featuredRooms.map((room, index) => {
            const normalizedRoom = normalizeRoom(room);
            return (
              <motion.div
                key={normalizedRoom.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <img 
                    src={normalizedRoom.image}
                    alt={normalizedRoom.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                    }}
                  />
                  <div className="absolute top-0 right-0 m-4 z-20">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ${normalizedRoom.price}/night
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {normalizedRoom.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {normalizedRoom.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {normalizedRoom.amenities && Array.isArray(normalizedRoom.amenities) ? 
                      normalizedRoom.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {amenity}
                        </span>
                      )) : 
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        Standard Amenities
                      </span>
                    }
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{normalizedRoom.capacity}</span> {normalizedRoom.capacity === 1 ? 'Guest' : 'Guests'}
                    </div>
                    
                    <Link
                      to={`/rooms/${normalizedRoom.id}`}
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center"
                    >
                      View Details
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/rooms"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
          >
            <span className="group-hover:underline">View All Rooms</span>
            <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
      
      {/* Hotel Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose Our Hotel</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We pride ourselves on offering a premium experience with amenities and services 
              designed to make your stay unforgettable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: 'Prime Location',
                description: 'Situated in the heart of the city, with easy access to major attractions and business districts.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: 'World-Class Service',
                description: 'Our highly trained staff ensures personalized service that anticipates your every need.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ),
                title: 'Luxurious Comfort',
                description: 'Premium bedding, state-of-the-art amenities, and carefully designed spaces for ultimate relaxation.'
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Fine Dining',
                description: 'Exceptional culinary experiences with gourmet restaurants serving local and international cuisine.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:transform hover:scale-[1.02] transition-all duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Promotions & Offers */}
      {Array.isArray(promotions) && promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Special Offers</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Take advantage of our limited-time offers and exclusive packages for an enhanced stay.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.isArray(promotions) && promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 relative overflow-hidden">
                  <img 
                    src={promo.image || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'} 
                    alt={promo.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                    }}
                  />
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg font-bold">
                    {promo.discount}% OFF
                  </div>
                </div>
                <div className="md:w-3/5 p-6 text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                    <p className="mb-4">{promo.description}</p>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                      <p className="text-sm">Use code: <span className="font-bold">{promo.code}</span></p>
                      <p className="text-sm">Valid until: {new Date(promo.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {user ? (
                    <Link
                      to={`/rooms?promo=${promo.code}`}
                      className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-4 rounded-full inline-flex items-center justify-center transition-colors duration-300 transform hover:scale-105"
                    >
                      Book Now
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  ) : (
                    <Link
                      to={`/login?redirect=/rooms?promo=${promo.code}`}
                      className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-4 rounded-full inline-flex items-center justify-center transition-colors duration-300 transform hover:scale-105"
                    >
                      Login to Book
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      
      {/* Testimonials */}
      {testimonials && Array.isArray(testimonials) && testimonials.length > 0 && (
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Guests Say</h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Read about the experiences of our valued guests and their memorable stays.
              </p>
            </div>
            
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${testimonialsPosition * 100}%)` }}
                >
                  {Array.isArray(testimonials) && testimonials.map((testimonial: Testimonial) => (
                    <div 
                      key={testimonial.id} 
                      className="min-w-full px-4"
                    >
                      <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto hover:bg-gray-700 transition-colors duration-300">
                        <div className="flex items-center mb-6">
                          <div className="mr-4">
                            <img 
                              src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff`} 
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=3b82f6&color=fff`;
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{testimonial.name}</h3>
                            <div className="flex text-yellow-400 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 italic mb-4">"{testimonial.comment}"</p>
                        <p className="text-gray-400 text-sm">Stayed on {new Date(testimonial.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {Array.isArray(testimonials) && testimonials.length > 1 && (
                <>
                  <button 
                    onClick={() => scrollTestimonials('left')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 focus:outline-none disabled:opacity-50"
                    disabled={testimonialsPosition === 0}
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => scrollTestimonials('right')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 focus:outline-none disabled:opacity-50"
                    disabled={testimonialsPosition === testimonials.length - 1}
                    aria-label="Next testimonial"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {Array.isArray(testimonials) && testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialsPosition(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    testimonialsPosition === index ? 'bg-blue-500' : 'bg-gray-600'
                  } transition-all duration-300`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" 
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}>
            </div>
            
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready for an Unforgettable Stay?</h2>
              <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg">
                Book your room now and experience our world-class service and luxury accommodations.
                Special rates available for early bookings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/rooms"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  Browse Rooms
                </Link>
                
                {user ? (
                  <Link
                    to="/new-reservation"
                    className="bg-transparent hover:bg-blue-700 text-white border-2 border-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    Book Now
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="bg-transparent hover:bg-blue-700 text-white border-2 border-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    Login to Book
                  </Link>
                )}
              </div>
              
              {!user && (
                <p className="text-blue-100 mt-4 text-sm">
                  New to our hotel? <Link to="/register" className="text-white underline hover:text-blue-200">Register here</Link> to make reservations.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Location & Map */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Find Us</h2>
              <p className="text-gray-600 mb-6">
                Our hotel is conveniently located in the heart of the city, just minutes away from major 
                attractions, shopping centers, and business districts.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-800">Address</h3>
                    <p className="text-gray-600">123 Luxury Avenue, City Center, Country</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-800">Contact</h3>
                    <p className="text-gray-600">+1 (123) 456-7890</p>
                    <p className="text-gray-600">info@luxuryhotel.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-gray-800">Hours</h3>
                    <p className="text-gray-600">Check-in: 3:00 PM</p>
                    <p className="text-gray-600">Check-out: 11:00 AM</p>
                    <p className="text-gray-600">Front Desk: 24/7</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                >
                  <span className="group-hover:underline">Get Directions</span>
                  <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-96 bg-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="w-full h-full bg-cover bg-center" 
                   style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-l+3b82f6(0,0)/0,0,13,0/800x600@2x?access_token=YOUR_MAPBOX_TOKEN')" }}>
                <div className="flex items-center justify-center h-full bg-blue-900 bg-opacity-20 hover:bg-opacity-10 transition-all duration-300">
                  <div className="bg-white p-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <p className="font-bold text-blue-700">Luxury Hotel</p>
                    <p className="text-gray-600 text-sm">Interactive map loading...</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;