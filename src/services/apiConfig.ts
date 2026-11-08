const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

export const apiUrl = (path: string): string =>
  API_BASE_URL ? `${API_BASE_URL}${path}` : path;
