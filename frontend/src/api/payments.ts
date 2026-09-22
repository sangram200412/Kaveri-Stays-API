import api from './axios';

export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: string;
  method: string;
  paid_at: string;
  idempotency_key: string | null;
}

export interface PaymentCreate {
  booking_id?: number;
  amount: number;
  method: string;
  idempotency_key?: string;
}

export const paymentsApi = {
  getAll: () =>
    api.get<Payment[]>('/payments/'),
  getByBooking: (bookingId: number) =>
    api.get<Payment[]>(`/bookings/${bookingId}/payments`),
  create: (data: { booking_id: number; amount: number; method: string; idempotency_key?: string }) =>
    api.post<Payment>(`/bookings/${data.booking_id}/payments`, data),
};
