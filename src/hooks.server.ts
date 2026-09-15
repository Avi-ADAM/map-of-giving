import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const ANON_COOKIE = 'anon_id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * No sign-up needed: every browser gets a random id so we can rate-limit and
 * avoid counting the same person's report twice. It identifies nothing else.
 */
const handleAnonId: Handle = ({ event, resolve }) => {
	let anonId = event.cookies.get(ANON_COOKIE);
	if (!anonId || !UUID_PATTERN.test(anonId)) {
		anonId = crypto.randomUUID();
		event.cookies.set(ANON_COOKIE, anonId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 365
		});
	}
	event.locals.anonId = anonId;
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleAnonId, handleParaglide);
