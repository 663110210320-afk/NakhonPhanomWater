import React, { useState, useEffect } from 'react';
import { DamStation } from '../types';
import { MapPin, Database, X } from 'lucide-react';

interface DamModalProps {
  isOpen: boolean;
  onClose: () => void;
  damStations: DamStation[];
  isDarkMode: boolean;
  districts: string[];
}

export const DamModal: React.FC<DamModalProps> = ({
  isOpen,
  onClose,
  damStations,
  isDarkMode,
  districts,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ทั้งหมด');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStations = damStations.filter(
    (s) => selectedDistrict === 'ทั้งหมด' || s.district === selectedDistrict
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Database className="w-6 h-6 text-violet-500" />
              ข้อมูลปริมาณน้ำในอ่างเก็บน้ำ ({damStations.length} แห่ง)
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              แสดงปริมาณน้ำที่มีอยู่จริงเทียบกับความจุอ่างเก็บน้ำของแต่ละพื้นที่
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              กรองตามอำเภอ:
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className={`flex-1 sm:w-64 px-3 py-2 rounded-xl text-sm font-medium outline-none transition-colors border shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-violet-500' 
                  : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500'
              }`}
            >
              <option value="ทั้งหมด">🌍 ทุกอำเภอ</option>
              {districts.map(d => {
                const count = damStations.filter(s => s.district === d).length;
                if (count === 0) return null;
                return (
                  <option key={d} value={d}>{d} ({count})</option>
                );
              })}
            </select>
          </div>
          
          <div className="flex gap-4 text-xs font-medium px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>น้ำมาก (&gt; 80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-violet-500"></span>
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>ปกติ (30 - 80%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>น้ำน้อย (&lt; 30%)</span>
            </div>
          </div>
        </div>

        {/* Content (Grid) */}
        <div className={`p-4 overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map((station) => {
              
              let gradientColor = 'from-violet-500 to-fuchsia-500';
              if (station.storagePercent < 30) {
                gradientColor = 'from-rose-500 to-orange-500';
              } else if (station.storagePercent > 80) {
                gradientColor = 'from-blue-500 to-cyan-500';
              }

              return (
                <div
                  key={station.id}
                  className={`group relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800 hover:border-violet-600' 
                      : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-lg'
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientColor}`}></div>

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {station.name}
                      </h3>
                      <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">อ.{station.district}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 font-bold text-lg ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>
                      {station.storagePercent.toFixed(1)}<span className="text-xs font-normal">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`text-[10px] font-semibold mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ปริมาณน้ำ (ล้าน ลบ.ม.)</div>
                      <div className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{station.storageAmount.toFixed(2)}</div>
                    </div>
                    <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`text-[10px] font-semibold mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ความจุอ่าง (ล้าน ลบ.ม.)</div>
                      <div className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{station.normalStorage.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${gradientColor}`}
                      style={{ width: `${Math.min(100, Math.max(0, station.storagePercent))}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[9px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>อัปเดต: {station.lastUpdated}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredStations.length === 0 && (
            <div className={`text-center py-12 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">ไม่พบข้อมูลอ่างเก็บน้ำในอำเภอที่เลือก</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
