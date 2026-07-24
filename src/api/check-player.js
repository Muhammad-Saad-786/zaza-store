// api/check-player.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, zoneId } = req.body;

    if (!userId || !zoneId) {
      return res
        .status(400)
        .json({ error: "User ID and Zone ID are required" });
    }

    console.log(`Checking player: ${userId} (${zoneId})`);

    // Dynamic import for node-fetch
    const fetch = (await import("node-fetch")).default;

    const response = await fetch("https://order-sa.codashop.com/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        Origin: "https://www.codashop.com",
        Referer: "https://www.codashop.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        country: "PK",
        deviceId: "4eefb088-6f38-4297-9dc9-a29e2322a00e",
        userId: userId,
        voucherTypeName: "MOBILE_LEGENDS",
        whiteLabelId: "0",
        zoneId: zoneId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Codashop API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Codashop response:", data);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
}
