
import React, { useMemo, useState } from 'react';
import { TreeData, getSpeciesColor, getImageUrl } from './types';

interface GalleryProps {
  isOpen: boolean;
  onClose: () => void;
  data: TreeData[];
  onSelectTree: (tree: TreeData) => void;
}

// Optimized Card component
const GalleryCard = React.memo(({ tree, onClick }: { tree: TreeData, onClick: () => void }) => {
  const imageUrl = useMemo(() => getImageUrl(tree, 'small'), [tree["Link Drive"]]);
  
  return (
    <div 
      onClick={onClick}
      className="group relative aspect-[3/4] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer hover:border-blue-500/50 transition-all shadow-xl hover:-translate-y-1 duration-300 animate-in fade-in duration-500"
    >
      <img 
        src={imageUrl} 
        alt={String(tree["No Pohon"])}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
        loading="lazy" 
        onError={(e: any) => e.target.src = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300'}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <span className="text-[7px] font-black text-white px-2 py-0.5 rounded-full mb-1 inline-block shadow-lg" style={{ background: getSpeciesColor(tree.Tanaman) }}>
          {tree.Tanaman.toUpperCase()}
        </span>
        <p className="text-white font-black text-xs uppercase truncate tracking-tight">#{tree["No Pohon"]}</p>
        <p className="text-slate-400 text-[8px] font-bold uppercase truncate opacity-70">{tree.Pengawas || 'Surveyor N/A'}</p>
      </div>
    </div>
  );
});

export const Gallery: React.FC<GalleryProps> = ({ isOpen, onClose, data, onSelectTree }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Memoize filtered items for responsiveness
  const galleryItems = useMemo(() => {
    return data
      .filter(d => 
        String(d["No Pohon"]).toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.Tanaman.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.Pengawas && d.Pengawas.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .reverse();
  }, [data, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-3xl flex flex-col p-6 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 max-w-7xl mx-auto w-full gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Visual Archive</h2>
          <p className="text-blue-400 text-[10px] font-black mt-1 tracking-[0.3em] uppercase">Inventory Database: {galleryItems.length} Records</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Cari ID, Jenis, atau Pengawas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-[10px] text-white font-bold outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" /></svg>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl border border-white/20 transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-12">
          {galleryItems.map((tree) => (
            <GalleryCard 
              key={`${tree["No Pohon"]}-${tree.X}`} 
              tree={tree} 
              onClick={() => onSelectTree(tree)} 
            />
          ))}
        </div>
        
        {galleryItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 opacity-30">
            <svg className="w-16 h-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1" /></svg>
            <p className="text-white font-black text-xs uppercase tracking-widest">Tidak ada data visual ditemukan</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] opacity-50">
        Navigasi Spasial Langsung: Klik foto untuk memicu Detail Card
      </div>
    </div>
  );
};
