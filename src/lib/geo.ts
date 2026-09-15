import type { LatLng } from './types';

const EARTH_RADIUS_M = 6_371_000;

/** Great-circle distance in meters (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLng = toRad(b.lng - a.lng);
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function getCurrentPosition(): Promise<LatLng> {
	return new Promise((resolve, reject) => {
		if (!('geolocation' in navigator)) {
			reject(new Error('Geolocation is not supported'));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
			reject,
			{ enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
		);
	});
}

export const googleMapsUrl = ({ lat, lng }: LatLng) =>
	`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const wazeUrl = ({ lat, lng }: LatLng) =>
	`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
