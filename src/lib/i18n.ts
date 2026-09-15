import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { localizeHref } from '$lib/paraglide/runtime';

/** An internal link in the current language, e.g. `href('/new')` → `/en/new`. */
export function href(path: string): string {
	return resolve(localizeHref(path) as Pathname);
}
