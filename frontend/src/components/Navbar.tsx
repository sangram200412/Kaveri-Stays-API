import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export function Navbar({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Shield size={13} className="text-violet-400" />
          <span>Role: <strong className="text-slate-100 capitalize">{user?.role}</strong></span>
        </div>
      </div>
    </header>
  );
}
