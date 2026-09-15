import type { Category } from './domain';
import { parseNewListing, readText, type FieldError } from './listing-validation';

export type NewSpotInput = {
	category: Category;
	description: string;
	whenHint: string | null;
	lat: number;
	lng: number;
};

export type NewSpotValues = Record<'category' | 'description' | 'whenHint' | 'lat' | 'lng', string>;

export type NewSpotErrors = Partial<
	Record<'category' | 'location' | 'description' | 'whenHint', FieldError>
>;

export type SpotParseResult =
	{ ok: true; data: NewSpotInput } | { ok: false; errors: NewSpotErrors };

export function readNewSpotValues(form: FormData): NewSpotValues {
	return {
		category: readText(form, 'category'),
		description: readText(form, 'description'),
		whenHint: readText(form, 'whenHint'),
		lat: readText(form, 'lat'),
		lng: readText(form, 'lng')
	};
}

/**
 * A spot has the same fields and limits as a listing, with "when to come" in place of
 * "how to find it", so it reuses the listing rules.
 */
export function parseNewSpot(values: NewSpotValues): SpotParseResult {
	const { whenHint, ...rest } = values;
	const result = parseNewListing({ ...rest, locationHint: whenHint });
	if (!result.ok) {
		const { locationHint, ...errors } = result.errors;
		return { ok: false, errors: locationHint ? { ...errors, whenHint: locationHint } : errors };
	}
	const { locationHint, ...data } = result.data;
	return { ok: true, data: { ...data, whenHint: locationHint } };
}
