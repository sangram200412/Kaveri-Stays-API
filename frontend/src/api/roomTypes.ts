import api from './axios';

export interface RoomType {
  room_type_id: number;
  type_name: string;
  max_occupancy: number;
}

export interface RoomTypeCreate {
  type_name: string;
  max_occupancy: number;
}

export const roomTypesApi = {
  getAll: () => api.get<RoomType[]>('/room-types/'),
  getById: (id: number) => api.get<RoomType>(`/room-types/${id}`),
  create: (data: RoomTypeCreate) => api.post<RoomType>('/room-types/', data),
};
