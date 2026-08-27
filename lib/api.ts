import { supabase } from './supabase';

const API_URL = 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || errorMessage;
    } catch {
      // Use fallback status text/message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) => request(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  }),
  patch: (path: string, body?: any, options?: RequestInit) => request(path, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
