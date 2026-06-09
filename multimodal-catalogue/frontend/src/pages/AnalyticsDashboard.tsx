import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data) return <div className="text-center py-20 animate-pulse text-slate-500">Loading Analytics...</div>;

  const ctrData = Object.entries(data.ctr_by_modality).map(([modality, ctr]) => ({
    name: modality,
    ctr: (ctr as number) * 100
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Intelligence Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time search performance and gaps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Queries</div>
          <div className="text-4xl font-black text-indigo-600">{data.total_searches}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Abandonment Rate</div>
          <div className="text-4xl font-black text-rose-500">{(data.abandonment_rate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Zero-Result Rate</div>
          <div className="text-4xl font-black text-amber-500">{(data.zero_result_rate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Daily Search Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Click-Through Rate by Modality</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} className="capitalize" />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="ctr" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Top Abandoned Queries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Query</th>
                <th className="px-4 py-3 rounded-tr-lg">Abandonment Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.top_abandoned_queries.map((q: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">"{q.query}"</td>
                  <td className="px-4 py-3 text-rose-500 font-semibold">{q.count}</td>
                </tr>
              ))}
              {data.top_abandoned_queries.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-400 italic">No abandonment data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
