export default async function handler(req, res) {
  // 1. Mandatory CORS Headers
  // We allow '*' (all) for initial testing, but you can restrict this to your Extension ID later
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Handle the "Preflight" check from the browser
  // Chrome sends an OPTIONS request first to see if the server is friendly
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Handle the actual Data Signal
  if (req.method === 'POST') {
    try {
      // Vercel automatically parses JSON bodies in req.body
      const data = req.body;
      
      console.log("--- HAVEN IDENTITY SIGNAL INGESTED ---");
      console.log("Score:", data.payload?.score);
      console.log("Category:", data.payload?.category);
      console.log("Persona:", data.payload?.persona);
      console.log("Timestamp:", new Date().toISOString());

      // Future Step: Insert into Vercel KV or Postgres here
      // await kv.set(`analysis:${Date.now()}`, data.payload);

      return res.status(200).json({ 
        status: "Signal Received",
        received_at: new Date().toISOString(),
        identity_locked: true
      });
    } catch (err) {
      console.error("Ingest Error:", err);
      return res.status(400).json({ error: "Malformed Payload" });
    }
  }

  // 4. Fallback for wrong methods
  res.setHeader('Allow', ['POST', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
