// Vercel Serverless Function for MLBB Player Checker
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
    const { userId, zoneId } = req.body;

    if (!userId || !zoneId) {
      return res
        .status(400)
        .json({ error: "User ID and Zone ID are required" });
    }

    console.log(`Checking player: ${userId} (${zoneId})`);

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
        zoneId: zoneId,
        voucherTypeName: "MOBILE_LEGENDS",
        whiteLabelId: "0",
      }),
    });

    const data = await response.json();
    console.log("Codashop response:", JSON.stringify(data));

    return res.json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
