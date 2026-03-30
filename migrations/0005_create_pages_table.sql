-- Migration number: 0005 	 2026-02-21T00:00:00.000Z
-- 建立頁面表
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content_blocks TEXT, -- JSON array of blocks
    in_menu INTEGER DEFAULT 0, -- 0 or 1
    status TEXT DEFAULT 'published',
    seo_title TEXT,
    seo_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
