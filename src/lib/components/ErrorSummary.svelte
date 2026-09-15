<script lang="ts">
	import { tick } from 'svelte';
	import { m } from '$lib/paraglide/messages.js';

	interface Props {
		/** A new object on every submission, so the summary takes focus again each time. */
		result: object | null | undefined;
		/** Each item links to the field (`target` id) that needs fixing. */
		items: { target: string; message: string }[];
		/** Shown instead of the list when set. */
		rateLimitedMessage?: string | null;
	}

	let { result, items, rateLimitedMessage = null }: Props = $props();

	let summary = $state<HTMLElement>();

	$effect(() => {
		if (result && (rateLimitedMessage || items.length > 0)) tick().then(() => summary?.focus());
	});
</script>

{#if rateLimitedMessage || items.length > 0}
	<div
		bind:this={summary}
		tabindex="-1"
		class="alert alert-error mb-5"
		aria-labelledby="error-summary-title"
	>
		{#if rateLimitedMessage}
			<p id="error-summary-title" class="m-0">{rateLimitedMessage}</p>
		{:else}
			<h2 id="error-summary-title" class="m-0 text-xl">{m.error_summary()}</h2>
			<ul class="mb-0">
				{#each items as item (item.target)}
					<li><a href="#{item.target}" class="text-inherit">{item.message}</a></li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
