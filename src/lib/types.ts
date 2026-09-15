import type { Category, ListingStatus, SpotStatus } from './domain';
import type { VisitCounts } from './spot-rating';

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

/** A hot spot as it is safe to send to the browser, with its recent visit counts. */
export type PublicSpot = LatLng & {
	id: string;
	category: Category;
	description: string;
	whenHint: string | null;
	status: SpotStatus;
	createdAt: Date;
	lastFoundAt: Date | null;
	visits: VisitCounts;
};

export type MapMarker = LatLng & {
	id: string;
	emoji: string;
	/** Accessible name, also shown in the popup. */
	label: string;
	/** When set, the marker opens a popup linking here. */
	href?: string;
};
