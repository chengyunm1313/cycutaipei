-- 建立網站資訊設定表（單筆設定）
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
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 預設寫入第一筆網站設定
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
);
