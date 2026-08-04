import React from 'react';
import { SimulationConfig, SimulationScenario } from '../types';
import { Settings, Play, Pause, FastForward, RotateCcw, CloudLightning, Waves, X, Droplets, Sun, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationControlBarProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onUpdateConfig: (c: SimulationConfig) => void;
  onTriggerScenario: (s: SimulationScenario) => void;
  onResetData: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTriggerScenario,
  onResetData,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-4xl px-4"
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-white">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-slate-800 border border-slate-700 rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core Controls */}
          <div className="flex items-center gap-3 pr-4 md:border-r border-slate-700">
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-purple-300">โหมดจำลองสถานการณ์</h3>
              <p className="text-[10px] text-slate-400">ทดสอบการแจ้งเตือน</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateConfig({...config, isRunning: !config.isRunning})}
              className={`p-3 rounded-xl flex items-center justify-center transition-colors shadow-md ${
                config.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {config.isRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white pl-0.5" />}
            </button>
            <button
              onClick={onResetData}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shadow-md text-slate-300 hover:text-white"
              title="รีเซ็ตข้อมูล"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col flex-1 w-full px-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><FastForward className="w-3 h-3" /> ความเร็ว</span>
              <span className="text-xs text-blue-400 font-bold">{config.speedSec} วินาที / รอบ</span>
            </div>
            <input 
              type="range" min="0.5" max="5" step="0.5" 
              value={config.speedSec} 
              onChange={(e) => onUpdateConfig({...config, speedSec: parseFloat(e.target.value)})}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Scenarios */}
          <div className="flex flex-wrap items-center justify-center gap-2 pl-4 md:border-l border-slate-700">
            <button
              onClick={() => onTriggerScenario('normal')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-emerald-400" /> ปกติ
            </button>
            <button
              onClick={() => onTriggerScenario('heavy_rain')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <CloudLightning className="w-3.5 h-3.5 text-amber-400" /> ฝนตกหนัก
            </button>
            <button
              onClick={() => onTriggerScenario('mekong_surge')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Waves className="w-3.5 h-3.5 text-blue-400" /> น้ำโขงหนุน
            </button>
            <button
              onClick={() => onTriggerScenario('pm25_smog')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Wind className="w-3.5 h-3.5 text-rose-400" /> ฝุ่นพิษ PM2.5
            </button>
            <button
              onClick={() => onTriggerScenario('gate_open')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> เปิดประตูระบาย
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
