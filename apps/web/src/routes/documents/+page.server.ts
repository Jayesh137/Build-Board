import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { documents: [], requiredDocs: [] };

  try {
    const api = createApiClient(session.access_token);
    const [documents, requiredDocs] = await Promise.all([
      api.get('/api/v1/projects/PROJECT_ID/documents').catch(() => []),
      api.get('/api/v1/projects/PROJECT_ID/documents/required').catch(() => []),
    ]);
    return { documents, requiredDocs };
  } catch {
    return { documents: [], requiredDocs: [] };
  }
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string;
    const tags = formData.get('tags') as string | null;
    const name = formData.get('name') as string | null;

    if (!file || file.size === 0) {
      return fail(400, { error: 'Please select a file' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.uploadFile('/api/v1/projects/PROJECT_ID/documents', file, {
        folder: folder || 'Other',
        tags: tags || '',
        name: name || file.name,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to upload document' });
    }
  },
};
