import {
	doublePrecision,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core';
import {
	CATEGORIES,
	LISTING_STATUSES,
	REPORT_KINDS,
	SPOT_STATUSES,
	SPOT_VISIT_OUTCOMES
} from '../../domain';

export const categoryEnum = pgEnum('category', CATEGORIES);
export const listingStatusEnum = pgEnum('listing_status', LISTING_STATUSES);
export const reportKindEnum = pgEnum('report_kind', REPORT_KINDS);
export const spotStatusEnum = pgEnum('spot_status', SPOT_STATUSES);
export const spotVisitOutcomeEnum = pgEnum('spot_visit_outcome', SPOT_VISIT_OUTCOMES);

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const listing = pgTable(
	'listing',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		category: categoryEnum('category').notNull(),
		description: text('description').notNull(),
		locationHint: text('location_hint'),
		lat: doublePrecision('lat').notNull(),
		lng: doublePrecision('lng').notNull(),
		status: listingStatusEnum('status').notNull().default('available'),
		createdAt: createdAt(),
		lastConfirmedAt: timestamp('last_confirmed_at', { withTimezone: true }).notNull().defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		goneAt: timestamp('gone_at', { withTimezone: true }),
		/** Random per-browser id from the `anon_id` cookie; used for rate limiting and dedup. */
		anonId: text('anon_id').notNull(),
		/** Set once optional accounts exist. */
		userId: text('user_id')
	},
	(table) => [
		index('listing_active_idx').on(table.status, table.expiresAt),
		index('listing_location_idx').on(table.lat, table.lng),
		index('listing_anon_created_idx').on(table.anonId, table.createdAt)
	]
);

export const report = pgTable(
	'report',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		listingId: uuid('listing_id')
			.notNull()
			.references(() => listing.id, { onDelete: 'cascade' }),
		kind: reportKindEnum('kind').notNull(),
		anonId: text('anon_id').notNull(),
		userId: text('user_id'),
		createdAt: createdAt()
	},
	(table) => [index('report_listing_created_idx').on(table.listingId, table.createdAt)]
);

/** A place where free things show up regularly. */
export const spot = pgTable(
	'spot',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		category: categoryEnum('category').notNull(),
		description: text('description').notNull(),
		/** Free text for now ("in the evening after closing"); may become structured later. */
		whenHint: text('when_hint'),
		lat: doublePrecision('lat').notNull(),
		lng: doublePrecision('lng').notNull(),
		status: spotStatusEnum('status').notNull().default('active'),
		createdAt: createdAt(),
		/** Latest visit where someone found something; `null` until the first one. */
		lastFoundAt: timestamp('last_found_at', { withTimezone: true }),
		closedAt: timestamp('closed_at', { withTimezone: true }),
		anonId: text('anon_id').notNull(),
		userId: text('user_id')
	},
	(table) => [
		index('spot_status_idx').on(table.status),
		index('spot_location_idx').on(table.lat, table.lng),
		index('spot_anon_created_idx').on(table.anonId, table.createdAt)
	]
);

/** One person's "I was there and ..." feedback. Timestamps may later reveal the best hours. */
export const spotVisit = pgTable(
	'spot_visit',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		spotId: uuid('spot_id')
			.notNull()
			.references(() => spot.id, { onDelete: 'cascade' }),
		outcome: spotVisitOutcomeEnum('outcome').notNull(),
		anonId: text('anon_id').notNull(),
		userId: text('user_id'),
		createdAt: createdAt()
	},
	(table) => [index('spot_visit_spot_created_idx').on(table.spotId, table.createdAt)]
);
