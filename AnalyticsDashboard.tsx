
import React, { useMemo } from 'react';
import { TreeData, getSpeciesColor } from './types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Scatter, Line, ComposedChart, Cell, ScatterChart, ZAxis
} from 'recharts';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  data: TreeData[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose, data }) => {
  const safeParse = (val: any) => {
    if (typeof val === 'number') return val;
    const cleaned = String(val || '0').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const stats = useMemo(() => {
    const valid = data.filter(d => safeParse(d.Tinggi) >= 10); 
    const n = valid.length;
    if (n === 0) return null;

    const surveyors: Record<string, number> = {};
    data.forEach(d => { if (d.Pengawas) surveyors[d.Pengawas] = (surveyors[d.Pengawas] || 0) + 1; });
    const surveyorList = Object.entries(surveyors).sort((a,b) => b[1] - a[1]);

    const heights = valid.map(d => safeParse(d.Tinggi) / 100);
    const meanH = heights.reduce((a, b) => a + b, 0) / n;
    const totalC_kg = valid.reduce((acc, curr) => acc + (curr.carbon || 0), 0);
    const totalC_ton = totalC_kg / 1000;
    const totalCO2e_ton = totalC_ton * (44/12);

    const points = valid.map(d => ({ x: safeParse(d.Tinggi) / 100, y: d.carbon || 0 }));
    const sumX = points.reduce((a, b) => a + b.x, 0);
    const sumY = points.reduce((a, b) => a + b.y, 0);
    const sumXY = points.reduce((a, b) => a + (b.x * b.y), 0);
    const sumX2 = points.reduce((a, b) => a + (b.x * b.x), 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const regressionLine = [
      { x: Math.min(...points.map(p => p.x)), y: slope * Math.min(...points.map(p => p.x)) + intercept },
      { x: Math.max(...points.map(p => p.x)), y: slope * Math.max(...points.map(p => p.x)) + intercept }
    ];

    // Individual Scatter Profil (Tinggi dalam Meter)
    const scatterByID = valid.map((d, idx) => ({
      x: idx + 1,
      y: safeParse(d.Tinggi) / 100,
      id: String(d["No Pohon"]),
      color: getSpeciesColor(d.Tanaman),
      species: d.Tanaman
    }));

    return { n, meanH, totalC_ton, totalCO2e_ton, regLine: regressionLine, points, surveyorList, scatterByID };
  }, [data]);

  const exportKML = () => {
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Montana AI Inventory Export</name>
    <Style id="pohonPoint">
      <IconStyle><scale>1.2</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon></IconStyle>
    </Style>`;

    data.forEach(t => {
      const lat = String(t.X).replace(',', '.');
      const lon = String(t.Y).replace(',', '.');
      kml += `
    <Placemark>
      <name>#${t["No Pohon"]} - ${t.Tanaman}</name>
      <description>Pengawas: ${t.Pengawas}\nTinggi: ${t.Tinggi}cm\nKesehatan: ${t.Kesehatan}</description>
      <styleUrl>#pohonPoint</styleUrl>
      <Point><coordinates>${lon},${lat},0</coordinates></Point>
    </Placemark>`;
    });

    kml += `
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Montana_Export_${new Date().toISOString().split('T')[0]}.kml`;
    link.click();
  };

  const exportPhotoCSV = () => {
    let csv = "ID Pohon,Jenis,Pengawas,Tinggi,Kesehatan,Link Drive\n";
    data.forEach(t => {
      csv += `"${t["No Pohon"]}","${t.Tanaman}","${t.Pengawas}","${t.Tinggi}","${t.Kesehatan}","${t["Link Drive"]}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Montana_Photo_List_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-slate-950 flex flex-col p-8 overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src="https://i.ibb.co.com/29Gzw6k/montana-AI.jpg" className="w-full h-full object-cover" alt="Montana AI Logo" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Intelligence Hub</h2>
            <p className="text-emerald-400 text-[10px] font-black tracking-widest uppercase mt-2">Analytical Insights & Data Distribution</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={exportKML}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export KML
          </button>
          <button 
            onClick={exportPhotoCSV}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Daftar Foto
          </button>
          <button onClick={onClose} className="bg-white/10 p-4 rounded-3xl border border-white/10 text-white hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-4 pb-12">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Populasi</p>
            <h3 className="text-3xl font-black text-white">{stats.n}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Surveyor</p>
            <h3 className="text-3xl font-black text-blue-400">{stats.surveyorList.length}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Karbon Ton</p>
            <h3 className="text-3xl font-black text-emerald-400">{stats.totalC_ton.toFixed(2)}</h3>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rata-rata H</p>
            <h3 className="text-3xl font-black text-white">{stats.meanH.toFixed(2)}m</h3>
          </div>
          <div className="bg-emerald-600/10 p-6 rounded-[2rem] border border-emerald-500/20 shadow-2xl flex flex-col justify-center">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Valuasi Karbon</p>
            <h3 className="text-xl font-black text-white">Rp {(stats.totalCO2e_ton * 1900000).toLocaleString()}</h3>
          </div>
        </div>

        {/* Profiles Scatter - FIXED DIMENSIONS */}
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Profil Individual: Tinggi per ID Pohon (Meter)
              </h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Visualisasi titik tunggal seluruh populasi</p>
            </div>
            <p className="text-[8px] text-slate-600 font-black uppercase bg-black/40 px-3 py-1.5 rounded-full">Sumbu X: Index • Sumbu Y: Meter</p>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar bg-black/30 rounded-3xl p-6 border border-white/5">
            <div style={{ width: Math.max(stats.scatterByID.length * 15, 800), height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="x" 
                    type="number" 
                    name="Pohon" 
                    stroke="#475569" 
                    fontSize={9} 
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis type="number" dataKey="y" stroke="#475569" fontSize={10} name="Tinggi (m)" unit="m" />
                  <ZAxis type="number" range={[60, 60]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                            <p className="text-[10px] font-black text-blue-400 uppercase mb-1">ID: {d.id}</p>
                            <p className="text-white font-bold text-xs uppercase">{d.species}</p>
                            <div className="h-[1px] bg-white/10 my-2" />
                            <p className="text-emerald-400 font-black text-lg">{d.y.toFixed(2)} <span className="text-[10px]">m</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Tinggi" data={stats.scatterByID}>
                    {stats.scatterByID.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} stroke="rgba(255,255,255,0.2)" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Surveyor Leaderboard */}
          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Perolehan Data per Pengawas
            </h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {stats.surveyorList.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500 font-black italic">#{i+1}</span>
                    <span className="text-white font-black uppercase text-xs truncate max-w-[120px]">{name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-sm leading-none">{count}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Data Realisasi</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regression Chart */}
          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-xl">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> Analisis Korelasi: Tinggi vs Karbon
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis type="number" dataKey="x" stroke="#475569" fontSize={10} name="m" />
                  <YAxis type="number" dataKey="y" stroke="#475569" fontSize={10} name="kg" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px' }} />
                  <Scatter name="Data Real" data={stats.points} fill="#3b82f6" fillOpacity={0.6} />
                  <Line type="monotone" data={stats.regLine} dataKey="y" stroke="#f59e0b" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-900 border-t border-white/5 text-center shrink-0">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Montana AI Dashboard • Scientific Forest Management v2.6</p>
      </div>
    </div>
  );
};
