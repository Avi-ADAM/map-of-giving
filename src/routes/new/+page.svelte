<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import MapView from '$lib/components/MapView.svelte';
	import { CATEGORIES, CATEGORY_EMOJI } from '$lib/domain';
	import { getCurrentPosition } from '$lib/geo';
	import { categoryLabel, fieldErrorMessage } from '$lib/labels';
	import { DESCRIPTION_MAX, HINT_MAX, type FieldError } from '$lib/listing-validation';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng } from '$lib/types';

	let { form } = $props();

	let hasJs = $state(false);
	let picked = $state<LatLng | null>(null);
	let userPosition = $state<LatLng | null>(null);
	let locationState = $state<'idle' | 'locating' | 'error'>('idle');
	let submitting = $state(false);
	let summary = $state<HTMLElement>();

	const errors = $derived(form?.errors ?? {});
	// Links from the error summary jump to the field that needs fixing.
	const summaryItems = $derived(
		(
			[
				['category', `category-${CATEGORIES[0]}`],
				['location', 'use-location'],
				['description', 'description'],
				['locationHint', 'locationHint']
			] as const
		).flatMap(([field, target]) => {
			const error: FieldError | undefined = errors[field];
			return error ? [{ target, message: fieldErrorMessage(error) }] : [];
		})
	);

	onMount(() => {
		hasJs = true;
	});

	$effect(() => {
		if (form?.errors || form?.rateLimited) tick().then(() => summary?.focus());
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

<svelte:head>
	<title>{m.new_title()} · {m.app_name()}</title>
</svelte:head>

<h1 class="mb-1 text-3xl font-bold">{m.new_title()}</h1>
<p class="mt-0 mb-5 text-lg">{m.new_intro()}</p>

{#if form?.rateLimited || summaryItems.length > 0}
	<div
		bind:this={summary}
		tabindex="-1"
		class="alert alert-error mb-5"
		aria-labelledby="error-summary-title"
	>
		{#if form?.rateLimited}
			<p id="error-summary-title" class="m-0">{m.error_rate_limited()}</p>
		{:else}
			<h2 id="error-summary-title" class="m-0 text-xl">{m.error_summary()}</h2>
			<ul class="mb-0">
				{#each summaryItems as item (item.target)}
					<li><a href="#{item.target}" class="text-inherit">{item.message}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<form
	method="POST"
	class="flex flex-col gap-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<fieldset aria-describedby={errors.category ? 'category-error' : undefined}>
		<legend class="mb-2 text-2xl font-bold">1. {m.field_category()}</legend>
		{#if errors.category}
			<p id="category-error" class="field-error mt-0">{fieldErrorMessage(errors.category)}</p>
		{/if}
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each CATEGORIES as category (category)}
				<label
					class="card flex min-h-14 cursor-pointer items-center gap-3 py-2 has-checked:border-brand-800 has-checked:bg-brand-50"
				>
					<input
						type="radio"
						name="category"
						id="category-{category}"
						value={category}
						checked={form?.values?.category === category}
						class="size-6 text-brand-800"
					/>
					<span aria-hidden="true" class="text-3xl">{CATEGORY_EMOJI[category]}</span>
					<span class="text-lg font-semibold">{categoryLabel(category)}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<fieldset aria-describedby={errors.location ? 'location-error' : undefined}>
		<legend class="mb-2 text-2xl font-bold">2. {m.field_location()}</legend>
		{#if errors.location}
			<p id="location-error" class="field-error mt-0">{fieldErrorMessage(errors.location)}</p>
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

		<MapView label={m.picker_map_label()} pickable bind:picked {userPosition} class="h-72" />
		<input type="hidden" name="lat" value={picked?.lat ?? ''} />
		<input type="hidden" name="lng" value={picked?.lng ?? ''} />
	</fieldset>

	<div class="flex flex-col gap-1">
		<label for="description" class="text-2xl font-bold">3. {m.field_description()}</label>
		<p id="description-hint" class="m-0 text-neutral-700">
			{m.field_description_hint({ max: DESCRIPTION_MAX })}
		</p>
		{#if errors.description}
			<p id="description-error" class="field-error m-0">{fieldErrorMessage(errors.description)}</p>
		{/if}
		<textarea
			id="description"
			name="description"
			rows="3"
			maxlength={DESCRIPTION_MAX}
			aria-invalid={errors.description ? 'true' : undefined}
			aria-describedby={errors.description
				? 'description-error description-hint'
				: 'description-hint'}
			class="rounded-lg border-2 border-neutral-500 text-lg"
			value={form?.values?.description ?? ''}></textarea>
	</div>

	<div class="flex flex-col gap-1">
		<label for="locationHint" class="text-xl font-bold">{m.field_hint()}</label>
		<p id="locationHint-hint" class="m-0 text-neutral-700">{m.field_hint_hint()}</p>
		{#if errors.locationHint}
			<p id="locationHint-error" class="field-error m-0">
				{fieldErrorMessage(errors.locationHint)}
			</p>
		{/if}
		<input
			type="text"
			id="locationHint"
			name="locationHint"
			maxlength={HINT_MAX}
			aria-invalid={errors.locationHint ? 'true' : undefined}
			aria-describedby={errors.locationHint
				? 'locationHint-error locationHint-hint'
				: 'locationHint-hint'}
			class="min-h-12 rounded-lg border-2 border-neutral-500 text-lg"
			value={form?.values?.locationHint ?? ''}
		/>
	</div>

	<button type="submit" class="btn btn-accent w-full text-xl" aria-disabled={submitting}>
		{submitting ? m.submitting() : m.submit_listing()}
	</button>
</form>
