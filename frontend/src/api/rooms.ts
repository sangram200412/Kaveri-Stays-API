import api from './axios';

export interface Room {
  room_id: number;
  property_id: number;
  room_number: string;
  room_type_id: number;
}

export interface RoomCreate {
  property_id: number;
  room_number: string;
  room_type_id: number;
}

export interface AvailabilityParams {
  start_date: string;
  end_date: string;
  property_id?: number;
  room_type_id?: number;
}

export type RoomAvailabilityParams = AvailabilityParams;

export const roomsApi = {
  getAll: (params?: { property_id?: number; room_type_id?: number }) =>
    api.get<Room[]>('/rooms/', { params }),
  getById: (id: number) => api.get<Room>(`/rooms/${id}`),
  create: (data: RoomCreate) => api.post<Room>('/rooms/', data),
  getAvailability: (params: AvailabilityParams) =>
    api.get<Room[]>('/rooms/availability', { params }),
};
