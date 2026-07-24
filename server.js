import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/check-player", async (req, res) => {
  try {
    const { userId, zoneId } = req.body;

    if (!userId || !zoneId) {
      return res
        .status(400)
        .json({ error: "User ID and Zone ID are required" });
    }

    console.log(`Checking player: ${userId} (${zoneId})`);

    // Try with different payload format
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
        gameCode: "mlbb",
        roleId: userId,
        serverId: zoneId,
        userId: userId,
        voucherTypeName: "MOBILE_LEGENDS",
        whiteLabelId: "0",
        zoneId: zoneId,
      }),
    });

    const data = await response.json();
    console.log("Codashop response:", JSON.stringify(data, null, 2));

    // If first attempt fails, try alternative format
    if (data.errorCode === "1003" || data.success === false) {
      console.log("Trying alternative payload format...");

      const response2 = await fetch("https://order-sa.codashop.com/validate", {
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
          gameCode: "MOBILE_LEGENDS",
          userId: userId,
          zoneId: zoneId,
          voucherTypeName: "MOBILE_LEGENDS",
          whiteLabelId: "0",
        }),
      });

      const data2 = await response2.json();
      console.log("Codashop response (alt):", JSON.stringify(data2, null, 2));

      return res.json(data2);
    }

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
