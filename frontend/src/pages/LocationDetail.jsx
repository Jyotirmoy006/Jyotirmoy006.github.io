import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, MapPin, ShieldCheck, Activity, 
  MessageCircle, Star, Shield, Bus, Droplets, HardHat, Zap
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

// IMPORTING THE MASTER 5,000 RECORD DATASET
import initialData from '../data/historical_data.json'; 

const LocationDetail = () => {
  const { id } = useParams(); 
  
  // --- 1. DATA INFLECTION (Persistence Layer) ---
  const allData = useMemo(() => {
    try {
      const saved = localStorage.getItem('civic_pulse_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we are using the high-density dataset
        return parsed.length > 3000 ? parsed : initialData;
      }
      return Array.isArray(initialData) ? initialData : [];
    } catch (e) { return []; }
  }, []);

  // --- 2. MULTI-AGENT SECTOR ANALYTICS ---
  const sectorData = useMemo(() => {
    if (!id || allData.length === 0) return null;
    
    // Normalize ID for matching (e.g., "New-Town" -> "new town")
    const targetName = id.replace(/-/g, ' ').toLowerCase().trim();
    
    const locRecords = allData.filter(d => {
        if (!d.loc) return false;
        return d.loc.toString().toLowerCase().trim() === targetName;
    });

    if (locRecords.length === 0) return null;

    // --- ACCURATE PARAMETER CALCULATOR ---
    const getParamScore = (cat) => {
        const mentions = locRecords.filter(d => 
            Array.isArray(d.aspects) && d.aspects.some(a => a.name === cat)
        );
        
        if (mentions.length === 0) return 75; // UI Fallback for empty sectors
        
        // Check the specific status INSIDE the aspect object (for compound logic)
        const positives = mentions.filter(d => {
            const targetAspect = d.aspects.find(a => a.name === cat);
            return targetAspect?.status === 'Positive';
        }).length;
        
        return Math.round((positives / mentions.length) * 100);
    };

    const roads = getParamScore('Roads');
    const hygiene = getParamScore('Hygiene');
    const safety = getParamScore('Safety');
    const transit = getParamScore('Transit');

    const scores = { Roads: roads, Hygiene: hygiene, Safety: safety, Transit: transit };
    
    return {
        displayName: targetName.toUpperCase(),
        pulseScore: ((roads + hygiene + safety + transit) / 4 / 10).toFixed(1),
        chartData: [
            { subject: 'Roads', A: roads },
            { subject: 'Hygiene', A: hygiene },
            { subject: 'Safety', A: safety },
            { subject: 'Transit', A: transit },
        ],
        params: [
            { name: 'Road Quality', val: roads, icon: <HardHat size={20}/>, color: 'emerald' },
            { name: 'Hygiene Index', val: hygiene, icon: <Droplets size={20}/>, color: 'amber' },
            { name: 'Safety Level', val: safety, icon: <Shield size={20}/>, color: 'blue' },
            { name: 'Transit Flow', val: transit, icon: <Bus size={20}/>, color: 'indigo' },
        ],
        reviews: locRecords.slice(0, 10), // Increased to 10 for depth
        confidence: (locRecords.reduce((acc, curr) => 
            acc + (curr.conf ? parseFloat(curr.conf.toString().replace('%', '')) : 95), 0) / locRecords.length).toFixed(1),
        strength: Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b),
        bottleneck: Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b),
        totalPulses: locRecords.length
    };
  }, [id, allData]);

  if (!sectorData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-['Outfit']">
        <div className="text-center">
            <Activity size={48} className="mx-auto text-slate-200 mb-6 animate-pulse" />
            <h2 className="text-2xl font-900 text-slate-400 uppercase tracking-widest">Neural Syncing...</h2>
            <p className="text-slate-400 mt-2">If this persists, perform a Factory Reset on the Reports page.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-32 text-inherit">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-8">
        
        {/* BACK BUTTON */}
        <div className="mb-10 animate-in fade-in slide-in-from-left duration-500">
          <Link to="/explore" className="inline-flex items-center gap-2 text-slate-400 font-900 text-[11px] uppercase tracking-[3px] no-underline hover:text-[#059669] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Metropolitan Matrix
          </Link>
        </div>

        <div className="grid grid-cols-[1.6fr_1fr] gap-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. SECTOR HEADER CARD */}
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-2 text-[#059669] mb-3">
                      <MapPin size={18} />
                      <span className="font-900 text-[10px] uppercase tracking-[4px]">Verified Civic Node</span>
                  </div>
                  <h1 className="text-7xl font-900 text-[#0f172a] tracking-tighter uppercase leading-none">{sectorData.displayName}</h1>
                  <p className="text-slate-400 font-medium mt-6 text-lg">
                    Real-time analysis of <strong>{sectorData.totalPulses}</strong> citizen interactions.
                  </p>
                </div>
                <div className="bg-[#0f172a] text-white p-10 rounded-[40px] text-center min-w-[140px] shadow-2xl">
                  <div className="text-6xl font-900 leading-none">{sectorData.pulseScore}</div>
                  <span className="text-[10px] font-900 opacity-40 uppercase tracking-widest mt-3 block">Pulse Rating</span>
                </div>
              </div>
            </div>

            {/* 2. PARAMETER DENSITY GRID */}
            <div className="grid grid-cols-2 gap-6">
              {sectorData.params.map((p) => (
                <div key={p.name} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl text-[#059669]">{p.icon}</div>
                    <span className="text-4xl font-900 text-[#0f172a] tracking-tighter">{p.val}%</span>
                  </div>
                  <h4 className="font-900 text-[10px] uppercase tracking-[3px] text-slate-400">{p.name}</h4>
                  <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${p.val > 80 ? 'bg-emerald-500' : p.val > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                      style={{ width: `${p.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 3. RADAR EQUILIBRIUM */}
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
              <h3 className="font-900 text-xs uppercase tracking-[5px] text-slate-400 mb-10 flex items-center gap-2">
                <Zap size={16} fill="#059669" className="text-[#059669]" /> Equilibrium Balance
              </h3>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sectorData.chartData}>
                    <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} />
                    <Radar 
                        dataKey="A" 
                        stroke="#059669" 
                        fill="#059669" 
                        fillOpacity={0.3} 
                        strokeWidth={4} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. AUDIT TRAIL (CITIZEN VOICE) */}
            <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm">
               <h3 className="font-900 text-xs uppercase tracking-[5px] text-slate-400 mb-10">Sector Audit Trail</h3>
               <div className="space-y-8">
                  {sectorData.reviews.map((r, i) => (
                    <div key={i} className="group border-l-4 border-slate-50 hover:border-[#059669] pl-8 py-2 transition-all">
                       <div className="flex items-center gap-3 mb-3">
                          <span className={`text-[9px] font-900 px-4 py-1.5 rounded-full uppercase tracking-tighter ${r.status === 'Positive' || r.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {r.status || r.sentiment}
                          </span>
                          <div className="flex gap-2">
                            {(r.aspects || []).map((a, idx) => (
                                <span key={idx} className="text-[8px] font-900 text-slate-300 uppercase tracking-widest">{a.name}</span>
                            ))}
                          </div>
                       </div>
                       <p className="text-slate-600 font-medium italic text-2xl leading-snug tracking-tight">"{r.text}"</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-8 sticky top-32 h-fit animate-in fade-in slide-in-from-right duration-1000">
            {/* SIDEBAR: AI LOGIC */}
            <div className="bg-[#0f172a] p-12 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
               <h3 className="font-900 text-[10px] uppercase tracking-[4px] text-[#059669] mb-10 flex items-center gap-2">
                 <ShieldCheck size={20}/> Neural Verification
               </h3>
               <div className="space-y-8">
                  <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <span className="text-slate-500 text-xs font-900 uppercase">Mean Confidence</span>
                    <span className="font-900 text-3xl text-emerald-400">{sectorData.confidence}%</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <span className="text-slate-500 text-xs font-900 uppercase">Core Strength</span>
                    <span className="font-900 text-xl text-blue-400 uppercase tracking-tighter">{sectorData.strength}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-xs font-900 uppercase">Top Risk</span>
                    <span className="font-900 text-xl text-rose-400 uppercase tracking-tighter">{sectorData.bottleneck}</span>
                  </div>
               </div>
            </div>

            {/* SIDEBAR: EXECUTIVE BRIEF */}
            <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-5">
                   <Activity size={120} className="text-[#059669]" />
               </div>
               <h3 className="font-900 text-[10px] uppercase tracking-[4px] text-slate-400 mb-8 flex items-center gap-2">
                 <Zap size={18} fill="#059669" className="text-[#059669]"/> Executive Brief
               </h3>
               <p className="text-[#0f172a] font-semibold leading-relaxed text-lg">
                 Current metrics indicate that <span className="text-[#059669] underline decoration-2">{sectorData.displayName}</span> is outperforming in <span className="bg-emerald-50 px-2 rounded">{sectorData.strength}</span>. 
               </p>
               <p className="text-slate-500 font-medium text-sm mt-4 leading-relaxed">
                 Neural pattern matching identifies <span className="text-rose-500 font-900">{sectorData.bottleneck}</span> as the primary friction point. System suggests immediate reallocation of civic resources to stabilize this sector's equilibrium.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocationDetail;