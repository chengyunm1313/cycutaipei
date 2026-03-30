const CREATE_ARTICLE_CATEGORIES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS article_categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active INTEGER DEFAULT true,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const CREATE_ARTICLE_CATEGORIES_SORT_ORDER_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_article_categories_sort_order ON article_categories(sort_order)
`;

/**
 * 確保 article_categories 資料表存在，避免新環境尚未套 migration 時 API 直接 500。
 */
export async function ensureArticleCategoriesTable(db: D1Database) {
	await db.prepare(CREATE_ARTICLE_CATEGORIES_TABLE_SQL).run();
	await db.prepare(CREATE_ARTICLE_CATEGORIES_SORT_ORDER_INDEX_SQL).run();
}
