// Core domain constants shared by the database schema, the server and the UI.
// Imported with a relative path from the schema, so keep it free of `$lib` aliases.

export const CATEGORIES = ['food', 'furniture', 'clothing', 'kids', 'household', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<Category, string> = {
	food: '🍎',
	furniture: '🛋️',
	clothing: '👕',
	kids: '🧸',
	household: '🍳',
	other: '📦'
};

/** How long a find stays on the map unless someone confirms it is still there. */
export const CATEGORY_TTL_HOURS: Record<Category, number> = {
	food: 24,
	furniture: 72,
	clothing: 72,
	kids: 72,
	household: 72,
	other: 72
};

export const REPORT_KINDS = ['still_there', 'taken', 'not_found', 'unusable'] as const;
export type ReportKind = (typeof REPORT_KINDS)[number];

export const REPORT_EMOJI: Record<ReportKind, string> = {
	still_there: '✅',
	taken: '🙌',
	not_found: '🔍',
	unusable: '⚠️'
};

export const LISTING_STATUSES = ['available', 'gone'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

/**
 * Hot spots: places where free things show up again and again (a bakery that leaves bread out
 * at night, a corner where people leave clothes). They don't expire like finds; visitors say
 * what they found each time, so others can tell whether a trip is worth it.
 */
export const SPOT_STATUSES = ['active', 'closed'] as const;
export type SpotStatus = (typeof SPOT_STATUSES)[number];

export const SPOT_VISIT_OUTCOMES = ['found', 'empty', 'unusable', 'stopped'] as const;
export type SpotVisitOutcome = (typeof SPOT_VISIT_OUTCOMES)[number];

export const SPOT_VISIT_EMOJI: Record<SpotVisitOutcome, string> = {
	found: '✅',
	empty: '❌',
	unusable: '⚠️',
	stopped: '🚫'
};

/** Visits older than this don't count towards "is it worth going". The copy says "two months". */
export const SPOT_FEEDBACK_WINDOW_DAYS = 60;
/** A spot where nobody has found anything for this long drops off the map. */
export const SPOT_STALE_DAYS = 180;

export function isCategory(value: unknown): value is Category {
	return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

export function isReportKind(value: unknown): value is ReportKind {
	return typeof value === 'string' && (REPORT_KINDS as readonly string[]).includes(value);
}

export function isSpotVisitOutcome(value: unknown): value is SpotVisitOutcome {
	return typeof value === 'string' && (SPOT_VISIT_OUTCOMES as readonly string[]).includes(value);
}
