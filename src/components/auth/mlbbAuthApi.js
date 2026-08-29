// src/lib/mlbbAuthApi.js
const API_URL = import.meta.env.PROD
  ? "/api/mlbb"
  : "http://localhost:3001/api/mlbb";

export async function sendVerificationCode(roleId, zoneId) {
  try {
    const response = await fetch(`${API_URL}/send-vc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId: roleId,
        zoneId: zoneId,
      }),
    });

    const data = await response.json();

    if (data.code === 0) {
      return {
        success: true,
        message: "Verification code sent to your in-game mailbox",
      };
    } else {
      return {
        success: false,
        error: data.msg || data.message || "Failed to send verification code",
      };
    }
  } catch (error) {
    console.error("Error sending VC:", error);
    return {
      success: false,
      error: error.message || "Connection error",
    };
  }
}

export async function loginWithVerificationCode(
  roleId,
  zoneId,
  verificationCode,
) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId: roleId,
        zoneId: zoneId,
        verificationCode: verificationCode,
      }),
    });

    const data = await response.json();

    if (data.code === 0 && data.data?.jwt) {
      const encryptedToken = btoa(data.data.jwt);
      localStorage.setItem("mlbb_token_encrypted", encryptedToken);
      localStorage.setItem("mlbb_role_id", roleId);
      localStorage.setItem("mlbb_zone_id", zoneId);

      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.msg || data.message || "Invalid verification code",
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.message || "Connection error",
    };
  }
}

export async function getMLBBUserInfo() {
  try {
    const encryptedToken = localStorage.getItem("mlbb_token_encrypted");
    if (!encryptedToken) {
      return { success: false, error: "Not logged in" };
    }

    const token = atob(encryptedToken);
    const response = await fetch(`${API_URL}/user-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.code === 0) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.msg || "Failed to fetch user info",
      };
    }
  } catch (error) {
    console.error("Get user info error:", error);
    return {
      success: false,
      error: error.message || "Connection error",
    };
  }
}

export function clearMLBBAuth() {
  localStorage.removeItem("mlbb_token_encrypted");
  localStorage.removeItem("mlbb_role_id");
  localStorage.removeItem("mlbb_zone_id");
}
