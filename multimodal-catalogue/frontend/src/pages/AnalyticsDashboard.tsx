import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Target, Zap, AlertTriangle } from 'lucide-react';

interface AnalyticsSummary {
  total_searches: number;
  ctr_by_modality: Record<string, number>;
  zero_result_rate: number;
  abandonment_rate: number;
  top_abandoned_queries: Array<{ query: string; count: number }>;
  daily_volume: Array<{ date: string; count: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get<AnalyticsSummary>('/analytics/summary');
        setData(res.data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  if (!data) return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-[#dbe7dc] border-t-[#b86b2f] rounded-full animate-spin"></div>
      <p className="text-stone-500 font-medium animate-pulse">Aggregating telemetry data...</p>
    </div>
  );

  const ctrData = Object.entries(data.ctr_by_modality).map(([modality, ctr]) => ({
    name: modality,
    ctr: (ctr as number) * 100
  }));

  return (
    <div className="space-y-10 page-enter">
      <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#dbe7dc] dark:bg-[#4f6f52]/25 text-[#243d2d] dark:text-[#d79a5f] text-xs font-bold uppercase tracking-widest mb-4">
            <Activity size={14} className="mr-2" /> Live Telemetry
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-[#162321] dark:text-[#f8f4ea] tracking-tight">Intelligence Dashboard</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 font-medium text-lg">Real-time multimodal search performance and content gaps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group stagger-card">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={64} className="text-[#4f6f52] dark:text-[#d79a5f]" />
          </div>
          <div className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-widest mb-3">Total Queries</div>
          <div className="text-5xl font-black text-[#162321] dark:text-[#f8f4ea]">{data.total_searches}</div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group stagger-card" style={{ animationDelay: '70ms' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={64} className="text-[#b86b2f]" />
          </div>
          <div className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-widest mb-3">Abandonment Rate</div>
          <div className="text-5xl font-black text-[#b86b2f]">{(data.abandonment_rate * 100).toFixed(1)}<span className="text-3xl">%</span></div>
        </div>
        
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group stagger-card" style={{ animationDelay: '140ms' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={64} className="text-amber-500" />
          </div>
          <div className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-widest mb-3">Zero-Result Rate</div>
          <div className="text-5xl font-black text-amber-500">{(data.zero_result_rate * 100).toFixed(1)}<span className="text-3xl">%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200 mb-8">Daily Search Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" strokeOpacity={0.28} />
                <XAxis dataKey="date" stroke="#78716c" fontSize={12} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(215,154,95,0.24)', backgroundColor: 'rgba(22, 35, 33, 0.92)', backdropFilter: 'blur(8px)', color: '#f8f4ea' }} 
                  itemStyle={{ color: '#d79a5f', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" stroke="#4f6f52" strokeWidth={4} dot={{ r: 6, fill: '#4f6f52', strokeWidth: 2, stroke: '#f8f4ea' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200 mb-8">Engagement by Modality</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ctrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" strokeOpacity={0.28} vertical={false} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} tickMargin={12} axisLine={false} tickLine={false} className="capitalize font-medium" />
                <YAxis stroke="#78716c" fontSize={12} unit="%" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(184, 107, 47, 0.12)' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#243d2d', color: '#f8f4ea', fontWeight: 'bold' }} 
                  itemStyle={{ color: '#f8f4ea' }}
                />
                <Bar dataKey="ctr" fill="#b86b2f" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl">
        <h3 className="text-xl font-display font-bold text-stone-800 dark:text-stone-200 mb-6">Content Gap Analysis (Top Abandoned Queries)</h3>
        <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-[#0f1b18]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100/50 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Search Query</th>
                <th className="px-6 py-4 text-right">Abandonment Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {data.top_abandoned_queries.map((q, i) => (
                <tr key={i} className="hover:bg-white/80 dark:hover:bg-stone-800/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-stone-800 dark:text-stone-200">"{q.query}"</td>
                  <td className="px-6 py-4 text-[#b86b2f] font-bold text-right">{q.count}</td>
                </tr>
              ))}
              {data.top_abandoned_queries.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-stone-400 dark:text-stone-500 font-medium">No significant abandonment data available yet. Your catalogue is performing well!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
