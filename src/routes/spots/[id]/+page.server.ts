import { error, fail } from '@sveltejs/kit';
import { isSpotVisitOutcome } from '$lib/domain';
import { isUuid } from '$lib/server/ids';
import { getSpot, reportSpotVisit } from '$lib/server/spots';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const spot = isUuid(params.id) ? await getSpot(params.id) : null;
	if (!spot) error(404, 'Spot not found');
	return { spot, now: Date.now() };
};

export const actions: Actions = {
	visit: async ({ params, request, locals }) => {
		const outcome = (await request.formData()).get('outcome');
		if (!isUuid(params.id) || !isSpotVisitOutcome(outcome))
			return fail(400, { result: 'invalid' as const });

		const result = await reportSpotVisit(params.id, outcome, locals.anonId);
		if (result === 'not_found') error(404, 'Spot not found');
		return { result };
	}
};
