export default async function handler(req, res) {
  // 1. Allow the Browser Extension to talk to Vercel (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = JSON.parse(req.body);
      console.log("Haven Signal Ingested:", data);

      // This is where you'd save to your Vercel KV or Postgres
      return res.status(200).json({ 
        received: true, 
        timestamp: new Date().toISOString(),
        category: data.payload.category 
      });
    } catch (err) {
      return res.status(400).json({ error: "Invalid Payload" });
    }
  }

  return res.status(405).send('Method Not Allowed');
}
