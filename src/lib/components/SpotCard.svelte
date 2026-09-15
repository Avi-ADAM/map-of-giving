<script lang="ts">
	import { CATEGORY_EMOJI } from '$lib/domain';
	import { formatDistance, relativeTime } from '$lib/format';
	import { href } from '$lib/i18n';
	import { categoryLabel, SPOT_VERDICT_EMOJI, verdictLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import { spotVerdict } from '$lib/spot-rating';
	import type { PublicSpot } from '$lib/types';

	interface Props {
		spot: PublicSpot;
		now: number;
		distance?: number | null;
	}

	let { spot, now, distance = null }: Props = $props();

	const verdict = $derived(spotVerdict(spot.visits));
</script>

<article class="card relative flex flex-col gap-1 hover:border-brand-800">
	<p class="m-0 flex items-center gap-2 font-semibold text-brand-900">
		<span aria-hidden="true" class="text-3xl">{CATEGORY_EMOJI[spot.category]}</span>
		{categoryLabel(spot.category)}
	</p>
	<h3 class="m-0 text-xl font-bold">
		<!-- The link covers the whole card for a big tap target. -->
		<a href={href(`/spots/${spot.id}`)} class="text-neutral-950 after:absolute after:inset-0">
			{spot.description}
		</a>
	</h3>
	{#if spot.whenHint}
		<p class="m-0">{m.spot_when_label()} {spot.whenHint}</p>
	{/if}
	<p class="m-0 font-semibold">
		<span aria-hidden="true">{SPOT_VERDICT_EMOJI[verdict]}</span>
		{verdictLabel(verdict)}
	</p>
	{#if distance !== null || spot.lastFoundAt}
		<p class="m-0 text-neutral-700">
			{#if distance !== null}
				<strong class="text-neutral-950"
					>{m.distance_away({ distance: formatDistance(distance) })}</strong
				>
			{/if}
			{#if distance !== null && spot.lastFoundAt}·{/if}
			{#if spot.lastFoundAt}
				{m.spot_last_found({ time: relativeTime(spot.lastFoundAt, now) })}
			{/if}
		</p>
	{/if}
</article>
