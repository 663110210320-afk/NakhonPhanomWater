import React, { useEffect, useState } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, Wind, X, CloudSun, Droplets } from 'lucide-react';

interface WeatherForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface DailyForecast {
  time: string;
  weathercode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
}

export const WeatherForecastModal: React.FC<WeatherForecastModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
}) => {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchForecast = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=17.4123&longitude=104.7786&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok'
        );
        const data = await res.json();
        if (data.daily) {
          const parsed: DailyForecast[] = data.daily.time.map((time: string, i: number) => ({
            time,
            weathercode: data.daily.weathercode[i],
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precipProb: data.daily.precipitation_probability_max[i],
          }));
          setForecast(parsed);
        }
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [isOpen]);

  if (!isOpen) return null;

  const getWeatherIcon = (code: number, className: string = "w-6 h-6") => {
    if (code === 0) return <Sun className={`${className} text-amber-500`} />;
    if (code >= 1 && code <= 3) return <CloudSun className={`${className} text-slate-400`} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-purple-500`} />;
    return <Cloud className={`${className} text-slate-400`} />;
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'ท้องฟ้าแจ่มใส';
    if (code >= 1 && code <= 3) return 'มีเมฆบางส่วน';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'มีฝนตก';
    if (code >= 95) return 'พายุฝนฟ้าคะนอง';
    return 'มีเมฆมาก';
  };

  const formatDay = (dateStr: string, isFirst: boolean) => {
    if (isFirst) return 'วันนี้';
    const date = new Date(dateStr);
    const days = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    return days[date.getDay()];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][date.getMonth()]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 flex items-center justify-between border-b relative overflow-hidden ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          {/* Background Gradient Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className={`text-2xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sun className="w-8 h-8 text-amber-500" />
              พยากรณ์อากาศล่วงหน้า 7 วัน
            </h2>
            <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              ข้อมูลอุณหภูมิและโอกาสเกิดฝน พื้นที่จังหวัดนครพนม
            </p>
          </div>
          <button
            onClick={onClose}
            className={`relative z-10 p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Sun className="w-12 h-12 text-amber-500 animate-spin-slow mb-4" />
              <div className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>กำลังโหลดข้อมูลพยากรณ์อากาศ...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {forecast.map((day, index) => {
                const isToday = index === 0;
                
                return (
                  <div 
                    key={day.time}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isDarkMode 
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    } ${isToday ? (isDarkMode ? 'ring-1 ring-amber-500/50 bg-amber-950/20' : 'ring-1 ring-amber-500/30 bg-amber-50/50') : ''}`}
                  >
                    {/* Date Section */}
                    <div className="flex items-center gap-4 w-32 shrink-0">
                      <div className={`w-14 text-center ${isToday ? 'text-amber-500 font-bold' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                        <div className="text-lg">{formatDay(day.time, isToday)}</div>
                        <div className="text-[10px]">{formatDate(day.time)}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 shadow-sm">
                        {getWeatherIcon(day.weathercode)}
                      </div>
                    </div>

                    {/* Desc Section */}
                    <div className={`flex-1 px-4 font-bold text-sm hidden sm:block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {getWeatherDesc(day.weathercode)}
                    </div>

                    {/* Rain Section */}
                    <div className={`flex items-center gap-1.5 w-24 shrink-0 font-bold ${
                      day.precipProb > 50 ? 'text-blue-500' : (day.precipProb > 20 ? 'text-cyan-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400'))
                    }`}>
                      <Droplets className="w-4 h-4" />
                      {day.precipProb}%
                    </div>

                    {/* Temp Section */}
                    <div className="flex items-center justify-end gap-3 w-32 shrink-0">
                      <div className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {Math.round(day.tempMax)}°
                      </div>
                      <div className={`text-sm font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {Math.round(day.tempMin)}°
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!loading && (
            <div className={`mt-6 text-center text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              ข้อมูลพยากรณ์อากาศสนับสนุนโดย Open-Meteo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
