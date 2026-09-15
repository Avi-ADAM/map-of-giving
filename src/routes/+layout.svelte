<script lang="ts">
	import './layout.css';
	import logo from '$lib/assets/logo-96.png';
	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { href } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, locales, localizeHref } from '$lib/paraglide/runtime';
	import { PLATFORM_NAME, PLATFORM_URL, RIKMA_SUPPORT_URL, RIKMA_URL } from '$lib/rikma';

	let { children } = $props();

	// Each language is written in its own script so people can recognise theirs.
	const LANGUAGE_NAMES: Record<(typeof locales)[number], string> = {
		he: 'עברית',
		ar: 'العربية',
		ru: 'Русский',
		en: 'English',
		fr: 'Français'
	};

	// Route ids are language-independent (the locale prefix is rerouted away in hooks.ts).
	const routeId = $derived(page.route.id ?? '');
	const inSpots = $derived(routeId.startsWith('/spots'));
	const sections = $derived([
		{
			path: '/',
			emoji: '🎁',
			text: m.nav_finds(),
			current: !inSpots,
			exact: routeId === '/'
		},
		{
			path: '/spots',
			emoji: '🔥',
			text: m.nav_spots(),
			current: inSpots,
			exact: routeId === '/spots'
		}
	]);
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={asset('/favicon.png')} />
	<link rel="apple-touch-icon" href={asset('/apple-touch-icon.png')} />
	<title>{m.app_name()}</title>
	<meta name="description" content={m.app_tagline()} />
	<meta name="theme-color" content="#07553d" />
</svelte:head>

<a href="#main" class="skip-link">{m.skip_to_content()}</a>

<nav aria-label={m.language_label()} class="border-b border-neutral-300 bg-neutral-100">
	<ul class="mx-auto flex max-w-3xl flex-wrap gap-x-4 px-4 py-1">
		{#each locales as locale (locale)}
			<li>
				<!-- Full reload so <html lang/dir> switch together with the text. -->
				<a
					href={localizeHref(page.url.pathname, { locale })}
					hreflang={locale}
					lang={locale}
					aria-current={locale === getLocale() ? 'true' : undefined}
					data-sveltekit-reload
					class="inline-flex min-h-11 items-center px-1 aria-[current]:font-bold aria-[current]:no-underline"
				>
					{LANGUAGE_NAMES[locale]}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<header class="bg-brand-800 text-white">
	<div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
		<a
			href={href('/')}
			class="inline-flex items-center gap-2 text-2xl font-bold text-white no-underline"
		>
			<img src={logo} alt="" width="44" height="44" class="size-11 rounded-full" />
			{m.app_name()}
		</a>
		<a href={href(inSpots ? '/spots/new' : '/new')} class="btn btn-accent">
			<span aria-hidden="true">➕</span>
			{inSpots ? m.nav_add_spot() : m.nav_add()}
		</a>
	</div>
</header>

<nav aria-label={m.nav_main_label()} class="border-b-2 border-brand-100 bg-brand-50">
	<!-- Two equal columns so both sections fit side by side on a narrow phone. -->
	<ul class="mx-auto my-0 grid max-w-3xl list-none grid-cols-2 gap-2 px-4 py-2 sm:flex">
		{#each sections as section (section.path)}
			<li>
				<a
					href={href(section.path)}
					aria-current={section.current ? (section.exact ? 'page' : 'true') : undefined}
					class="btn w-full gap-1 px-2 text-base sm:gap-2 sm:px-5 sm:text-lg {section.current
						? 'btn-primary'
						: 'btn-secondary'}"
				>
					<!-- Decorative; dropped on narrow phones so both labels stay on one line. -->
					<span aria-hidden="true" class="hidden min-[400px]:inline">{section.emoji}</span>
					{section.text}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<main id="main" tabindex="-1" class="mx-auto max-w-3xl px-4 py-5 focus:outline-none">
	{@render children()}
</main>

<footer class="mt-8 border-t-2 border-neutral-300 bg-neutral-50">
	<div class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
		<p class="m-0 font-semibold text-neutral-800">{m.footer_note()}</p>

		<div class="flex items-start gap-3">
			<img src={logo} alt="" width="48" height="48" class="size-12 shrink-0 rounded-full" />
			<p class="m-0">{m.footer_rikma({ app: m.app_name(), brand: PLATFORM_NAME })}</p>
		</div>

		<!-- The 1💗1 pages are in Hebrew, whatever the current language. -->
		<nav aria-label={m.footer_links_label()}>
			<ul class="m-0 flex list-none flex-wrap gap-2 p-0">
				<li>
					<a href={RIKMA_SUPPORT_URL} hreflang="he" class="btn btn-accent">
						<span aria-hidden="true">💗</span>
						{m.footer_support()}
					</a>
				</li>
				<li>
					<a href={RIKMA_URL} hreflang="he" class="btn btn-secondary">{m.footer_project()}</a>
				</li>
				<li>
					<a href={PLATFORM_URL} hreflang="he" class="btn btn-secondary">
						{m.footer_platform({ brand: PLATFORM_NAME })}
					</a>
				</li>
			</ul>
		</nav>
	</div>
</footer>
