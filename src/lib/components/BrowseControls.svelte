<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentPosition } from '$lib/geo';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng } from '$lib/types';

	interface Props {
		view: 'map' | 'list';
		userPosition?: LatLng | null;
	}

	let { view, userPosition = $bindable(null) }: Props = $props();

	let hasJs = $state(false);
	let locationState = $state<'idle' | 'locating' | 'error'>('idle');

	onMount(() => {
		hasJs = true;
	});

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
