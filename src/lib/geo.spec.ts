import { describe, expect, it } from 'vitest';
import { distanceMeters } from './geo';

describe('distanceMeters', () => {
	it('is zero for the same point', () => {
		expect(distanceMeters({ lat: 32, lng: 34.8 }, { lat: 32, lng: 34.8 })).toBe(0);
	});

	it('measures Tel Aviv to Jerusalem at roughly 54 km', () => {
		const km =
			distanceMeters({ lat: 32.0853, lng: 34.7818 }, { lat: 31.7683, lng: 35.2137 }) / 1000;
		expect(km).toBeGreaterThan(52);
		expect(km).toBeLessThan(56);
	});
});
