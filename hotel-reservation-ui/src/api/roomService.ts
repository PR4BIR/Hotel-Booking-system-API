// src/api/roomService.ts
import apiClient from './client';

export const getRooms = async (filters = {}) => {
  const response = await apiClient.get('/rooms', { params: filters });
  return response.data;
};

export interface Room {
    id: string;
    // Add other room properties as needed
}

export const getRoomById = async (id: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
};