export const API_CONFIG = {
  baseUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'https://localhost:7113/api'
    : 'https://aitrainingsystem.onrender.com/api',
};

