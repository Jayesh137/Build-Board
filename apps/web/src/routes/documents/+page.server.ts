import { getDocuments } from '$lib/server/queries';
import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const documents = await getDocuments();
    return { documents: documents ?? [], requiredDocs: [] };
  } catch {
    return { documents: [], requiredDocs: [] };
  }
};

export const actions: Actions = {
  upload: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string;
    const tags = formData.get('tags') as string | null;
    const name = formData.get('name') as string | null;

    if (!file || file.size === 0) {
      return fail(400, { error: 'Please select a file' });
    }

    try {
      const api = createApiClient();
      await api.uploadFile('/documents', file, {
        folder: folder || 'Other',
        tags: tags || '',
        name: name || file.name,
      });
    } catch {
      return fail(500, { error: 'Failed to upload document' });
    }
  },
};
