export type WaterStatus = 'normal' | 'watch' | 'warning' | 'critical';

export interface RainStation {
  id: string;
  name: string;
  district: string;
  subdistrict: string;
  latitude: number;
  longitude: number;
  rainfall24h: number;
  lastUpdated: string;
}

export interface Pm25Station {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  pm25: number;
  aqi: number;
  colorId: string;
  lastUpdated: string;
}

export interface DamStation {
  id: number;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  storagePercent: number;
  storageAmount: number;
  normalStorage: number;
  lastUpdated: string;
}

export type WaterTrend = 'rising' | 'steady' | 'falling';

export interface HourlyData {
  time: string;
  date?: string;
  level: number;
  rainfall: number;
  flowRate?: number;
}

export interface HistoricalRecord {
  time: string;
  date?: string;
  level: number;
  rainfall: number;
  flowRate?: number;
}

export interface WaterStation {
  id: string;
  code: string;
  name: string;
  district: string;
  subdistrict: string;
  waterway: string;
  latitude: number;
  longitude: number;
  currentLevel: number; // เมตร รทก. (m.MSL)
  bankLevel: number; // ระดับตลิ่ง (m.MSL)
  groundLevel?: number; // ระดับพื้นท้องน้ำ (m.MSL)
  storagePercent?: number; // % ปริมาณน้ำเทียบความจุตลิ่งจาก สสน.
  warningLevel: number; // ระดับเตือนภัย (m.MSL)
  criticalLevel: number; // ระดับวิกฤต (m.MSL)
  flowRate: number; // อัตราการไหล ลบ.ม./วินาที
  rainfall24h: number; // ปริมาณน้ำฝน 24 ชม. (มม.)
  lastUpdated: string;
  status: WaterStatus;
  trend: WaterTrend;
  hourlyHistory: HourlyData[];
  dailyHistory?: HistoricalRecord[];
  monthlyHistory?: HistoricalRecord[];
}

export interface WaterAlert {
  id: string;
  stationId: string;
  stationName: string;
  district: string;
  severity: WaterStatus;
  waterLevel: number;
  bankLevel: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AlertSetting {
  soundEnabled: boolean;
  autoNotification: boolean;
  watchThresholdPct: number; // Default 70%
  warningThresholdPct: number; // Default 85%
  criticalThresholdPct: number; // Default 95%
  notifyLine: boolean;
  notifySms: boolean;
}

export type SimulationScenario = 'normal' | 'heavy_rain' | 'mekong_surge' | 'gate_open' | 'drought' | 'pm25_smog';

export interface SimulationConfig {
  isRunning: boolean;
  speedSec: number; // seconds per tick
  scenario: SimulationScenario;
  rainRateMm: number;
}

export interface AIAnalysisResult {
  summary: string;
  overallRiskLevel: WaterStatus;
  districtRisks: Array<{
    district: string;
    riskLevel: WaterStatus;
    advice: string;
  }>;
  actionItems: string[];
  recommendationsForPublic: string[];
}

export type WaterCategoryKey = 'low_critical' | 'low' | 'normal' | 'high' | 'overflow';

export interface WaterCategoryInfo {
  key: WaterCategoryKey;
  label: string;
  rangeText: string;
  badgeBgLight: string;
  badgeBgDark: string;
  gaugeGradient: string;
  colorHex: string;
  statusType: WaterStatus;
}

export function getWaterCategory(pct: number): WaterCategoryInfo {
  if (pct <= 10) {
    return {
      key: 'low_critical',
      label: 'น้ำน้อยวิกฤต',
      rangeText: '≤10%',
      badgeBgLight: 'bg-purple-100 border-purple-300 text-purple-800 font-bold',
      badgeBgDark: 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold',
      gaugeGradient: 'from-purple-600 to-indigo-500',
      colorHex: '#9333ea',
      statusType: 'warning',
    };
  } else if (pct <= 30) {
    return {
      key: 'low',
      label: 'น้ำน้อย',
      rangeText: '11-30%',
      badgeBgLight: 'bg-amber-100 border-amber-300 text-amber-800 font-bold',
      badgeBgDark: 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold',
      gaugeGradient: 'from-amber-500 to-yellow-400',
      colorHex: '#f59e0b',
      statusType: 'watch',
    };
  } else if (pct <= 70) {
    return {
      key: 'normal',
      label: 'น้ำปกติ',
      rangeText: '31-70%',
      badgeBgLight: 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold',
      badgeBgDark: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold',
      gaugeGradient: 'from-emerald-500 to-teal-400',
      colorHex: '#10b981',
      statusType: 'normal',
    };
  } else if (pct <= 100) {
    return {
      key: 'high',
      label: 'น้ำมาก',
      rangeText: '71-100%',
      badgeBgLight: 'bg-blue-100 border-blue-300 text-blue-800 font-bold',
      badgeBgDark: 'bg-blue-500/20 border-blue-500/50 text-cyan-300 font-bold',
      gaugeGradient: 'from-blue-500 to-cyan-400',
      colorHex: '#3b82f6',
      statusType: 'watch',
    };
  } else {
    return {
      key: 'overflow',
      label: 'น้ำล้นตลิ่ง',
      rangeText: '>100%',
      badgeBgLight: 'bg-rose-100 border-rose-300 text-rose-800 font-bold animate-pulse',
      badgeBgDark: 'bg-rose-500/25 border-rose-500/60 text-rose-400 font-bold animate-pulse',
      gaugeGradient: 'from-rose-600 to-red-500',
      colorHex: '#f43f5e',
      statusType: 'critical',
    };
  }
}

export function getWaterLevelPercent(station: WaterStation): number {
  if (station.storagePercent !== undefined && station.storagePercent !== null && !isNaN(station.storagePercent) && station.storagePercent > 0) {
    return Math.max(0, Math.round(station.storagePercent));
  }

  const current = station.currentLevel || 0;
  const bank = station.bankLevel || 10;

  if (station.groundLevel !== undefined && station.groundLevel !== null && station.groundLevel > 0 && bank > station.groundLevel) {
    const depth = Math.max(0, current - station.groundLevel);
    const capacity = bank - station.groundLevel;
    return Math.max(0, Math.round((depth / capacity) * 100));
  }

  // If MSL level (elevation above sea level > 30m):
  if (current > 30 && bank > 30) {
    // Estimate standard river bed depth around 10 meters below bank level
    const estimatedGround = bank - 10;
    const depth = Math.max(0, current - estimatedGround);
    return Math.max(0, Math.round((depth / 10) * 100));
  }

  // Local gauge level (e.g. 0-15m)
  if (bank <= 0) return 0;
  return Math.max(0, Math.round((current / bank) * 100));
}

export type RainfallSeverity = 'none' | 'light' | 'moderate' | 'heavy' | 'very_heavy';

export interface RainfallCategoryInfo {
  key: RainfallSeverity;
  label: string;
  shortLabel: string;
  rangeText: string;
  badgeBgLight: string;
  badgeBgDark: string;
  textColor: string;
  barColor: string;
  iconText: string;
}

export function getRainfallCategory(rainfallMm: number): RainfallCategoryInfo {
  const mm = Number(rainfallMm || 0);
  if (mm <= 0) {
    return {
      key: 'none',
      label: 'ไม่มีฝน',
      shortLabel: 'ไม่มีฝน',
      rangeText: '0 มม.',
      badgeBgLight: 'bg-slate-100 border-slate-300 text-slate-600',
      badgeBgDark: 'bg-slate-800/60 border-slate-700 text-slate-400',
      textColor: 'text-slate-400',
      barColor: 'bg-slate-400',
      iconText: '☀️',
    };
  } else if (mm < 10.1) {
    return {
      key: 'light',
      label: 'ฝนตกเล็กน้อย',
      shortLabel: 'ฝนเล็กน้อย',
      rangeText: '0.1-10 มม.',
      badgeBgLight: 'bg-blue-50 border-blue-200 text-blue-700',
      badgeBgDark: 'bg-blue-950/50 border-blue-800 text-blue-300',
      textColor: 'text-blue-400',
      barColor: 'bg-blue-500',
      iconText: '🌦️',
    };
  } else if (mm < 35.1) {
    return {
      key: 'moderate',
      label: 'ฝนตกปานกลาง',
      shortLabel: 'ฝนปานกลาง',
      rangeText: '10.1-35 มม.',
      badgeBgLight: 'bg-cyan-50 border-cyan-300 text-cyan-800 font-semibold',
      badgeBgDark: 'bg-cyan-950/60 border-cyan-700 text-cyan-300 font-semibold',
      textColor: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      iconText: '🌧️',
    };
  } else if (mm < 90.1) {
    return {
      key: 'heavy',
      label: 'ฝนตกหนัก ⚠️',
      shortLabel: 'ฝนตกหนัก',
      rangeText: '35.1-90 มม.',
      badgeBgLight: 'bg-amber-100 border-amber-300 text-amber-900 font-bold',
      badgeBgDark: 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold',
      textColor: 'text-amber-400',
      barColor: 'bg-amber-500',
      iconText: '⛈️',
    };
  } else {
    return {
      key: 'very_heavy',
      label: 'ฝนตกหนักมาก 🚨',
      shortLabel: 'ตกหนักมาก',
      rangeText: '>90 มม.',
      badgeBgLight: 'bg-rose-100 border-rose-400 text-rose-900 font-extrabold animate-pulse',
      badgeBgDark: 'bg-rose-500/25 border-rose-500/60 text-rose-300 font-extrabold animate-pulse',
      textColor: 'text-rose-400',
      barColor: 'bg-rose-600',
      iconText: '⚡🚨',
    };
  }
}

export interface ThaiWaterRainStation {
  id: string;
  code: string;
  name: string;
  district: string;
  subdistrict: string;
  province: string;
  basin: string;
  latitude: number;
  longitude: number;
  rain24h: number;
  rainToday?: number;
  rain3d?: number;
  datetime: string;
  agency: {
    name: string;
    shortName: string;
  };
  intensity: {
    key: 'none' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
    label: string;
    color: string;
    badgeBg: string;
  };
}

export interface DistrictRainSummary {
  district: string;
  stationCount: number;
  avgRain: number;
  maxRain: number;
  maxStation: string;
}

export interface ThaiWaterRainResponse {
  success: boolean;
  source: string;
  province: string;
  totalStations: number;
  updatedAt: string;
  summary: {
    avgRain24h: number;
    maxRainStation: ThaiWaterRainStation | null;
    heavyRainCount: number;
    veryHeavyRainCount: number;
    districtCount: number;
    highestDistrict: DistrictRainSummary | null;
  };
  districtSummary: DistrictRainSummary[];
  stations: ThaiWaterRainStation[];
}

