export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

    const response = await fetch(
      `https://arena.rone.dev/api/heroes/rank?days=${days}&rank=${rank}&sort_field=${sort_field}&sort_order=${sort_order}&size=${size}&index=${index}&lang=${lang}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return res.status(500).json({ error: error.message });
  }
}
