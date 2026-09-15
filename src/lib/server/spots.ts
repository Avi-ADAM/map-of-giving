import { and, count, countDistinct, desc, eq, gt, inArray, isNull, or } from 'drizzle-orm';
import { SPOT_FEEDBACK_WINDOW_DAYS, type SpotVisitOutcome } from '$lib/domain';
import { emptyVisitCounts, isSpotActive, staleCutoff, type VisitCounts } from '$lib/spot-rating';
import type { NewSpotInput } from '$lib/spot-validation';
import type { PublicSpot } from '$lib/types';
import { getDb } from './db';
import { spot, spotVisit } from './db/schema';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** Anonymous abuse limits. Spots are added rarely, so the limit is per day. */
export const MAX_SPOTS_PER_DAY = 5;
/** One person can say what they found once per visit, roughly. */
export const SPOT_VISIT_COOLDOWN_MS = 12 * HOUR_MS;
/** Distinct people saying "stopped" since the last find close a spot. */
export const STOPPED_REPORTS_TO_CLOSE = 2;
const MAX_RESULTS = 500;

const publicColumns = {
	id: spot.id,
	category: spot.category,
	description: spot.description,
	whenHint: spot.whenHint,
	lat: spot.lat,
	lng: spot.lng,
	status: spot.status,
	createdAt: spot.createdAt,
	lastFoundAt: spot.lastFoundAt
};

async function visitCounts(spotIds: string[], now: number): Promise<Map<string, VisitCounts>> {
	const result = new Map(spotIds.map((id) => [id, emptyVisitCounts()]));
	if (spotIds.length === 0) return result;
	const db = await getDb();
	const rows = await db
		.select({ spotId: spotVisit.spotId, outcome: spotVisit.outcome, visits: count() })
		.from(spotVisit)
		.where(
			and(
				inArray(spotVisit.spotId, spotIds),
				gt(spotVisit.createdAt, new Date(now - SPOT_FEEDBACK_WINDOW_DAYS * DAY_MS))
			)
		)
		.groupBy(spotVisit.spotId, spotVisit.outcome);
	for (const row of rows) {
		const counts = result.get(row.spotId);
		if (counts) counts[row.outcome] = row.visits;
	}
	return result;
}

export async function listActiveSpots(): Promise<PublicSpot[]> {
	const db = await getDb();
	const now = Date.now();
	const cutoff = staleCutoff(now);
	const rows = await db
		.select(publicColumns)
		.from(spot)
		.where(
			and(
				eq(spot.status, 'active'),
				or(gt(spot.lastFoundAt, cutoff), and(isNull(spot.lastFoundAt), gt(spot.createdAt, cutoff)))
			)
		)
		.orderBy(desc(spot.lastFoundAt), desc(spot.createdAt))
		.limit(MAX_RESULTS);
	const counts = await visitCounts(
		rows.map((row) => row.id),
		now
	);
	return rows.map((row) => ({ ...row, visits: counts.get(row.id) ?? emptyVisitCounts() }));
}

export async function getSpot(id: string): Promise<PublicSpot | null> {
	const db = await getDb();
	const [row] = await db.select(publicColumns).from(spot).where(eq(spot.id, id)).limit(1);
	if (!row) return null;
	const counts = await visitCounts([id], Date.now());
	return { ...row, visits: counts.get(id) ?? emptyVisitCounts() };
}

export async function createSpot(
	input: NewSpotInput,
	anonId: string
): Promise<{ id: string } | { rateLimited: true }> {
	const db = await getDb();
	const now = Date.now();

	const [{ recent }] = await db
		.select({ recent: count() })
		.from(spot)
		.where(and(eq(spot.anonId, anonId), gt(spot.createdAt, new Date(now - DAY_MS))));
	if (recent >= MAX_SPOTS_PER_DAY) return { rateLimited: true };

	const [row] = await db
		.insert(spot)
		.values({ ...input, anonId })
		.returning({ id: spot.id });
	return { id: row.id };
}

export type VisitOutcome = 'ok' | 'duplicate' | 'closed' | 'not_found';

export async function reportSpotVisit(
	spotId: string,
	outcome: SpotVisitOutcome,
	anonId: string
): Promise<VisitOutcome> {
	const db = await getDb();
	const now = Date.now();

	const [target] = await db
		.select({ status: spot.status, createdAt: spot.createdAt, lastFoundAt: spot.lastFoundAt })
		.from(spot)
		.where(eq(spot.id, spotId))
		.limit(1);
	if (!target) return 'not_found';
	if (!isSpotActive(target, now)) return 'closed';

	const [{ recent }] = await db
		.select({ recent: count() })
		.from(spotVisit)
		.where(
			and(
				eq(spotVisit.spotId, spotId),
				eq(spotVisit.anonId, anonId),
				gt(spotVisit.createdAt, new Date(now - SPOT_VISIT_COOLDOWN_MS))
			)
		);
	if (recent > 0) return 'duplicate';

	await db.insert(spotVisit).values({ spotId, outcome, anonId });

	if (outcome === 'found') {
		await db
			.update(spot)
			.set({ lastFoundAt: new Date(now) })
			.where(eq(spot.id, spotId));
	} else if (outcome === 'stopped') {
		const [{ reporters }] = await db
			.select({ reporters: countDistinct(spotVisit.anonId) })
			.from(spotVisit)
			.where(
				and(
					eq(spotVisit.spotId, spotId),
					eq(spotVisit.outcome, 'stopped'),
					gt(spotVisit.createdAt, target.lastFoundAt ?? target.createdAt)
				)
			);
		if (reporters >= STOPPED_REPORTS_TO_CLOSE) {
			await db
				.update(spot)
				.set({ status: 'closed', closedAt: new Date(now) })
				.where(eq(spot.id, spotId));
		}
	}

	return 'ok';
}
