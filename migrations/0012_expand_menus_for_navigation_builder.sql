-- 擴充 menus 欄位，支援導覽頁面 Builder（自訂頁連動、位置、父子關係、自訂連結）
ALTER TABLE menus ADD COLUMN page_id INTEGER;
ALTER TABLE menus ADD COLUMN position TEXT NOT NULL DEFAULT 'top';
ALTER TABLE menus ADD COLUMN parent_menu_id INTEGER;
ALTER TABLE menus ADD COLUMN custom_link TEXT;

CREATE INDEX IF NOT EXISTS idx_menus_position ON menus(position);
CREATE INDEX IF NOT EXISTS idx_menus_parent_menu_id ON menus(parent_menu_id);
CREATE INDEX IF NOT EXISTS idx_menus_page_id ON menus(page_id);

-- 將舊有 page 型選單依 url 回填 page_id（找不到則保留 NULL）
UPDATE menus
SET page_id = (
	SELECT id
	FROM pages
	WHERE ('/' || slug) = menus.url
	LIMIT 1
)
WHERE type = 'page'
  AND page_id IS NULL
  AND url IS NOT NULL;
