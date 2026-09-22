import api from './axios';

export interface Property {
  property_id: number;
  property_name: string;
  city: string;
  star_rating: number;
}

export interface PropertyCreate {
  property_name: string;
  city: string;
  star_rating: number;
}

export const propertiesApi = {
  getAll: () => api.get<Property[]>('/properties/'),
  getById: (id: number) => api.get<Property>(`/properties/${id}`),
  create: (data: PropertyCreate) => api.post<Property>('/properties/', data),
};
