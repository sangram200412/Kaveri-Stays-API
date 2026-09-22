import api from './axios';

export interface Guest {
  guest_id: number;
  full_name: string;
  email: string;
  phone: string;
  city: string;
}

export interface GuestCreate {
  full_name: string;
  email: string;
  phone: string;
  city: string;
}

export const guestsApi = {
  getAll: () => api.get<Guest[]>('/guests/'),
  getById: (id: number) => api.get<Guest>(`/guests/${id}`),
  create: (data: GuestCreate) => api.post<Guest>('/guests/', data),
};
