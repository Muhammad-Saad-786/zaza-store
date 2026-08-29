export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { size = 30, index = 1, order = "desc", lang = "en" } = req.query;

    const response = await fetch(
      `https://arena.rone.dev/api/heroes?size=${size}&index=${index}&order=${order}&lang=${lang}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error fetching heroes:", error);
    return res.status(500).json({ error: error.message });
  }
}
