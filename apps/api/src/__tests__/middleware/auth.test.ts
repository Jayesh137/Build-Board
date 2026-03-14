import { describe, it, expect } from 'vitest';
import app from '../../index.js';

describe('Health endpoint', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});

describe('Auth middleware', () => {
  it('GET /auth/me without Authorization header returns 401', async () => {
    const res = await app.request('/auth/me');
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });

  it('GET /auth/me with invalid token format returns 401', async () => {
    const res = await app.request('/auth/me', {
      headers: { Authorization: 'InvalidFormat abc123' },
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });
});

describe('404 fallback', () => {
  it('GET /nonexistent returns 404', async () => {
    const res = await app.request('/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Not found');
  });
});
