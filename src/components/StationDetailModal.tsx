import React, { useState } from 'react';
import { WaterStation, getWaterCategory, getWaterLevelPercent, getRainfallCategory } from '../types';
import { X, MapPin, Activity, Droplets, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface StationDetailModalProps {
  station: WaterStation | null;
  onClose: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({ station, onClose }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  if (!station) return null;

  const pct = getWaterLevelPercent(station);
  const category = getWaterCategory(pct);
  
  let TrendIcon = Minus;
  let trendText = 'ทรงตัว';
  if (station.trend === 'rising') {
    TrendIcon = ArrowUpRight;
    trendText = 'เพิ่มขึ้น';
  } else if (station.trend === 'falling') {
    TrendIcon = ArrowDownRight;
    trendText = 'ลดลง';
  }

  const getChartData = () => {
    switch (timeRange) {
      case '30d': return [...(station.monthlyHistory || [])].reverse();
      case '7d': return [...(station.dailyHistory || [])].reverse();
      case '24h': default: return [...(station.hourlyHistory || [])].reverse();
    }
  };

  const chartData = getChartData();
  const minLevel = Math.max(0, Math.min(...chartData.map(d => d.level)) - 1);
  const maxLevel = Math.max(station.bankLevel + 1, Math.max(...chartData.map(d => d.level)) + 1);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`p-6 border-b border-slate-800 bg-gradient-to-r ${category.gaugeGradient} bg-opacity-10 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${category.gaugeGradient} opacity-20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none`}></div>
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${category.badgeBgDark} flex items-center gap-1.5`}>
                    {category.statusType === 'critical' && <ShieldAlert className="w-3.5 h-3.5" />}
                    {category.statusType === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {category.label}
                  </div>
                  <div className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    อัปเดต: {station.lastUpdated}
                  </div>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{station.name}</h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" /> อ.{station.district} ต.{station.subdistrict}</span>
                  <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-cyan-400" /> ลำน้ำ: {station.waterway}</span>
                  <span className="flex items-center gap-1.5 opacity-60 text-xs">พิกัด: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">ระดับน้ำปัจจุบัน</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{station.currentLevel.toFixed(2)}</span>
                  <span className="text-sm text-slate-400">ม.รทก.</span>
                </div>
                <div className={`text-xs mt-2 flex items-center gap-1 ${
                  station.trend === 'rising' ? 'text-rose-400' : station.trend === 'falling' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  แนวโน้ม{trendText}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${category.gaugeGradient}`} style={{ width: `${Math.min(100, pct)}%` }}></div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">ระดับตลิ่ง (วิกฤต)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-300">{station.bankLevel.toFixed(2)}</span>
                  <span className="text-sm text-slate-400">ม.รทก.</span>
                </div>
                <div className="text-xs mt-2 text-slate-400 flex items-center gap-1">
                  ปริมาณน้ำ <span className={category.textColor + " font-bold"}>{pct}%</span> ของตลิ่ง
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">ระดับเตือนภัย</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-amber-400">{station.warningLevel.toFixed(2)}</span>
                  <span className="text-sm text-slate-400">ม.รทก.</span>
                </div>
                <div className="text-xs mt-2 text-slate-400">
                  เตือนภัยเมื่อน้ำถึง 85%
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">ปริมาณฝน 24 ชม.</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${getRainfallCategory(station.rainfall24h).textColor}`}>{station.rainfall24h}</span>
                  <span className="text-sm text-slate-400">มม.</span>
                </div>
                <div className="text-xs mt-2 text-slate-400">
                  สะสมในพื้นที่รอบสถานี
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  กราฟแสดงระดับน้ำย้อนหลัง
                </h3>
                
                <div className="flex p-1 bg-slate-800 rounded-lg">
                  <button 
                    onClick={() => setTimeRange('24h')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${timeRange === '24h' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    24 ชั่วโมง
                  </button>
                  <button 
                    onClick={() => setTimeRange('7d')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${timeRange === '7d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    7 วัน
                  </button>
                  <button 
                    onClick={() => setTimeRange('30d')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${timeRange === '30d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    30 วัน
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={category.colorHex} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={category.colorHex} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey={timeRange === '24h' ? 'time' : 'date'} 
                      stroke="#475569" 
                      fontSize={11} 
                      tickMargin={10} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[minLevel, maxLevel]} 
                      stroke="#475569" 
                      fontSize={11} 
                      tickFormatter={(val) => val.toFixed(1)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    
                    {/* Bank Level Line */}
                    <ReferenceLine y={station.bankLevel} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'ระดับตลิ่ง', fill: '#ef4444', fontSize: 10 }} />
                    {/* Warning Level Line */}
                    <ReferenceLine y={station.warningLevel} stroke="#f59e0b" strokeDasharray="4 4" label={{ position: 'insideBottomLeft', value: 'เตือนภัย', fill: '#f59e0b', fontSize: 10 }} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      name="ระดับน้ำ (ม.)" 
                      stroke={category.colorHex} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLevel)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
