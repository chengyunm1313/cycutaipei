const CREATE_TAGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const CREATE_TAGS_CREATED_AT_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at)
`;

/**
 * 確保 tags 資料表存在，避免舊環境尚未補齊 schema 時 API 直接 500。
 */
export async function ensureTagsTable(db: D1Database) {
	await db.prepare(CREATE_TAGS_TABLE_SQL).run();
	await db.prepare(CREATE_TAGS_CREATED_AT_INDEX_SQL).run();
}
