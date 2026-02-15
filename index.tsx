import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { TreeData, getImageUrl } from './types';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOxKo348A23N-6vdRDWskgwP6a_y9NOrri6Jpde8hw-X7ZrvytimOVb0eK0VcaTjhbCg/exec';
const ADMIN_PIN = '1212';

const GalleryApp: React.FC = () => {
  const [data, setData] = useState<TreeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const normalized = (Array.isArray(json) ? json : []).map((item: any) => ({
        ...item,
        "No Pohon": String(item["No Pohon"] || "").trim(),
        Tanaman: String(item.Tanaman || "").trim(),
        Pengawas: String(item.Pengawas || "").trim(),
        Tanggal: String(item.Tanggal || "").split(/[ T]/)[0].trim(),
        Kesehatan: item.Kesehatan || 'Sehat'
      }));
      setData(normalized.reverse());
    } catch (e) {
      console.error("Fetch Error:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filterOptions = useMemo(() => {
    const pengawasSet = new Set<string>();
    const bibitSet = new Set<string>();
    const tanggalSet = new Set<string>();
    data.forEach(d => {
      if (d.Pengawas) pengawasSet.add(d.Pengawas);
      if (d.Tanaman) bibitSet.add(d.Tanaman);
      if (d.Tanggal) tanggalSet.add(d.Tanggal);
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
        d["No Pohon"].toLowerCase().includes(search.toLowerCase()) ||
        d.Tanaman.toLowerCase().includes(search.toLowerCase()) ||
        d.Pengawas.toLowerCase().includes(search.toLowerCase());
      const matchesPengawas = !selectedPengawas || d.Pengawas === selectedPengawas;
      const matchesBibit = !selectedBibit || d.Tanaman === selectedBibit;
      const matchesTanggal = !selectedTanggal || d.Tanggal === selectedTanggal;
      return matchesSearch && matchesPengawas && matchesBibit && matchesTanggal;
    });
  }, [data, search, selectedPengawas, selectedBibit, selectedTanggal]);

  const goNext = useCallback(() => {
    if (viewerIndex !== null && viewerIndex < filtered.length - 1) setViewerIndex(v => v! + 1);
  }, [viewerIndex, filtered.length]);

  const goPrev = useCallback(() => {
    if (viewerIndex !== null && viewerIndex > 0) setViewerIndex(v => v - 1);
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
      setTimeout(loadData, 2000);
    } catch (e) {
      alert("Gagal menghapus.");
      setIsDeleting(false);
    }
  };

  const activeItem = viewerIndex !== null ? filtered[viewerIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-[100] glass-nav py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="https://i.ibb.co.com/29Gzw6k/montana-AI.jpg" className="w-10 h-10 rounded-xl object-cover border border-slate-200" alt="Logo" />
              <div>
                <h1 className="text-lg font-extrabold tracking-tighter leading-none">MONTANA <span className="text-blue-600">ARCHIVE</span></h1>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Forest Monitoring System</p>
              </div>
            </div>

            <div className="flex-1 max-w-md relative">
              <input 
                type="text" 
                placeholder="Cari ID atau Spesies..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-10 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <button onClick={loadData} className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200">
              <svg className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedPengawas} onChange={(e) => setSelectedPengawas(e.target.value)} className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold uppercase outline-none focus:border-blue-500 min-w-[120px]">
              <option value="">Semua Pengawas</option>
              {filterOptions.pengawas.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={selectedBibit} onChange={(e) => setSelectedBibit(e.target.value)} className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold uppercase outline-none focus:border-blue-500 min-w-[120px]">
              <option value="">Semua Bibit</option>
              {filterOptions.bibit.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={selectedTanggal} onChange={(e) => setSelectedTanggal(e.target.value)} className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] font-bold uppercase outline-none focus:border-blue-500 min-w-[120px]">
              <option value="">Semua Tanggal</option>
              {filterOptions.tanggal.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Total {filtered.length} Aset
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Loading Records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filtered.map((item, idx) => (
              <div 
                key={`${item["No Pohon"]}-${idx}`}
                className="group relative aspect-[3/4] bg-white rounded-3xl overflow-hidden card-shadow cursor-pointer hover:-translate-y-1 transition-all duration-300"
                onClick={() => setViewerIndex(idx)}
              >
                <img src={getImageUrl(item, 'small')} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                
                <div className="absolute bottom-4 left-5 right-5">
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md text-white uppercase ${item.Kesehatan === 'Sehat' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {item.Kesehatan}
                  </span>
                  <h4 className="font-extrabold text-white text-base mt-1 leading-tight">#{item["No Pohon"]}</h4>
                  <p className="text-[9px] font-bold text-slate-200 uppercase truncate">{item.Tanaman}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* IMMERSIVE VIEWER (Gambar Besar, Teks Kecil) */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300"
          onTouchStart={(e) => touchStart.current = e.targetTouches[0].clientX}
          onTouchMove={(e) => touchEnd.current = e.targetTouches[0].clientX}
          onTouchEnd={() => {
            if (touchStart.current - touchEnd.current > 70) goNext();
            if (touchStart.current - touchEnd.current < -70) goPrev();
          }}
        >
          {/* Viewer Toolbar */}
          <div className="p-4 flex justify-between items-center z-10">
            <div className="bg-white/10 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase">Aset {viewerIndex! + 1} / {filtered.length}</div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(String(activeItem["No Pohon"]))} className="bg-red-500/20 text-red-400 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button onClick={() => setViewerIndex(null)} className="bg-white/10 text-white p-2.5 rounded-xl hover:bg-white/20 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* MAXIMIZED IMAGE AREA */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <img 
              src={getImageUrl(activeItem, 'large')} 
              className="max-h-[90%] max-w-[95%] object-contain rounded-lg animate-zoom shadow-2xl" 
              key={String(activeItem["No Pohon"])}
            />
            
            <button onClick={goPrev} className="hidden md:flex absolute left-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-all border border-white/10" disabled={viewerIndex === 0}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goNext} className="hidden md:flex absolute right-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white backdrop-blur-md transition-all border border-white/10" disabled={viewerIndex === filtered.length - 1}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* COMPACT DETAILS PANEL */}
          <div className="bg-slate-900 border-t border-white/5 p-4 md:px-12">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{activeItem.Tanaman}</h2>
                <p className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">ID: #{activeItem["No Pohon"]} • By {activeItem.Pengawas}</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                <div className="bg-white/5 p-2 px-4 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Tinggi</p>
                  <p className="text-xs font-black text-white">{activeItem.Tinggi} cm</p>
                </div>
                <div className="bg-white/5 p-2 px-4 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Status</p>
                  <p className="text-xs font-black text-white">{activeItem.Kesehatan}</p>
                </div>
                <div className="bg-white/5 p-2 px-4 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Tanggal</p>
                  <p className="text-[9px] font-black text-white leading-none">{activeItem.Tanggal}</p>
                </div>
                <div className="bg-white/5 p-2 px-4 rounded-xl text-center border border-white/5">
                  <p className="text-[7px] font-bold text-slate-500 uppercase mb-0.5">Lokasi</p>
                  <p className="text-[8px] font-black text-emerald-400 leading-none">{String(activeItem.X).substring(0,6)}, {String(activeItem.Y).substring(0,6)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full shadow-2xl">
            <h3 className="text-slate-900 font-extrabold text-lg text-center mb-4 uppercase">Hapus Data?</h3>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-100 rounded-xl py-3 px-4 text-center text-slate-900 font-black text-xl tracking-[0.4em] mb-4 outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="****"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            />
            <div className="flex flex-col gap-2">
              <button onClick={handleDelete} className="w-full bg-red-600 text-white rounded-xl py-3 text-[10px] font-black uppercase shadow-lg shadow-red-500/20">Konfirmasi</button>
              <button onClick={() => { setDeleteTarget(null); setPinInput(''); }} className="w-full py-2 text-[10px] font-bold uppercase text-slate-400">Batal</button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-[3000] bg-white/90 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-lg font-black text-slate-900 uppercase">Updating Archive...</h2>
        </div>
      )}

      <footer className="py-12 text-center opacity-30">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Montana AI Systems • Visual Archive v3.0</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<GalleryApp />);
