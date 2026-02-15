
import React from 'react';
import { TreeData, HEALTH_COLORS } from '../types';

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  data: TreeData[];
  onSelectTree: (tree: TreeData) => void;
  getImageUrl: (url: string) => string; // Deprecated in favor of extractor
  treeImageUrlExtractor: (tree: TreeData) => string;
}

const Gallery: React.FC<GalleryProps> = ({ isOpen, onClose, data, onSelectTree, treeImageUrlExtractor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/85 backdrop-blur-3xl flex flex-col p-6 md:p-12 animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Katalog Visual Realisasi</h2>
          <p className="text-blue-400 text-xs font-bold mt-1 tracking-[0.2em] uppercase">Sinkronisasi Database Visual: {data.length} Pohon</p>
        </div>
        <button 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl transition-all border border-white/20 active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {data.map((tree) => (
            <div 
              key={tree["No Pohon"] + String(tree.X)}
              onClick={() => onSelectTree(tree)}
              className="group relative aspect-[3/4] bg-slate-800 rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-2xl"
            >
              <img 
                src={treeImageUrlExtractor(tree)} 
                alt={tree.Tanaman}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                loading="lazy"
                onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300'}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                <span className="text-white text-[8px] font-black uppercase">#${tree["No Pohon"]}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 translate-y-1 group-hover:translate-y-0 transition-transform">
                <span 
                  className="text-[7px] font-black px-1.5 py-0.5 rounded-full text-white mb-1 inline-block shadow-lg"
                  style={{ backgroundColor: HEALTH_COLORS[tree.Kesehatan] }}
                >
                  {tree.Kesehatan.toUpperCase()}
                </span>
                <h3 className="text-white font-black text-sm leading-tight uppercase truncate">{tree.Tanaman}</h3>
                <p className="text-slate-400 text-[9px] font-bold mt-0.5 truncate tracking-tight">{tree.Pengawas || 'N/A'}</p>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-500 font-bold uppercase tracking-widest">Tidak ada foto ditemukan dalam database</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] opacity-50">
        Klik kartu untuk navigasi cepat ke lokasi peta
      </div>
    </div>
  );
};

export default Gallery;
