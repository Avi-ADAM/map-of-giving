<script lang="ts">
	import { CATEGORY_EMOJI } from '$lib/domain';
	import { formatDistance, relativeTime } from '$lib/format';
	import { href } from '$lib/i18n';
	import { categoryLabel } from '$lib/labels';
	import { m } from '$lib/paraglide/messages.js';
	import type { PublicListing } from '$lib/types';

	interface Props {
		listing: PublicListing;
		now: number;
		distance?: number | null;
	}

	let { listing, now, distance = null }: Props = $props();
</script>

<article class="card relative flex flex-col gap-1 hover:border-brand-800">
	<p class="m-0 flex items-center gap-2 font-semibold text-brand-900">
		<span aria-hidden="true" class="text-3xl">{CATEGORY_EMOJI[listing.category]}</span>
		{categoryLabel(listing.category)}
	</p>
	<h3 class="m-0 text-xl font-bold">
		<!-- The link covers the whole card for a big tap target. -->
		<a href={href(`/listing/${listing.id}`)} class="text-neutral-950 after:absolute after:inset-0">
			{listing.description}
		</a>
	</h3>
	{#if listing.locationHint}
		<p class="m-0">{m.hint_label()} {listing.locationHint}</p>
	{/if}
	<p class="m-0 text-neutral-700">
		{#if distance !== null}
			<strong class="text-neutral-950"
				>{m.distance_away({ distance: formatDistance(distance) })}</strong
			>
			·
		{/if}
		{m.posted_ago({ time: relativeTime(listing.createdAt, now) })}
	</p>
</article>
