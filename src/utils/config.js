// Central API URL — works in both dev (proxy) and production (full URL)
export const API_URL = process.env.REACT_APP_API_URL || '';

// Helper: prefix any /api/... path with the backend URL in production
export const apiPath = (path) => `${API_URL}${path}`;
