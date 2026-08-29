export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { id, size = 20, index = 1, lang = "en" } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Hero identifier is required" });
    }

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/${id}/skill-combos?size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching skill combos:", error);
    return res.status(500).json({ error: error.message });
  }
}
