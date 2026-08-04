import React, { useState, useEffect } from 'react';
import { WaterStation, AIAnalysisResult } from '../types';
import { X, Sparkles, Loader2, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Activity, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: WaterStation[];
  isDarkMode: boolean;
  dataMode: 'real' | 'sim';
  lastUpdated: Date;
}

export const ExecutiveSummaryModal: React.FC<ExecutiveSummaryModalProps> = ({
  isOpen,
  onClose,
  stations,
  isDarkMode,
  dataMode,
  lastUpdated,
}) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      generateAnalysis();
    }
  }, [isOpen]);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stations })
      });
      
      if (!res.ok) throw new Error('Failed to analyze data');
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setAnalysis(data.result);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950 shrink-0 relative overflow-hidden flex justify-between items-start">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">AI สรุปสถานการณ์น้ำ</h2>
                  <p className="text-xs text-teal-400 font-bold tracking-wide uppercase mt-1">Executive Summary Report</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 
                ข้อมูล ณ เวลา: {lastUpdated.toLocaleTimeString('th-TH')} {dataMode === 'sim' ? '(โหมดจำลอง)' : ''}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-900">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-teal-500">
                <Sparkles className="w-12 h-12 animate-pulse mb-4 text-teal-400" />
                <p className="font-bold text-lg text-white mb-2">Gemini AI กำลังวิเคราะห์ข้อมูล...</p>
                <p className="text-sm text-slate-400">ประมวลผลข้อมูลจาก {stations.length} สถานีเพื่อสรุปสถานการณ์</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-rose-500 bg-slate-800/50 rounded-2xl border border-rose-500/20 p-8 text-center">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-bold text-lg text-white mb-2">ไม่สามารถสร้างรายงานได้</p>
                <p className="text-sm opacity-80 mb-6">{error}</p>
                <button 
                  onClick={generateAnalysis}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg transition-colors"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                
                {/* Overall Risk Card */}
                <div className={`p-6 rounded-2xl border relative overflow-hidden ${
                  analysis.overallRiskLevel === 'critical' ? 'bg-rose-950/40 border-rose-500/50' :
                  analysis.overallRiskLevel === 'warning' ? 'bg-amber-950/40 border-amber-500/50' :
                  analysis.overallRiskLevel === 'watch' ? 'bg-yellow-950/40 border-yellow-500/50' :
                  'bg-emerald-950/40 border-emerald-500/50'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                      analysis.overallRiskLevel === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      analysis.overallRiskLevel === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      analysis.overallRiskLevel === 'watch' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {analysis.overallRiskLevel === 'critical' ? <ShieldAlert className="w-8 h-8" /> :
                       analysis.overallRiskLevel === 'warning' ? <AlertTriangle className="w-8 h-8" /> :
                       <ShieldCheck className="w-8 h-8" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">ระดับความเสี่ยงภาพรวม</h3>
                      <div className="text-xl font-black text-white mb-3">
                        {analysis.overallRiskLevel === 'critical' ? 'วิกฤต (ล้นตลิ่ง)' :
                         analysis.overallRiskLevel === 'warning' ? 'เตือนภัย (เสี่ยงล้นตลิ่ง)' :
                         analysis.overallRiskLevel === 'watch' ? 'เฝ้าระวัง' : 'ปกติ'}
                      </div>
                      <p className="text-slate-300 leading-relaxed text-sm">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* District Risk Table/List */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-500" />
                    พื้นที่ที่ต้องเฝ้าระวัง
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.districtRisks.map((d, i) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white">อ.{d.district}</h4>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            d.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            d.riskLevel === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            d.riskLevel === 'watch' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {d.riskLevel === 'critical' ? 'วิกฤต' :
                             d.riskLevel === 'warning' ? 'เตือนภัย' :
                             d.riskLevel === 'watch' ? 'เฝ้าระวัง' : 'ปกติ'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{d.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items & Public Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-500" />
                      ข้อเสนอแนะสำหรับหน่วยงาน
                    </h3>
                    <ul className="space-y-3">
                      {analysis.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      คำแนะนำสำหรับประชาชน
                    </h3>
                    <ul className="space-y-3">
                      {analysis.recommendationsForPublic.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500/50" />
              <span>Generated by Google Gemini AI</span>
            </div>
            <button 
              onClick={generateAnalysis}
              disabled={loading}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'กำลังวิเคราะห์...' : 'อัปเดตรายงาน'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
