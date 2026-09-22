import api from './axios';

export interface Review {
  review_id: number;
  booking_id: number;
  rating: number;
  review_text: string | null;
  reviewed_at: string;
}

export interface ReviewCreate {
  rating: number;
  review_text?: string | null;
}

export const reviewsApi = {
  getAll: () => api.get<Review[]>('/reviews/'),
  getByBooking: (bookingId: number) =>
    api.get<Review>(`/bookings/${bookingId}/review`),
  createForBooking: (bookingId: number, data: ReviewCreate) =>
    api.post<Review>(`/bookings/${bookingId}/review`, {
      booking_id: bookingId,
      ...data,
    }),
};
