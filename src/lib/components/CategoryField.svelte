<script lang="ts">
	import { CATEGORIES, CATEGORY_EMOJI } from '$lib/domain';
	import { categoryLabel, fieldErrorMessage } from '$lib/labels';
	import type { FieldError } from '$lib/listing-validation';

	interface Props {
		legend: string;
		error?: FieldError;
		selected?: string;
	}

	let { legend, error, selected }: Props = $props();
</script>

<!-- The error summary links to the first radio, `category-${CATEGORIES[0]}`. -->
<fieldset aria-describedby={error ? 'category-error' : undefined}>
	<legend class="mb-2 text-2xl font-bold">{legend}</legend>
	{#if error}
		<p id="category-error" class="field-error mt-0">{fieldErrorMessage(error)}</p>
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
					checked={selected === category}
					class="size-6 text-brand-800"
				/>
				<span aria-hidden="true" class="text-3xl">{CATEGORY_EMOJI[category]}</span>
				<span class="text-lg font-semibold">{categoryLabel(category)}</span>
			</label>
		{/each}
	</div>
</fieldset>
