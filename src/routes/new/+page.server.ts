import { fail, redirect } from '@sveltejs/kit';
import { parseNewListing, readNewListingValues } from '$lib/listing-validation';
import { localizeHref } from '$lib/paraglide/runtime';
import { createListing } from '$lib/server/listings';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const values = readNewListingValues(await request.formData());
		const parsed = parseNewListing(values);
		if (!parsed.ok) return fail(400, { values, errors: parsed.errors });

		const result = await createListing(parsed.data, locals.anonId);
		if ('rateLimited' in result) return fail(429, { values, rateLimited: true });

		redirect(303, localizeHref(`/listing/${result.id}?created=1`));
	}
};
