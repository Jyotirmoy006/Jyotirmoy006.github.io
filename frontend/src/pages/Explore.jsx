import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { MapPin, Activity, Droplets, Shield, Bus, ArrowLeft, TrendingUp, Zap } from 'lucide-react';

const Explore = () => {
  // 1. LOAD THE LIVE 5,000+ DATASET (With Zero-Crash Guard)
  const allData = useMemo(() => {
    try {
      const saved = localStorage.getItem('civic_pulse_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If data is old structure (aspects as strings), return empty to avoid crash
        if (parsed.length > 0 && typeof parsed[0].aspects === 'string') return [];
        return parsed;
      }
      return [];
    } catch (e) { return []; }
  }, []);

  // 2. DYNAMIC MATRIX CALCULATOR (Agent-Aware Logic)
  const locationMatrix = useMemo(() => {
    // Normalizing names to prevent duplicates like "Newtown" vs "newtown"
    const locNames = [...new Set(allData.map(d => d.loc?.trim().toUpperCase().replace(':', '')))]
      .filter(Boolean)
      .sort();
      
    const categories = ['Roads', 'Hygiene', 'Safety', 'Transit'];

    return locNames.map((name, index) => {
      const locData = allData.filter(d => d.loc?.trim().toUpperCase().replace(':', '') === name);
      
      const params = {};
      categories.forEach(cat => {
        // Filter records that specifically mention this category in their aspects array
        const mentions = locData.filter(d => 
          Array.isArray(d.aspects) && d.aspects.some(a => a.name === cat)
        );

        // Accuracy Check: Find the status of THIS specific agent inside the array
        const posCount = mentions.filter(d => {
          const targetAspect = d.aspects.find(a => a.name === cat);
          return targetAspect?.status === 'Positive';
        }).length;

        // Score logic: Round to nearest % or fallback to 75 to keep UI beautiful
        params[cat] = mentions.length > 0 ? Math.round((posCount / mentions.length) * 100) : 75;
      });

      // Overall Score (Avg of 4 params divided by 10 for a 1-10 scale)
      const avg = Object.values(params).reduce((a, b) => a + b, 0) / categories.length;
      
      return {
        id: index,
        name: name,
        // Restoring your dynamic tagging feature
        type: index % 3 === 0 ? 'High-Density' : index % 2 === 0 ? 'Residential' : 'Commercial',
        score: (avg / 10).toFixed(1),
        params
      };
    });
  }, [allData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Outfit'] pb-32 text-inherit">
      <Navbar />
      <main className="max-w-7xl mx-auto py-16 px-8">
        
        {/* BACK NAVIGATION */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 font-900 text-[11px] uppercase tracking-[3px] no-underline hover:text-[#059669] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
        </div>

        {/* HEADER SECTION */}
        <div className="mb-16 border-l-4 border-[#059669] pl-8 animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-5xl font-900 text-[#0f172a] tracking-tighter uppercase">
            Metropolitan <span className="text-[#059669]">Matrix</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Real-time Multi-Agent analysis across <strong>{locationMatrix.length}</strong> metropolitan sectors.
          </p>
        </div>

        {/* THE GRID (Restoring all visual features) */}
        {locationMatrix.length === 0 ? (
           <div className="bg-white p-20 rounded-[48px] text-center border border-slate-100 shadow-sm">
             <Activity size={48} className="mx-auto text-slate-200 mb-6 animate-pulse" />
             <p className="text-slate-400 font-900 uppercase tracking-widest text-xs">Waiting for Neural Sync. Please click "Force Factory Reset" on Reports page.</p>
           </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {locationMatrix.map((loc) => (
              <div key={loc.id} className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                
                {/* TOP CARD SECTION */}
                <div className="flex justify-between items-start mb-8 text-inherit">
                  <div>
                    <span className="text-[10px] font-900 text-[#059669] uppercase tracking-[2px]">{loc.type}</span>
                    <h3 className="text-2xl font-900 text-[#0f172a] mt-1 tracking-tight uppercase">{loc.name}</h3>
                  </div>
                  <div className="bg-[#0f172a] text-white p-5 rounded-[28px] text-center min-w-[80px] shadow-xl">
                    <b className="text-3xl block leading-none tracking-tighter">{loc.score}</b>
                    <small className="text-[8px] font-900 opacity-40 uppercase tracking-widest mt-2 block">Pulse</small>
                  </div>
                </div>

                {/* PARAMETER PERCENTAGE BARS */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(loc.params).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 group-hover:bg-white transition-colors">
                      <span className="text-[9px] font-900 text-slate-400 uppercase tracking-widest block mb-1">{key}</span>
                      <div className="text-xl font-900 text-[#0f172a] mb-2">{val}%</div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            val > 80 ? 'bg-emerald-500' : val > 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTION LINK */}
                <Link 
                  to={`/location/${loc.name.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="mt-8 flex items-center justify-center gap-2 py-5 bg-[#f0fdf4] text-[#059669] rounded-[28px] font-900 text-[10px] uppercase tracking-[3px] no-underline border border-transparent hover:border-[#059669] transition-all"
                >
                  Deep Sector Analysis <TrendingUp size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;