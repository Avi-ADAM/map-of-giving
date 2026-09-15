<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<h1 class="text-3xl font-bold">
	{page.status === 404 ? m.error_not_found() : m.error_generic()}
</h1>
<p>
	<a href={href('/')} class="btn btn-primary">{m.back_to_all()}</a>
</p>
