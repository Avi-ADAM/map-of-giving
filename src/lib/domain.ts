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

export function isCategory(value: unknown): value is Category {
	return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

export function isReportKind(value: unknown): value is ReportKind {
	return typeof value === 'string' && (REPORT_KINDS as readonly string[]).includes(value);
}
