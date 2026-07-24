// Use relative path in production (Vercel), localhost in development
const API_URL = import.meta.env.PROD
  ? "/api/check-player"
  : "http://localhost:3001/api/check-player";

export async function checkPlayerName(userId, zoneId) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        zoneId: zoneId,
      }),
    });

    const data = await response.json();

    if (data && data.result && data.result.username) {
      const encodedUsername = data.result.username;
      let decodedUsername;

      try {
        decodedUsername = decodeURIComponent(encodedUsername);
      } catch (e) {
        decodedUsername = encodedUsername;
      }

      return {
        success: true,
        username: decodedUsername,
        userId: userId,
        zoneId: zoneId,
      };
    } else if (data && data.success === false) {
      return {
        success: false,
        error: data.errorMsg || "Player not found",
      };
    } else {
      return {
        success: false,
        error: "Player not found. Check your ID and Server ID.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || "Connection error",
    };
  }
}
