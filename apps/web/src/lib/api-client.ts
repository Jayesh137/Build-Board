const PROJECT_ID = '544c1eb2-3d9f-4fa3-819e-a83522a917a5';
const API_BASE = 'http://localhost:3001';

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
  const projectBase = `${API_BASE}/api/v1/projects/${PROJECT_ID}`;

  async function get<T>(path: string): Promise<T> {
    const url = path ? `${projectBase}${path}` : projectBase;
    const res = await fetch(url);
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const url = path ? `${projectBase}${path}` : projectBase;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function patch<T>(path: string, body: unknown): Promise<T> {
    const url = path ? `${projectBase}${path}` : projectBase;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  async function del(path: string): Promise<void> {
    const url = path ? `${projectBase}${path}` : projectBase;
    const res = await fetch(url, { method: 'DELETE' });
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
    const url = path ? `${projectBase}${path}` : projectBase;
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }

  return { get, post, patch, del, uploadFile, projectId: PROJECT_ID };
}
