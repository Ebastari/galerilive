
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { TreeData, getSpeciesColor, getImageUrl } from './types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOxKo348A23N-6vdRDWskgwP6a_y9NOrri6Jpde8hw-X7ZrvytimOVb0eK0VcaTjhbCg/exec';
const ADMIN_PIN = '1212';

const GalleryApp: React.FC = () => {
  const [data, setData] = useState<TreeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // States for specific filters
  const [selectedPengawas, setSelectedPengawas] = useState('');
  const [selectedBibit, setSelectedBibit] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?t=${Date.now()}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json.reverse() : []);
    } catch (e) {
      console.error("Fetch Error:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate unique options for filters
  const filterOptions = useMemo(() => {
    const pengawasSet = new Set<string>();
    const bibitSet = new Set<string>();
    const tanggalSet = new Set<string>();

    data.forEach(d => {
      if (d.Pengawas) pengawasSet.add(d.Pengawas);
      if (d.Tanaman) bibitSet.add(d.Tanaman);
      if (d.Tanggal) {
        // Extract only date part (remove time if present)
        const dateOnly = d.Tanggal.split(' ')[0];
        tanggalSet.add(dateOnly);
      }
    });

    return {
      pengawas: Array.from(pengawasSet).sort(),
      bibit: Array.from(bibitSet).sort(),
      tanggal: Array.from(tanggalSet).sort((a, b) => b.localeCompare(a))
    };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(d => {
      const matchesSearch = 
        String(d["No Pohon"]).toLowerCase().includes(search.toLowerCase()) ||
        d.Tanaman.toLowerCase().includes(search.toLowerCase()) ||
        String(d.Pengawas || "").toLowerCase().includes(search.toLowerCase());

      const matchesPengawas = !selectedPengawas || d.Pengawas === selectedPengawas;
      const matchesBibit = !selectedBibit || d.Tanaman === selectedBibit;
      const matchesTanggal = !selectedTanggal || d.Tanggal.split(' ')[0] === selectedTanggal;

      return matchesSearch && matchesPengawas && matchesBibit && matchesTanggal;
    });
  }, [data, search, selectedPengawas, selectedBibit, selectedTanggal]);

  const resetFilters = () => {
    setSearch('');
    setSelectedPengawas('');
    setSelectedBibit('');
    setSelectedTanggal('');
  };

  const goNext = useCallback(() => {
    if (viewerIndex !== null && viewerIndex < filtered.length - 1) setViewerIndex(v => v! + 1);
  }, [viewerIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (viewerIndex !== null && viewerIndex > 0) setViewerIndex(v => v! - 1);
  }, [viewerIndex]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (viewerIndex === null) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setViewerIndex(null);
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [viewerIndex, goNext, goPrev]);

  const handleDelete = async () => {
    if (pinInput !== ADMIN_PIN) {
      alert("PIN Salah!");
      return;
    }
    setIsDeleting(true);
    const targetId = deleteTarget;
    setDeleteTarget(null);
    setPinInput('');

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'delete', pohonId: String(targetId) })
      });
      setViewerIndex(null);
      setTimeout(loadData, 2500);
    } catch (e) {
      alert("Gagal menghapus.");
      setIsDeleting(false);
    }
  };

  const activeItem = viewerIndex !== null ? filtered[viewerIndex] : null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 selection:bg-blue-500/30">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                  <img src="https://i.ibb.co.com/29Gzw6k/montana-AI.jpg" className="w-full h-full object-cover" alt="Montana AI" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Visual <span className="text-blue-500">Archive</span></h1>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Satellite Monitoring System</p>
                </div>
              </div>

              <div className="flex-1 max-w-md relative">
                <input 
                  type="text" 
                  placeholder="Cari ID, Spesies, atau Pengawas..."
                  className="w-full bg-white/80 border border-slate-200 rounded-2xl py-3.5 px-12 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <button 
                onClick={loadData}
                className={`p-3.5 rounded-2xl bg-white/80 border border-slate-200 hover:bg-slate-100 transition-all ${isLoading ? 'animate-spin' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            {/* Sub-Filters Bar */}
            <div className="flex flex-wrap items-center gap-3">
               <select 
                  value={selectedPengawas}
                  onChange={(e) => setSelectedPengawas(e.target.value)}
                  className="bg-white/80 border border-slate-200 rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <option value="" className="bg-white">Semua Pengawas</option>
                  {filterOptions.pengawas.map(p => <option key={p} value={p} className="bg-white">{p}</option>)}
                </select>

                <select 
                  value={selectedBibit}
                  onChange={(e) => setSelectedBibit(e.target.value)}
                  className="bg-white/80 border border-slate-200 rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <option value="" className="bg-white">Semua Jenis Bibit</option>
                  {filterOptions.bibit.map(b => <option key={b} value={b} className="bg-white">{b}</option>)}
                </select>

                <select 
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="bg-white/80 border border-slate-200 rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <option value="" className="bg-white">Semua Tanggal</option>
                  {filterOptions.tanggal.map(t => <option key={t} value={t} className="bg-white">{t}</option>)}
                </select>

              {(selectedPengawas || selectedBibit || selectedTanggal || search) && (
                <button 
                  onClick={resetFilters}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  Reset Filter
                </button>
              )}

              <div className="ml-auto text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Menampilkan {filtered.length} dari {data.length} aset
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-6">
            <div className="w-16 h-16 border-[6px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-[0.5em] animate-pulse">Syncing Mission Database</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-48 opacity-20">
            <svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-2xl font-black uppercase tracking-widest italic">No Records Found</h3>
            <p className="text-[10px] mt-2 font-bold uppercase tracking-widest">Coba sesuaikan filter pencarian Anda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map((item, idx) => (
              <div 
                key={String(item["No Pohon"])}
                className="group relative aspect-[3/4] bg-slate-200 rounded-[2.5rem] overflow-hidden border border-slate-200 cursor-pointer shadow-2xl hover:-translate-y-2 transition-all duration-500"
                onClick={() => setViewerIndex(idx)}
              >
                <img 
                  src={getImageUrl(item, 'small')} 
                   className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                  loading="lazy" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-40" />
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(String(item["No Pohon"])); }}
                  className="absolute top-5 right-5 p-3.5 bg-red-600/20 backdrop-blur-md rounded-2xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white border border-red-500/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <div className="absolute bottom-6 left-7 right-7">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">{item.Kesehatan}</span>
                  </div>
                  <h4 className="font-black text-lg uppercase tracking-tight truncate">#{item["No Pohon"]}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase truncate mt-0.5">{item.Tanaman}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Full Screen Viewer Overlay */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-[1000] bg-black flex flex-col animate-in fade-in duration-300"
          onTouchStart={(e) => touchStart.current = e.targetTouches[0].clientX}
          onTouchMove={(e) => touchEnd.current = e.targetTouches[0].clientX}
          onTouchEnd={() => {
            if (touchStart.current - touchEnd.current > 70) goNext();
            if (touchStart.current - touchEnd.current < -70) goPrev();
          }}
        >
          {/* Viewer Nav */}
          <div className="p-6 md:p-8 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            <div className="bg-blue-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-blue-500/30">Item {viewerIndex! + 1} / {filtered.length}</div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteTarget(String(activeItem["No Pohon"]))}
                className="bg-red-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-red-700 transition-all flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus
              </button>
              <button 
                onClick={() => setViewerIndex(null)}
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl text-white hover:bg-white/20 border border-white/10 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Large Image */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#020617]">
            <img 
              src={getImageUrl(activeItem, 'large')} 
              className="max-h-full max-w-full object-contain md:p-10 transition-all duration-500 transform scale-100" 
              key={String(activeItem["No Pohon"])}
            />
            
            {/* Nav Arrows */}
            <button onClick={goPrev} className="hidden md:flex absolute left-10 p-7 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-0 border border-white/10" disabled={viewerIndex === 0}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goNext} className="hidden md:flex absolute right-10 p-7 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-all disabled:opacity-0 border border-white/10" disabled={viewerIndex === filtered.length - 1}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Detail Footer */}
          <div className="p-8 md:p-12 bg-slate-900 border-t border-white/5 bg-gradient-to-t from-black to-slate-900/50">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-10">
              <div className="text-center lg:text-left flex-1">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3">{activeItem.Tanaman}</h2>
                <p className="text-blue-500 text-sm font-black tracking-[0.3em] uppercase">ID: #{activeItem["No Pohon"]} • Surveyor: {activeItem.Pengawas || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto text-center">
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Tinggi</p><p className="text-xl font-black">{activeItem.Tinggi} <span className="text-[10px] text-blue-500">CM</span></p></div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Status</p><p className="text-xl font-black">{activeItem.Kesehatan}</p></div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Tanggal</p><p className="text-[10px] font-black leading-tight mt-1">{activeItem.Tanggal.split(' ')[0]}</p></div>
                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Lokasi</p><p className="text-[10px] font-black leading-tight text-emerald-400 mt-1">{activeItem.X}, {activeItem.Y}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-slate-900 font-black text-xl uppercase italic tracking-tighter text-center mb-2">PIN Keamanan</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center mb-8">Data #{deleteTarget} akan dihapus</p>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-100 border-none rounded-2xl py-5 px-6 text-center text-slate-900 font-black text-2xl tracking-[0.5em] mb-6 outline-none focus:ring-4 focus:ring-red-500/10"
              placeholder="****"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            />
            <div className="flex flex-col gap-2">
              <button onClick={handleDelete} className="w-full bg-red-600 text-white rounded-2xl py-4 text-[10px] font-black uppercase shadow-xl shadow-red-500/30">Konfirmasi Hapus</button>
              <button onClick={() => { setDeleteTarget(null); setPinInput(''); }} className="w-full py-4 text-[10px] font-black uppercase text-slate-400">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Loading State */}
      {isDeleting && (
        <div className="fixed inset-0 z-[3000] bg-red-600/95 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-20 h-20 border-[8px] border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Database Syncing...</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60 mt-4">Removing asset from mission control</p>
        </div>
      )}

      <footer className="py-12 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.8em]">Montana AI Systems • Visual Archive 2.6</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<GalleryApp />);
