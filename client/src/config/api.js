export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

// Helper to get auth headers (for Safari cookie fallback)
export function getAuthHeaders() {
  const sessionId = localStorage.getItem("sessionId");
  const headers = { "Content-Type": "application/json" };
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }
  return headers;
}