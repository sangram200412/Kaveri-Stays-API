import React, { useEffect, useState } from 'react';
import { reportsApi, type OccupancyReport, type ADRReport, type RevPARReport } from '../api/reports';
import { propertiesApi, type Property } from '../api/properties';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { TrendingUp, Percent, DollarSign, BarChart3, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear().toString());
  const [month, setMonth] = useState((currentDate.getMonth() + 1).toString());

  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [adr, setAdr] = useState<ADRReport[]>([]);
  const [revpar, setRevpar] = useState<RevPARReport[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const y = parseInt(year);
      const m = parseInt(month);

      const [occRes, adrRes, revRes, propRes] = await Promise.allSettled([
        reportsApi.getOccupancy(y, m),
        reportsApi.getADR(y, m),
        reportsApi.getRevPAR(y, m),
        propertiesApi.getAll(),
      ]);

      if (occRes.status === 'fulfilled') setOccupancy(occRes.value.data);
      if (adrRes.status === 'fulfilled') setAdr(adrRes.value.data);
      if (revRes.status === 'fulfilled') setRevpar(revRes.value.data);
      if (propRes.status === 'fulfilled') setProperties(propRes.value.data);
    } catch {
      toast.error('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [year, month]);

  const propertyMap = new Map(properties.map((p) => [p.property_id, p.property_name]));

  // Aggregate metrics
  const avgOccupancy =
    occupancy.length > 0
      ? (occupancy.reduce((acc, curr) => acc + (Number(curr.occupancy_rate) || 0), 0) / occupancy.length).toFixed(1)
      : '0.0';

  const avgAdr =
    adr.length > 0
      ? (adr.reduce((acc, curr) => acc + (Number(curr.adr) || 0), 0) / adr.length).toFixed(2)
      : '0.00';

  const avgRevpar =
    revpar.length > 0
      ? (revpar.reduce((acc, curr) => acc + (Number(curr.revpar) || 0), 0) / revpar.length).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Business Reports</h1>
          <p className="text-sm text-slate-400">KPIs: Occupancy rate, ADR (Average Daily Rate), and RevPAR</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="w-32">
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={[
                { value: '1', label: 'January' },
                { value: '2', label: 'February' },
                { value: '3', label: 'March' },
                { value: '4', label: 'April' },
                { value: '5', label: 'May' },
                { value: '6', label: 'June' },
                { value: '7', label: 'July' },
                { value: '8', label: 'August' },
                { value: '9', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' },
              ]}
            />
          </div>
          <div className="w-28">
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={[
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
              ]}
            />
          </div>
          <Button variant="primary" size="sm" onClick={loadReports}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Occupancy Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 text-violet-400 flex items-center justify-center">
              <Percent size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{avgOccupancy}%</p>
          <p className="text-xs text-slate-500 mt-1">Percentage of room-nights sold</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Daily Rate (ADR)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4">₹{avgAdr}</p>
          <p className="text-xs text-slate-500 mt-1">Average rental revenue per paid occupied room</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              RevPAR (Revenue per Available Room)
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-600/15 text-cyan-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 mt-4">₹{avgRevpar}</p>
          <p className="text-xs text-slate-500 mt-1">Total room revenue divided by total rooms</p>
        </div>
      </div>

      {/* Property Breakdown Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Performance by Hotel Property</h3>
          <p className="text-xs text-slate-400">Monthly breakdown for {month}/{year}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Property</th>
                <th className="px-6 py-3.5">Occupancy Rate</th>
                <th className="px-6 py-3.5">ADR</th>
                <th className="px-6 py-3.5">RevPAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Calculating analytics...
                  </td>
                </tr>
              ) : occupancy.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No activity recorded for this time period.
                  </td>
                </tr>
              ) : (
                occupancy.map((row) => {
                  const propAdr = adr.find((a) => a.property_id === row.property_id)?.adr || 0;
                  const propRev = revpar.find((r) => r.property_id === row.property_id)?.revpar || 0;

                  return (
                    <tr key={row.property_id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <Building2 size={16} className="text-violet-400" />
                        <span>{propertyMap.get(row.property_id) || `Property #${row.property_id}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-violet-300 font-semibold">{row.occupancy_rate}%</span>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">₹{propAdr}</td>
                      <td className="px-6 py-4 text-cyan-400 font-semibold">₹{propRev}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
