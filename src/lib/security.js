// Sanitize user input to prevent XSS
export function sanitizeInput(input) {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate username (3-20 chars, alphanumeric + underscore)
export function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// Validate price
export function isValidPrice(price) {
  return /^\d+(\.\d{1,2})?$/.test(price) && parseFloat(price) > 0;
}

// Validate UUID format
export function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

// Rate limiting helper
const rateLimits = {};
export function checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  if (!rateLimits[key]) {
    rateLimits[key] = { count: 1, resetAt: now + windowMs };
    return true;
  }
  if (now > rateLimits[key].resetAt) {
    rateLimits[key] = { count: 1, resetAt: now + windowMs };
    return true;
  }
  if (rateLimits[key].count >= maxRequests) return false;
  rateLimits[key].count++;
  return true;
}
