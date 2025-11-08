// src/api/authService.ts
import apiClient from './client';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};

interface RegisterUserData {
    email: string;
    password: string;
    name: string;
}

interface RegisterResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const register = async (userData: RegisterUserData): Promise<RegisterResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};