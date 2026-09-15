import { listActiveListings } from '$lib/server/listings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	listings: await listActiveListings(),
	now: Date.now()
});
