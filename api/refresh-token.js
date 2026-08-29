// Vercel Serverless Function - Refresh MLBB Token (if needed)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // If there's a refresh endpoint, implement it here
    // For now, just return the same token
    return res.json({ code: 0, data: { token } });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: error.message });
  }
}
