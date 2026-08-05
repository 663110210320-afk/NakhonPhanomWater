export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const rainRes = await fetch("https://api-v3.thaiwater.net/api/v1/thaiwater30/public/rain_24h", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json"
      }
    });

    if (!rainRes.ok) {
      throw new Error(`ThaiWater Rain API returned status ${rainRes.status}`);
    }

    const rainJson = await rainRes.json();
    const rawRainData = rainJson.data || [];

    // Filter for Nakhon Phanom
    const nkpRainItems = rawRainData.filter((item) => {
      const provName = item.geocode?.province_name?.th || "";
      return provName.includes("นครพนม");
    });

    const getIntensity = (mm) => {
      if (mm <= 0) return { key: 'none', label: 'ไม่มีฝน', color: 'text-slate-400', badgeBg: 'bg-slate-700 text-slate-300' };
      if (mm < 10.1) return { key: 'light', label: 'ฝนเล็กน้อย', color: 'text-blue-400', badgeBg: 'bg-blue-900/50 text-blue-300' };
      if (mm < 35.1) return { key: 'moderate', label: 'ฝนปานกลาง', color: 'text-cyan-400', badgeBg: 'bg-cyan-900/50 text-cyan-300' };
      if (mm < 90.1) return { key: 'heavy', label: 'ฝนตกหนัก', color: 'text-amber-500', badgeBg: 'bg-amber-500/20 text-amber-500' };
      return { key: 'very_heavy', label: 'ตกหนักมาก', color: 'text-rose-500', badgeBg: 'bg-rose-500/20 text-rose-500' };
    };

    let totalRain = 0;
    let heavyCount = 0;
    let veryHeavyCount = 0;
    let maxRainStation = null;

    const stations = nkpRainItems.map((item, idx) => {
      const rawDistrict = item.geocode?.amphoe_name?.th || "เมืองนครพนม";
      const district = rawDistrict.replace(/District/g, "").replace(/อำเภอ/g, "").trim();
      const rain24h = Number(item.rain_24h || 0);

      totalRain += rain24h;
      if (rain24h >= 90.1) veryHeavyCount++;
      else if (rain24h >= 35.1) heavyCount++;

      const st = {
        id: item.station?.id?.toString() || item.id?.toString() || `rain-${idx}`,
        code: item.station?.tele_station_id || '',
        name: item.station?.tele_station_name?.th || item.station?.station_name?.th || `สถานี #${idx + 1}`,
        district,
        subdistrict: item.geocode?.tumbon_name?.th || "เมือง",
        province: "นครพนม",
        basin: item.basin?.basin_name?.th || "",
        latitude: Number(item.station?.tele_station_lat || item.station?.station_lat || 0),
        longitude: Number(item.station?.tele_station_long || item.station?.station_long || 0),
        rain24h,
        datetime: item.rainfall_datetime || new Date().toISOString(),
        agency: {
          name: item.agency?.agency_name?.th || 'สสน.',
          shortName: item.agency?.agency_shortname?.th || 'สสน.'
        },
        intensity: getIntensity(rain24h)
      };

      if (!maxRainStation || rain24h > maxRainStation.rain24h) {
        maxRainStation = st;
      }
      return st;
    });

    const districtGroups = {};
    stations.forEach(st => {
      if (!districtGroups[st.district]) {
        districtGroups[st.district] = { sum: 0, count: 0, max: 0 };
      }
      districtGroups[st.district].sum += st.rain24h;
      districtGroups[st.district].count++;
      if (st.rain24h > districtGroups[st.district].max) {
        districtGroups[st.district].max = st.rain24h;
      }
    });

    let highestDistrict = null;
    const districtSummary = Object.keys(districtGroups).map(d => {
      const g = districtGroups[d];
      const avg = g.sum / g.count;
      const res = {
        district: d,
        stationCount: g.count,
        avgRain: avg,
        maxRain: g.max,
        maxStation: ''
      };
      if (!highestDistrict || avg > highestDistrict.avgRain) {
        highestDistrict = res;
      }
      return res;
    });

    districtSummary.sort((a, b) => b.avgRain - a.avgRain);

    res.status(200).json({
      success: true,
      source: "ThaiWater",
      province: "นครพนม",
      totalStations: stations.length,
      updatedAt: new Date().toISOString(),
      summary: {
        avgRain24h: stations.length > 0 ? totalRain / stations.length : 0,
        maxRainStation,
        heavyRainCount: heavyCount,
        veryHeavyRainCount: veryHeavyCount,
        districtCount: districtSummary.length,
        highestDistrict
      },
      districtSummary,
      stations
    });
  } catch (error) {
    console.error("Error fetching ThaiWater Rain data:", error);
    res.status(500).json({
      success: false,
      error: "ไม่สามารถดึงข้อมูลปริมาณฝนได้",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
