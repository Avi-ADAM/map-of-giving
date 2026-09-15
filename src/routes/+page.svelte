<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import ListingCard from '$lib/components/ListingCard.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import { CATEGORY_EMOJI } from '$lib/domain';
	import { distanceMeters, getCurrentPosition } from '$lib/geo';
	import { href } from '$lib/i18n';
	import { categoryLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng, MapMarker } from '$lib/types';

	let { data } = $props();

	// Read from the URL (not the server load) so switching views doesn't refetch listings.
	const view = $derived(page.url.searchParams.get('view') === 'list' ? 'list' : 'map');

	let hasJs = $state(false);
	let userPosition = $state<LatLng | null>(null);
	let locationState = $state<'idle' | 'locating' | 'error'>('idle');

	onMount(() => {
		hasJs = true;
	});

	const listings = $derived.by(() => {
		const position = userPosition;
		if (!position) return data.listings.map((listing) => ({ listing, distance: null }));
		return data.listings
			.map((listing) => ({ listing, distance: distanceMeters(position, listing) }))
			.sort((a, b) => a.distance - b.distance);
	});

	const markers: MapMarker[] = $derived(
		data.listings.map((listing) => ({
			id: listing.id,
			lat: listing.lat,
			lng: listing.lng,
			emoji: CATEGORY_EMOJI[listing.category],
			label: `${categoryLabel(listing.category)}: ${listing.description}`,
			href: href(`/listing/${listing.id}`)
		}))
	);

	async function locate() {
		locationState = 'locating';
		try {
			userPosition = await getCurrentPosition();
			locationState = 'idle';
		} catch {
			locationState = 'error';
		}
	}
</script>

<h1 class="mb-1 text-3xl font-bold">{m.app_tagline()}</h1>
<p class="mt-0 mb-4 text-lg">{m.app_intro()}</p>

<div class="mb-4 flex flex-wrap items-center gap-3">
	<nav aria-label={m.view_label()} class="flex gap-2">
		{#each [{ id: 'map', emoji: '🗺️', text: m.view_map() }, { id: 'list', emoji: '📋', text: m.view_list() }] as option (option.id)}
			<a
				href="?view={option.id}"
				aria-current={view === option.id ? 'page' : undefined}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				class="btn {view === option.id ? 'btn-primary' : 'btn-secondary'}"
			>
				<span aria-hidden="true">{option.emoji}</span>
				{option.text}
			</a>
		{/each}
	</nav>

	{#if hasJs}
		<button
			type="button"
			class="btn btn-secondary"
			onclick={locate}
			disabled={locationState === 'locating'}
		>
			<span aria-hidden="true">📍</span>
			{m.near_me()}
		</button>
	{/if}
</div>

<p role="status" class="empty:hidden {locationState === 'error' ? 'alert alert-warning' : ''}">
	{#if locationState === 'locating'}
		{m.locating()}
	{:else if locationState === 'error'}
		{m.location_error()}
	{:else if userPosition}
		{m.sorted_by_distance()}
	{/if}
</p>

{#if view === 'map'}
	<MapView label={m.map_label()} {markers} {userPosition} class="h-[60vh] min-h-80" />
{/if}

<section aria-labelledby="listings-heading" class="mt-6">
	<h2 id="listings-heading" class="text-2xl font-bold">
		{m.listings_heading({ count: data.listings.length })}
	</h2>

	{#if data.listings.length === 0}
		<div class="card">
			<p class="m-0 text-xl font-bold">{m.empty_title()}</p>
			<p>{m.empty_body()}</p>
			<a href={href('/new')} class="btn btn-accent">{m.nav_add()}</a>
		</div>
	{:else}
		<!-- Always rendered: it is the accessible, no-JS alternative to the map. -->
		<ul class="m-0 grid list-none gap-3 p-0">
			{#each listings as { listing, distance } (listing.id)}
				<li><ListingCard {listing} {distance} now={data.now} /></li>
			{/each}
		</ul>
	{/if}
</section>
