import type { LayoutServerLoad } from './$types';

// Public page - no auth required
export const load: LayoutServerLoad = async () => {
  return {
    session: null,
    user: null,
    pathname: '',
  };
};
