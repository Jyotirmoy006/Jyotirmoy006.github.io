import React, { useMemo } from 'react';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck, TrendingUp, Activity } from 'lucide-react';

const Matrix = () => {
  const allData = useMemo(() => {
    try {
      const saved = localStorage.getItem('civic_pulse_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  }, []);

  const sectorData = useMemo(() => {
    const sectors = ['Roads', 'Safety', 'Transit', 'Hygiene'];
    return sectors.map(name => {
      // Find all records that mention this sector in their aspects array
      const mentions = allData.filter(d => 
        Array.isArray(d.aspects) && d.aspects.some(a => a.name === name)
      );
      
      const pos = mentions.filter(d => {
          const target = d.aspects.find(a => a.name === name);
          return target?.status === 'Positive';
      }).length;

      const score = mentions.length > 0 ? ((pos / mentions.length) * 100).toFixed(1) : 75;
      return { name, score: parseFloat(score), total: mentions.length };
    });
  }, [allData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-20 text-inherit">
      <Navbar />
      <main className="max-w-6xl mx-auto py-16 px-8">
        <div className="mb-12 border-l-4 border-[#059669] pl-8">
          <h1 className="text-5xl font-900 text-[#0f172a] tracking-tighter uppercase">Sentiment <span className="text-[#059669]">Matrix</span></h1>
          <p className="text-slate-500 font-medium mt-2">Aggregate health index for {allData.length} analyzed pulse points.</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-16">
          {sectorData.map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-lg group">
              <span className="text-[10px] font-900 text-slate-400 uppercase tracking-widest block mb-4">{s.name}</span>
              <div className={`text-4xl font-900 mb-1 ${s.score > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{s.score}%</div>
              <div className="flex justify-between items-center mt-4">
                  <span className="text-[9px] font-900 text-slate-300 uppercase">Health Index</span>
                  <div className="text-[9px] font-900 bg-slate-50 px-2 py-1 rounded-lg text-slate-400 uppercase">{s.total} Pulses</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 900}} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)'}} />
              <Bar dataKey="score" radius={[15, 15, 0, 0]} barSize={65}>
                {sectorData.map((entry, index) => (
                  <Cell key={index} fill={entry.score > 70 ? '#059669' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default Matrix;