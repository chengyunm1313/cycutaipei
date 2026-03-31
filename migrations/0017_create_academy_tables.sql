CREATE TABLE IF NOT EXISTS academy_categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE,
	description TEXT,
	image TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active INTEGER DEFAULT 1,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academy_courses (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	excerpt TEXT,
	content TEXT,
	category_id INTEGER REFERENCES academy_categories(id),
	youtube_url TEXT,
	cover_image TEXT,
	speaker TEXT,
	resource_link TEXT,
	is_featured INTEGER DEFAULT 0,
	sort_order INTEGER NOT NULL DEFAULT 0,
	status TEXT DEFAULT 'published',
	post_date TEXT,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_academy_categories_sort_order
	ON academy_categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_academy_courses_category_id
	ON academy_courses(category_id);

CREATE INDEX IF NOT EXISTS idx_academy_courses_status
	ON academy_courses(status);

CREATE INDEX IF NOT EXISTS idx_academy_courses_sort_order
	ON academy_courses(sort_order);
