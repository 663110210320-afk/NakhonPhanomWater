export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { station } = req.body;
    
    if (!station) {
      return res.status(400).json({ error: 'Missing station data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const prompt = `
คุณคือผู้เชี่ยวชาญด้านอุทกวิทยาและการจัดการภัยพิบัติน้ำท่วม 
กรุณาวิเคราะห์สถานการณ์น้ำของสถานีต่อไปนี้ และประเมินความเสี่ยงน้ำล้นตลิ่งใน 1-3 วันข้างหน้าแบบสรุปสั้นๆ เข้าใจง่าย (ไม่เกิน 3-4 บรรทัด) พร้อมคำแนะนำ
ข้อมูลสถานี:
- ชื่อสถานี: ${station.name} (${station.district})
- ระดับน้ำปัจจุบัน: ${station.currentLevel} เมตร (รทก.)
- ระดับตลิ่ง: ${station.bankLevel} เมตร (รทก.)
- ระดับเตือนภัย: ${station.warningLevel} เมตร (รทก.)
- ระดับวิกฤต: ${station.criticalLevel || station.bankLevel} เมตร (รทก.)
- สถานะปัจจุบัน: ${station.status}
- ปริมาณฝน 24 ชม. ล่าสุดในพื้นที่: ${station.rainfall24h || 'ไม่มีข้อมูล'} มม.

แนวทางการตอบ: 
- ขึ้นต้นด้วย [ระดับความเสี่ยง: ต่ำ/ปานกลาง/สูง/วิกฤต]
- ตามด้วยการวิเคราะห์สั้นๆ (ใช้ภาษากระชับ เป็นกันเอง)
- ปิดท้ายด้วยคำแนะนำสำหรับประชาชน
    `.trim();

    const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Low temperature for more deterministic analysis
          maxOutputTokens: 300,
        }
      })
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API returned status ${fetchRes.status}`);
    }

    const data = await fetchRes.json();
    const predictionText = data.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";

    res.status(200).json({
      success: true,
      prediction: predictionText
    });

  } catch (error) {
    console.error("AI Prediction Error:", error);
    res.status(500).json({
      success: false,
      error: "ไม่สามารถประมวลผล AI ได้",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
