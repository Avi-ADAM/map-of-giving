<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import MapView from '$lib/components/MapView.svelte';
	import { CATEGORY_EMOJI, REPORT_EMOJI, REPORT_KINDS } from '$lib/domain';
	import { relativeTime } from '$lib/format';
	import { googleMapsUrl, wazeUrl } from '$lib/geo';
	import { href } from '$lib/i18n';
	import { categoryLabel, reportLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';

	let { data, form } = $props();

	const listing = $derived(data.listing);
	const isGone = $derived(listing.status === 'gone' || listing.expiresAt.getTime() <= data.now);
	const wasConfirmed = $derived(
		listing.lastConfirmedAt.getTime() - listing.createdAt.getTime() > 60_000
	);
	const created = $derived(page.url.searchParams.has('created'));

	const outcomeMessage = $derived.by(() => {
		switch (form?.outcome) {
			case 'ok':
				return m.report_thanks();
			case 'duplicate':
				return m.report_duplicate();
			case 'gone':
				return m.report_gone();
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
	<title>{categoryLabel(listing.category)} · {m.app_name()}</title>
</svelte:head>

{#if created}
	<p bind:this={banner} tabindex="-1" class="alert alert-success mt-0 mb-5 text-lg">
		<span aria-hidden="true">🎉</span>
		{m.created_thanks()}
	</p>
{/if}

<article class="flex flex-col gap-4">
	<header>
		<p class="m-0 text-5xl" aria-hidden="true">{CATEGORY_EMOJI[listing.category]}</p>
		<h1 class="my-1 text-3xl font-bold">{categoryLabel(listing.category)}</h1>
		<p class="m-0 text-xl">{listing.description}</p>
		{#if listing.locationHint}
			<p class="mt-2 mb-0 text-lg"><strong>{m.hint_label()}</strong> {listing.locationHint}</p>
		{/if}
	</header>

	<ul class="m-0 list-none space-y-1 p-0 text-neutral-800">
		<li>
			<span aria-hidden="true">🕒</span>
			{m.posted_ago({ time: relativeTime(listing.createdAt, data.now) })}
		</li>
		{#if wasConfirmed}
			<li>
				<span aria-hidden="true">✅</span>
				{m.confirmed_ago({ time: relativeTime(listing.lastConfirmedAt, data.now) })}
			</li>
		{/if}
		{#if !isGone}
			<li>
				<span aria-hidden="true">⏳</span>
				{m.expires_in({ time: relativeTime(listing.expiresAt, data.now) })}
			</li>
		{/if}
	</ul>

	<!-- Kept outside the {#if} below so the announcement survives the listing becoming unavailable. -->
	<p role="status" class="alert alert-success m-0 empty:hidden">{outcomeMessage}</p>

	{#if isGone}
		<p class="alert alert-warning m-0">{m.listing_gone()}</p>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2">
			<a href={googleMapsUrl(listing)} class="btn btn-primary">
				<span aria-hidden="true">🧭</span>
				{m.navigate_google()}
			</a>
			<a href={wazeUrl(listing)} class="btn btn-primary">
				<span aria-hidden="true">🚗</span>
				{m.navigate_waze()}
			</a>
		</div>

		<MapView
			label={m.listing_on_map()}
			markers={[
				{ ...listing, emoji: CATEGORY_EMOJI[listing.category], label: listing.description }
			]}
			class="h-64"
		/>

		<section aria-labelledby="report-heading" class="card">
			<h2 id="report-heading" class="mt-0 mb-1 text-2xl font-bold">{m.report_title()}</h2>
			<p class="mt-0">{m.report_intro()}</p>
			<form method="POST" action="?/report" class="grid gap-2" use:enhance>
				{#each REPORT_KINDS as kind (kind)}
					<button
						type="submit"
						name="kind"
						value={kind}
						class="btn btn-secondary w-full justify-start"
					>
						<span aria-hidden="true" class="text-2xl">{REPORT_EMOJI[kind]}</span>
						{reportLabel(kind)}
					</button>
				{/each}
			</form>
		</section>
	{/if}

	<p class="m-0">
		<a href={href('/')} class="btn btn-secondary">{m.back_to_all()}</a>
	</p>
</article>
