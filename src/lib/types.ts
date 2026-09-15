import type { Category, ListingStatus } from './domain';

export type LatLng = { lat: number; lng: number };

/** A listing as it is safe to send to the browser (no reporter identifiers). */
export type PublicListing = LatLng & {
	id: string;
	category: Category;
	description: string;
	locationHint: string | null;
	status: ListingStatus;
	createdAt: Date;
	lastConfirmedAt: Date;
	expiresAt: Date;
};

export type MapMarker = LatLng & {
	id: string;
	emoji: string;
	/** Accessible name, also shown in the popup. */
	label: string;
	/** When set, the marker opens a popup linking here. */
	href?: string;
};
