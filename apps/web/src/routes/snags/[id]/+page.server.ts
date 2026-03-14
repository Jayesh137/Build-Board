import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { snag: null, photos: [], timeline: [] };

  try {
    const api = createApiClient(session.access_token);
    const [snag, photos, timeline] = await Promise.all([
      api.get(`/api/v1/projects/PROJECT_ID/snags/${params.id}`).catch(() => null),
      api.get(`/api/v1/projects/PROJECT_ID/snags/${params.id}/photos`).catch(() => []),
      api.get(`/api/v1/projects/PROJECT_ID/snags/${params.id}/timeline`).catch(() => []),
    ]);
    return { snag, photos, timeline };
  } catch {
    return { snag: null, photos: [], timeline: [] };
  }
};

export const actions: Actions = {
  update: async ({ params, request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const status = formData.get('status') as string | null;
    const resolutionNotes = formData.get('resolutionNotes') as string | null;
    const contractor = formData.get('contractor') as string | null;
    const description = formData.get('description') as string | null;
    const title = formData.get('title') as string | null;
    const room = formData.get('room') as string | null;
    const severity = formData.get('severity') as string | null;

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (resolutionNotes !== null) updates.resolutionNotes = resolutionNotes || null;
    if (contractor !== null) updates.contractor = contractor || null;
    if (description !== null) updates.description = description || null;
    if (title) updates.title = title;
    if (room !== null) updates.room = room || null;
    if (severity) updates.severity = severity;

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/snags/${params.id}`, updates);
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update snag' });
    }
  },

  markFixed: async ({ params, request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const resolutionNotes = formData.get('resolutionNotes') as string | null;

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/snags/${params.id}`, {
        status: 'fixed',
        resolutionNotes: resolutionNotes || null,
      });
      return { success: true, action: 'markFixed' };
    } catch {
      return fail(500, { error: 'Failed to mark as fixed' });
    }
  },

  verify: async ({ params, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/snags/${params.id}`, {
        status: 'verified',
      });
      return { success: true, action: 'verify' };
    } catch {
      return fail(500, { error: 'Failed to verify fix' });
    }
  },
};
