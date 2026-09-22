import React, { useEffect, useState } from 'react';
import { propertiesApi, type Property } from '../api/properties';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Building2, MapPin, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState('4');

  const canCreate = ['owner', 'manager'].includes(user?.role?.toLowerCase() || '');

  const loadProperties = async () => {
    try {
      setLoading(true);
      const res = await propertiesApi.getAll();
      setProperties(res.data);
    } catch (err) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) {
      toast.error('Property name and city are required');
      return;
    }

    setSubmitting(true);
    try {
      await propertiesApi.create({
        property_name: name.trim(),
        city: city.trim(),
        star_rating: parseInt(rating),
      });
      toast.success('Property created successfully!');
      setIsModalOpen(false);
      setName('');
      setCity('');
      setRating('4');
      loadProperties();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hotel Properties</h1>
          <p className="text-sm text-slate-400">Manage all hotel locations and branch properties</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Property
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading hotel properties...</div>
      ) : properties.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No properties found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by adding your first hotel property to the system.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add First Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div
              key={p.property_id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-200 group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Building2 size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg text-amber-400 text-xs font-semibold">
                    <Star size={12} className="fill-amber-400" />
                    <span>{p.star_rating} Stars</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                    {p.property_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                    <MapPin size={13} className="text-slate-500" />
                    <span>{p.city}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Property ID: #{p.property_id}</span>
                <span className="text-violet-400 font-medium">Active Branch</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hotel Property">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Property Name"
            placeholder="e.g. Kaveri Grand Palace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="City"
            placeholder="e.g. Bangalore, Mysore, Ooty"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Select
            label="Star Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={[
              { value: '5', label: '5 Stars - Ultra Luxury' },
              { value: '4', label: '4 Stars - Premium Deluxe' },
              { value: '3', label: '3 Stars - Comfort Boutique' },
              { value: '2', label: '2 Stars - Economy' },
              { value: '1', label: '1 Star - Budget' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Property
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
