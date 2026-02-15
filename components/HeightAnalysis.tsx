
import React, { useMemo } from 'react';
import { TreeData, getSpeciesColor } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';

interface HeightAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  data: TreeData[];
}

const HeightAnalysis: React.FC<HeightAnalysisProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  // Helper untuk membersihkan input angka dari string/spreadsheet
  const safeParse = (val: any) => {
    if (typeof val === 'number') return val;
    const cleaned = String(val || '0').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const analysis = useMemo(() => {
    const valid = data.filter(d => safeParse(d.Tinggi) > 0);
    if (valid.length === 0) return null;

    // 1. Species Average Height
    const speciesMap: Record<string, { total: number, count: number, min: number, max: number }> = {};
    valid.forEach(d => {
      const h = safeParse(d.Tinggi);
      if (!speciesMap[d.Tanaman]) {
        speciesMap[d.Tanaman] = { total: 0, count: 0, min: h, max: h };
      }
      speciesMap[d.Tanaman].total += h;
      speciesMap[d.Tanaman].count += 1;
      speciesMap[d.Tanaman].min = Math.min(speciesMap[d.Tanaman].min, h);
      speciesMap[d.Tanaman].max = Math.max(speciesMap[d.Tanaman].max, h);
    });

    const speciesChartData = Object.entries(speciesMap).map(([name, stats]) => ({
      name,
      avg: Math.round(stats.total / stats.count),
      min: stats.min,
      max: stats.max,
      count: stats.count,
      color: getSpeciesColor(name)
    })).sort((a, b) => b.avg - a.avg);

    // 2. Individual Height Scatter Plot Data
    const scatterData = valid.map((tree, index) => ({
      x: index + 1,
      y: safeParse(tree.Tinggi),
      id: String(tree["No Pohon"]),
      species: tree.Tanaman,
      color: getSpeciesColor(tree.Tanaman)
    }));

    // 3. Top 10 Tallest
    const tallest = [...valid].sort((a, b) => safeParse(b.Tinggi) - safeParse(a.Tinggi)).slice(0, 10);

    return { speciesChartData, tallest, scatterData, total: valid.length };
  }, [data]);

  return (
    <div className="fixed inset-0 z-[5500] bg-slate-950/95 backdrop-blur-3xl flex flex-col p-6 md:p-10 animate-in fade-in slide-in-from-right-10 duration-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl shadow-2xl overflow-hidden border-2 border-white/30">
            <img src="https://i.ibb.co.com/29Gzw6k/montana-AI.jpg" className="w-full h-full object-cover" alt="Montana AI Logo" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Height Stratification</h2>
            <p className="text-blue-400 text-[10px] font-black tracking-[0.4em] uppercase">Vertical Forest Structure Analysis</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-3xl border border-white/20 transition-all active:scale-90 shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {!analysis ? (
        <div className="flex-1 flex items-center justify-center">
           <p className="text-slate-500 font-black uppercase tracking-widest animate-pulse">Menunggu Data Valid (Tinggi > 0)...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full pr-4 space-y-8 pb-12">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Populasi Teranalisis</h4>
              <div className="text-5xl font-black text-white">{analysis.total} <span className="text-sm text-blue-500">Unit</span></div>
            </div>
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rata-rata Tinggi Global</h4>
              <div className="text-5xl font-black text-white">
                {Math.round(analysis.speciesChartData.reduce((acc, curr) => acc + (curr.avg * curr.count), 0) / analysis.total)} 
                <span className="text-sm text-emerald-500 uppercase ml-2">cm</span>
              </div>
            </div>
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Variansi Spesies</h4>
              <div className="text-5xl font-black text-white">{analysis.speciesChartData.length} <span className="text-sm text-orange-500">Takson</span></div>
            </div>
          </div>

          {/* Scatter Diagram - Individual Height Distribution */}
          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> 
                  Distribusi Tinggi Individual (Scatter)
                </h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Setiap titik mewakili satu pohon dalam database</p>
              </div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full bg-black/40">
                Sumbu Y: Tinggi (cm) • Sumbu X: Urutan Index
              </p>
            </div>
            
            {/* Parent container harus punya height absolut untuk ResponsiveContainer */}
            <div className="h-96 w-full overflow-x-auto custom-scrollbar bg-black/40 rounded-3xl p-6 border border-white/5">
              <div style={{ width: Math.max(analysis.scatterData.length * 15, 800), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="x" 
                      type="number" 
                      name="Index" 
                      stroke="#475569" 
                      fontSize={10} 
                      tick={{ fill: '#475569' }}
                      tickFormatter={(val) => `#${val}`}
                    />
                    <YAxis 
                      dataKey="y" 
                      type="number" 
                      name="Tinggi" 
                      unit=" cm" 
                      stroke="#475569" 
                      fontSize={10} 
                      tick={{ fill: '#475569' }}
                    />
                    <ZAxis type="number" range={[100, 100]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Pohon ID: {d.id}</p>
                              <p className="text-white font-black text-xs uppercase">{d.species}</p>
                              <div className="h-[1px] bg-white/10 my-2" />
                              <p className="text-emerald-400 font-black text-xl leading-none">{d.y} <span className="text-[10px] uppercase">cm</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Pohon" data={analysis.scatterData}>
                      {analysis.scatterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          strokeWidth={2} 
                          stroke="rgba(255,255,255,0.2)" 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tallest Ranking */}
          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" /> Top 10 Pohon Tertinggi (cm)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {analysis.tallest.map((tree, idx) => (
                <div key={idx} className="bg-slate-800/50 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-[10px]">#{idx+1}</div>
                    <div className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-lg">ID: {tree["No Pohon"]}</div>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">{tree.Tinggi} <span className="text-[10px] text-slate-500">CM</span></div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{tree.Tanaman}</div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[8px] font-black text-blue-500 uppercase truncate">{tree.Pengawas}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] opacity-40">
        AI Structural Analysis Engine • Montana Ecosystem Monitoring
      </div>
    </div>
  );
};

export default HeightAnalysis;
