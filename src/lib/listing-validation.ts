import { isCategory, type Category } from './domain';

export const DESCRIPTION_MAX = 300;
export const HINT_MAX = 120;

export type NewListingInput = {
	category: Category;
	description: string;
	locationHint: string | null;
	lat: number;
	lng: number;
};

export type NewListingValues = Record<
	'category' | 'description' | 'locationHint' | 'lat' | 'lng',
	string
>;

export type FieldError =
	| 'category_required'
	| 'location_required'
	| 'description_required'
	| 'description_too_long'
	| 'hint_too_long';

export type NewListingErrors = Partial<
	Record<'category' | 'location' | 'description' | 'locationHint', FieldError>
>;

export type ParseResult =
	{ ok: true; data: NewListingInput } | { ok: false; errors: NewListingErrors };

function readText(form: FormData, key: string): string {
	const value = form.get(key);
	return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function readNewListingValues(form: FormData): NewListingValues {
	return {
		category: readText(form, 'category'),
		description: readText(form, 'description'),
		locationHint: readText(form, 'locationHint'),
		lat: readText(form, 'lat'),
		lng: readText(form, 'lng')
	};
}

/** Parses a coordinate and rounds it to ~1m precision; `null` when missing or out of range. */
function parseCoordinate(raw: string, limit: number): number | null {
	if (raw === '') return null;
	const value = Number(raw);
	return Number.isFinite(value) && Math.abs(value) <= limit ? Math.round(value * 1e5) / 1e5 : null;
}

const length = (text: string) => [...text].length;

export function parseNewListing(values: NewListingValues): ParseResult {
	const errors: NewListingErrors = {};
	const lat = parseCoordinate(values.lat, 90);
	const lng = parseCoordinate(values.lng, 180);

	if (!isCategory(values.category)) errors.category = 'category_required';
	if (lat === null || lng === null) errors.location = 'location_required';
	if (!values.description) errors.description = 'description_required';
	else if (length(values.description) > DESCRIPTION_MAX)
		errors.description = 'description_too_long';
	if (length(values.locationHint) > HINT_MAX) errors.locationHint = 'hint_too_long';

	if (
		Object.keys(errors).length > 0 ||
		!isCategory(values.category) ||
		lat === null ||
		lng === null
	) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		data: {
			category: values.category,
			description: values.description,
			locationHint: values.locationHint || null,
			lat,
			lng
		}
	};
}
