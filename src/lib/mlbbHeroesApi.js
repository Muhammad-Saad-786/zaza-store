// src/lib/mlbbHeroesApi.js
const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:3001/api/mlbb";

const headers = {
  accept: "application/json",
};

export async function fetchAllHeroes(params = {}) {
  const queryParams = new URLSearchParams({
    size: params.size || 20,
    index: params.index || 1,
    order: params.order || "desc",
    lang: params.lang || "en",
  });

  try {
    const response = await fetch(`${API_BASE_URL}/heroes?${queryParams}`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch heroes");
    return await response.json();
  } catch (error) {
    console.error("Error fetching heroes:", error);
    throw error;
  }
}

export async function fetchHeroRank(params = {}) {
  const queryParams = new URLSearchParams({
    days: params.days || 1,
    rank: params.rank || "all",
    sort_field: params.sortField || "win_rate",
    sort_order: params.sortOrder || "desc",
    size: params.size || 20,
    index: params.index || 1,
    lang: params.lang || "en",
  });

  try {
    const response = await fetch(`${API_BASE_URL}/heroes/rank?${queryParams}`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch hero rankings");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero rankings:", error);
    throw error;
  }
}

export async function fetchHeroPositions(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.roles?.length) {
    params.roles.forEach((role) => queryParams.append("role", role));
  }
  if (params.lanes?.length) {
    params.lanes.forEach((lane) => queryParams.append("lane", lane));
  }

  queryParams.append("size", params.size || 20);
  queryParams.append("index", params.index || 1);
  queryParams.append("order", params.order || "desc");
  queryParams.append("lang", params.lang || "en");

  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/positions?${queryParams}`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero positions");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero positions:", error);
    throw error;
  }
}

export async function fetchHeroDetails(heroIdentifier) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}?size=20&index=1&lang=en`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero details:", error);
    throw error;
  }
}

export async function fetchHeroStats(heroIdentifier) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/stats?lang=en`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero stats:", error);
    throw error;
  }
}

export async function fetchHeroSkillCombos(heroIdentifier) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/skill-combos?size=20&index=1&lang=en`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch skill combos");
    return await response.json();
  } catch (error) {
    console.error("Error fetching skill combos:", error);
    throw error;
  }
}

export async function fetchHeroTrends(heroIdentifier, params = {}) {
  const queryParams = new URLSearchParams({
    days: params.days || 7,
    size: params.size || 20,
    index: params.index || 1,
    lang: params.lang || "en",
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/trends?${queryParams}`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero trends");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero trends:", error);
    throw error;
  }
}

export async function fetchHeroRelations(heroIdentifier) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/relations?size=20&index=1&lang=en`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero relations");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero relations:", error);
    throw error;
  }
}

export async function fetchHeroCounters(heroIdentifier, params = {}) {
  const queryParams = new URLSearchParams({
    days: params.days || 1,
    rank: params.rank || "all",
    size: params.size || 20,
    index: params.index || 1,
    lang: params.lang || "en",
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/counters?${queryParams}`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero counters");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero counters:", error);
    throw error;
  }
}

export async function fetchHeroCompatibility(heroIdentifier, params = {}) {
  const queryParams = new URLSearchParams({
    days: params.days || 1,
    rank: params.rank || "all",
    size: params.size || 20,
    index: params.index || 1,
    lang: params.lang || "en",
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/heroes/${heroIdentifier}/compatibility?${queryParams}`,
      { headers },
    );
    if (!response.ok) throw new Error("Failed to fetch hero compatibility");
    return await response.json();
  } catch (error) {
    console.error("Error fetching hero compatibility:", error);
    throw error;
  }
}
