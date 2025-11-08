export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Room {
  id: number;
  type: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  availability: boolean;
  image?: string; // Optional single image for display purposes
  featured?: boolean; // Flag for featured rooms
}

export interface Reservation {
  id: number;
  guestName: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: number;
  roomType: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  paymentStatus?: 'pending' | 'advance_paid' | 'fully_paid';
  advanceAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  reservationId: number;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  paidAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; username: string }) => Promise<void>;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  email?: string; // Optional, for user who submitted
  userId?: number; // Optional, to link to a user account
  isApproved?: boolean; // For admin moderation
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  image?: string;
  code: string;
  isActive?: boolean;
  appliesTo?: 'all_rooms' | 'specific_rooms' | 'room_types';
  roomIds?: number[]; // If applies to specific rooms
  roomTypes?: string[]; // If applies to room types
  minStay?: number; // Minimum number of nights required
  createdAt?: string;
}

export interface RoomFilterData {
  checkIn: string;
  checkOut: string;
  priceRange: [number, number];
  capacity: number;
  roomType: string;
}

export interface RoomAvailabilityResponse {
  available: boolean;
  message?: string;
  availableRooms?: Room[];
}

export interface HotelAmenity {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'room' | 'dining' | 'wellness' | 'business' | 'entertainment';
}

export interface RoomReview {
  id: number;
  userId: number;
  userName: string;
  roomId: number;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
}