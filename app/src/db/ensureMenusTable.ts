const CREATE_MENUS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS menus (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	title TEXT NOT NULL,
	url TEXT,
	type TEXT NOT NULL,
	page_id INTEGER,
	position TEXT NOT NULL DEFAULT 'top',
	parent_menu_id INTEGER,
	custom_link TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	target TEXT DEFAULT '_self',
	is_active INTEGER DEFAULT true,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const CREATE_MENUS_SORT_ORDER_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order)
`;

const CREATE_MENUS_POSITION_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_menus_position ON menus(position)
`;

const CREATE_MENUS_PARENT_MENU_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_menus_parent_menu_id ON menus(parent_menu_id)
`;

const CREATE_MENUS_PAGE_ID_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_menus_page_id ON menus(page_id)
`;

const REQUIRED_COLUMNS: Record<string, string> = {
	page_id: 'ALTER TABLE menus ADD COLUMN page_id INTEGER',
	position: `ALTER TABLE menus ADD COLUMN position TEXT NOT NULL DEFAULT 'top'`,
	parent_menu_id: 'ALTER TABLE menus ADD COLUMN parent_menu_id INTEGER',
	custom_link: 'ALTER TABLE menus ADD COLUMN custom_link TEXT',
};

interface TableInfoRow {
	name?: string;
}

async function ensureRequiredColumns(db: D1Database) {
	const tableInfo = await db.prepare('PRAGMA table_info(menus)').all<TableInfoRow>();
	const existingColumns = new Set((tableInfo.results || []).map((row) => row.name).filter(Boolean));

	for (const [column, statement] of Object.entries(REQUIRED_COLUMNS)) {
		if (!existingColumns.has(column)) {
			await db.prepare(statement).run();
		}
	}
}

/**
 * 確保 menus 資料表存在，避免新環境尚未套 migration 時 API 直接 500。
 */
export async function ensureMenusTable(db: D1Database) {
	await db.prepare(CREATE_MENUS_TABLE_SQL).run();
	await ensureRequiredColumns(db);
	await db.prepare(CREATE_MENUS_SORT_ORDER_INDEX_SQL).run();
	await db.prepare(CREATE_MENUS_POSITION_INDEX_SQL).run();
	await db.prepare(CREATE_MENUS_PARENT_MENU_INDEX_SQL).run();
	await db.prepare(CREATE_MENUS_PAGE_ID_INDEX_SQL).run();
}
