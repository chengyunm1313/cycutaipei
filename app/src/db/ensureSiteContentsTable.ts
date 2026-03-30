const CREATE_SITE_CONTENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS site_contents (
	id TEXT PRIMARY KEY NOT NULL,
	type TEXT NOT NULL,
	parent_id TEXT,
	title TEXT,
	slug TEXT,
	summary TEXT,
	content TEXT,
	image_url TEXT,
	link_url TEXT,
	extra_json TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active INTEGER DEFAULT 1,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const CREATE_SITE_CONTENTS_TYPE_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_site_contents_type_sort ON site_contents(type, sort_order)
`;

const CREATE_SITE_CONTENTS_PARENT_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_site_contents_parent ON site_contents(parent_id)
`;

/**
 * 確保 site_contents 資料表存在，避免新環境尚未套 migration 時 API 直接 500。
 */
export async function ensureSiteContentsTable(db: D1Database) {
	await db.prepare(CREATE_SITE_CONTENTS_TABLE_SQL).run();
	await db.prepare(CREATE_SITE_CONTENTS_TYPE_INDEX_SQL).run();
	await db.prepare(CREATE_SITE_CONTENTS_PARENT_INDEX_SQL).run();
}
