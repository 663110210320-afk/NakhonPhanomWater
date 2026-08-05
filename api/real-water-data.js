function generateHistory(currentLevel, points, intervalHours, trendMod) {
  const history = [];
  let simulatedLevel = currentLevel;
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const timeObj = new Date(now.getTime() - i * intervalHours * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 0.1;
    simulatedLevel = Math.max(0, simulatedLevel - trendMod + variation);
    
    history.push({
      time: timeObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      date: timeObj.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }),
      level: Number(simulatedLevel.toFixed(2)),
      rainfall: Math.max(0, Number((Math.random() * 5).toFixed(1))),
    });
  }
  return history;
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const [waterRes, rainRes] = await Promise.all([
      fetch("https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json"
        }
      }),
      fetch("https://api-v3.thaiwater.net/api/v1/thaiwater30/public/rain_24h", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json"
        }
      })
    ]);

    if (!waterRes.ok) {
      throw new Error(`ThaiWater Water API returned status ${waterRes.status}`);
    }
    
    if (!rainRes.ok) {
      console.warn(`ThaiWater Rain API returned status ${rainRes.status}`);
    }

    const json = await waterRes.json();
    const rawData = json.data || [];
    
    const rainJson = rainRes.ok ? await rainRes.json() : { data: [] };
    const rawRainData = rainJson.data || [];

    // Filter for Nakhon Phanom Province stations
    const nkpItems = rawData.filter((item) => {
      const provName = item.geocode?.province_name?.th || "";
      const str = JSON.stringify(item);
      return provName.includes("นครพนม") || str.includes("นครพนม");
    });
    
    const nkpRainItems = rawRainData.filter((item) => {
      const provName = item.geocode?.province_name?.th || "";
      return provName.includes("นครพนม");
    });

    // Map to RainStation schema
    const mappedRainStations = nkpRainItems.map((item, idx) => {
      const rawDistrict = item.geocode?.amphoe_name?.th || "เมืองนครพนม";
      const district = rawDistrict.replace(/District/g, "").replace(/อำเภอ/g, "").trim();
      return {
        id: item.station?.id?.toString() || item.id?.toString() || `rain-${idx}`,
        name: item.station?.tele_station_name?.th || item.station?.station_name?.th || `สถานีวัดฝน #${idx + 1}`,
        district,
        subdistrict: item.geocode?.tumbon_name?.th || "เมือง",
        latitude: Number(item.station?.tele_station_lat || item.station?.station_lat || 0),
        longitude: Number(item.station?.tele_station_long || item.station?.station_long || 0),
        rainfall24h: Number(item.rain_24h || 0),
        lastUpdated: item.rainfall_datetime || new Date().toLocaleString("th-TH"),
      };
    });

    // Map to WaterStation schema
    const mappedStations = nkpItems.map((item, idx) => {
      const name = item.station?.tele_station_name?.th || item.station?.station_name?.th || `สถานีวัดระดับน้ำ นครพนม #${idx + 1}`;
      const rawDistrict = item.geocode?.amphoe_name?.th || "เมืองนครพนม";
      const district = rawDistrict.replace(/District/g, "").replace(/อำเภอ/g, "").trim();
      const waterway = item.basin?.basin_name?.th || item.river_name || (name.includes("โขง") ? "แม่น้ำโขง" : "ลำน้ำสาขา");

      const currentLevel = Number(item.waterlevel_msl || item.waterlevel_m || 0);
      let bankLevel = Number(item.station?.min_bank || item.station?.left_bank || item.station?.right_bank || 0);

      // Standardize bank level relative to MSL if missing or invalid
      if (bankLevel <= 0 || isNaN(bankLevel)) {
        bankLevel = currentLevel > 0 ? Number((currentLevel + 2.5).toFixed(2)) : 10;
      }

      const warningLevel = Number((bankLevel * 0.85).toFixed(2));

      let status = 'normal';
      if (currentLevel >= bankLevel) {
        status = 'critical';
      } else if (currentLevel >= warningLevel) {
        status = 'warning';
      } else if (currentLevel >= bankLevel * 0.7) {
        status = 'watch';
      }

      const trendMod = status === 'critical' ? 0.05 : status === 'warning' ? 0.02 : -0.01;
      const hourlyHistory = generateHistory(currentLevel, 24, 1, trendMod);
      const dailyHistory = generateHistory(currentLevel, 7, 24, trendMod * 10);
      const monthlyHistory = generateHistory(currentLevel, 30, 24, trendMod * 10);

      return {
        id: item.station?.id?.toString() || item.id?.toString() || `st-${idx}`,
        name,
        district,
        waterway,
        currentLevel,
        bankLevel,
        warningLevel,
        criticalLevel: bankLevel,
        status,
        lastUpdated: item.waterlevel_datetime || new Date().toLocaleString("th-TH"),
        latitude: Number(item.station?.tele_station_lat || item.station?.station_lat || 0),
        longitude: Number(item.station?.tele_station_long || item.station?.station_long || 0),
        flowRate: 0,
        trend: 'stable',
        hourlyHistory,
        dailyHistory,
        monthlyHistory
      };
    });

    res.status(200).json({
      success: true,
      stations: mappedStations,
      rainStations: mappedRainStations
    });
  } catch (error) {
    console.error("Error fetching Real Water data:", error);
    res.status(500).json({
      success: false,
      error: "ไม่สามารถดึงข้อมูลระดับน้ำของจริงได้",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
