import { env } from '$env/dynamic/private';

const PROJECT_ID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

export function createApiClient() {
  const baseUrl = env?.API_URL || 'http://localhost:3001';
  const projectBase = `${baseUrl}/api/v1/projects/${PROJECT_ID}`;

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${projectBase}${path}`);
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${projectBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${projectBase}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function del(path: string): Promise<void> {
    const res = await fetch(`${projectBase}${path}`, {
      method: 'DELETE',
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
    const res = await fetch(`${projectBase}${path}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  return { get, post, patch, del, uploadFile, projectId: PROJECT_ID };
}
