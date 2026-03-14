import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    const api = createApiClient();
    const [snag, photos, timeline] = await Promise.all([
      api.get(`/snags/${params.id}`).catch(() => null),
      api.get(`/snags/${params.id}/photos`).catch(() => []),
      api.get(`/snags/${params.id}/timeline`).catch(() => []),
    ]);
    return { snag, photos, timeline };
  } catch {
    return { snag: null, photos: [], timeline: [] };
  }
};

export const actions: Actions = {
  update: async ({ params, request }) => {
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
      const api = createApiClient();
      await api.patch(`/snags/${params.id}`, updates);
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update snag' });
    }
  },

  markFixed: async ({ params, request }) => {
    const formData = await request.formData();
    const resolutionNotes = formData.get('resolutionNotes') as string | null;

    try {
      const api = createApiClient();
      await api.patch(`/snags/${params.id}`, {
        status: 'fixed',
        resolutionNotes: resolutionNotes || null,
      });
    } catch {
      return fail(500, { error: 'Failed to mark as fixed' });
    }
  },

  verify: async ({ params }) => {
    try {
      const api = createApiClient();
      await api.patch(`/snags/${params.id}`, {
        status: 'verified',
      });
    } catch {
      return fail(500, { error: 'Failed to verify fix' });
    }
  },
};
