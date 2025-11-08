// Update your API client configuration to match server routes

import apiClient from './client';
import type { Reservation, Room, User, Testimonial, Promotion } from '../types';

// Auth endpoints
export const login = async (email: string, password: string): Promise<User> => {
  const params = new URLSearchParams();
  params.append('username', email); // email goes in the username field
  params.append('password', password);
  const response = await apiClient.post('/api/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const register = async (userData: { email: string; password: string; username: string }): Promise<User> => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

// Room endpoints
export const fetchRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get('/api/rooms');
  return response.data;
};

export const fetchFeaturedRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get('/api/rooms/featured');
  return response.data;
};

export const getRoom = async (id: number | string): Promise<Room> => {
  const response = await apiClient.get(`/api/rooms/${id}`);
  return response.data;
};

// Update other endpoints as needed

// Reservation endpoints
export const fetchReservations = async (): Promise<Reservation[]> => {
  const response = await apiClient.get('/api/reservations');
  return response.data;
};

export const getReservation = async (id: number): Promise<Reservation> => {
  const response = await apiClient.get(`/api/reservations/${id}`);
  return response.data;
};

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> => {
  const response = await apiClient.post('/api/reservations', {
    ...reservation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const updateReservation = async (id: number, reservation: Partial<Reservation>): Promise<Reservation> => {
  const response = await apiClient.patch(`/api/reservations/${id}`, {
    ...reservation,
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const createPayment = async (paymentData: {
  reservationId: number;
  amount: number;
  paymentMethod: string;
  paymentType: string;
}): Promise<any> => {
  const response = await apiClient.post('/api/payments', paymentData);
  return response.data;
};

export const deleteReservation = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/reservations/${id}`);
};

// Testimonial endpoints
export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const response = await apiClient.get('/api/testimonials');
  return response.data;
};

export const submitTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'date'>): Promise<Testimonial> => {
  const response = await apiClient.post('/api/testimonials', {
    ...testimonial,
    date: new Date().toISOString()
  });
  return response.data;
};

// Promotion endpoints
export const fetchPromotions = async (): Promise<Promotion[]> => {
  const response = await apiClient.get('/api/promotions');
  return response.data;
};

// Room availability check
export const checkRoomAvailability = async (
  roomId: number | string, 
  checkIn: string, 
  checkOut: string
): Promise<{available: boolean; message?: string}> => {
  const response = await apiClient.get(`/api/rooms/${roomId}/availability`, {
    params: { checkIn, checkOut }
  });
  return response.data;
};

// Room filtering
export const filterRooms = async (filters: {
  checkIn?: string;
  checkOut?: string;
  priceRange?: [number, number];
  capacity?: number;
  roomType?: string;
}): Promise<Room[]> => {
  const response = await apiClient.get('/api/rooms/filter', { params: filters });
  return response.data;
};