import type { MiddlewareHandler } from 'hono';
import { supabase } from '../lib/supabase.js';

// Extend Hono's context variables
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export const auth: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = header.slice(7);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('userId', data.user.id);
  c.set('userEmail', data.user.email || '');
  await next();
};
