import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const room = url.searchParams.get('room') || '';
  const phase = url.searchParams.get('phase') || '';
  const trade = url.searchParams.get('trade') || '';
  const type = url.searchParams.get('type') || '';

  try {
    const api = createApiClient();
    const params = new URLSearchParams();
    if (room) params.set('room', room);
    if (phase) params.set('phase', phase);
    if (trade) params.set('trade', trade);
    if (type) params.set('type', type);
    const qs = params.toString();

    const [photos, filters] = await Promise.all([
      api.get(`/photos${qs ? `?${qs}` : ''}`).catch(() => []),
      api.get('/photos/filters').catch(() => ({
        rooms: [],
        phases: [],
        trades: [],
        types: [],
      })),
    ]);
    return { photos, filters };
  } catch {
    return { photos: [], filters: { rooms: [], phases: [], trades: [], types: [] } };
  }
};

export const actions: Actions = {
  upload: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const room = formData.get('room') as string | null;
    const caption = formData.get('caption') as string | null;
    const phase = formData.get('phase') as string | null;
    const type = formData.get('type') as string | null;

    if (!file || file.size === 0) {
      return fail(400, { error: 'Please select a photo' });
    }

    try {
      const api = createApiClient();
      await api.uploadFile('/photos', file, {
        room: room || '',
        caption: caption || '',
        phase: phase || '',
        type: type || '',
      });
    } catch {
      return fail(500, { error: 'Failed to upload photo' });
    }
  },
};
