import { describe, expect, it } from 'vitest';
import { HINT_MAX } from './listing-validation';
import { parseNewSpot, readNewSpotValues, type NewSpotValues } from './spot-validation';

const valid: NewSpotValues = {
	category: 'food',
	description: 'המאפייה משאירה מאפים בקרטון ליד הכניסה',
	whenHint: 'בערב אחרי סגירה',
	lat: '32.0853',
	lng: '34.7818'
};

describe('parseNewSpot', () => {
	it('accepts a valid spot', () => {
		expect(parseNewSpot(valid)).toEqual({
			ok: true,
			data: {
				category: 'food',
				description: 'המאפייה משאירה מאפים בקרטון ליד הכניסה',
				whenHint: 'בערב אחרי סגירה',
				lat: 32.0853,
				lng: 34.7818
			}
		});
	});

	it('stores an empty "when" as null', () => {
		const result = parseNewSpot({ ...valid, whenHint: '' });
		expect(result.ok && result.data.whenHint).toBeNull();
	});

	it('reports errors under the spot field names', () => {
		expect(
			parseNewSpot({ ...valid, category: '', lat: '', whenHint: 'x'.repeat(HINT_MAX + 1) })
		).toEqual({
			ok: false,
			errors: {
				category: 'category_required',
				location: 'location_required',
				whenHint: 'hint_too_long'
			}
		});
	});
});

describe('readNewSpotValues', () => {
	it('trims and collapses whitespace', () => {
		const form = new FormData();
		form.set('whenHint', '  בערב \n חמישי ');
		expect(readNewSpotValues(form)).toEqual({
			category: '',
			description: '',
			whenHint: 'בערב חמישי',
			lat: '',
			lng: ''
		});
	});
});
