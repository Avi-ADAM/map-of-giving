import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

// `pglite:<directory>` is the local zero-setup database, see src/lib/server/db/index.ts.
const PGLITE_PREFIX = 'pglite:';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	...(url.startsWith(PGLITE_PREFIX)
		? { driver: 'pglite' as const, dbCredentials: { url: url.slice(PGLITE_PREFIX.length) } }
		: { dbCredentials: { url } }),
	verbose: true,
	strict: true
});
