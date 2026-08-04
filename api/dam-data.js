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
    const response = await fetch("https://api-v3.thaiwater.net/api/v1/thaiwater30/provinces/dam?province_id=48");
    if (!response.ok) {
      throw new Error(`ThaiWater API responded with status: ${response.status}`);
    }
    const data = await response.json();

    const dams = data?.data?.dam_medium || [];
    const formattedDams = dams.map((d) => ({
      id: Number(d.dam?.id || Math.random()),
      name: d.dam?.dam_name?.th || 'ไม่ทราบชื่ออ่างเก็บน้ำ',
      district: d.geocode?.amphoe_name?.th || 'เมืองนครพนม',
      latitude: Number(d.dam?.dam_lat || 17.4),
      longitude: Number(d.dam?.dam_long || 104.7),
      storagePercent: Number(d.dam_storage_percent || 0),
      storageAmount: Number(d.dam_storage || 0),
      normalStorage: Number(d.dam?.normal_storage || 0),
      lastUpdated: d.dam_date || 'N/A'
    }));

    res.status(200).json({
      success: true,
      dams: formattedDams
    });
  } catch (error) {
    console.error("Error fetching Dam data:", error);
    res.status(500).json({
      success: false,
      error: "ไม่สามารถดึงข้อมูลอ่างเก็บน้ำได้",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
