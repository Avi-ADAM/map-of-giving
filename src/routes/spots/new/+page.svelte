<script lang="ts">
	import { enhance } from '$app/forms';
	import CategoryField from '$lib/components/CategoryField.svelte';
	import ErrorSummary from '$lib/components/ErrorSummary.svelte';
	import LocationField from '$lib/components/LocationField.svelte';
	import { CATEGORIES } from '$lib/domain';
	import { fieldErrorMessage } from '$lib/labels';
	import { DESCRIPTION_MAX, HINT_MAX, type FieldError } from '$lib/listing-validation';
	import { m } from '$lib/paraglide/messages.js';

	let { form } = $props();

	let submitting = $state(false);

	const errors = $derived(form?.errors ?? {});
	// Links from the error summary jump to the field that needs fixing.
	const summaryItems = $derived(
		(
			[
				['category', `category-${CATEGORIES[0]}`],
				['location', 'use-location'],
				['description', 'description'],
				['whenHint', 'whenHint']
			] as const
		).flatMap(([field, target]) => {
			const error: FieldError | undefined = errors[field];
			return error ? [{ target, message: fieldErrorMessage(error) }] : [];
		})
	);
</script>

<svelte:head>
	<title>{m.nav_add_spot()} · {m.app_name()}</title>
</svelte:head>

<h1 class="mb-1 text-3xl font-bold">{m.nav_add_spot()}</h1>
<p class="mt-0 mb-5 text-lg">{m.spot_new_intro()}</p>

<ErrorSummary
	result={form}
	items={summaryItems}
	rateLimitedMessage={form?.rateLimited ? m.spot_error_rate_limited() : null}
/>

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
	<CategoryField
		legend="1. {m.spot_field_category()}"
		error={errors.category}
		selected={form?.values?.category}
	/>

	<LocationField
		legend="2. {m.spot_field_location()}"
		mapLabel={m.spot_picker_map_label()}
		error={errors.location}
	/>

	<div class="flex flex-col gap-1">
		<label for="description" class="text-2xl font-bold">3. {m.spot_field_description()}</label>
		<p id="description-hint" class="m-0 text-neutral-700">
			{m.spot_field_description_hint({ max: DESCRIPTION_MAX })}
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
		<label for="whenHint" class="text-xl font-bold">{m.spot_field_when()}</label>
		<p id="whenHint-hint" class="m-0 text-neutral-700">{m.spot_field_when_hint()}</p>
		{#if errors.whenHint}
			<p id="whenHint-error" class="field-error m-0">{fieldErrorMessage(errors.whenHint)}</p>
		{/if}
		<input
			type="text"
			id="whenHint"
			name="whenHint"
			maxlength={HINT_MAX}
			aria-invalid={errors.whenHint ? 'true' : undefined}
			aria-describedby={errors.whenHint ? 'whenHint-error whenHint-hint' : 'whenHint-hint'}
			class="min-h-12 rounded-lg border-2 border-neutral-500 text-lg"
			value={form?.values?.whenHint ?? ''}
		/>
	</div>

	<button type="submit" class="btn btn-accent w-full text-xl" aria-disabled={submitting}>
		{submitting ? m.submitting() : m.spot_submit()}
	</button>
</form>
