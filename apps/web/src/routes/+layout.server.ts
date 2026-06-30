import type { LayoutServerLoad } from './$types';
import { getPhases, getProject } from '$lib/server/queries';

export const load: LayoutServerLoad = async ({ url }) => {
  let projectName = 'BuildBoard';
  let projectAddress = '';
  let progress = 0;

  try {
    const [project, phases] = await Promise.all([getProject(), getPhases()]);
    projectName = project?.name ?? projectName;
    projectAddress = project?.address ?? projectAddress;

    const tasks = phases.flatMap((phase: any) => phase.tasks ?? []);
    if (tasks.length > 0) {
      const done = tasks.filter((task: any) => task.status === 'done').length;
      progress = Math.round((done / tasks.length) * 100);
    }
  } catch {
    // Shell data should never prevent page rendering.
  }

  return {
    pathname: url.pathname,
    projectName,
    projectAddress,
    progress,
  };
};
