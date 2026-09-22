import { AxiosError } from 'axios';

export function getApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((e: { msg: string }) => e.msg).join(', ');
      }
    }
    if (error.response?.status === 400) return 'Bad request. Please check your input.';
    if (error.response?.status === 401) return 'Unauthorized. Please log in again.';
    if (error.response?.status === 403) return 'You do not have permission to perform this action.';
    if (error.response?.status === 404) return 'Resource not found.';
    if (error.response?.status === 409) return 'Conflict: ' + (data?.detail || 'A duplicate entry already exists.');
    if (error.response?.status === 422) {
      if (Array.isArray(data?.detail)) {
        return data.detail.map((e: { msg: string; loc?: string[] }) =>
          `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`
        ).join('; ');
      }
      return 'Validation error. Please check your input.';
    }
    if (error.response?.status === 500) return 'Server error. Please try again later.';
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  checked_in: 'bg-green-500/20 text-green-300 border-green-500/30',
  checked_out: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  no_show: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export const METHOD_COLORS: Record<string, string> = {
  card: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  upi: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  bank_transfer: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  cash: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  staff: 'bg-green-500/20 text-green-300 border-green-500/30',
  guest: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};
