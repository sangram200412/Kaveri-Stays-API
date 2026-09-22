import React, { useEffect, useState } from 'react';
import { roomTypesApi, type RoomType } from '../api/roomTypes';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Layers, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function RoomTypesPage() {
  const { user } = useAuth();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [typeName, setTypeName] = useState('');
  const [occupancy, setOccupancy] = useState('2');

  const canCreate = ['owner', 'manager'].includes(user?.role?.toLowerCase() || '');

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const res = await roomTypesApi.getAll();
      setRoomTypes(res.data);
    } catch {
      toast.error('Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      toast.error('Type name is required');
      return;
    }

    setSubmitting(true);
    try {
      await roomTypesApi.create({
        type_name: typeName.trim(),
        max_occupancy: parseInt(occupancy),
      });
      toast.success('Room type created successfully!');
      setIsModalOpen(false);
      setTypeName('');
      setOccupancy('2');
      loadRoomTypes();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create room type');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Room Types & Categories</h1>
          <p className="text-sm text-slate-400">Configure room specifications, suites, and occupancy rules</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Room Type
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading room types...</div>
      ) : roomTypes.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
          <Layers size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No room types configured</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Create standard room types like Deluxe Suite, Executive King, or Standard Double.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add First Room Type
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roomTypes.map((rt) => (
            <div
              key={rt.room_type_id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-200 group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Layers size={20} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">ID #{rt.room_type_id}</span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                    {rt.type_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300 mt-2">
                    <Users size={15} className="text-violet-400" />
                    <span>Max {rt.max_occupancy} guests</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Standard Category</span>
                <span className="text-emerald-400 font-medium">Ready for Booking</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Type Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Room Type">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Type Name"
            placeholder="e.g. Deluxe Suite, Presidential Penthouse, Twin Comfort"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />
          <Input
            label="Max Occupancy (Guests)"
            type="number"
            min="1"
            max="12"
            value={occupancy}
            onChange={(e) => setOccupancy(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Room Type
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
