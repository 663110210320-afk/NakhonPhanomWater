import React from 'react';
import { WaterStation, getWaterCategory, getWaterLevelPercent, getRainfallCategory } from '../types';
import { MapPin, TrendingUp, TrendingDown, Minus, Activity, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface StationCardGridProps {
  stations: WaterStation[];
  onSelectStation: (station: WaterStation) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  districts: string[];
  isDarkMode: boolean;
}

export const StationCardGrid: React.FC<StationCardGridProps> = ({
  stations,
  onSelectStation,
  selectedDistrict,
  onDistrictChange,
  districts,
  isDarkMode,
}) => {
  const filteredStations = stations.filter(
    (s) => selectedDistrict === 'ทั้งหมด' || s.district === selectedDistrict
  );

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Activity className="w-5 h-5 text-blue-500" />
            ข้อมูลสถานีรายจุด
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            แสดงระดับน้ำปัจจุบันเทียบกับระดับตลิ่ง พร้อมแนวโน้ม 24 ชั่วโมงย้อนหลัง
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium outline-none transition-colors border shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="ทั้งหมด">🌍 ทุกอำเภอ</option>
            {districts.map(d => {
              const count = stations.filter(s => s.district === d).length;
              if (count === 0) return null;
              return (
                <option key={d} value={d}>{d} ({count})</option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStations.map((station) => {
          const pct = getWaterLevelPercent(station);
          const category = getWaterCategory(pct);
          
          let TrendIcon = Minus;
          let trendColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
          if (station.trend === 'rising') {
            TrendIcon = TrendingUp;
            trendColor = isDarkMode ? 'text-rose-400' : 'text-rose-500';
          } else if (station.trend === 'falling') {
            TrendIcon = TrendingDown;
            trendColor = isDarkMode ? 'text-emerald-400' : 'text-emerald-500';
          }

          const chartData = [...(station.hourlyHistory || [])].reverse();

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`group relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${category.gaugeGradient}`}></div>

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {station.name}
                  </h3>
                  <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">อ.{station.district} ต.{station.subdistrict}</span>
                    <span className="opacity-50 mx-0.5">•</span>
                    <span className={`font-bold ${getRainfallCategory(station.rainfall24h).textColor}`}>ฝน {station.rainfall24h}มม.</span>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap ${
                  isDarkMode ? category.badgeBgDark : category.badgeBgLight
                }`}>
                  {category.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-0.5`}>ระดับน้ำปัจจุบัน</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {station.currentLevel.toFixed(2)}
                    </span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ม.</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider mb-0.5`}>ระดับตลิ่ง</p>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {station.bankLevel.toFixed(2)}
                    </span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ม.</span>
                  </div>
                </div>
              </div>

              {/* Progress Gauge */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>ความจุลำน้ำ</span>
                  <span className={category.textColor}>{pct}%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${category.gaugeGradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>
              </div>

              {/* Mini Sparkline & Trend */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1 rounded bg-slate-100 dark:bg-slate-800 ${trendColor}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {station.trend === 'rising' ? 'เพิ่มขึ้น' : station.trend === 'falling' ? 'ลดลง' : 'ทรงตัว'}
                  </span>
                </div>
                
                {/* Sparkline Chart */}
                <div className="h-6 w-20 opacity-70 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} hide />
                      <Area 
                        type="monotone" 
                        dataKey="level" 
                        stroke={category.colorHex} 
                        fill={category.colorHex} 
                        fillOpacity={0.2} 
                        strokeWidth={1.5} 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className={`w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${
                  isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
