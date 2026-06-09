import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, Zap, AlertTriangle } from 'lucide-react';

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

  if (!data) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Aggregating telemetry data...</p>
    </div>
  );

  const ctrData = Object.entries(data.ctr_by_modality).map(([modality, ctr]) => ({
    name: modality,
    ctr: (ctr as number) * 100
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Activity size={14} className="mr-2" /> Live Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">Real-time multimodal search performance and content gaps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Total Queries</div>
          <div className="text-5xl font-black text-slate-900 dark:text-white">{data.total_searches}</div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={64} className="text-rose-500" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Abandonment Rate</div>
          <div className="text-5xl font-black text-rose-500">{(data.abandonment_rate * 100).toFixed(1)}<span className="text-3xl">%</span></div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={64} className="text-amber-500" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest mb-3">Zero-Result Rate</div>
          <div className="text-5xl font-black text-amber-500">{(data.zero_result_rate * 100).toFixed(1)}<span className="text-3xl">%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 mb-8">Daily Search Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', color: '#fff' }} 
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 mb-8">Engagement by Modality</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={12} axisLine={false} tickLine={false} className="capitalize font-medium" />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#6366f1', color: '#fff', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="ctr" fill="#8b5cf6" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6">Content Gap Analysis (Top Abandoned Queries)</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Search Query</th>
                <th className="px-6 py-4 text-right">Abandonment Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.top_abandoned_queries.map((q: any, i: number) => (
                <tr key={i} className="hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">"{q.query}"</td>
                  <td className="px-6 py-4 text-rose-500 font-bold text-right">{q.count}</td>
                </tr>
              ))}
              {data.top_abandoned_queries.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">No significant abandonment data available yet. Your catalogue is performing well!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
