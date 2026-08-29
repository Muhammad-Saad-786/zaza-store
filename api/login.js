// Vercel Serverless Function - MLBB Login
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roleId, zoneId, verificationCode } = req.body;

    if (!roleId || !zoneId || !verificationCode) {
      return res.status(400).json({
        error: "Role ID, Zone ID, and Verification Code are required",
      });
    }

    const response = await fetch("https://arena.rone.dev/api/user/auth/login", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        role_id: parseInt(roleId),
        zone_id: parseInt(zoneId),
        vc: parseInt(verificationCode),
      }),
    });

    const data = await response.json();

    // If login successful, set JWT as httpOnly cookie
    if (data.code === 0 && data.data?.jwt) {
      res.setHeader(
        "Set-Cookie",
        `mlbb_token=${data.data.jwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
      );
    }

    return res.json(data);
  } catch (error) {
    console.error("Error during MLBB login:", error);
    return res.status(500).json({ error: error.message });
  }
}
