import React, { useState, useEffect, useCallback } from 'react';
import {
  WaterStation,
  WaterAlert,
  AlertSetting,
  SimulationConfig,
  SimulationScenario,
  WaterStatus,
  getWaterLevelPercent,
  RainStation,
  Pm25Station,
  DamStation,
} from './types';
import { INITIAL_STATIONS, NAKHON_PHANOM_DISTRICTS, calculateWaterStatus } from './data/initialStations';
import { Navbar } from './components/Navbar';
import { SummaryStats } from './components/SummaryStats';
import { StationCardGrid } from './components/StationCardGrid';
import { DamModal } from './components/DamModal';
import { WeatherForecastModal } from './components/WeatherForecastModal';
import { NakhonPhanomMap } from './components/NakhonPhanomMap';
import { StationDetailModal } from './components/StationDetailModal';
import { SimulationControlBar } from './components/SimulationControlBar';
import { RainfallSourcesModal } from './components/RainfallSourcesModal';
import { NakhonPhanomRainModal } from './components/NakhonPhanomRainModal';

import { playAlertSiren } from './utils/audioAlert';
import { ShieldAlert, AlertTriangle, MapPin, Waves, RefreshCw, Search } from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<WaterStation[]>(INITIAL_STATIONS);
  const [rainStations, setRainStations] = useState<RainStation[]>([]);
  const [pm25Stations, setPm25Stations] = useState<Pm25Station[]>([]);
  const [damStations, setDamStations] = useState<DamStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<WaterStation | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulation State
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    isRunning: true,
    speedSec: 3,
    scenario: 'normal',
    rainRateMm: 15,
  });

  // Theme state: false = Light Mode (ไลท์โหมด), true = Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Data Source Mode: 'real' (ThaiWater API) vs 'sim' (Simulation Engine)
  const [dataMode, setDataMode] = useState<'real' | 'sim'>('real');
  const [isLoadingRealData, setIsLoadingRealData] = useState<boolean>(false);
  const [realDataError, setRealDataError] = useState<string | null>(null);

  const fetchRealData = useCallback(async () => {
    setIsLoadingRealData(true);
    setRealDataError(null);
    try {
      // Fetch water and rain data
      const res = await fetch('/api/real-water-data');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      
      // Fetch PM 2.5 data independently
      try {
        const pmRes = await fetch('/api/pm25-data');
        if (pmRes.ok) {
          const pmJson = await pmRes.json();
          if (pmJson.success && Array.isArray(pmJson.stations)) {
            setPm25Stations(pmJson.stations);
          }
        }
      } catch (pmErr) {
        console.error('Failed to fetch PM2.5:', pmErr);
      }

      // Fetch Dam data independently
      try {
        const damRes = await fetch('/api/dam-data');
        if (damRes.ok) {
          const damJson = await damRes.json();
          if (damJson.success && Array.isArray(damJson.dams)) {
            setDamStations(damJson.dams);
          }
        }
      } catch (damErr) {
        console.error('Failed to fetch Dams:', damErr);
      }

      if (json.success && Array.isArray(json.stations) && json.stations.length > 0) {
        setStations(json.stations);
        if (json.rainStations && Array.isArray(json.rainStations)) {
          setRainStations(json.rainStations);
        }
        setLastUpdated(new Date());
      } else {
        throw new Error(json.error || 'ไม่พบข้อมูลสถานี');
      }
    } catch (err) {
      console.error('Fetch real data error:', err);
      setRealDataError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingRealData(false);
    }
  }, []);

  // Fetch real data on mount or when dataMode is changed to 'real'
  useEffect(() => {
    if (dataMode === 'real') {
      fetchRealData();
    }
  }, [dataMode, fetchRealData]);

  // Modal Visibility States
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isRainfallModalOpen, setIsRainfallModalOpen] = useState<boolean>(false);
  const [isDamModalOpen, setIsDamModalOpen] = useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState<boolean>(false);

  // Handle station water level update (Manual adjustment or Simulation tick)
  const updateStationLevel = useCallback(
    (stationId: string, newLevel: number) => {
      setStations((prevStations) =>
        prevStations.map((st) => {
          if (st.id !== stationId) return st;

          const oldStatus = st.status;
          const newStatus = calculateWaterStatus(
            newLevel,
            st.bankLevel,
            st.warningLevel,
            st.criticalLevel
          );

          const trend = newLevel > st.currentLevel ? 'rising' : newLevel < st.currentLevel ? 'falling' : 'steady';

          // Append to history
          const updatedHistory = [
            ...st.hourlyHistory.slice(1),
            {
              time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              level: parseFloat(newLevel.toFixed(2)),
              rainfall: st.rainfall24h,
            },
          ];

          return {
            ...st,
            currentLevel: parseFloat(newLevel.toFixed(2)),
            status: newStatus,
            trend,
            lastUpdated: 'เมื่อสักครู่',
            hourlyHistory: updatedHistory,
          };
        })
      );
      setLastUpdated(new Date());
    },
    []
  );

  // Simulation Interval Tick
  useEffect(() => {
    if (!simConfig.isRunning) return;

    const interval = setInterval(() => {
      setStations((prev) =>
        prev.map((st) => {
          // Slight realistic water level variation
          const delta = (Math.random() - 0.48) * 0.05;
          const nextLevel = Math.max(1, Math.min(st.bankLevel * 1.3, st.currentLevel + delta));
          const nextStatus = calculateWaterStatus(
            nextLevel,
            st.bankLevel,
            st.warningLevel,
            st.criticalLevel
          );

          return {
            ...st,
            currentLevel: parseFloat(nextLevel.toFixed(2)),
            status: nextStatus,
            lastUpdated: 'เมื่อสักครู่',
          };
        })
      );
      setLastUpdated(new Date());

      setPm25Stations((prev) => 
        prev.map(st => {
          const delta = (Math.random() - 0.48) * 5; // fluctuate up to 5 points
          const newPm = Math.max(0, st.pm25 + delta);
          
          let newColor = '1';
          if (newPm > 75) newColor = '5'; // Red
          else if (newPm > 37.5) newColor = '4'; // Orange
          else if (newPm > 25) newColor = '3'; // Yellow
          else if (newPm > 15) newColor = '2'; // Green
          else newColor = '1'; // Blue

          return {
            ...st,
            pm25: parseFloat(newPm.toFixed(1)),
            aqi: Math.min(300, Math.round(newPm * 1.5)),
            colorId: newColor,
            lastUpdated: 'เมื่อสักครู่ (จำลอง)'
          };
        })
      );
    }, simConfig.speedSec * 1000);

    return () => clearInterval(interval);
  }, [simConfig.isRunning, simConfig.speedSec]);

  // Scenario Triggers
  const handleTriggerScenario = (scenario: SimulationScenario) => {
    setStations((prev) =>
      prev.map((st) => {
        let levelMod = 0;
        let rainMod = 0;

        if (scenario === 'heavy_rain') {
          levelMod = 0.4 + Math.random() * 0.6;
          rainMod = 30;
        } else if (scenario === 'mekong_surge') {
          levelMod = st.waterway.includes('โขง') ? 0.8 : 0.4;
          rainMod = 15;
        } else if (scenario === 'gate_open') {
          levelMod = st.waterway.includes('อูน') || st.waterway.includes('ก่ำ') ? -0.7 : -0.2;
        } else if (scenario === 'drought') {
          levelMod = -0.8;
        }

        const nextLevel = Math.max(1, Math.min(st.bankLevel * 1.25, st.currentLevel + levelMod));
        const nextStatus = calculateWaterStatus(
          nextLevel,
          st.bankLevel,
          st.warningLevel,
          st.criticalLevel
        );

        return {
          ...st,
          currentLevel: parseFloat(nextLevel.toFixed(2)),
          rainfall24h: Math.max(0, st.rainfall24h + rainMod),
          status: nextStatus,
          trend: levelMod > 0 ? 'rising' : levelMod < 0 ? 'falling' : 'steady',
          lastUpdated: 'เมื่อสักครู่',
        };
      })
    );
    setLastUpdated(new Date());

    if (scenario === 'pm25_smog') {
      setPm25Stations((prev) => 
        prev.map(st => {
          // Increase PM2.5 significantly
          const newPm = Math.min(500, st.pm25 + 50 + Math.random() * 100);
          let newColor = '1';
          if (newPm > 75) newColor = '5'; // Red (Danger)
          else if (newPm > 37.5) newColor = '4'; // Orange
          else if (newPm > 25) newColor = '3'; // Yellow
          
          return {
            ...st,
            pm25: parseFloat(newPm.toFixed(1)),
            aqi: Math.min(300, Math.round(newPm * 1.5)),
            colorId: newColor,
            lastUpdated: 'เมื่อสักครู่ (จำลอง)'
          };
        })
      );
    }

    if (scenario === 'heavy_rain' || scenario === 'mekong_surge' || scenario === 'pm25_smog') {
      triggerAudioSiren('critical');
    }
  };

  const handleTestStationAlert = (station: WaterStation) => {
    playAlertSiren(station.status === 'critical' ? 'critical' : 'warning');
    const newAlert: WaterAlert = {
      id: `alt-test-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      district: station.district,
      severity: station.status,
      waterLevel: station.currentLevel,
      bankLevel: station.bankLevel,
      message: `🔔 ทดสอบส่งสัญญาณไซเรนเตือนภัยประจำสถานี ${station.name}`,
      timestamp: 'เมื่อสักครู่',
      isRead: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setIsAlertDrawerOpen(true);
  };

  const unreadAlertCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 pb-16 ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white'
        : 'bg-slate-100 text-slate-800 selection:bg-blue-500 selection:text-white'
    }`}>
      {/* Top Navigation */}
      <Navbar
        stations={stations}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setIsAlertDrawerOpen(true)}
        onOpenRainModal={() => setIsRainfallModalOpen(true)}

        onOpenSimModal={() => setIsSimModalOpen(true)}
        isSimulating={simConfig.isRunning}
        onToggleSim={() => setSimConfig({ ...simConfig, isRunning: !simConfig.isRunning })}
        onRefresh={() => (dataMode === 'real' ? fetchRealData() : setLastUpdated(new Date()))}
        lastUpdated={lastUpdated}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        dataMode={dataMode}
        isLoadingRealData={isLoadingRealData}
        onToggleDataMode={() => {
          if (dataMode === 'real') {
            setDataMode('sim');
          } else {
            setDataMode('real');
            fetchRealData();
          }
        }}
        onOpenForecast={() => setIsForecastModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Real Water Data Banner */}
        {dataMode === 'real' && (
          <div className={`mb-5 p-2.5 px-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium transition-all ${
            isDarkMode
              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">คลังข้อมูลน้ำแห่งชาติ (สสน. / ThaiWater API)</span>
                <span className="opacity-40">•</span>
                <span>ตรวจวัดอัตโนมัติ <strong>{stations.length} สถานี</strong></span>
                <span className="hidden md:inline opacity-40">•</span>
                <span className="hidden md:inline opacity-80">อัปเดต {lastUpdated.toLocaleTimeString('th-TH')}</span>
              </div>
            </div>

            <button
              onClick={fetchRealData}
              disabled={isLoadingRealData}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1 text-[11px] shrink-0 self-end sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingRealData ? 'animate-spin' : ''}`} />
              <span>{isLoadingRealData ? 'กำลังอัปเดต...' : 'ดึงข้อมูลสด'}</span>
            </button>
          </div>
        )}

        {/* Real Data Error Banner */}
        {realDataError && dataMode === 'real' && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            isDarkMode ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">⚠️ ไม่สามารถอัปเดตข้อมูลได้</p>
              <p className="text-xs opacity-80">ระบบขัดข้อง: รอคำสั่งแก้ไข ({realDataError})</p>
            </div>
          </div>
        )}

        {/* Urgent Critical Alert Banner Header if any critical stations exist */}
        {stations.some((s) => s.status === 'critical') && (
          <div className={`mb-6 p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse ${
            isDarkMode
              ? 'bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-slate-900 border-rose-500/50'
              : 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white border-rose-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 text-white shrink-0">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  แจ้งเตือนภัยระดับน้ำวิกฤต/ล้นตลิ่งในจังหวัดนครพนม!
                </h2>
                <p className="text-xs text-rose-100">
                  พบสถานีที่มีระดับน้ำเท่ากับหรือสูงกว่าระดับตลิ่งจำนวน{' '}
                  <span className="font-bold underline">
                    {stations.filter((s) => s.status === 'critical').length} สถานี
                  </span>{' '}
                  โปรดติดตามสถานการณ์อย่างใกล้ชิด
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            </div>
          </div>
        )}

        {/* Executive KPI Summary Cards */}
        <SummaryStats
          stations={stations}
          damStations={damStations}
          isDarkMode={isDarkMode}
          onOpenRainfallModal={() => setIsRainfallModalOpen(true)}
          onOpenDamModal={() => setIsDamModalOpen(true)}
        />

        {/* Interactive Map Section */}
        <section className="my-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <MapPin className="w-5 h-5 text-blue-600" />
                แผนที่สถานีเฝ้าระวังระดับน้ำ นครพนม
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                แสดงพิกัดตำแหน่งสถานีตามลำน้ำโขงและลำน้ำสาขาในเขตอำเภอต่างๆ
              </p>
            </div>
            
            {/* Search Input */}
            <div className={`relative w-full sm:w-72 md:w-96 flex items-center rounded-xl overflow-hidden border shadow-sm transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-700 focus-within:border-blue-500' : 'bg-white border-slate-300 focus-within:border-blue-500'
            }`}>
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อสถานี หรืออำเภอ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2.5 px-3 outline-none text-sm font-medium bg-transparent ${
                  isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`pr-3 text-lg font-bold hover:text-rose-500 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <NakhonPhanomMap
            stations={stations.filter(s => 
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.district.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            rainStations={rainStations.filter(s => 
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.subdistrict.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            pm25Stations={pm25Stations.filter(s => 
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.district.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            damStations={damStations.filter(s => 
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.district.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            selectedDistrict={selectedDistrict}
            onDistrictChange={(d) => setSelectedDistrict(d)}
            districts={NAKHON_PHANOM_DISTRICTS}
            isDarkMode={isDarkMode}
          />
        </section>

        {/* Station Cards Grid View */}
        <StationCardGrid
          stations={stations.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.district.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          onSelectStation={(st) => setSelectedStation(st)}
          selectedDistrict={selectedDistrict}
          onDistrictChange={(d) => setSelectedDistrict(d)}
          districts={NAKHON_PHANOM_DISTRICTS}
          isDarkMode={isDarkMode}
        />
      </main>

      {/* Footer */}
      <footer className={`mt-16 border-t py-8 text-center text-xs transition-colors ${
        isDarkMode
          ? 'border-slate-900 bg-slate-950 text-slate-500'
          : 'border-slate-200 bg-white text-slate-500 shadow-inner'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              ระบบติดตามและแจ้งเตือนระดับน้ำ จังหวัดนครพนม
            </span>
          </div>
          <p>© 2026 Nakhon Phanom Hydro-Monitoring & Disaster Preparedness Center</p>
        </div>
      </footer>

      {/* Station Detail Modal */}
      <StationDetailModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />

      {/* Simulation Control Modal */}
      <SimulationControlBar
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        config={simConfig}
        onUpdateConfig={setSimConfig}
        onTriggerScenario={handleTriggerScenario}
        onResetData={() => setStations(INITIAL_STATIONS)}
      />



      {/* Nakhon Phanom 24-Hour Rainfall Live Monitoring Modal */}
      <NakhonPhanomRainModal
        isOpen={isRainfallModalOpen}
        onClose={() => setIsRainfallModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Dam Modal */}
      <DamModal
        isOpen={isDamModalOpen}
        onClose={() => setIsDamModalOpen(false)}
        damStations={damStations}
        isDarkMode={isDarkMode}
        districts={NAKHON_PHANOM_DISTRICTS}
      />

      {/* Weather Forecast Modal */}
      <WeatherForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
