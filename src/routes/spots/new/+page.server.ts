import { fail, redirect } from '@sveltejs/kit';
import { localizeHref } from '$lib/paraglide/runtime';
import { createSpot } from '$lib/server/spots';
import { parseNewSpot, readNewSpotValues } from '$lib/spot-validation';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const values = readNewSpotValues(await request.formData());
		const parsed = parseNewSpot(values);
		if (!parsed.ok) return fail(400, { values, errors: parsed.errors });

		const result = await createSpot(parsed.data, locals.anonId);
		if ('rateLimited' in result) return fail(429, { values, rateLimited: true });

		redirect(303, localizeHref(`/spots/${result.id}?created=1`));
	}
};
