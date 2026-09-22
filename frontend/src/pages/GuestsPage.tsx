import React, { useEffect, useState } from 'react';
import { guestsApi, type Guest } from '../api/guests';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Mail, MapPin, Phone, Plus, Search, UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function GuestsPage() {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Guest Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canCreate = ['owner', 'manager', 'staff'].includes(user?.role?.toLowerCase() || '');

  const loadGuests = async () => {
    try {
      setLoading(true);
      const res = await guestsApi.getAll();
      setGuests(res.data);
    } catch {
      toast.error('Failed to load guests list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error('Name, email, and phone number are required');
      return;
    }

    setSubmitting(true);
    try {
      await guestsApi.create({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim() || 'Unknown',
      });
      toast.success('Guest registered successfully!');
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setPhone('');
      setCity('');
      loadGuests();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create guest profile');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      g.full_name?.toLowerCase().includes(term) ||
      g.email?.toLowerCase().includes(term) ||
      g.phone?.toLowerCase().includes(term) ||
      g.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Guest Directory (CRM)</h1>
          <p className="text-sm text-slate-400">Manage registered hotel guests, profiles, and contact details</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Guest Profile
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Search by name, email, phone, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Guest Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading guests directory...</div>
      ) : filteredGuests.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Users size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No guests found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'No guests match your search filter.' : 'Add your first guest profile to start booking.'}
          </p>
          {canCreate && !searchTerm && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add First Guest
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuests.map((g) => (
            <div
              key={g.guest_id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-200 group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                    {g.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-slate-500">ID #{g.guest_id}</span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition">
                    {g.full_name}
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-500 shrink-0" />
                      <span className="truncate">{g.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-500 shrink-0" />
                      <span>{g.phone}</span>
                    </div>
                    {g.city && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-slate-500 shrink-0" />
                        <span>{g.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <UserCheck size={13} />
                  <span>Verified Guest</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Guest Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Guest Profile">
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. ramesh@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="City"
            placeholder="e.g. Bangalore"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Guest Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
