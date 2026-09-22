import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Hotel, Lock, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email,
        password,
        role,
        property_id: propertyId ? parseInt(propertyId) : null,
      });
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to create account. Email may already exist.';
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/30 text-white mb-2">
            <Hotel size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400">Register new staff, manager, or owner account</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@kaveristays.com"
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

            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'owner', label: 'Owner (Full Access to Properties, Rooms, Reports)' },
                { value: 'manager', label: 'Manager (Bookings, Rooms, Reports)' },
                { value: 'staff', label: 'Staff (Front Desk & Bookings)' },
                { value: 'guest', label: 'Guest (Self-service Bookings)' },
              ]}
            />

            {(role === 'manager' || role === 'staff') && (
              <Input
                label="Assigned Property ID (Optional)"
                type="number"
                placeholder="e.g. 1"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                helperText="Leave blank if not assigned to a single property"
              />
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 mt-2 text-sm font-semibold rounded-xl"
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
