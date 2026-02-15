
import React, { useMemo } from 'react';
import { TreeData, HealthStatus } from '../types';

interface SidebarProps {
  data: TreeData[];
  onSearch: (query: string) => void;
  aiInsight: string;
  isAiLoading: boolean;
  onToggleBoundary: () => void;
  showBoundary: boolean;
  onKmzUpload?: (geojson: any) => void;
  // Props baru untuk Kontrol Data
  isLiveSync: boolean;
  onToggleLiveSync: () => void;
  onManualRefresh: () => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  data, onSearch, onToggleBoundary, showBoundary, 
  onKmzUpload, isLiveSync, onToggleLiveSync, onManualRefresh, isLoading 
}) => {
  const stats = useMemo(() => {
    const surveyors: Record<string, number> = {};
    data.forEach(d => {
      if (d.Pengawas) surveyors[d.Pengawas] = (surveyors[d.Pengawas] || 0) + 1;
    });
    
    return {
      total: data.length,
      healthy: data.filter(d => d.Kesehatan === HealthStatus.HEALTHY).length,
      surveyorList: Object.entries(surveyors).sort((a,b) => b[1] - a[1])
    };
  }, [data]);

  const handleKmzFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onKmzUpload) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const dom = new DOMParser().parseFromString(text, 'text/xml');
        // @ts-ignore
        const geojson = window.toGeoJSON.kml(dom);
        onKmzUpload(geojson);
      } catch (err) {
        alert("Gagal memproses file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 w-full pointer-events-none sm:fixed sm:top-28 sm:left-6 sm:bottom-6 sm:w-80 sm:z-[1000]">
      {/* Search Bar */}
      <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl sm:rounded-[2rem] shadow-2xl pointer-events-auto border border-white/10">
        <input
          type="text"
          placeholder="Cari ID atau Jenis..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Main Stats Panel */}
      <div className="bg-slate-900/95 backdrop-blur-2xl p-6 rounded-3xl sm:rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-y-auto custom-scrollbar border border-white/10 flex-1 space-y-6">
        
        {/* DATA ENGINE CONTROL - Solusi untuk Lag/Berat */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLiveSync ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Data Engine</p>
            </div>
            <button 
              onClick={onToggleLiveSync} 
              className={`text-[9px] font-black px-3 py-1 rounded-full transition-all border ${isLiveSync ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              {isLiveSync ? 'LIVE SYNC' : 'SNAPSHOT'}
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <p className="text-[8px] text-slate-500 uppercase leading-relaxed font-bold">
              {isLiveSync 
                ? "Auto-update aktif. Performa menurun di jaringan lambat." 
                : "Aplikasi lebih ringan. Data diperbarui hanya jika diminta."}
            </p>
            {!isLiveSync && (
              <button 
                onClick={onManualRefresh}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            )}
          </div>
        </div>

        {/* Manual KMZ Upload */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Upload KML/GeoJSON Manual</p>
          <div className="relative group cursor-pointer">
            <input 
              type="file" 
              accept=".kml,.geojson" 
              onChange={handleKmzFile} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            />
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 text-center group-hover:bg-blue-600/30 transition-all">
              <span className="text-[9px] font-black text-blue-400 uppercase">Pilih File KMZ/KML</span>
            </div>
          </div>
        </div>

        {/* Population Stats */}
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Total Populasi</span>
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none">{stats.total} <span className="text-xs text-blue-500 italic">Pah</span></h2>
          <div className="flex items-center gap-2 mt-4">
             <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(stats.healthy/stats.total)*100}%` }} />
             </div>
             <span className="text-[9px] font-black text-emerald-500">{Math.round((stats.healthy/stats.total)*100)}% OK</span>
          </div>
        </div>

        {/* Boundary Control */}
        <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/10 group hover:bg-white/10 transition-all">
          <div>
            <p className="text-[9px] font-black uppercase text-blue-400">Layer Batas Proyek</p>
            <p className="text-[7px] text-slate-500 uppercase">Visibilitas Master Plan</p>
          </div>
          <button onClick={onToggleBoundary} className={`w-10 h-5 rounded-full relative transition-all ${showBoundary ? 'bg-blue-600' : 'bg-slate-800'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showBoundary ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
