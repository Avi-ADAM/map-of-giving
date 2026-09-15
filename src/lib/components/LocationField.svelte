<script lang="ts">
	import { onMount } from 'svelte';
	import MapView from '$lib/components/MapView.svelte';
	import { getCurrentPosition } from '$lib/geo';
	import { fieldErrorMessage } from '$lib/labels';
	import type { FieldError } from '$lib/listing-validation';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng } from '$lib/types';

	interface Props {
		legend: string;
		/** Accessible name of the picker map. */
		mapLabel: string;
		error?: FieldError;
	}

	let { legend, mapLabel, error }: Props = $props();

	let hasJs = $state(false);
	let picked = $state<LatLng | null>(null);
	let userPosition = $state<LatLng | null>(null);
	let locationState = $state<'idle' | 'locating' | 'error'>('idle');

	onMount(() => {
		hasJs = true;
	});

	async function useMyLocation() {
		locationState = 'locating';
		try {
			const position = await getCurrentPosition();
			userPosition = position;
			picked = position;
			locationState = 'idle';
		} catch {
			locationState = 'error';
		}
	}
</script>

<!-- The error summary links to #use-location. -->
<fieldset aria-describedby={error ? 'location-error' : undefined}>
	<legend class="mb-2 text-2xl font-bold">{legend}</legend>
	{#if error}
		<p id="location-error" class="field-error mt-0">{fieldErrorMessage(error)}</p>
	{/if}
	<noscript><p class="alert alert-warning">{m.location_needs_js()}</p></noscript>

	{#if hasJs}
		<button
			type="button"
			id="use-location"
			class="btn btn-primary mb-2 w-full"
			onclick={useMyLocation}
			disabled={locationState === 'locating'}
		>
			<span aria-hidden="true">📍</span>
			{m.use_my_location()}
		</button>
	{/if}

	<p
		role="status"
		class="my-2 empty:hidden {locationState === 'error' ? 'alert alert-warning' : ''}"
	>
		{#if locationState === 'locating'}
			{m.locating()}
		{:else if locationState === 'error'}
			{m.location_error()}
		{:else if picked}
			<span aria-hidden="true">✅</span> {m.location_set()}
		{/if}
	</p>
	<p class="my-2">{m.location_pick_hint()}</p>

	<MapView label={mapLabel} pickable bind:picked {userPosition} class="h-72" />
	<input type="hidden" name="lat" value={picked?.lat ?? ''} />
	<input type="hidden" name="lng" value={picked?.lng ?? ''} />
</fieldset>
