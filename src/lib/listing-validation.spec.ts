import { describe, expect, it } from 'vitest';
import {
	DESCRIPTION_MAX,
	HINT_MAX,
	parseNewListing,
	readNewListingValues,
	type NewListingValues
} from './listing-validation';

const valid: NewListingValues = {
	category: 'food',
	description: 'ארגז פירות וירקות',
	locationHint: '',
	lat: '32.0853',
	lng: '34.7818'
};

describe('parseNewListing', () => {
	it('accepts a valid listing and rounds coordinates', () => {
		const result = parseNewListing({ ...valid, lat: '32.085312345', locationHint: 'ליד הפח' });
		expect(result).toEqual({
			ok: true,
			data: {
				category: 'food',
				description: 'ארגז פירות וירקות',
				locationHint: 'ליד הפח',
				lat: 32.08531,
				lng: 34.7818
			}
		});
	});

	it('stores an empty hint as null', () => {
		const result = parseNewListing(valid);
		expect(result.ok && result.data.locationHint).toBeNull();
	});

	it('reports every missing field at once', () => {
		const result = parseNewListing({
			category: '',
			description: '',
			locationHint: '',
			lat: '',
			lng: ''
		});
		expect(result).toEqual({
			ok: false,
			errors: {
				category: 'category_required',
				location: 'location_required',
				description: 'description_required'
			}
		});
	});

	it('rejects unknown categories and out-of-range coordinates', () => {
		const result = parseNewListing({ ...valid, category: 'weapons', lat: '91' });
		expect(result).toEqual({
			ok: false,
			errors: { category: 'category_required', location: 'location_required' }
		});
	});

	it('counts length in characters, not UTF-16 units', () => {
		const emojiOnly = '🍎'.repeat(DESCRIPTION_MAX);
		expect(parseNewListing({ ...valid, description: emojiOnly }).ok).toBe(true);
		expect(parseNewListing({ ...valid, description: emojiOnly + '🍎' })).toEqual({
			ok: false,
			errors: { description: 'description_too_long' }
		});
		expect(parseNewListing({ ...valid, locationHint: 'x'.repeat(HINT_MAX + 1) })).toEqual({
			ok: false,
			errors: { locationHint: 'hint_too_long' }
		});
	});
});

describe('readNewListingValues', () => {
	it('trims and collapses whitespace, and ignores files', () => {
		const form = new FormData();
		form.set('description', '  ספה   במצב\n טוב ');
		form.set('category', new Blob(['x']));
		expect(readNewListingValues(form)).toEqual({
			category: '',
			description: 'ספה במצב טוב',
			locationHint: '',
			lat: '',
			lng: ''
		});
	});
});
