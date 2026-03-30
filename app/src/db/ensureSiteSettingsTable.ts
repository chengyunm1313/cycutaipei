const CREATE_SITE_SETTINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS site_settings (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	site_name TEXT NOT NULL DEFAULT '產品型錄平台',
	site_title TEXT,
	logo_url TEXT,
	footer_logo_url TEXT,
	favicon_url TEXT,
	social_share_image_url TEXT,
	meta_description TEXT,
	meta_keywords TEXT,
	tax_id TEXT,
	phone TEXT,
	fax TEXT,
	address TEXT,
	email TEXT,
	facebook_url TEXT,
	instagram_url TEXT,
	youtube_url TEXT,
	line_url TEXT,
	copyright TEXT,
	enquiry_subjects TEXT,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const INSERT_DEFAULT_SITE_SETTINGS_SQL = `
INSERT OR IGNORE INTO site_settings (
	id,
	site_name,
	site_title,
	meta_description,
	meta_keywords
) VALUES (
	1,
	'產品型錄平台',
	'產品型錄平台 | 專業工業產品目錄',
	'提供最完整的工業產品型錄，涵蓋電子零件、機械設備、測量儀器與包裝材料。',
	'產品型錄,工業產品,電子零件,機械設備,測量儀器'
)
`;

/**
 * 確保 site_settings 資料表與預設資料存在，避免新環境尚未套 migration 時 API 直接 500。
 */
export async function ensureSiteSettingsTable(db: D1Database) {
	await db.prepare(CREATE_SITE_SETTINGS_TABLE_SQL).run();
	await db.prepare(INSERT_DEFAULT_SITE_SETTINGS_SQL).run();
}
