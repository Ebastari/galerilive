
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { TreeData, HEALTH_COLORS, HealthStatus } from './types';
import { getAIInsights } from './services/geminiService';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOOrMqBcQxlbhtTR_YwlwYsoSNCRB7MerXhgqB7C7ECspezjLnYyIr7BtVBF56wmBUdA/exec';

/** 
 * Data GeoJSON hasil konversi KMZ yang Anda berikan.
 * Untuk memperbarui ini di masa depan: Konversi KMZ ke GeoJSON (geojson.io) lalu ganti isi array features.
 */
const BOUNDARY_DATA: any = {
  "type": "FeatureCollection",
  "name": "rencana_to_kmz",
  "features": [
    { "type": "Feature", "properties": { "Name": "Realisasi Perapian", "Luas": "14.38", "To_due_dat": "15 Februari 2026", "Status": "REALISASI" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 115.1983736, -2.9775644 ], [ 115.1986137, -2.9777841 ], [ 115.1985908, -2.9778415 ], [ 115.1986193, -2.9778856 ], [ 115.1986334, -2.9779334 ], [ 115.198642, -2.9779756 ], [ 115.1986533, -2.9780234 ], [ 115.1986856, -2.9780656 ], [ 115.1986951, -2.9780905 ], [ 115.1987502, -2.9781633 ], [ 115.1988129, -2.9782247 ], [ 115.1988546, -2.9783051 ], [ 115.1988926, -2.978353 ], [ 115.1988705, -2.9790922 ], [ 115.1987568, -2.979476 ], [ 115.1985637, -2.9797126 ], [ 115.1984173, -2.9797626 ], [ 115.198246, -2.9797049 ], [ 115.1981283, -2.979676 ], [ 115.1980853, -2.9797764 ], [ 115.1980815, -2.9799056 ], [ 115.1980871, -2.979977 ], [ 115.1981298, -2.9800632 ], [ 115.1981618, -2.9801027 ], [ 115.198251, -2.9801244 ], [ 115.1983473, -2.9802071 ], [ 115.1983934, -2.9803758 ], [ 115.1983789, -2.9804978 ], [ 115.1983788, -2.980584 ], [ 115.1984143, -2.9806881 ], [ 115.198507, -2.9807636 ], [ 115.1986175, -2.980893 ], [ 115.1986922, -2.9810367 ], [ 115.1987393, -2.9812332 ], [ 115.1990225, -2.9811743 ], [ 115.1991703, -2.9812664 ], [ 115.1993241, -2.9811254 ], [ 115.1993506, -2.9809727 ], [ 115.1994935, -2.981022 ], [ 115.1996772, -2.9810855 ], [ 115.1998713, -2.981162 ], [ 115.2000265, -2.9811744 ], [ 115.2001838, -2.9811935 ], [ 115.200283, -2.9812075 ], [ 115.2003697, -2.9812361 ], [ 115.2003586, -2.9811184 ], [ 115.2003531, -2.9810609 ], [ 115.2004502, -2.9811743 ], [ 115.199029, -2.9778348 ], [ 115.1983627, -2.9773247 ], [ 115.1983736, -2.9775644 ] ] ] } },
    { "type": "Feature", "properties": { "Name": "Belum perapian", "Luas": "5.66", "To_due_dat": "15 Maret 2026", "Status": "RENCANA" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 115.2033724, -2.9830498 ], [ 115.2033798, -2.9830039 ], [ 115.2030115, -2.9818242 ], [ 115.2028886, -2.9812594 ], [ 115.2028938, -2.9809867 ], [ 115.2028849, -2.9806517 ], [ 115.202795, -2.980307 ], [ 115.2026671, -2.9799144 ], [ 115.2026202, -2.9796769 ], [ 115.2025655, -2.9796314 ], [ 115.2023748, -2.9799437 ], [ 115.202275, -2.9803078 ], [ 115.2019106, -2.9805948 ], [ 115.2013816, -2.9806797 ], [ 115.2009121, -2.9809813 ], [ 115.2006896, -2.9810522 ], [ 115.200594, -2.9810364 ], [ 115.2003531, -2.9810609 ], [ 115.2003697, -2.9812361 ], [ 115.2004477, -2.9815521 ], [ 115.2010114, -2.9817396 ], [ 115.2014822, -2.9819485 ], [ 115.2016745, -2.9822431 ], [ 115.2022377, -2.9827752 ], [ 115.2027871, -2.9829555 ], [ 115.2033724, -2.9830498 ] ] ] } },
    { "type": "Feature", "properties": { "Name": "Belum perapian 2", "Luas": "5.02", "To_due_dat": "30 Maret 2026", "Status": "RENCANA" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 115.2022995, -2.9777204 ], [ 115.2025025, -2.9782212 ], [ 115.2026154, -2.978911 ], [ 115.2026844, -2.9795372 ], [ 115.2029922, -2.9804059 ], [ 115.203063, -2.9809944 ], [ 115.203025, -2.9813325 ], [ 115.2035261, -2.9831045 ], [ 115.2036829, -2.982683 ], [ 115.20386, -2.9813211 ], [ 115.2038152, -2.9805609 ], [ 115.2035656, -2.9786266 ], [ 115.203289, -2.977882 ], [ 115.2026886, -2.9777873 ], [ 115.2022995, -2.9777204 ] ] ] } }
  ]
};

const App: React.FC = () => {
  const [rawData, setRawData] = useState<TreeData[]>([]);
  const [filteredData, setFilteredData] = useState<TreeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  
  // Added isLiveSync state to satisfy SidebarProps interface
  const [isLiveSync, setIsLiveSync] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pulseLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);

  const latestFive = useMemo(() => [...rawData].slice(-5).reverse(), [rawData]);

  const initMap = useCallback(() => {
    if (mapRef.current) return;
    const map = L.map('map', { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([-2.979129, 115.199507], 15);
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 }).addTo(map);
    
    markersLayerRef.current = L.layerGroup().addTo(map);
    pulseLayerRef.current = L.layerGroup().addTo(map);
    
    // Boundary styling logic
    boundaryLayerRef.current = L.geoJSON(BOUNDARY_DATA, {
      style: (feature) => ({
        color: feature?.properties?.Status === 'REALISASI' ? '#10b981' : '#f43f5e',
        weight: 3,
        fillOpacity: 0.05,
        dashArray: feature?.properties?.Status === 'REALISASI' ? '0' : '8, 8',
        lineCap: 'round'
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(`
          <div class="p-3 bg-white rounded-2xl shadow-xl min-w-[150px]">
            <h4 class="font-black text-slate-900 text-xs uppercase">${p.Name}</h4>
            <div class="mt-2 space-y-1">
              <p class="text-[9px] font-bold text-slate-400 uppercase">Luas: <span class="text-slate-900">${p.Luas} Ha</span></p>
              <p class="text-[9px] font-bold text-slate-400 uppercase">Tenggat: <span class="text-slate-900">${p.To_due_dat}</span></p>
            </div>
          </div>
        `, { className: 'modern-popup' });
      }
    }).addTo(map);

    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !boundaryLayerRef.current) return;
    if (showBoundary) boundaryLayerRef.current.addTo(mapRef.current);
    else boundaryLayerRef.current.remove();
  }, [showBoundary]);

  const renderMarkers = useCallback((data: TreeData[]) => {
    if (!markersLayerRef.current || !mapRef.current || !pulseLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    pulseLayerRef.current.clearLayers();
    
    const bounds = L.latLngBounds([]);
    
    // Add GeoJSON bounds to initial fit
    if (boundaryLayerRef.current) {
      bounds.extend(boundaryLayerRef.current.getBounds());
    }

    data.forEach((item, index) => {
      const xNum = typeof item.X === 'string' ? parseFloat(item.X.replace(',', '.')) : item.X;
      const yNum = typeof item.Y === 'string' ? parseFloat(item.Y.replace(',', '.')) : item.Y;

      if (xNum && yNum && !isNaN(xNum) && !isNaN(yNum)) {
        const color = HEALTH_COLORS[item.Kesehatan] || '#3b82f6';
        const marker = L.circleMarker([xNum, yNum], { 
          radius: 6, fillColor: color, color: 'white', weight: 1, fillOpacity: 0.8 
        });
        
        bounds.extend([xNum, yNum]);
        markersLayerRef.current?.addLayer(marker);

        if (index === data.length - 1) {
          const pulseIcon = L.divIcon({ className: 'pulse-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
          L.marker([xNum, yNum], { icon: pulseIcon }).addTo(pulseLayerRef.current!);
        }
      }
    });

    if (data.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(bounds.pad(0.1));
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      const data: TreeData[] = await response.json();
      if (Array.isArray(data)) {
        setRawData(data);
        setFilteredData(data);
        renderMarkers(data);
        setIsAiLoading(true);
        getAIInsights(data).then(res => { setAiInsight(res); setIsAiLoading(false); });
      }
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  useEffect(() => { initMap(); fetchData(); }, [initMap]);

  // Added useEffect for live sync polling
  useEffect(() => {
    let timer: any = null;
    if (isLiveSync) {
      timer = setInterval(() => { fetchData(); }, 15000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isLiveSync]);

  return (
    <div className="relative h-screen w-screen bg-slate-950 overflow-hidden flex flex-col font-sans">
      <div id="map" className="flex-1 z-0 contrast-[1.1] saturate-[1.1]" />

      {/* Header */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-5xl">
        <div className="glass p-4 rounded-[2.5rem] flex items-center justify-between shadow-2xl border-white/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <img src="https://i.ibb.co.com/29Gzw6k/montana-AI.jpg" className="w-full h-full object-cover" alt="Montana AI Logo" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-lg uppercase italic leading-none">MONTANA <span className="text-blue-600">MISSION CONTROL</span></h1>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Satellite Boundary & Inventory Monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDashboardOpen(true)} className="bg-emerald-600 text-white flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all text-[10px] font-black uppercase tracking-wider">
               Analisis
            </button>
            <button onClick={() => setIsGalleryOpen(true)} className="bg-slate-900 text-white flex items-center gap-2 px-5 py-3.5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-wider">
               Galeri
            </button>
            <button onClick={fetchData} className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200 active:rotate-180 transition-all">
              <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Added required props to Sidebar to fix TypeScript error */}
      <Sidebar 
        data={filteredData} 
        onSearch={(q) => {
          const f = rawData.filter(d => String(d["No Pohon"]).toLowerCase().includes(q.toLowerCase()) || d.Tanaman.toLowerCase().includes(q.toLowerCase()));
          setFilteredData(f);
          renderMarkers(f);
        }} 
        aiInsight={aiInsight} 
        isAiLoading={isAiLoading}
        onToggleBoundary={() => setShowBoundary(!showBoundary)}
        showBoundary={showBoundary}
        isLiveSync={isLiveSync}
        onToggleLiveSync={() => setIsLiveSync(!isLiveSync)}
        onManualRefresh={fetchData}
        isLoading={isLoading}
      />
      
      {/* YouTube Style Live Activity */}
      <div className="fixed bottom-8 right-16 z-[2000] w-72 pointer-events-none space-y-3">
        <div className="flex items-center gap-2 mb-4 bg-red-600/90 text-white px-3 py-1.5 rounded-full w-fit shadow-xl animate-pulse ml-auto backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Tracking</span>
        </div>
        <div className="space-y-2 flex flex-col items-end">
          {latestFive.map((tree, idx) => (
            <div key={`${tree["No Pohon"]}-${idx}`} className="live-notification-item glass border-l-4 border-blue-500 p-3 rounded-2xl shadow-lg w-full pointer-events-auto flex items-center gap-3" style={{ animationDelay: `${idx * 0.1}s`, opacity: 1 - (idx * 0.15) }}>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black text-blue-600 uppercase leading-none truncate">{tree.Pengawas}</p>
                <p className="text-[10px] font-bold text-slate-900 truncate mt-1">Input Baru: #{tree["No Pohon"]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Gallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} data={filteredData} onSelectTree={(t) => {
        setIsGalleryOpen(false);
        if (mapRef.current) mapRef.current.setView([parseFloat(String(t.X).replace(',','.')), parseFloat(String(t.Y).replace(',','.'))], 19);
      }} treeImageUrlExtractor={(t) => `https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300`} getImageUrl={url=>url} />

      <AnalyticsDashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} data={filteredData} />
    </div>
  );
};

export default App;
