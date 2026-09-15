import { SPOT_STALE_DAYS, type SpotStatus, type SpotVisitOutcome } from './domain';

/** Visits in the feedback window, by outcome. */
export type VisitCounts = Record<SpotVisitOutcome, number>;

export type SpotVerdict = 'unknown' | 'often' | 'sometimes' | 'rarely';

/** Fewer visits than this is too little to say whether a spot is worth the trip. */
export const MIN_VISITS_FOR_VERDICT = 3;

const DAY_MS = 86_400_000;

export const emptyVisitCounts = (): VisitCounts => ({
	found: 0,
	empty: 0,
	unusable: 0,
	stopped: 0
});

/** How likely a trip is to pay off, from recent visits. "Stopped" reports close a spot instead. */
export function spotVerdict(counts: VisitCounts): SpotVerdict {
	const tries = counts.found + counts.empty + counts.unusable;
	if (tries < MIN_VISITS_FOR_VERDICT) return 'unknown';
	const ratio = counts.found / tries;
	if (ratio >= 0.6) return 'often';
	if (ratio >= 0.3) return 'sometimes';
	return 'rarely';
}

/** Oldest "last found" (or creation, if nothing was found yet) that still keeps a spot listed. */
export const staleCutoff = (now: number) => new Date(now - SPOT_STALE_DAYS * DAY_MS);

export function isSpotActive(
	spot: { status: SpotStatus; createdAt: Date; lastFoundAt: Date | null },
	now: number
): boolean {
	const lastSign = spot.lastFoundAt ?? spot.createdAt;
	return spot.status === 'active' && lastSign > staleCutoff(now);
}
