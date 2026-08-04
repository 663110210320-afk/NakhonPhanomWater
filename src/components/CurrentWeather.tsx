import React, { useEffect, useState } from 'react';
import { Sun, Moon, Cloud, CloudRain, CloudLightning, Wind } from 'lucide-react';

interface CurrentWeatherProps {
  isDarkMode: boolean;
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  is_day: number;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ isDarkMode }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Nakhon Phanom coordinates: 17.4123, 104.7786
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=17.4123&longitude=104.7786&current_weather=true&timezone=Asia%2FBangkok'
        );
        const data = await res.json();
        if (data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
            is_day: data.current_weather.is_day,
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border animate-pulse ${
        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}>
        <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600"></div>
        <div className="w-8 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = () => {
    const code = weather.weathercode;
    const isDay = weather.is_day === 1;
    
    if (code === 0) return isDay ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-300" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-slate-400" />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (code >= 95) return <CloudLightning className="w-4 h-4 text-purple-500" />;
    
    return <Wind className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
    }`}>
      {getWeatherIcon()}
      <span className="text-xs font-bold">{Math.round(weather.temperature)}°C</span>
    </div>
  );
};
