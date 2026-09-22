import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Building2, Lock, Mail, Hotel } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      await login(response.data.access_token, response.data.refresh_token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Invalid credentials. Please try again.';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30 text-white mb-2">
            <Hotel size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Kaveri Stays</h1>
          <p className="text-sm text-slate-400">Hotel Management & Guest Booking Portal</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="manager@kaveristays.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 mt-2 text-sm font-semibold rounded-xl"
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Need a staff or guest account?{' '}
              <Link to="/register" className="text-violet-400 font-medium hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials helper card */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">Quick Sign-in Help:</p>
          <p>If you already seeded accounts in PostgreSQL, sign in with your credentials.</p>
          <p className="mt-1 text-slate-500">Or register a new <strong>Owner</strong> or <strong>Manager</strong> account on the registration page.</p>
        </div>
      </div>
    </div>
  );
}
