import { createApiClient } from '$lib/api-client';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const { session } = await locals.safeGetSession();
  if (!session) return { contact: null };

  try {
    const api = createApiClient(session.access_token);
    const contact = await api.get(`/api/v1/projects/PROJECT_ID/contacts/${params.id}`);
    return { contact };
  } catch {
    return { contact: null };
  }
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
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
    const contractValue = formData.get('contractValue') as string | null;
    const rating = formData.get('rating') as string | null;
    const isPinned = formData.get('isPinned') === 'true';

    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    try {
      const api = createApiClient(session.access_token);
      await api.patch(`/api/v1/projects/PROJECT_ID/contacts/${params.id}`, {
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
        contractValue: contractValue ? Math.round(parseFloat(contractValue) * 100) : null,
        rating: rating ? parseInt(rating, 10) : null,
        isPinned,
      });
      return { success: true };
    } catch {
      return fail(500, { error: 'Failed to update contact' });
    }
  },
};
