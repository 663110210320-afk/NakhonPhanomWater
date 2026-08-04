import React from 'react';
import { WaterStation } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, CloudRain, ShieldCheck, Activity } from 'lucide-react';

interface SummaryStatsProps {
  stations: WaterStation[];
  damStations: any[]; // Or import DamStation
  isDarkMode: boolean;
  onOpenRainfallModal: () => void;
  onOpenDamModal: () => void;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ 
  stations, 
  damStations = [],
  isDarkMode,
  onOpenRainfallModal,
  onOpenDamModal
}) => {
  const total = stations.length;
  const critical = stations.filter(s => s.status === 'critical').length;
  const warning = stations.filter(s => s.status === 'warning').length;
  const watch = stations.filter(s => s.status === 'watch').length;
  const normal = stations.filter(s => s.status === 'normal').length;

  const totalRain = stations.reduce((sum, s) => sum + (s.rainfall24h || 0), 0);
  const avgRain = total > 0 ? (totalRain / total).toFixed(1) : '0';

  const Card = ({ 
    title, value, subtitle, icon, gradient, textColor, onClick, isClickable 
  }: { 
    title: string; value: string | number; subtitle: string; icon: React.ReactNode; 
    gradient: string; textColor: string; onClick?: () => void; isClickable?: boolean;
  }) => (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
      {/* Background Gradient Blob */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${gradient}`}></div>
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className={`text-3xl font-black tracking-tight mb-1 ${textColor}`}>{value}</div>
        <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card 
        title="สถานีทั้งหมด" 
        value={total} 
        subtitle="สถานีเฝ้าระวังระดับน้ำ" 
        icon={<Activity className="w-5 h-5" />} 
        gradient="from-blue-500 to-cyan-400"
        textColor={isDarkMode ? 'text-blue-400' : 'text-blue-600'}
      />
      <Card 
        title="ปกติ / น้ำน้อย" 
        value={normal + watch} 
        subtitle="ระดับน้ำยังอยู่ในเกณฑ์ปลอดภัย" 
        icon={<CheckCircle2 className="w-5 h-5" />} 
        gradient="from-emerald-500 to-teal-400"
        textColor={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}
      />
      <Card 
        title="เฝ้าระวัง / เตือนภัย" 
        value={warning} 
        subtitle="ระดับน้ำสูงใกล้ล้นตลิ่ง" 
        icon={<AlertTriangle className="w-5 h-5" />} 
        gradient="from-amber-500 to-orange-400"
        textColor={isDarkMode ? 'text-amber-400' : 'text-amber-600'}
      />
      <Card 
        title="วิกฤต (ล้นตลิ่ง)" 
        value={critical} 
        subtitle="ต้องอพยพหรือจัดการด่วน" 
        icon={<ShieldAlert className="w-5 h-5" />} 
        gradient="from-rose-500 to-red-600"
        textColor={isDarkMode ? 'text-rose-400' : 'text-rose-600'}
      />
      
      {/* Rainfall specific card spanning 2 columns */}
      <div 
        onClick={onOpenRainfallModal}
        className={`col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-400/50'
        }`}
      >
        <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-20 blur-3xl from-blue-600 to-indigo-600 bg-gradient-to-br`}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ฝนเฉลี่ย (24 ชม.)</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{avgRain}</span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>มม.</span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>คลิกเพื่อดูปริมาณฝนแยกรายอำเภอ &rarr;</p>
          </div>
        </div>
      </div>

      {/* Dam specific card spanning 2 columns */}
      <div 
        onClick={onOpenDamModal}
        className={`col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-violet-500/50' : 'bg-white border-slate-200 hover:border-violet-400/50'
        }`}
      >
        <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-20 blur-3xl from-violet-600 to-fuchsia-600 bg-gradient-to-br`}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
              <path d="M3 12A9 3 0 0 0 21 12"></path>
            </svg>
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ข้อมูลอ่างเก็บน้ำ ({damStations.length} แห่ง)</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {damStations.length > 0 
                  ? (damStations.reduce((sum: number, d: any) => sum + d.storageAmount, 0)).toFixed(1)
                  : '0.0'}
              </span>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>ล้าน ลบ.ม.</span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} font-medium`}>คลิกเพื่อดูรายละเอียดอ่างเก็บน้ำ &rarr;</p>
          </div>
        </div>
      </div>

    </div>
  );
};
