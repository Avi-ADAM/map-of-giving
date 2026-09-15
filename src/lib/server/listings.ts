import { and, count, countDistinct, desc, eq, gt, inArray } from 'drizzle-orm';
import { CATEGORY_TTL_HOURS, type ReportKind } from '$lib/domain';
import type { NewListingInput } from '$lib/listing-validation';
import type { PublicListing } from '$lib/types';
import { getDb } from './db';
import { listing, report } from './db/schema';

const HOUR_MS = 3_600_000;

/** Anonymous abuse limits. Tune these once we see real usage. */
export const MAX_LISTINGS_PER_HOUR = 10;
export const REPORT_COOLDOWN_MS = HOUR_MS;
/** Distinct people saying "not found" / "unusable" since the last confirmation hide a listing. */
export const NEGATIVE_REPORTS_TO_HIDE = 2;
const MAX_RESULTS = 500;

const publicColumns = {
	id: listing.id,
	category: listing.category,
	description: listing.description,
	locationHint: listing.locationHint,
	lat: listing.lat,
	lng: listing.lng,
	status: listing.status,
	createdAt: listing.createdAt,
	lastConfirmedAt: listing.lastConfirmedAt,
	expiresAt: listing.expiresAt
};

export async function listActiveListings(): Promise<PublicListing[]> {
	const db = await getDb();
	return db
		.select(publicColumns)
		.from(listing)
		.where(and(eq(listing.status, 'available'), gt(listing.expiresAt, new Date())))
		.orderBy(desc(listing.createdAt))
		.limit(MAX_RESULTS);
}

export async function getListing(id: string): Promise<PublicListing | null> {
	const db = await getDb();
	const [row] = await db.select(publicColumns).from(listing).where(eq(listing.id, id)).limit(1);
	return row ?? null;
}

export async function createListing(
	input: NewListingInput,
	anonId: string
): Promise<{ id: string } | { rateLimited: true }> {
	const db = await getDb();
	const now = Date.now();

	const [{ recent }] = await db
		.select({ recent: count() })
		.from(listing)
		.where(and(eq(listing.anonId, anonId), gt(listing.createdAt, new Date(now - HOUR_MS))));
	if (recent >= MAX_LISTINGS_PER_HOUR) return { rateLimited: true };

	const [row] = await db
		.insert(listing)
		.values({
			...input,
			anonId,
			expiresAt: new Date(now + CATEGORY_TTL_HOURS[input.category] * HOUR_MS)
		})
		.returning({ id: listing.id });
	return { id: row.id };
}

export type ReportOutcome = 'ok' | 'duplicate' | 'gone' | 'not_found';

export async function reportListing(
	listingId: string,
	kind: ReportKind,
	anonId: string
): Promise<ReportOutcome> {
	const db = await getDb();
	const now = Date.now();

	const [target] = await db
		.select({
			category: listing.category,
			status: listing.status,
			lastConfirmedAt: listing.lastConfirmedAt,
			expiresAt: listing.expiresAt
		})
		.from(listing)
		.where(eq(listing.id, listingId))
		.limit(1);
	if (!target) return 'not_found';
	if (target.status === 'gone' || target.expiresAt.getTime() <= now) return 'gone';

	const [{ recent }] = await db
		.select({ recent: count() })
		.from(report)
		.where(
			and(
				eq(report.listingId, listingId),
				eq(report.anonId, anonId),
				gt(report.createdAt, new Date(now - REPORT_COOLDOWN_MS))
			)
		);
	if (recent > 0) return 'duplicate';

	await db.insert(report).values({ listingId, kind, anonId });

	if (kind === 'still_there') {
		const renewed = now + CATEGORY_TTL_HOURS[target.category] * HOUR_MS;
		await db
			.update(listing)
			.set({
				lastConfirmedAt: new Date(now),
				expiresAt: new Date(Math.max(target.expiresAt.getTime(), renewed))
			})
			.where(eq(listing.id, listingId));
	} else if (kind === 'taken') {
		await markGone(listingId, now);
	} else {
		const [{ reporters }] = await db
			.select({ reporters: countDistinct(report.anonId) })
			.from(report)
			.where(
				and(
					eq(report.listingId, listingId),
					inArray(report.kind, ['not_found', 'unusable']),
					gt(report.createdAt, target.lastConfirmedAt)
				)
			);
		if (reporters >= NEGATIVE_REPORTS_TO_HIDE) await markGone(listingId, now);
	}

	return 'ok';
}

async function markGone(listingId: string, now: number) {
	const db = await getDb();
	await db
		.update(listing)
		.set({ status: 'gone', goneAt: new Date(now) })
		.where(eq(listing.id, listingId));
}
