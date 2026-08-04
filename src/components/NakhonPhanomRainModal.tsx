import React, { useState, useEffect } from 'react';
import { X, CloudRain, Loader2, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThaiWaterRainResponse, ThaiWaterRainStation, DistrictRainSummary } from '../types';

interface NakhonPhanomRainModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const NakhonPhanomRainModal: React.FC<NakhonPhanomRainModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  const [data, setData] = useState<ThaiWaterRainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'district' | 'station'>('district');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/thaiwater-rain-24h');
      if (!res.ok) throw new Error('Failed to fetch rainfall data');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'API Error');
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="font-bold">กำลังดึงข้อมูลปริมาณฝนจากคลังข้อมูลน้ำแห่งชาติ...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-rose-500">
          <AlertTriangle className="w-10 h-10 mb-4 opacity-50" />
          <p className="font-bold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
          <p className="text-sm opacity-80 mt-1">{error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" /> ลองใหม่
          </button>
        </div>
      );
    }

    if (!data) return null;

    return (
      <div className="flex flex-col h-full">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-bold mb-1">ฝนเฉลี่ย (นครพนม)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-400">{data.summary.avgRain24h.toFixed(1)}</span>
              <span className="text-sm text-slate-400">มม.</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-bold mb-1">อำเภอที่ฝนตกมากสุด</p>
            <div className="flex items-baseline gap-1 truncate">
              <span className="text-lg font-black text-white truncate">{data.summary.highestDistrict?.district || '-'}</span>
            </div>
            <div className="text-xs text-cyan-400 mt-1">{data.summary.highestDistrict?.avgRain.toFixed(1)} มม.</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
            <p className="text-xs text-amber-500 font-bold mb-1">ฝนตกหนัก (35-90 มม.)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-500">{data.summary.heavyRainCount}</span>
              <span className="text-sm text-amber-600/50">สถานี</span>
            </div>
          </div>
          <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
            <p className="text-xs text-rose-500 font-bold mb-1">ฝนตกหนักมาก (&gt;90 มม.)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-500">{data.summary.veryHeavyRainCount}</span>
              <span className="text-sm text-rose-600/50">สถานี</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-700/50 mb-4 shrink-0">
          <button 
            onClick={() => setActiveTab('district')}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'district' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            สรุปรายอำเภอ
          </button>
          <button 
            onClick={() => setActiveTab('station')}
            className={`px-4 py-2 text-sm font-bold transition-colors border-b-2 ${activeTab === 'station' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            รายสถานี ({data.stations.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
          {activeTab === 'district' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.districtSummary.map((d: DistrictRainSummary) => (
                <div key={d.district} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-200">อ.{d.district}</h4>
                    <p className="text-xs text-slate-500 mt-1">วัดจาก {d.stationCount} สถานี (สูงสุด: {d.maxRain.toFixed(1)} มม.)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-400">{d.avgRain.toFixed(1)}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">เฉลี่ย (มม.)</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data.stations.sort((a, b) => b.rain24h - a.rain24h).map((st: ThaiWaterRainStation) => (
                <div key={st.id} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-800/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.intensity.badgeBg}`}>
                        {st.intensity.label}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{st.agency.shortName}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200">{st.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> อ.{st.district} ต.{st.subdistrict}</p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto bg-slate-900/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                    <div className="flex items-baseline gap-1 sm:justify-end">
                      <span className={`text-xl sm:text-2xl font-black ${st.intensity.color.replace('text-', 'text-')}`}>{st.rain24h.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">มม.</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{new Date(st.datetime).toLocaleString('th-TH')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <CloudRain className="w-6 h-6 text-white" />
                </div>
                ข้อมูลปริมาณฝน 24 ชั่วโมง (นครพนม)
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                ดึงข้อมูลล่าสุดจาก <a href="https://thaiwater.net" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">คลังข้อมูลน้ำแห่งชาติ (สสน.)</a>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchData} disabled={loading}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title="รีเฟรช"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-950">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
