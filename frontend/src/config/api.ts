// API Configuration
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

const SECURITY_RADAR_API_URL = import.meta.env.PROD
  ? '/security-api'
  : (import.meta.env.VITE_SECURITY_RADAR_API_URL || 'http://localhost:8088');

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/input/chat`,
  ASSESS: `${API_BASE_URL}/assess`,
  INPUT: `${API_BASE_URL}/input`,
  URL_INPUT: `${API_BASE_URL}/input/url`,
  CSV_INPUT: `${API_BASE_URL}/input/csv`,
  SECURITY_RADAR_ASSESS: `${SECURITY_RADAR_API_URL}/assess`,
  SECURITY_RADAR_HEALTH: `${SECURITY_RADAR_API_URL}/health`,
  MOCK_ASSESS: `${API_BASE_URL}/assess/mock`,
  HISTORY_SAVE: `${API_BASE_URL}/history/save`,
  HISTORY_GET: `${API_BASE_URL}/history`,
  HISTORY_DELETE: `${API_BASE_URL}/history`,
} as const;

export default API_BASE_URL;
