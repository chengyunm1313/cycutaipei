import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export type Env = {
	DB: D1Database;
	BUCKET: R2Bucket;
};

// 用於 Cloudflare Worker / Pages Function 的 Context
export function getDb(db: D1Database) {
	return drizzle(db, { schema });
}
