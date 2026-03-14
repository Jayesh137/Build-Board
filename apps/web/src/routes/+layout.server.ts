import { redirect, isRedirect } from '@sveltejs/kit';
import { createApiClient } from '$lib/api-client';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const { session, user } = await locals.safeGetSession();

  // Skip redirect logic for auth pages and setup page itself
  const isAuthPage = url.pathname.startsWith('/auth');
  const isSetupPage = url.pathname.startsWith('/setup');

  if (session && !isAuthPage && !isSetupPage) {
    // Check if user has any projects — if not, redirect to setup
    try {
      const api = createApiClient(session.access_token);
      const projects = await api.get<Array<{ id: string }>>('/api/v1/setup');
      if (!projects || projects.length === 0) {
        throw redirect(303, '/setup');
      }
    } catch (e) {
      if (isRedirect(e)) throw e;
      // If API is unavailable, don't block the user — let them continue
    }
  }

  return {
    session,
    user,
    pathname: url.pathname,
  };
};
