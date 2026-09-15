import { listActiveSpots } from '$lib/server/spots';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	spots: await listActiveSpots(),
	now: Date.now()
});
