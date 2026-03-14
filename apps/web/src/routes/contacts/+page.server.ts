import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { contacts: [] };

  try {
    const api = createApiClient(session.access_token);
    const contacts = await api.get('/api/v1/projects/PROJECT_ID/contacts');
    return { contacts };
  } catch {
    return { contacts: [] };
  }
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const { session } = await locals.safeGetSession();
    if (!session) return fail(401, { error: 'Not authenticated' });

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const role = formData.get('role') as string | null;
    const company = formData.get('company') as string | null;
    const phone = formData.get('phone') as string | null;
    const email = formData.get('email') as string | null;
    const address = formData.get('address') as string | null;
    const website = formData.get('website') as string | null;
    const notes = formData.get('notes') as string | null;
    const insuranceExpiry = formData.get('insuranceExpiry') as string | null;
    const qualifications = formData.get('qualifications') as string | null;
    const isPinned = formData.get('isPinned') === 'true';

    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.post('/api/v1/projects/PROJECT_ID/contacts', {
        name,
        role: role || null,
        company: company || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        website: website || null,
        notes: notes || null,
        insuranceExpiry: insuranceExpiry || null,
        qualifications: qualifications || null,
        isPinned,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to create contact' });
    }
  },
};
