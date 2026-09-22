import React from 'react';

export type BadgeVariant = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'pending' | 'success' | 'warning' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant | string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variantStyles: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  checked_in: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checked_out: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  default: 'bg-slate-800 text-slate-300 border-slate-700',
};

export function Badge({ variant = 'default', children, size = 'md' }: BadgeProps) {
  const style = variantStyles[variant.toLowerCase()] || variantStyles.default;
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeStyle} ${style}`}
    >
      {children}
    </span>
  );
}
