import { env } from '$env/dynamic/private';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

export function createApiClient(authToken: string) {
  const baseUrl = env.API_URL || 'http://localhost:3001';

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function del(path: string): Promise<void> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
  }

  async function uploadFile<T>(
    path: string,
    file: File,
    fields?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (fields) {
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value);
      }
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  return { get, post, patch, del, uploadFile };
}
