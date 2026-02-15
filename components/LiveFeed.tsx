
import React from 'react';
import { TreeData, getSpeciesColor, getImageUrl } from '../types';

interface LiveFeedProps {
  data: TreeData[];
  onSelectItem: (item: TreeData) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ data, onSelectItem, onClose, isVisible }) => {
  if (!isVisible || data.length === 0) return null;
  
  const latest = [...data].reverse().slice(0, 4); // Batasi 4 agar tidak terlalu tinggi di HP

  return (
    <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-16 z-[2000] w-[calc(100%-2rem)] sm:w-72 pointer-events-none space-y-3">
      {/* Header dengan tombol tutup */}
      <div className="flex items-center gap-2 mb-4 bg-red-600/95 text-white pl-4 pr-2 py-2 rounded-full w-fit shadow-2xl animate-pulse ml-auto backdrop-blur-md border border-white/20 pointer-events-auto">
        <div className="live-dot"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] mr-2">Live Monitoring</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          title="Sembunyikan"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Container List Notifikasi */}
      <div className="space-y-2 flex flex-col items-end max-h-[50vh] overflow-y-auto no-scrollbar pointer-events-auto">
        {latest.map((item, idx) => (
          <div 
            key={`${item["No Pohon"]}-${idx}`} 
            onClick={() => onSelectItem(item)}
            className="live-feed-item glass border-l-4 p-3 rounded-2xl shadow-xl w-full flex items-center gap-3 cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all bg-white/90"
            style={{ 
              borderLeftColor: getSpeciesColor(item.Tanaman),
              animationDelay: `${idx * 0.1}s`
            }}
          >
            <div className="relative shrink-0">
              <img 
                src={getImageUrl(item, 'small')} 
                className="w-10 h-10 rounded-xl object-cover border border-white/20" 
                alt="thumb"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex justify-between items-center">
                <p className="text-[8px] font-black uppercase leading-none truncate" style={{ color: getSpeciesColor(item.Tanaman) }}>
                  {item.Pengawas}
                </p>
                <span className="text-[7px] font-black text-slate-400">ID #{item["No Pohon"]}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-900 truncate mt-0.5">
                {item.Tanaman}
              </p>
              <div className="flex items-center gap-1 mt-0.5 opacity-60">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter italic">{item.Tanggal}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
