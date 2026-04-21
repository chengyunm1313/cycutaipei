CREATE TABLE IF NOT EXISTS article_categories (
	id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE,
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active INTEGER DEFAULT true,
	created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_categories_sort_order
	ON article_categories(sort_order);

UPDATE products
SET slug = 'activity-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE articles
SET slug = 'article-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE categories
SET slug = 'category-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE article_categories
SET slug = 'article-category-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE academy_categories
SET slug = 'academy-category-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE academy_courses
SET slug = 'academy-course-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE pages
SET slug = 'page-' || id
WHERE slug GLOB '*[^ -~]*';

UPDATE site_contents
SET slug = REPLACE(type, '_', '-') || '-' || id
WHERE slug IS NOT NULL
	AND slug GLOB '*[^ -~]*';
