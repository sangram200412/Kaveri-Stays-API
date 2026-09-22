import api from './axios';

export interface StayRange {
  start_date: string;
  end_date: string;
}

export interface Booking {
  booking_id: number;
  guest_id: number;
  room_id: number;
  stay: StayRange;
  guests_count: number;
  nightly_rate: string | number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface BookingCreate {
  guest_id: number;
  room_id: number;
  stay: StayRange;
  guests_count: number;
  nightly_rate?: number;
  status?: string;
  notes?: string | null;
}

export interface BookingUpdate {
  status?: string;
  notes?: string | null;
}

export interface BookingListParams {
  property_id?: number;
  status?: string;
  guest_id?: number;
  start_date?: string;
  end_date?: string;
  sort?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
}

export const bookingsApi = {
  getAll: (params?: BookingListParams) =>
    api.get<Booking[]>('/bookings/', { params }),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),
  create: (data: BookingCreate) => api.post<Booking>('/bookings/', data),
  update: (id: number, data: BookingUpdate) =>
    api.patch<Booking>(`/bookings/${id}`, data),
  cancel: (id: number) => api.delete(`/bookings/${id}`),
  delete: (id: number) => api.delete(`/bookings/${id}`),
};
