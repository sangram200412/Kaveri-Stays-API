import React, { useEffect, useState } from 'react';
import { roomsApi, type Room, type RoomAvailabilityParams } from '../api/rooms';
import { propertiesApi, type Property } from '../api/properties';
import { roomTypesApi, type RoomType } from '../api/roomTypes';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Calendar, DoorOpen, Plus, Search, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterProperty, setFilterProperty] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  // Availability state
  const [checkStartDate, setCheckStartDate] = useState('');
  const [checkEndDate, setCheckEndDate] = useState('');
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Add Room Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');

  const canCreate = ['owner', 'manager'].includes(user?.role?.toLowerCase() || '');

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, propsRes, typesRes] = await Promise.allSettled([
        roomsApi.getAll({
          property_id: filterProperty ? parseInt(filterProperty) : undefined,
          room_type_id: filterType ? parseInt(filterType) : undefined,
        }),
        propertiesApi.getAll(),
        roomTypesApi.getAll(),
      ]);

      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data);
      if (propsRes.status === 'fulfilled') {
        setProperties(propsRes.value.data);
        if (propsRes.value.data.length > 0 && !propertyId) {
          setPropertyId(propsRes.value.data[0].property_id.toString());
        }
      }
      if (typesRes.status === 'fulfilled') {
        setRoomTypes(typesRes.value.data);
        if (typesRes.value.data.length > 0 && !roomTypeId) {
          setRoomTypeId(typesRes.value.data[0].room_type_id.toString());
        }
      }
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterProperty, filterType]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkStartDate || !checkEndDate) {
      toast.error('Select both check-in and check-out dates');
      return;
    }
    if (checkStartDate >= checkEndDate) {
      toast.error('Check-out date must be strictly after check-in date');
      return;
    }

    setCheckingAvailability(true);
    try {
      const params: RoomAvailabilityParams = {
        start_date: checkStartDate,
        end_date: checkEndDate,
        ...(filterProperty ? { property_id: parseInt(filterProperty) } : {}),
        ...(filterType ? { room_type_id: parseInt(filterType) } : {}),
      };
      const res = await roomsApi.getAvailability(params);
      setAvailableRooms(res.data);
      toast.success(`Found ${res.data.length} available rooms!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to check room availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !roomNumber.trim() || !roomTypeId) {
      toast.error('All room fields are required');
      return;
    }

    setSubmitting(true);
    try {
      await roomsApi.create({
        property_id: parseInt(propertyId),
        room_number: roomNumber.trim(),
        room_type_id: parseInt(roomTypeId),
      });
      toast.success('Room created successfully!');
      setIsModalOpen(false);
      setRoomNumber('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const propertyMap = new Map(properties.map((p) => [p.property_id, p.property_name]));
  const typeMap = new Map(roomTypes.map((t) => [t.room_type_id, t.type_name]));

  const displayRooms = availableRooms !== null ? availableRooms : rooms;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hotel Rooms & Inventory</h1>
          <p className="text-sm text-slate-400">View room configurations and verify real-time stay availability</p>
        </div>
        {canCreate && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Room
          </Button>
        )}
      </div>

      {/* Live Availability Checker Card */}
      <div className="bg-slate-900/90 border border-violet-800/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
          <Calendar size={18} />
          <span>Real-time Availability Engine</span>
        </div>

        <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input
            label="Check-in Date"
            type="date"
            value={checkStartDate}
            onChange={(e) => setCheckStartDate(e.target.value)}
            required
          />
          <Input
            label="Check-out Date"
            type="date"
            value={checkEndDate}
            onChange={(e) => setCheckEndDate(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              loading={checkingAvailability}
              icon={<Search size={16} />}
              className="w-full"
            >
              Search Available
            </Button>
            {availableRooms !== null && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAvailableRooms(null)}
                className="shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </form>

        {availableRooms !== null && (
          <div className="p-3 bg-violet-950/40 border border-violet-800/40 rounded-xl text-xs text-violet-200 flex items-center justify-between">
            <span>
              Showing <strong>{availableRooms.length}</strong> available room(s) for stay from{' '}
              <strong>{checkStartDate}</strong> to <strong>{checkEndDate}</strong>.
            </span>
            <span className="text-[11px] text-violet-300 font-semibold cursor-pointer underline" onClick={() => setAvailableRooms(null)}>
              Clear search filter
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div className="w-56">
          <Select
            label="Filter by Property"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            options={[
              { value: '', label: 'All Properties' },
              ...properties.map((p) => ({
                value: p.property_id.toString(),
                label: p.property_name,
              })),
            ]}
          />
        </div>

        <div className="w-56">
          <Select
            label="Filter by Room Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'All Room Types' },
              ...roomTypes.map((t) => ({
                value: t.room_type_id.toString(),
                label: t.type_name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Room ID</th>
                <th className="px-6 py-3.5">Room Number</th>
                <th className="px-6 py-3.5">Property</th>
                <th className="px-6 py-3.5">Room Type</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading hotel rooms...
                  </td>
                </tr>
              ) : displayRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No rooms found matching the specified parameters.
                  </td>
                </tr>
              ) : (
                displayRooms.map((r) => (
                  <tr key={r.room_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono text-slate-400">#{r.room_id}</td>
                    <td className="px-6 py-4 font-bold text-white text-base">
                      Room {r.room_number}
                    </td>
                    <td className="px-6 py-4">
                      {propertyMap.get(r.property_id) || `Property #${r.property_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-violet-300">
                        {typeMap.get(r.room_type_id) || `Type #${r.room_type_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="confirmed">Active in System</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hotel Room">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Select
            label="Property"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            options={properties.map((p) => ({
              value: p.property_id.toString(),
              label: `${p.property_name} (${p.city})`,
            }))}
            required
          />
          <Input
            label="Room Number"
            placeholder="e.g. 101, 204A, PH-1"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
          <Select
            label="Room Type"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            options={roomTypes.map((t) => ({
              value: t.room_type_id.toString(),
              label: `${t.type_name} (Max ${t.max_occupancy} guests)`,
            }))}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
