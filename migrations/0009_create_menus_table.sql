-- 建立導覽列選單資料表（若已存在則略過）
CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT,
    type TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    target TEXT DEFAULT '_self',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);
