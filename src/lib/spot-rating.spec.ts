import { describe, expect, it } from 'vitest';
import { SPOT_STALE_DAYS } from './domain';
import { emptyVisitCounts, isSpotActive, spotVerdict } from './spot-rating';

const counts = (found: number, empty: number, unusable = 0, stopped = 0) => ({
	...emptyVisitCounts(),
	found,
	empty,
	unusable,
	stopped
});

describe('spotVerdict', () => {
	it('says nothing until there are enough visits', () => {
		expect(spotVerdict(counts(2, 0))).toBe('unknown');
		expect(spotVerdict(counts(0, 0, 0, 5))).toBe('unknown');
	});

	it('grades by the share of visits where something was found', () => {
		expect(spotVerdict(counts(3, 2))).toBe('often');
		expect(spotVerdict(counts(1, 2))).toBe('sometimes');
		expect(spotVerdict(counts(1, 3))).toBe('rarely');
	});

	it('counts things in bad condition as a wasted trip', () => {
		expect(spotVerdict(counts(3, 0, 3))).toBe('sometimes');
	});
});

describe('isSpotActive', () => {
	const now = Date.UTC(2026, 8, 15);
	const daysAgo = (days: number) => new Date(now - days * 86_400_000);

	it('keeps a spot while someone found something recently', () => {
		const spot = { status: 'active' as const, createdAt: daysAgo(400), lastFoundAt: daysAgo(10) };
		expect(isSpotActive(spot, now)).toBe(true);
		expect(isSpotActive({ ...spot, status: 'closed' }, now)).toBe(false);
	});

	it('drops a spot where nothing was found for a long time', () => {
		const old = daysAgo(SPOT_STALE_DAYS + 1);
		expect(isSpotActive({ status: 'active', createdAt: old, lastFoundAt: null }, now)).toBe(false);
		expect(isSpotActive({ status: 'active', createdAt: daysAgo(5), lastFoundAt: null }, now)).toBe(
			true
		);
	});
});
