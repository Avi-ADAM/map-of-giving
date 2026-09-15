<script lang="ts">
	import { onMount } from 'svelte';
	import type * as Leaflet from 'leaflet';
	import { m } from '$lib/paraglide/messages.js';
	import type { LatLng, MapMarker } from '$lib/types';

	interface Props {
		/** Accessible name of the map region. */
		label: string;
		markers?: MapMarker[];
		/** Location picker mode: tapping the map or dragging the pin updates `picked`. */
		pickable?: boolean;
		picked?: LatLng | null;
		userPosition?: LatLng | null;
		class?: string;
	}

	let {
		label,
		markers = [],
		pickable = false,
		picked = $bindable(null),
		userPosition = null,
		class: className = ''
	}: Props = $props();

	const DEFAULT_CENTER: [number, number] = [31.5, 34.9];
	const DEFAULT_ZOOM = 7;
	const CLOSE_ZOOM = 16;

	let container = $state<HTMLDivElement>();
	// Leaflet is loaded lazily so pages stay light until a map is actually shown.
	let L = $state.raw<typeof Leaflet | null>(null);
	let map = $state.raw<Leaflet.Map | null>(null);
	let status = $state<'loading' | 'ready' | 'failed'>('loading');

	onMount(() => {
		let cancelled = false;
		let instance: Leaflet.Map | undefined;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
			.then(([module]) => {
				if (cancelled || !container) return;
				const leaflet = (module as unknown as { default?: typeof Leaflet }).default ?? module;
				instance = leaflet
					.map(container, {
						zoomAnimation: !reducedMotion,
						fadeAnimation: !reducedMotion,
						markerZoomAnimation: !reducedMotion
					})
					.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
				leaflet
					.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
						maxZoom: 19,
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
					})
					.addTo(instance);
				if (pickable) {
					instance.on('click', (event) => {
						picked = { lat: event.latlng.lat, lng: event.latlng.lng };
					});
				}
				L = leaflet;
				map = instance;
				status = 'ready';
			})
			.catch(() => {
				status = 'failed';
			});

		return () => {
			cancelled = true;
			instance?.remove();
		};
	});

	function emojiIcon(leaflet: typeof Leaflet, emoji: string, pin = false) {
		return leaflet.divIcon({
			className: pin ? 'emoji-marker pin' : 'emoji-marker',
			html: `<span aria-hidden="true">${emoji}</span>`,
			iconSize: [44, 44],
			iconAnchor: pin ? [22, 44] : [22, 22],
			popupAnchor: [0, -22]
		});
	}

	function popupContent(item: MapMarker & { href: string }) {
		const root = document.createElement('div');
		root.className = 'map-popup';
		root.dir = document.documentElement.dir;
		const text = document.createElement('p');
		text.textContent = item.label;
		const link = document.createElement('a');
		link.href = item.href;
		link.className = 'btn btn-primary';
		link.textContent = m.details_link();
		root.append(text, link);
		return root;
	}

	function createMarker(leaflet: typeof Leaflet, item: MapMarker) {
		const interactive = Boolean(item.href);
		const marker = leaflet.marker([item.lat, item.lng], {
			icon: emojiIcon(leaflet, item.emoji),
			title: item.label,
			interactive,
			keyboard: interactive
		});
		marker.on('add', () => marker.getElement()?.setAttribute('aria-label', item.label));
		if (item.href) {
			const target = { ...item, href: item.href };
			marker.bindPopup(() => popupContent(target));
			// Move keyboard focus into the popup, and back to the marker when it closes.
			marker.on('popupopen', (event) =>
				event.popup.getElement()?.querySelector('a')?.focus({ preventScroll: true })
			);
			marker.on('popupclose', () => {
				if (document.activeElement === document.body) marker.getElement()?.focus();
			});
		}
		return marker;
	}

	let fitted = false;
	$effect(() => {
		if (!L || !map) return;
		const leaflet = L;
		const instance = map;
		const layer = leaflet
			.layerGroup(markers.map((item) => createMarker(leaflet, item)))
			.addTo(instance);

		if (!fitted && markers.length > 0) {
			fitted = true;
			if (markers.length === 1) {
				instance.setView([markers[0].lat, markers[0].lng], CLOSE_ZOOM);
			} else {
				const bounds = leaflet.latLngBounds(markers.map((item) => [item.lat, item.lng]));
				instance.fitBounds(bounds, { padding: [32, 32], maxZoom: CLOSE_ZOOM });
			}
		}

		return () => layer.remove();
	});

	let pin: Leaflet.Marker | null = null;
	$effect(() => {
		if (!L || !map || !pickable) return;
		const target = picked;
		if (!target) {
			pin?.remove();
			pin = null;
			return;
		}
		if (pin) {
			pin.setLatLng([target.lat, target.lng]);
			return;
		}
		const marker = L.marker([target.lat, target.lng], {
			icon: emojiIcon(L, '📍', true),
			draggable: true,
			keyboard: true,
			title: label
		}).addTo(map);
		marker.on('dragend', () => {
			const { lat, lng } = marker.getLatLng();
			picked = { lat, lng };
		});
		pin = marker;
	});

	$effect(() => {
		if (!L || !map || !userPosition) return;
		const instance = map;
		const dot = L.circleMarker([userPosition.lat, userPosition.lng], {
			radius: 9,
			color: '#fff',
			weight: 3,
			fillColor: '#1d4ed8',
			fillOpacity: 1,
			interactive: false
		}).addTo(instance);
		instance.setView(
			[userPosition.lat, userPosition.lng],
			Math.max(instance.getZoom(), CLOSE_ZOOM - 1)
		);
		return () => dot.remove();
	});
</script>

<div class="relative overflow-hidden rounded-xl border-2 border-neutral-500 {className}">
	<div bind:this={container} dir="ltr" role="region" aria-label={label} class="h-full w-full"></div>
	{#if status !== 'ready'}
		<p
			class="absolute inset-0 m-0 flex items-center justify-center bg-neutral-100 p-4 text-center"
			role="status"
		>
			{status === 'failed' ? m.map_failed() : m.map_loading()}
		</p>
	{/if}
</div>
