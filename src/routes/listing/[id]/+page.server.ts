import { error, fail } from '@sveltejs/kit';
import { isReportKind } from '$lib/domain';
import { isUuid } from '$lib/server/ids';
import { getListing, reportListing } from '$lib/server/listings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const listing = isUuid(params.id) ? await getListing(params.id) : null;
	if (!listing) error(404, 'Listing not found');
	return { listing, now: Date.now() };
};

export const actions: Actions = {
	report: async ({ params, request, locals }) => {
		const kind = (await request.formData()).get('kind');
		if (!isUuid(params.id) || !isReportKind(kind))
			return fail(400, { outcome: 'invalid' as const });

		const outcome = await reportListing(params.id, kind, locals.anonId);
		if (outcome === 'not_found') error(404, 'Listing not found');
		return { outcome };
	}
};
