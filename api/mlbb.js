// /api/mlbb.js - Combined MLBB API handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action, id, ...params } = req.query;
  const baseUrl = "https://arena.rone.dev/api";

  try {
    let url;
    let options = {
      method: "GET",
      headers: { accept: "application/json" },
    };

    switch (action) {
      case "heroes":
        url = `${baseUrl}/heroes?size=${params.size || 20}&index=${params.index || 1}&order=${params.order || "desc"}&lang=${params.lang || "en"}`;
        break;

      case "heroes-rank":
        url = `${baseUrl}/heroes/rank?days=${params.days || 1}&rank=${params.rank || "all"}&sort_field=${params.sort_field || "win_rate"}&sort_order=${params.sort_order || "desc"}&size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "heroes-positions":
        let posUrl = `${baseUrl}/heroes/positions?`;
        if (Array.isArray(params.role)) {
          params.role.forEach((role) => (posUrl += `role=${role}&`));
        } else if (params.role) {
          posUrl += `role=${params.role}&`;
        }
        if (Array.isArray(params.lane)) {
          params.lane.forEach((lane) => (posUrl += `lane=${lane}&`));
        } else if (params.lane) {
          posUrl += `lane=${params.lane}&`;
        }
        url =
          posUrl +
          `size=${params.size || 20}&index=${params.index || 1}&order=${params.order || "desc"}&lang=${params.lang || "en"}`;
        break;

      case "hero-detail":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}?size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-skill-combos":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/skill-combos?size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-relations":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/relations?size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-counters":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/counters?days=${params.days || 1}&rank=${params.rank || "all"}&size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-compatibility":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/compatibility?days=${params.days || 1}&rank=${params.rank || "all"}&size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-trends":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/trends?days=${params.days || 7}&size=${params.size || 20}&index=${params.index || 1}&lang=${params.lang || "en"}`;
        break;

      case "hero-stats":
        if (!id)
          return res.status(400).json({ error: "Hero identifier is required" });
        url = `${baseUrl}/heroes/${id}/stats?lang=${params.lang || "en"}`;
        break;

      case "send-vc":
        if (req.method !== "POST")
          return res.status(405).json({ error: "Method not allowed" });
        const { roleId, zoneId } = req.body;
        if (!roleId || !zoneId)
          return res
            .status(400)
            .json({ error: "Role ID and Zone ID are required" });

        options = {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            role_id: parseInt(roleId),
            zone_id: parseInt(zoneId),
          }),
        };
        url = `${baseUrl}/user/auth/send-vc`;
        break;

      case "login":
        if (req.method !== "POST")
          return res.status(405).json({ error: "Method not allowed" });
        const { roleId: rid, zoneId: zid, verificationCode } = req.body;
        if (!rid || !zid || !verificationCode)
          return res.status(400).json({ error: "Missing required fields" });

        options = {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            role_id: parseInt(rid),
            zone_id: parseInt(zid),
            vc: parseInt(verificationCode),
          }),
        };
        url = `${baseUrl}/user/auth/login`;
        break;

      case "user-info":
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "No token provided" });

        options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        url = `${baseUrl}/user/info?lang=en`;
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
