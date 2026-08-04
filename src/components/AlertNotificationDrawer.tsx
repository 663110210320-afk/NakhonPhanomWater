import React, { useState } from 'react';
import { WaterAlert, AlertSetting, WaterStation } from '../types';
import { X, Bell, ShieldAlert, AlertTriangle, CheckCircle2, Settings, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: WaterAlert[];
  onClearAlerts: () => void;
  onMarkAsRead: (id: string) => void;
  settings: AlertSetting;
  onUpdateSettings: (s: AlertSetting) => void;
  stations: WaterStation[];
  onOpenWarningModal?: () => void;
}

export const AlertNotificationDrawer: React.FC<AlertNotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAlerts,
  onMarkAsRead,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');

  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              การแจ้งเตือน
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-black animate-pulse">
                  {unreadCount} ใหม่
                </span>
              )}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'alerts' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" /> รายการเตือนภัย
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'settings' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" /> ตั้งค่าการแจ้งเตือน
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50 dark:bg-slate-900">
            {activeTab === 'alerts' ? (
              <div className="flex flex-col gap-3">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">ไม่มีการแจ้งเตือนใหม่</p>
                    <p className="text-xs mt-1">สถานการณ์ปกติ</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ล่าสุด ({alerts.length})</span>
                      <button 
                        onClick={onClearAlerts}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> ล้างทั้งหมด
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {alerts.map(alert => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                          className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                            alert.isRead 
                              ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 opacity-70' 
                              : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500/50 shadow-sm'
                          }`}
                        >
                          {/* Accent line */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            alert.severity === 'critical' ? 'bg-rose-500' :
                            alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></div>

                          <div className="pl-3">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {alert.severity === 'critical' ? (
                                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                                ) : alert.severity === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Bell className="w-4 h-4 text-blue-500" />
                                )}
                                <span className={`text-xs font-bold ${
                                  alert.severity === 'critical' ? 'text-rose-600 dark:text-rose-400' :
                                  alert.severity === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                  {alert.stationName}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{alert.timestamp}</span>
                            </div>
                            
                            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 leading-relaxed font-medium">
                              {alert.message}
                            </p>
                            
                            {!alert.isRead && (
                              <div className="flex justify-end mt-2">
                                <button 
                                  onClick={() => onMarkAsRead(alert.id)}
                                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> ทำเครื่องหมายว่าอ่านแล้ว
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">ช่องทางการแจ้งเตือน</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">เสียงแจ้งเตือนไซเรน</p>
                      <p className="text-xs text-slate-500">เล่นเสียงเตือนเมื่อมีระดับน้ำวิกฤต</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.soundEnabled} onChange={(e) => onUpdateSettings({...settings, soundEnabled: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">แจ้งเตือนอัตโนมัติ</p>
                      <p className="text-xs text-slate-500">แสดงการแจ้งเตือน Pop-up บนหน้าจอ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.autoNotification} onChange={(e) => onUpdateSettings({...settings, autoNotification: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">เกณฑ์การแจ้งเตือน</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">เฝ้าระวัง (Watch)</p>
                      <span className="text-sm font-bold text-blue-600">{settings.watchThresholdPct}%</span>
                    </div>
                    <input type="range" min="30" max="100" value={settings.watchThresholdPct} onChange={(e) => onUpdateSettings({...settings, watchThresholdPct: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">เตือนภัย (Warning)</p>
                      <span className="text-sm font-bold text-amber-500">{settings.warningThresholdPct}%</span>
                    </div>
                    <input type="range" min="50" max="100" value={settings.warningThresholdPct} onChange={(e) => onUpdateSettings({...settings, warningThresholdPct: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">วิกฤต (Critical)</p>
                      <span className="text-sm font-bold text-rose-500">{settings.criticalThresholdPct}%</span>
                    </div>
                    <input type="range" min="70" max="100" value={settings.criticalThresholdPct} onChange={(e) => onUpdateSettings({...settings, criticalThresholdPct: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
