<script lang="ts">
	import { page } from '$app/state';
	import BrowseControls from '$lib/components/BrowseControls.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import SpotCard from '$lib/components/SpotCard.svelte';
	import { CATEGORY_EMOJI } from '$lib/domain';
	import { distanceMeters } from '$lib/geo';
	import { href } from '$lib/i18n';
	import { categoryLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng, MapMarker } from '$lib/types';

	let { data } = $props();

	const view = $derived(page.url.searchParams.get('view') === 'list' ? 'list' : 'map');

	let userPosition = $state<LatLng | null>(null);

	const spots = $derived.by(() => {
		const position = userPosition;
		if (!position) return data.spots.map((spot) => ({ spot, distance: null }));
		return data.spots
			.map((spot) => ({ spot, distance: distanceMeters(position, spot) }))
			.sort((a, b) => a.distance - b.distance);
	});

	const markers: MapMarker[] = $derived(
		data.spots.map((spot) => ({
			id: spot.id,
			lat: spot.lat,
			lng: spot.lng,
			emoji: CATEGORY_EMOJI[spot.category],
			label: `${categoryLabel(spot.category)}: ${spot.description}`,
			href: href(`/spots/${spot.id}`)
		}))
	);
</script>

<svelte:head>
	<title>{m.nav_spots()} · {m.app_name()}</title>
</svelte:head>

<h1 class="mb-1 text-3xl font-bold">{m.nav_spots()}</h1>
<p class="mt-0 mb-4 text-lg">{m.spots_intro()}</p>

<BrowseControls {view} bind:userPosition />

{#if view === 'map'}
	<MapView label={m.spots_map_label()} {markers} {userPosition} class="h-[60vh] min-h-80" />
{/if}

<section aria-labelledby="spots-heading" class="mt-6">
	<h2 id="spots-heading" class="text-2xl font-bold">
		{m.spots_heading({ count: data.spots.length })}
	</h2>

	{#if data.spots.length === 0}
		<div class="card">
			<p class="m-0 text-xl font-bold">{m.spots_empty_title()}</p>
			<p>{m.spots_empty_body()}</p>
			<a href={href('/spots/new')} class="btn btn-accent">{m.nav_add_spot()}</a>
		</div>
	{:else}
		<!-- Always rendered: it is the accessible, no-JS alternative to the map. -->
		<ul class="m-0 grid list-none gap-3 p-0">
			{#each spots as { spot, distance } (spot.id)}
				<li><SpotCard {spot} {distance} now={data.now} /></li>
			{/each}
		</ul>
	{/if}
</section>
