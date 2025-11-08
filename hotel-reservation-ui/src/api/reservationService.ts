// src/api/reservationService.ts
import apiClient from './client';

// Define interfaces for reservation data
export interface ReservationCreateData {
    checkInDate: string;
    checkOutDate: string;
    roomId: number;
    guestCount: number;
    specialRequests?: string;
}

export interface ReservationResponse {
    id: number;
    checkInDate: string;
    checkOutDate: string;
    roomId: number;
    guestCount: number;
    status: string;
    specialRequests?: string;
    createdAt: string;
}

export const createReservation = async (reservationData: ReservationCreateData): Promise<ReservationResponse> => {
    const response = await apiClient.post('/reservations', reservationData);
    return response.data;
};

export const getMyReservations = async () => {
  const response = await apiClient.get('/reservations/my');
  return response.data;
};

export interface CancelReservationResponse {
    success: boolean;
    message: string;
}

export const cancelReservation = async (id: number): Promise<CancelReservationResponse> => {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
};