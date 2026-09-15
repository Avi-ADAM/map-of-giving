import {
	doublePrecision,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid
} from 'drizzle-orm/pg-core';
import { CATEGORIES, LISTING_STATUSES, REPORT_KINDS } from '../../domain';

export const categoryEnum = pgEnum('category', CATEGORIES);
export const listingStatusEnum = pgEnum('listing_status', LISTING_STATUSES);
export const reportKindEnum = pgEnum('report_kind', REPORT_KINDS);

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
