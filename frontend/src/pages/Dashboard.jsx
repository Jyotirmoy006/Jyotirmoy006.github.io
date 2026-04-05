import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  MessageSquare, Zap, Activity, 
  Clock, ArrowUpRight, RefreshCw, ShieldCheck 
} from 'lucide-react';
import initialData from '../data/historical_data.json'; 

const Dashboard = () => {
  const VERSION = "SYNC_5.2_FINAL_STRICT";

  const [livePulses, setLivePulses] = useState(() => {
    try {
      const savedV = localStorage.getItem('pulse_version');
      const savedD = localStorage.getItem('civic_pulse_data');
      if (savedV !== VERSION || !savedD) {
        localStorage.setItem('pulse_version', VERSION);
        localStorage.removeItem('civic_pulse_data');
        return initialData;
      }
      return JSON.parse(savedD);
    } catch (e) { return initialData; }
  });

  const [locationInput, setLocationInput] = useState('');
  const [observationInput, setObservationInput] = useState('');

  useEffect(() => {
    localStorage.setItem('civic_pulse_data', JSON.stringify(livePulses));
    localStorage.setItem('pulse_version', VERSION);
  }, [livePulses]);

  // ✅ CHANGE 1: Sorted highest score first (descending) — synced from dataset
  const dynamicTopCards = useMemo(() => {
    const counts = {};
    (livePulses || []).forEach(p => {
      const loc = p?.loc?.trim() || "Unknown";
      if (!counts[loc]) counts[loc] = { pos: 0, total: 0 };
      counts[loc].total += 1;
      if (p.sentiment === "Positive" || p.status === "Positive") counts[loc].pos += 1;
    });

    return Object.entries(counts)
      .map(([name, data]) => {
        const score = (data.pos / data.total) * 10;
        return { name, score: score.toFixed(1), trend: (score - 7.5).toFixed(1) };
      })
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score)) // ✅ Highest first
      .slice(0, 3);
  }, [livePulses]);

  // ✅ CHANGE 2: Helper — compute sentiment bar for a pulse
  const getSentimentBar = (aspects) => {
    if (!Array.isArray(aspects) || aspects.length === 0) return null;
    const positiveCount = aspects.filter(a => a.status === 'Positive').length;
    const negativeCount = aspects.filter(a => a.status === 'Negative').length;
    const total = aspects.length;
    const posPercent = Math.round((positiveCount / total) * 100);
    const isMostlyPositive = positiveCount >= 2; // ✅ Green if 2+ positive params
    return { positiveCount, negativeCount, posPercent, isMostlyPositive };
  };

  const handleAnalyze = async () => {
    if (!observationInput || !locationInput) return;
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: observationInput }),
      });
      const data = await response.json();
      const text = observationInput.toLowerCase();
      const zones = text.split(/but|and|lekin|par|aur|kintu|ebong|\.|,|;|।/);

      const finalAspects = (data.aspects || []).map(tagName => {
        const zone = zones.find(z => {
          if (tagName === "Roads") return /road|sadak|rasta|pothole|flyover|pul|pitch/i.test(z);
          if (tagName === "Safety") return /safe|light|police|suraksha|nirapotta|alo|cctv/i.test(z);
          if (tagName === "Transit") return /bus|auto|metro|traffic|toto|rickshaw|vahan/i.test(z);
          if (tagName === "Hygiene") return /clean|dirty|waste|garbage|nongra|ganda|naala|vat/i.test(z);
          return false;
        }) || text;

        const negs = ["broken", "bad", "dirty", "dark", "no", "poor", "not", "নয়", "নেই", "ganda", "baje", "nongra", "bekar", "kharab"];
        const isNeg = negs.some(word => zone.includes(word));
        return { name: tagName, status: isNeg ? "Negative" : "Positive" };
      });

      const hasN = finalAspects.some(a => a.status === "Negative");
      const hasP = finalAspects.some(a => a.status === "Positive");

      const newPulse = {
        id: Date.now(), loc: locationInput, text: observationInput,
        aspects: finalAspects, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: (hasP && hasN) ? "Mixed" : hasN ? "Negative" : "Positive",
        conf: data.confidence || "98.9%"
      };

      setLivePulses([newPulse, ...livePulses]);
      setObservationInput(''); setLocationInput('');
    } catch (e) { alert("Check app.py!"); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-32 text-inherit">
      <Navbar />
      <main className="max-w-6xl mx-auto py-16 px-8">
        
        {/* HEADER */}
        <div className="mb-16 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-[#059669]" />
              <span className="text-[10px] font-900 text-[#059669] uppercase tracking-[4px]">Neural Civic Core</span>
            </div>
            <h1 className="text-6xl font-900 text-[#0f172a] tracking-tighter uppercase font-bold text-inherit">City <span className="text-[#059669]">Pulse</span></h1>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 px-6 py-4 rounded-2xl text-[10px] font-900 uppercase tracking-widest border-none cursor-pointer transition-all">
            <RefreshCw size={14} /> Force Sync 5.2
          </button>
        </div>

        {/* SCORECARDS — sorted highest first */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {dynamicTopCards.map((loc, i) => (
            <Link key={i} to={`/location/${loc.name.toLowerCase().replace(/\s+/g, '-')}`} className="no-underline group">
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                {/* ✅ Rank badge — #1 gets a gold tint */}
                {i === 0 && (
                  <span className="absolute top-6 left-6 text-[9px] font-900 uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
                    #1 Highest
                  </span>
                )}
                <ArrowUpRight size={20} className="absolute top-6 right-6 text-[#059669] opacity-0 group-hover:opacity-100 transition-all" />
                <span className="text-[10px] font-900 text-slate-400 uppercase tracking-widest block mb-6 mt-4">{loc.name}</span>
                <div className="text-7xl font-900 text-[#0f172a] mb-2 tracking-tighter group-hover:text-[#059669] transition-colors">{loc.score}</div>
                <div className={`font-900 text-[11px] uppercase tracking-tighter ${parseFloat(loc.trend) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {parseFloat(loc.trend) >= 0 ? `+${loc.trend}` : loc.trend} Pulse Shift
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* INPUT BOX */}
        <div className="bg-[#0f172a] p-16 rounded-[48px] shadow-2xl mb-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#059669]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-14">
                <div className="bg-[#059669] p-4 rounded-2xl shadow-lg"><MessageSquare size={36} className="text-white" /></div>
                <h2 className="text-4xl font-900 text-white tracking-tight uppercase">Post Local Insight</h2>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-8 mb-10">
                <input value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="bg-white/5 border border-white/10 p-6 rounded-[24px] outline-none focus:border-[#059669] text-white font-semibold text-inherit" placeholder="Location..." />
                <input value={observationInput} onChange={(e) => setObservationInput(e.target.value)} className="bg-white/5 border border-white/10 p-6 rounded-[24px] outline-none focus:border-[#059669] text-white font-semibold text-inherit" placeholder="Sadak is broken but safety is bright..." />
            </div>
            <button onClick={handleAnalyze} className="w-full bg-[#059669] hover:bg-[#047857] text-white py-8 rounded-[24px] text-xl font-900 flex justify-center items-center gap-4 transition-all active:scale-[0.98] border-none cursor-pointer">
                ANALYZE NEURAL PULSE <Zap fill="currentColor" size={24} />
            </button>
          </div>
        </div>

        {/* FEED */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-xs font-900 text-slate-400 uppercase tracking-[6px] mb-12 flex items-center gap-4">
            <Activity className="text-[#059669] animate-pulse" size={20} /> Latest Civic Traces
          </h3>
          {(livePulses || []).slice(0, 15).map((pulse) => {
            const bar = getSentimentBar(pulse.aspects); // ✅ Compute bar data
            return (
              <div key={pulse.id} className="bg-white p-10 rounded-[40px] border border-slate-100 flex flex-col gap-6 hover:shadow-xl transition-all duration-300">
                
                {/* Top row: status stripe + content + time */}
                <div className="flex items-center gap-10">
                  <div className={`w-2.5 h-16 rounded-full shrink-0 ${pulse.status === 'Mixed' ? 'bg-orange-400' : pulse.status === 'Positive' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h4 className="font-900 text-[#0f172a] text-[13px] uppercase tracking-tighter">{pulse.loc}</h4>
                      {(Array.isArray(pulse.aspects) ? pulse.aspects : []).map((a, idx) => (
                        <span key={idx} className={`text-[9px] font-900 px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                          a.status === 'Positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>{a.name}</span>
                      ))}
                    </div>
                    <p className="text-[#475569] font-medium text-2xl leading-snug italic">"{pulse.text}"</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-2 text-[11px] font-900 text-slate-300 uppercase mb-4"><Clock size={14} /> {pulse.time}</div>
                    <div className="text-[10px] font-900 text-slate-400 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">AI: {pulse.conf}</div>
                  </div>
                </div>

                {/* ✅ CHANGE 2: Sentiment bar — green if 2+ positive, red-mix otherwise */}
                {bar && (
                  <div className="pl-[calc(0.625rem+2.5rem)] pr-0">
                    <div className="flex items-center gap-3">
                      {/* Bar track */}
                      <div className="flex-grow h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${bar.posPercent}%`,
                            backgroundColor: bar.isMostlyPositive ? '#059669' : '#f43f5e',
                          }}
                        />
                      </div>
                      {/* Labels */}
                      <span className={`text-[10px] font-900 uppercase tracking-widest shrink-0 ${bar.isMostlyPositive ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {bar.positiveCount}+ / {bar.negativeCount}- 
                        {bar.isMostlyPositive ? ' · Good' : ' · Needs Attention'}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;