import { getLocale } from '$lib/paraglide/runtime';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['day', 86_400_000],
	['hour', 3_600_000],
	['minute', 60_000]
];

/** "5 minutes ago" / "in 3 hours", in the current locale. */
export function relativeTime(date: Date, now: number): string {
	const diff = date.getTime() - now;
	const formatter = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
	const [unit, ms] = UNITS.find(([, ms]) => Math.abs(diff) >= ms) ?? UNITS[UNITS.length - 1];
	return formatter.format(Math.round(diff / ms), unit);
}

export function formatDistance(meters: number): string {
	const km = meters >= 1000;
	return new Intl.NumberFormat(getLocale(), {
		style: 'unit',
		unit: km ? 'kilometer' : 'meter',
		maximumFractionDigits: km ? 1 : 0
	}).format(km ? meters / 1000 : Math.max(10, Math.round(meters / 10) * 10));
}
