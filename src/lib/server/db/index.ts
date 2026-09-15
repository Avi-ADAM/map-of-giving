import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

export type Database = NeonHttpDatabase<typeof schema>;

const PGLITE_PREFIX = 'pglite:';

/**
 * `DATABASE_URL` is either a Postgres URL (Neon in production) or `pglite:<directory>`
 * for a zero-setup local database that runs inside the Node process.
 */
async function connect(): Promise<Database> {
	const url = env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');
	if (!url.startsWith(PGLITE_PREFIX)) return drizzle(neon(url), { schema });

	const [{ mkdir }, { PGlite }, { drizzle: drizzlePglite }, { migrate }] = await Promise.all([
		import('node:fs/promises'),
		import('@electric-sql/pglite'),
		import('drizzle-orm/pglite'),
		import('drizzle-orm/pglite/migrator')
	]);
	const directory = url.slice(PGLITE_PREFIX.length);
	// PGlite creates its own directory but not missing parents like `.data/`.
	await mkdir(directory, { recursive: true });
	const database = drizzlePglite(new PGlite(directory), { schema });
	await migrate(database, { migrationsFolder: 'drizzle' });
	// Both drivers expose the same query builder; we type against the production one.
	return database as unknown as Database;
}

// Cached on globalThis so Vite hot reloads don't open the local database twice.
const cache = globalThis as typeof globalThis & { __mapOfGivingDb?: Promise<Database> };

export function getDb(): Promise<Database> {
	cache.__mapOfGivingDb ??= connect().catch((error) => {
		cache.__mapOfGivingDb = undefined;
		throw error;
	});
	return cache.__mapOfGivingDb;
}
