export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { size = 20, index = 1, order = "desc", lang = "en" } = req.query;
    const roles = req.query.role || [];
    const lanes = req.query.lane || [];

    let url = `https://arena.rone.dev/api/heroes/positions?`;

    if (Array.isArray(roles)) {
      roles.forEach((role) => (url += `role=${role}&`));
    } else if (roles) {
      url += `role=${roles}&`;
    }

    if (Array.isArray(lanes)) {
      lanes.forEach((lane) => (url += `lane=${lane}&`));
    } else if (lanes) {
      url += `lane=${lanes}&`;
    }

    url += `size=${size}&index=${index}&order=${order}&lang=${lang}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return res.status(500).json({ error: error.message });
  }
}
