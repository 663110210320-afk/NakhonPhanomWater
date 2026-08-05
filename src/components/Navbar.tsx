import React from 'react';
import { WaterStation } from '../types';
import { 
  Bell, Volume2, VolumeX, Settings, Waves, 
  Sun, Moon, CloudRain, ShieldAlert, Activity, RefreshCw 
} from 'lucide-react';
import { CurrentWeather } from './CurrentWeather';

interface NavbarProps {
  stations: WaterStation[];
  onOpenRainModal: () => void;

  onOpenSimModal: () => void;
  isSimulating: boolean;
  onToggleSim: () => void;
  onRefresh: () => void;
  lastUpdated: Date;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  dataMode: 'real' | 'sim';
  isLoadingRealData: boolean;
  onToggleDataMode: () => void;
  onOpenForecast: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stations,
  onOpenRainModal,

  onOpenSimModal,
  isSimulating,
  isDarkMode,
  onToggleTheme,
  dataMode,
  isLoadingRealData,
  onToggleDataMode,
  onOpenForecast,
}) => {
  const totalRain = stations.reduce((sum, s) => sum + (s.rainfall24h || 0), 0);
  const avgRain = stations.length > 0 ? (totalRain / stations.length).toFixed(1) : '0';

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-slate-950/80 border-slate-800' 
        : 'bg-white/80 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${
              isDarkMode ? 'from-blue-600 to-cyan-500' : 'from-blue-500 to-cyan-400'
            } shadow-lg shadow-blue-500/20`}>
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Nakhon Phanom
              </h1>
              <p className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Water & Disaster Tracking
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Real vs Sim Mode Toggle */}
            <div className={`hidden md:flex items-center p-1 rounded-full border ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={onToggleDataMode}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                  dataMode === 'real' 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                }`}
              >
                <Activity className="w-3 h-3" /> ข้อมูลจริง
              </button>
              <button
                onClick={onToggleDataMode}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                  dataMode === 'sim' 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                }`}
              >
                <Settings className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} /> จำลอง
              </button>
            </div>



            {/* Current Weather (Temp) */}
            <CurrentWeather isDarkMode={isDarkMode} onOpenForecast={onOpenForecast} />

            {/* Rain Info Button */}
            <button
              onClick={onOpenRainModal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors shadow-sm border ${
                isDarkMode ? 'bg-cyan-900/20 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/40' : 'bg-cyan-50 border-cyan-100 text-cyan-700 hover:bg-cyan-100'
              }`}
              title="สถิติปริมาณฝนสะสม (เฉลี่ยทั้งจังหวัด)"
            >
              <CloudRain className="w-4 h-4" />
              <span className="text-xs font-bold">ฝนเฉลี่ย {avgRain} มม.</span>
            </button>

            {/* Sim Control Button */}
            {dataMode === 'sim' && (
              <button
                onClick={onOpenSimModal}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title="ควบคุมการจำลอง"
              >
                <Settings className="w-5 h-5 text-purple-500" />
              </button>
            )}

            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="เปลี่ยนธีม"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};
