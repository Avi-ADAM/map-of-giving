<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import MapView from '$lib/components/MapView.svelte';
	import { CATEGORY_EMOJI, SPOT_VISIT_EMOJI, SPOT_VISIT_OUTCOMES } from '$lib/domain';
	import { formatCount, relativeTime } from '$lib/format';
	import { googleMapsUrl, wazeUrl } from '$lib/geo';
	import { href } from '$lib/i18n';
	import { categoryLabel, SPOT_VERDICT_EMOJI, verdictLabel, visitLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import { isSpotActive, spotVerdict } from '$lib/spot-rating';

	let { data, form } = $props();

	const spot = $derived(data.spot);
	const isActive = $derived(isSpotActive(spot, data.now));
	const verdict = $derived(spotVerdict(spot.visits));
	const created = $derived(page.url.searchParams.has('created'));

	const counts = $derived([
		{
			emoji: SPOT_VISIT_EMOJI.found,
			text: m.spot_count_found({ count: formatCount(spot.visits.found) })
		},
		{
			emoji: SPOT_VISIT_EMOJI.empty,
			text: m.spot_count_empty({ count: formatCount(spot.visits.empty) })
		},
		{
			emoji: SPOT_VISIT_EMOJI.unusable,
			text: m.spot_count_unusable({ count: formatCount(spot.visits.unusable) })
		}
	]);

	const resultMessage = $derived.by(() => {
		switch (form?.result) {
			case 'ok':
				return m.report_thanks();
			case 'duplicate':
				return m.spot_visit_duplicate();
			case 'closed':
				return m.spot_visit_closed();
			case 'invalid':
				return m.error_generic();
			default:
				return '';
		}
	});

	let banner = $state<HTMLElement>();
	onMount(() => banner?.focus());
</script>

<svelte:head>
	<title>{m.nav_spots()} · {categoryLabel(spot.category)} · {m.app_name()}</title>
</svelte:head>

{#if created}
	<p bind:this={banner} tabindex="-1" class="alert alert-success mt-0 mb-5 text-lg">
		<span aria-hidden="true">🎉</span>
		{m.spot_created_thanks()}
	</p>
{/if}

<article class="flex flex-col gap-4">
	<header>
		<p class="m-0 text-5xl" aria-hidden="true">{CATEGORY_EMOJI[spot.category]}</p>
		<p class="m-0 font-semibold text-brand-900">
			<span aria-hidden="true">🔥</span>
			{m.nav_spots()}
		</p>
		<h1 class="my-1 text-3xl font-bold">{categoryLabel(spot.category)}</h1>
		<p class="m-0 text-xl">{spot.description}</p>
		{#if spot.whenHint}
			<p class="mt-2 mb-0 text-lg"><strong>{m.spot_when_label()}</strong> {spot.whenHint}</p>
		{/if}
	</header>

	<section aria-labelledby="worth-heading" class="card">
		<h2 id="worth-heading" class="mt-0 mb-1 text-2xl font-bold">{m.spot_stats_heading()}</h2>
		<p class="mt-0 mb-2 text-xl font-bold">
			<span aria-hidden="true">{SPOT_VERDICT_EMOJI[verdict]}</span>
			{verdictLabel(verdict)}
		</p>
		{#if spot.lastFoundAt}
			<p class="mt-0 mb-2">
				<span aria-hidden="true">🕒</span>
				{m.spot_last_found({ time: relativeTime(spot.lastFoundAt, data.now) })}
			</p>
		{/if}
		<p class="m-0 text-neutral-700">{m.spot_stats_window()}</p>
		<ul class="m-0 list-none space-y-1 p-0">
			{#each counts as item (item.emoji)}
				<li><span aria-hidden="true">{item.emoji}</span> {item.text}</li>
			{/each}
		</ul>
	</section>

	<!-- Kept outside the {#if} below so the announcement survives the spot being closed. -->
	<p role="status" class="alert alert-success m-0 empty:hidden">{resultMessage}</p>

	{#if !isActive}
		<p class="alert alert-warning m-0">{m.spot_closed()}</p>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2">
			<a href={googleMapsUrl(spot)} class="btn btn-primary">
				<span aria-hidden="true">🧭</span>
				{m.navigate_google()}
			</a>
			<a href={wazeUrl(spot)} class="btn btn-primary">
				<span aria-hidden="true">🚗</span>
				{m.navigate_waze()}
			</a>
		</div>

		<MapView
			label={m.spot_on_map()}
			markers={[{ ...spot, emoji: CATEGORY_EMOJI[spot.category], label: spot.description }]}
			class="h-64"
		/>

		<section aria-labelledby="visit-heading" class="card">
			<h2 id="visit-heading" class="mt-0 mb-1 text-2xl font-bold">{m.spot_visit_title()}</h2>
			<p class="mt-0">{m.spot_visit_intro()}</p>
			<form method="POST" action="?/visit" class="grid gap-2" use:enhance>
				{#each SPOT_VISIT_OUTCOMES as outcome (outcome)}
					<button
						type="submit"
						name="outcome"
						value={outcome}
						class="btn btn-secondary w-full justify-start"
					>
						<span aria-hidden="true" class="text-2xl">{SPOT_VISIT_EMOJI[outcome]}</span>
						{visitLabel(outcome)}
					</button>
				{/each}
			</form>
		</section>
	{/if}

	<p class="m-0">
		<a href={href('/spots')} class="btn btn-secondary">{m.back_to_spots()}</a>
	</p>
</article>
