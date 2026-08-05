import React from 'react';
import { X, Info, Waves, CloudRain, Wind, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type RiskTopic = 'water' | 'rain' | 'pm25' | 'dam' | null;

interface RiskCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: RiskTopic;
  isDarkMode: boolean;
}

export const RiskCriteriaModal: React.FC<RiskCriteriaModalProps> = ({ isOpen, onClose, topic, isDarkMode }) => {
  if (!isOpen || !topic) return null;

  const content = {
    water: {
      title: 'เกณฑ์ความเสี่ยงระดับน้ำ',
      icon: <Waves className="w-6 h-6 text-blue-400" />,
      color: 'blue',
      items: [
        { label: 'ปกติ', range: '< 70% ของความจุตลิ่ง', desc: 'ระดับน้ำอยู่ในเกณฑ์ปกติ ปลอดภัย', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
        { label: 'เฝ้าระวัง', range: '70% - 84% ของตลิ่ง', desc: 'ระดับน้ำเริ่มสูง ควรติดตามสถานการณ์', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
        { label: 'เตือนภัย', range: '85% - 99% ของตลิ่ง', desc: 'ระดับน้ำใกล้ล้นตลิ่ง เตรียมรับมือ', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
        { label: 'วิกฤต (ล้นตลิ่ง)', range: '>= 100% ของตลิ่ง', desc: 'ระดับน้ำล้นตลิ่ง อาจเกิดน้ำท่วมขัง', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
      ]
    },
    rain: {
      title: 'เกณฑ์ปริมาณฝนสะสม (24 ชม.)',
      icon: <CloudRain className="w-6 h-6 text-cyan-400" />,
      color: 'cyan',
      items: [
        { label: 'ไม่มีฝน', range: '0 มม.', desc: 'ท้องฟ้าแจ่มใส', bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/50' },
        { label: 'ฝนเล็กน้อย', range: '0.1 - 10 มม.', desc: 'ฝนตกปรอยๆ ไม่ส่งผลกระทบ', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
        { label: 'ฝนปานกลาง', range: '10.1 - 35 มม.', desc: 'ฝนตกต่อเนื่อง อาจมีน้ำขังรอระบาย', bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
        { label: 'ฝนตกหนัก', range: '35.1 - 90 มม.', desc: 'เสี่ยงต่อน้ำท่วมฉับพลันและน้ำป่าไหลหลาก', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
        { label: 'ตกหนักมาก', range: '> 90 มม.', desc: 'อันตรายสูงมาก ระวังอุทกภัยฉับพลัน', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
      ]
    },
    pm25: {
      title: 'เกณฑ์คุณภาพอากาศ (PM 2.5)',
      icon: <Wind className="w-6 h-6 text-emerald-400" />,
      color: 'emerald',
      items: [
        { label: 'ดีมาก', range: '0 - 15 µg/m³', desc: 'คุณภาพอากาศดีมาก เหมาะกับกิจกรรมกลางแจ้ง', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
        { label: 'ดี', range: '15.1 - 25 µg/m³', desc: 'คุณภาพอากาศดี สามารถทำกิจกรรมกลางแจ้งได้', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
        { label: 'ปานกลาง', range: '25.1 - 37.5 µg/m³', desc: 'ผู้ที่ไวต่อมลพิษควรลดระยะเวลาทำกิจกรรม', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
        { label: 'เริ่มมีผลกระทบ', range: '37.6 - 75 µg/m³', desc: 'ควรสวมหน้ากากอนามัยเมื่ออยู่กลางแจ้ง', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
        { label: 'มีผลกระทบ', range: '> 75 µg/m³', desc: 'งดกิจกรรมกลางแจ้ง และสวมหน้ากาก N95', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
      ]
    },
    dam: {
      title: 'เกณฑ์ปริมาณน้ำในอ่างเก็บน้ำ',
      icon: <ShieldAlert className="w-6 h-6 text-indigo-400" />,
      color: 'indigo',
      items: [
        { label: 'น้ำน้อย', range: '< 30% ของความจุ', desc: 'เฝ้าระวังภัยแล้ง การเกษตรอาจได้รับผลกระทบ', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
        { label: 'น้ำปกติ', range: '30% - 80% ของความจุ', desc: 'ปริมาณน้ำอยู่ในเกณฑ์บริหารจัดการได้', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
        { label: 'น้ำมาก', range: '> 80% ของความจุ', desc: 'เฝ้าระวังน้ำล้นสปิลเวย์ หากมีฝนตกหนัก', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
        { label: 'น้ำล้นความจุ', range: '> 100% ของความจุ', desc: 'เสี่ยงน้ำล้นสปิลเวย์กระทบพื้นที่ท้ายเขื่อน', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
      ]
    }
  };

  const data = content[topic];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-md ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-3xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-5 flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
            <div className={`p-2 rounded-xl bg-${data.color}-500/10`}>
              {data.icon}
            </div>
            <h2 className={`font-bold text-lg flex-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {data.title}
            </h2>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-3">
            {data.items.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-1 ${isDarkMode ? `${item.bg} ${item.border}` : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-sm ${isDarkMode ? item.text : 'text-slate-800'}`}>{item.label}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-black/20 text-white/80' : 'bg-white text-slate-600 border'}`}>
                    {item.range}
                  </span>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className={`p-4 text-center text-xs ${isDarkMode ? 'text-slate-500 bg-slate-950/50' : 'text-slate-400 bg-slate-50'}`}>
            ข้อมูลอ้างอิงจากคลังข้อมูลน้ำแห่งชาติ (สสน.)
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
