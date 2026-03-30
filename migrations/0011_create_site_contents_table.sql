-- 建立網站內容管理通用資料表
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
);

CREATE INDEX IF NOT EXISTS idx_site_contents_type_sort ON site_contents(type, sort_order);
CREATE INDEX IF NOT EXISTS idx_site_contents_parent ON site_contents(parent_id);
