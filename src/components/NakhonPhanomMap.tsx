import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { WaterStation, RainStation, Pm25Station, DamStation, getWaterLevelPercent } from '../types';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons based on status
const createCustomIcon = (status: string) => {
  let color = '#3b82f6'; // blue (normal/watch)
  if (status === 'critical') color = '#ef4444'; // red
  else if (status === 'warning') color = '#f59e0b'; // amber
  else if (status === 'watch') color = '#10b981'; // green

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="white" stroke-width="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom rain drop icon for rain stations
const createRainIcon = () => {
  const color = '#06b6d4'; // Cyan
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}" stroke="white" stroke-width="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Custom PM 2.5 icon
const createPm25Icon = (colorId: string) => {
  let color = '#3b82f6'; // 1 = ฟ้า (ดีมาก)
  if (colorId === '2') color = '#10b981'; // เขียว (ดี)
  else if (colorId === '3') color = '#eab308'; // เหลือง (ปานกลาง)
  else if (colorId === '4') color = '#f97316'; // ส้ม (เริ่มมีผลกระทบ)
  else if (colorId === '5') color = '#ef4444'; // แดง (มีผลกระทบ)

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}" stroke="white" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M8 11h8" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 15h4" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Custom dam icon
const createDamIcon = () => {
  const color = '#8b5cf6'; // Violet
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${color}" stroke="white" stroke-width="2">
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-16 4v9a2 2 0 0 0 2 2z"></path>
      <path d="M14 14.5a2 2 0 1 1-4 0"></path>
      <path d="M22 7l-4-4L2 11"></path>
    </svg>`;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Component to handle map zooming to selected station
const MapController = ({ selectedStation, stations, selectedDistrict }: any) => {
  const map = useMap();

  useEffect(() => {
    if (selectedStation && selectedStation.latitude && selectedStation.longitude) {
      map.setView([selectedStation.latitude, selectedStation.longitude], 13, {
        animate: true,
        duration: 1
      });
    } else if (selectedDistrict !== 'ทั้งหมด') {
      const distStations = stations.filter((s: WaterStation) => s.district === selectedDistrict);
      if (distStations.length > 0) {
        const avgLat = distStations.reduce((sum: number, s: WaterStation) => sum + s.latitude, 0) / distStations.length;
        const avgLng = distStations.reduce((sum: number, s: WaterStation) => sum + s.longitude, 0) / distStations.length;
        map.setView([avgLat, avgLng], 11, { animate: true, duration: 1 });
      }
    } else {
      // Nakhon Phanom general center
      map.setView([17.4, 104.5], 9, { animate: true, duration: 1 });
    }
  }, [selectedStation, selectedDistrict, map, stations]);

  return null;
};

interface NakhonPhanomMapProps {
  stations: WaterStation[];
  rainStations?: RainStation[];
  pm25Stations?: Pm25Station[];
  damStations?: DamStation[];
  selectedStation: WaterStation | null;
  onSelectStation: (station: WaterStation | null) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  districts: string[];
  isDarkMode: boolean;
}

export const NakhonPhanomMap: React.FC<NakhonPhanomMapProps> = ({
  stations,
  rainStations = [],
  pm25Stations = [],
  damStations = [],
  selectedStation,
  onSelectStation,
  selectedDistrict,
  onDistrictChange,
  districts,
  isDarkMode,
}) => {
  const [mapStyle, setMapStyle] = React.useState<'default' | 'satellite' | 'terrain' | 'street'>('default');
  const [showWaterStations, setShowWaterStations] = React.useState<boolean>(true);
  const [showRainStations, setShowRainStations] = React.useState<boolean>(false);
  const [showPm25Stations, setShowPm25Stations] = React.useState<boolean>(false);
  const [showDamStations, setShowDamStations] = React.useState<boolean>(false);
  const [showRadar, setShowRadar] = React.useState<boolean>(false);
  const [radarPath, setRadarPath] = React.useState<string | null>(null);

  useEffect(() => {
    // Fetch latest RainViewer radar timestamp
    const fetchRadar = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await res.json();
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          // Get the latest past radar frame
          const latestFrame = data.radar.past[data.radar.past.length - 1];
          setRadarPath(latestFrame.path);
        }
      } catch (err) {
        console.error('Failed to fetch RainViewer data:', err);
      }
    };
    fetchRadar();
    // Refresh radar every 10 minutes
    const interval = setInterval(fetchRadar, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  let mapTileUrl = '';
  let mapAttribution = '';
  
  if (mapStyle === 'default') {
    mapTileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    mapAttribution = '&copy; <a href="https://carto.com/">CARTO</a>';
  } else if (mapStyle === 'satellite') {
    mapTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    mapAttribution = 'Tiles &copy; Esri';
  } else if (mapStyle === 'terrain') {
    mapTileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    mapAttribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
  } else if (mapStyle === 'street') {
    mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    mapAttribution = '&copy; OpenStreetMap contributors';
  }

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col md:flex-row h-[500px] transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Sidebar Controls */}
      <div className={`w-full md:w-64 p-4 border-b md:border-b-0 md:border-r flex flex-col gap-4 overflow-y-auto ${
        isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
      }`}>
        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            กรองตามอำเภอ
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-colors border ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="ทั้งหมด">🌍 พื้นที่ทั้งหมด ({stations.length} สถานี)</option>
            {districts.map(d => {
              const count = stations.filter(s => s.district === d).length;
              if (count === 0) return null;
              return (
                <option key={d} value={d}>{d} ({count})</option>
              );
            })}
          </select>
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            รูปแบบแผนที่
          </label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value as any)}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-colors border ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="default">🎨 ค่าเริ่มต้น (ปรับตามธีม)</option>
            <option value="satellite">🛰️ ดาวเทียม (Satellite)</option>
            <option value="terrain">⛰️ ภูมิประเทศ (Terrain)</option>
            <option value="street">ถนน (Street Map)</option>
          </select>
        </div>

        <div>
          <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            ข้อมูลบนแผนที่
          </label>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input 
              type="checkbox" 
              checked={showWaterStations}
              onChange={(e) => setShowWaterStations(e.target.checked)}
              className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-slate-100 border-slate-300"
            />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              🌊 แสดงสถานีวัดระดับน้ำ
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showRainStations}
              onChange={(e) => setShowRainStations(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-100 border-slate-300"
            />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              🌧️ แสดงสถานีวัดฝน 24 ชม.
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              checked={showPm25Stations}
              onChange={(e) => setShowPm25Stations(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-100 border-slate-300"
            />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              😷 แสดงค่าฝุ่น PM 2.5
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              checked={showDamStations}
              onChange={(e) => setShowDamStations(e.target.checked)}
              className="w-4 h-4 rounded text-violet-500 focus:ring-violet-500 bg-slate-100 border-slate-300"
            />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              🛢️ แสดงข้อมูลอ่างเก็บน้ำ
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input 
              type="checkbox" 
              checked={showRadar}
              onChange={(e) => setShowRadar(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-100 border-slate-300"
            />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              ⛈️ แสดงเรดาร์เมฆพายุฝน
            </span>
          </label>
        </div>


      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[17.4, 104.5]} 
          zoom={9} 
          scrollWheelZoom={true}
          zoomAnimation={true}
          zoomSnap={0.1}
          zoomDelta={0.5}
          wheelPxPerZoomLevel={100}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution={mapAttribution}
            url={mapTileUrl}
          />
          
          {/* RainViewer Storm Clouds Layer */}
          {showRadar && radarPath && (
            <TileLayer
              url={`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`}
              attribution="&copy; <a href='https://rainviewer.com'>RainViewer</a>"
              opacity={0.7}
              zIndex={10}
            />
          )}

          <MapController selectedStation={selectedStation} stations={stations} selectedDistrict={selectedDistrict} />
          
          {showWaterStations && stations.map(st => (
            <Marker 
              key={st.id} 
              position={[st.latitude, st.longitude]}
              icon={createCustomIcon(st.status)}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Tooltip 
                direction="bottom" 
                offset={[0, 10]} 
                opacity={1} 
                permanent 
                className={`font-bold text-[10px] shadow-sm border-0 ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-white/90 text-slate-700'
                }`}
              >
                {st.name}
              </Tooltip>
              <Popup className={isDarkMode ? 'dark-popup' : ''}>
                <div className="p-1 min-w-[200px]">
                  <h4 className="font-bold text-sm mb-1">{st.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">อ.{st.district} ต.{st.subdistrict}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs">ระดับน้ำปัจจุบัน</span>
                    <span className="font-bold text-blue-600">{st.currentLevel.toFixed(2)} ม.</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs">ระดับตลิ่ง</span>
                    <span className="font-bold text-gray-600">{st.bankLevel.toFixed(2)} ม.</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectStation(st);
                    }}
                    className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {showRainStations && rainStations.map(st => (
            <Marker 
              key={`rain-${st.id}`} 
              position={[st.latitude, st.longitude]}
              icon={createRainIcon()}
            >
              <Tooltip 
                direction="bottom" 
                offset={[0, 10]} 
                opacity={1} 
                permanent 
                className={`font-bold text-[10px] shadow-sm border-0 ${
                  isDarkMode ? 'bg-cyan-900 text-cyan-100' : 'bg-cyan-50 text-cyan-800'
                }`}
              >
                <div className="text-center">
                  <div>{st.name}</div>
                  <div className="text-[11px] mt-0.5 opacity-90">{st.rainfall24h > 0 ? `${st.rainfall24h} มม.` : 'ไม่มีฝน'}</div>
                </div>
              </Tooltip>
              <Popup className={isDarkMode ? 'dark-popup' : ''}>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌧️</span>
                    <h4 className="font-bold text-sm">{st.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">อ.{st.district} ต.{st.subdistrict}</p>
                  <div className="flex justify-between items-center bg-cyan-50 p-2 rounded-lg border border-cyan-100 mb-2">
                    <span className="text-xs font-bold text-cyan-800">ปริมาณฝนสะสม</span>
                    <span className="font-black text-cyan-600">{st.rainfall24h.toFixed(1)} มม.</span>
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    อัปเดต: {st.lastUpdated}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {showPm25Stations && pm25Stations.map(st => (
            <Marker 
              key={`pm25-${st.id}`} 
              position={[st.latitude, st.longitude]}
              icon={createPm25Icon(st.colorId)}
            >
              <Tooltip 
                direction="bottom" 
                offset={[0, 10]} 
                opacity={1} 
                permanent 
                className={`font-bold text-[10px] shadow-sm border-0 ${
                  isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'
                }`}
              >
                AQI: {st.aqi}
              </Tooltip>
              <Popup className={isDarkMode ? 'dark-popup' : ''}>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">😷</span>
                    <h4 className="font-bold text-sm">{st.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">อ.{st.district}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">AQI</div>
                      <div className="font-black text-lg text-slate-700 dark:text-slate-200">{st.aqi}</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">PM 2.5</div>
                      <div className="font-black text-lg text-slate-700 dark:text-slate-200">{st.pm25} <span className="text-[10px] font-normal">µg/m³</span></div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-gray-400 text-right mt-2">
                    อัปเดต: {st.lastUpdated}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Dam Stations (Reservoirs) Layer */}
          {showDamStations && damStations.map((st) => (
            <Marker 
              key={`dam-${st.id}`} 
              position={[st.latitude, st.longitude]}
              icon={createDamIcon()}
            >
              <Tooltip 
                direction="bottom" 
                offset={[0, 10]} 
                opacity={1} 
                permanent 
                className={`font-bold text-[10px] shadow-sm border-0 ${
                  isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'
                }`}
              >
                {st.storagePercent.toFixed(0)}%
              </Tooltip>
              <Popup className={isDarkMode ? 'dark-popup' : ''}>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🛢️</span>
                    <h4 className="font-bold text-sm">{st.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">อ.{st.district}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">ปริมาณน้ำ</div>
                      <div className="font-black text-lg text-slate-700 dark:text-slate-200">{st.storageAmount.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-400">ล้าน ลบ.ม.</div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">ความจุอ่าง</div>
                      <div className="font-black text-lg text-slate-700 dark:text-slate-200">{st.normalStorage.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-400">ล้าน ลบ.ม.</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center text-xs font-bold text-violet-500">
                    ความจุคิดเป็น {st.storagePercent.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-gray-400 text-right mt-2">
                    อัปเดต: {st.lastUpdated}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Global styling for leaflet popup in dark mode */}
        {isDarkMode && (
          <style>{`
            .dark-popup .leaflet-popup-content-wrapper,
            .dark-popup .leaflet-popup-tip {
              background-color: #0f172a;
              color: #f1f5f9;
              border: 1px solid #1e293b;
            }
            .dark-popup .leaflet-popup-content h4 { color: #f8fafc; }
            .dark-popup .leaflet-popup-content p, 
            .dark-popup .leaflet-popup-content span { color: #94a3b8; }
            .dark-popup .leaflet-popup-content .text-blue-600 { color: #60a5fa; }
            .dark-popup .leaflet-popup-content .text-gray-600 { color: #cbd5e1; }
            .dark-popup a.leaflet-popup-close-button { color: #94a3b8; }
          `}</style>
        )}
      </div>
    </div>
  );
};
