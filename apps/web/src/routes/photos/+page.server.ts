import { getPhotos } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const photos = await getPhotos();
    return {
      photos: photos ?? [],
      filters: { rooms: [], phases: [], trades: [], types: [] },
    };
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
