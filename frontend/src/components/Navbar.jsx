import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Map } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="w-full bg-white border-b border-[#d1fae5] sticky top-0 z-[1000] shadow-sm font-['Outfit']">
      <div className="max-w-7xl mx-auto px-10 h-24 flex justify-between items-center text-inherit">
        <Link to="/" className="flex items-center gap-3 text-2xl font-800 text-[#0f172a] uppercase no-underline">
          <Leaf size={28} className="text-[#059669]" fill="#059669" />
          <span>Civic <span className="text-[#059669]">Pulse</span></span>
        </Link>
        <nav className="flex items-center gap-12 text-inherit">
          <Link to="/reports" className="text-[#059669] font-800 text-[11px] uppercase tracking-[2px] no-underline">Public Reports</Link>
          <Link to="/admin" className="text-[#059669] font-800 text-[11px] uppercase tracking-[2px] no-underline">Admin Lab</Link>
          <Link to="/explore" className="bg-[#f0fdf4] border-2 border-[#059669] px-6 py-3 rounded-2xl text-[#059669] font-800 text-[11px] uppercase no-underline hover:bg-[#059669] hover:text-white transition-all">
            View Locations
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;