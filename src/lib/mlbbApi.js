export async function checkPlayerName(userId, zoneId) {
  try {
    // Use our backend proxy (port 3001)
    const response = await fetch("http://localhost:3001/api/check-player", {
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
    console.log("Player check response:", data);

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
    console.error("MLBB API error:", error);
    if (error.message.includes("Failed to fetch")) {
      return {
        success: false,
        error:
          "Cannot connect to server. Make sure backend is running on port 3001.",
      };
    }
    return {
      success: false,
      error: error.message || "Connection error",
    };
  }
}
