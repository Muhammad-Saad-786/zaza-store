import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ==================== MLBB AUTH ENDPOINTS ====================

// Send Verification Code
app.post("/api/mlbb/send-vc", async (req, res) => {
  try {
    const { roleId, zoneId } = req.body;

    if (!roleId || !zoneId) {
      return res.status(400).json({
        error: "Role ID and Zone ID are required",
      });
    }

    console.log(`📧 Sending VC to Role ID: ${roleId}, Zone ID: ${zoneId}`);

    const response = await fetch(
      "https://arena.rone.dev/api/user/auth/send-vc",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          role_id: parseInt(roleId),
          zone_id: parseInt(zoneId),
        }),
      },
    );

    const data = await response.json();
    console.log("📬 Send VC Response:", JSON.stringify(data, null, 2));

    return res.json(data);
  } catch (error) {
    console.error("❌ Error sending verification code:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Login with Verification Code
app.post("/api/mlbb/login", async (req, res) => {
  try {
    const { roleId, zoneId, verificationCode } = req.body;

    if (!roleId || !zoneId || !verificationCode) {
      return res.status(400).json({
        error: "Role ID, Zone ID, and Verification Code are required",
      });
    }

    console.log(
      `🔐 MLBB Login attempt - Role ID: ${roleId}, Zone ID: ${zoneId}, VC: ${verificationCode}`,
    );

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
    console.log("✅ Login Response:", JSON.stringify(data, null, 2));

    return res.json(data);
  } catch (error) {
    console.error("❌ Error during MLBB login:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get MLBB User Info
app.get("/api/mlbb/user-info", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    console.log("👤 Fetching MLBB user info...");

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
    console.log("👤 User Info Response:", JSON.stringify(data, null, 2));

    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ==================== PLAYER CHECKER ENDPOINT ====================

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

// ==================== MLBB HEROES ENDPOINTS ====================

// Get all heroes
app.get("/api/mlbb/heroes", async (req, res) => {
  try {
    const { size = 20, index = 1, order = "desc", lang = "en" } = req.query;

    console.log(`🎮 Fetching heroes - Page ${index}, Size ${size}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes?size=${size}&index=${index}&order=${order}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching heroes:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero rankings
app.get("/api/mlbb/heroes/rank", async (req, res) => {
  try {
    const {
      days = 1,
      rank = "all",
      sort_field = "win_rate",
      sort_order = "desc",
      size = 20,
      index = 1,
      lang = "en",
    } = req.query;

    console.log(`🏆 Fetching hero rankings - ${rank} rank, ${days} days`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/rank?days=${days}&rank=${rank}&sort_field=${sort_field}&sort_order=${sort_order}&size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero rankings:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero positions
app.get("/api/mlbb/heroes/positions", async (req, res) => {
  try {
    const { size = 20, index = 1, order = "desc", lang = "en" } = req.query;
    const roles = req.query.role || [];
    const lanes = req.query.lane || [];

    let url = `https://arena.rone.dev/api/heroes/positions?`;

    // Add roles
    if (Array.isArray(roles)) {
      roles.forEach((role) => (url += `role=${role}&`));
    } else if (roles) {
      url += `role=${roles}&`;
    }

    // Add lanes
    if (Array.isArray(lanes)) {
      lanes.forEach((lane) => (url += `lane=${lane}&`));
    } else if (lanes) {
      url += `lane=${lanes}&`;
    }

    url += `size=${size}&index=${index}&order=${order}&lang=${lang}`;

    console.log(`📍 Fetching hero positions...`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero positions:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero details
app.get("/api/mlbb/heroes/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { size = 20, index = 1, lang = "en" } = req.query;

    console.log(`🦸 Fetching hero details for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}?size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero details:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero skill combos
app.get("/api/mlbb/heroes/:identifier/skill-combos", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { size = 20, index = 1, lang = "en" } = req.query;

    console.log(`⚔️ Fetching skill combos for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/skill-combos?size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching skill combos:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero relations
app.get("/api/mlbb/heroes/:identifier/relations", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { size = 20, index = 1, lang = "en" } = req.query;

    console.log(`🔗 Fetching relations for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/relations?size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero relations:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero counters
app.get("/api/mlbb/heroes/:identifier/counters", async (req, res) => {
  try {
    const { identifier } = req.params;
    const {
      days = 1,
      rank = "all",
      size = 20,
      index = 1,
      lang = "en",
    } = req.query;

    console.log(`⚔️ Fetching counters for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/counters?days=${days}&rank=${rank}&size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero counters:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero compatibility
app.get("/api/mlbb/heroes/:identifier/compatibility", async (req, res) => {
  try {
    const { identifier } = req.params;
    const {
      days = 1,
      rank = "all",
      size = 20,
      index = 1,
      lang = "en",
    } = req.query;

    console.log(`🤝 Fetching compatibility for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/compatibility?days=${days}&rank=${rank}&size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero compatibility:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero trends
app.get("/api/mlbb/heroes/:identifier/trends", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { days = 7, size = 20, index = 1, lang = "en" } = req.query;

    console.log(`📈 Fetching trends for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/trends?days=${days}&size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero trends:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Get hero stats
app.get("/api/mlbb/heroes/:identifier/stats", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { lang = "en" } = req.query;

    console.log(`📊 Fetching stats for: ${identifier}`);

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${identifier}/stats?lang=${lang}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("❌ Error fetching hero stats:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ==================== SERVER START ====================

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`\n🎮 MLBB Auth:`);
  console.log(`   - POST /api/mlbb/send-vc`);
  console.log(`   - POST /api/mlbb/login`);
  console.log(`   - GET  /api/mlbb/user-info`);

  console.log(`\n🔍 Player Checker:`);
  console.log(`   - POST /api/check-player`);

  console.log(`\n🦸 MLBB Heroes:`);
  console.log(`   - GET /api/mlbb/heroes`);
  console.log(`   - GET /api/mlbb/heroes/rank`);
  console.log(`   - GET /api/mlbb/heroes/positions`);
  console.log(`   - GET /api/mlbb/heroes/:identifier`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/skill-combos`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/relations`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/counters`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/compatibility`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/trends`);
  console.log(`   - GET /api/mlbb/heroes/:identifier/stats`);
});
