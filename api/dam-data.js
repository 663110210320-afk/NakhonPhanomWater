export default async function handler(req, res) {
  try {
    const response = await fetch('https://api-v3.thaiwater.net/api/v1/thaiwater30/public/dam_data');
    if (!response.ok) {
      throw new Error(`ThaiWater API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // Add CORS headers so localhost can still fetch it during local development
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

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in Serverless Function:', error);
    res.status(500).json({ error: 'Failed to fetch dam data from ThaiWater API' });
  }
}
