// Vercel Serverless Function - Get MLBB User Info
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get token from cookie or Authorization header
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.mlbb_token;
    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const response = await fetch(
      "https://arena.rone.dev/api/user/info?lang=en",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: error.message });
  }
}
