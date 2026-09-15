<script lang="ts">
	import { page } from '$app/state';
	import BrowseControls from '$lib/components/BrowseControls.svelte';
	import ListingCard from '$lib/components/ListingCard.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import { CATEGORY_EMOJI } from '$lib/domain';
	import { distanceMeters } from '$lib/geo';
	import { href } from '$lib/i18n';
	import { categoryLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng, MapMarker } from '$lib/types';

	let { data } = $props();

	// Read from the URL (not the server load) so switching views doesn't refetch listings.
	const view = $derived(page.url.searchParams.get('view') === 'list' ? 'list' : 'map');

	let userPosition = $state<LatLng | null>(null);

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
</script>

<h1 class="mb-1 text-3xl font-bold">{m.app_tagline()}</h1>
<p class="mt-0 mb-4 text-lg">{m.app_intro()}</p>

<BrowseControls {view} bind:userPosition />

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
			<p class="mb-0">{m.spots_promo()}</p>
			<a href={href('/spots')} class="btn btn-secondary mt-2">
				<span aria-hidden="true">🔥</span>
				{m.spots_promo_link()}
			</a>
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
