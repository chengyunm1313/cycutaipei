import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { ensureSiteSettingsTable } from '@/db/ensureSiteSettingsTable';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';
import { ensureTagsTable } from '@/db/ensureTagsTable';

export const runtime = 'edge';

type SqlRecord = Record<string, unknown>;

async function queryAll<T extends SqlRecord>(db: D1Database, sql: string): Promise<T[]> {
	const { results } = await db.prepare(sql).all<T>();
	return results || [];
}

function buildSnapshotFileName(exportedAt: string): string {
	const compact = exportedAt.replace(/[-:TZ.]/g, '').slice(0, 14);
	return `site-snapshot-${compact || Date.now()}.json`;
}

export async function GET() {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureMenusTable(env.DB);
		await ensureSiteSettingsTable(env.DB);
		await ensureSiteContentsTable(env.DB);
		await ensureArticleCategoriesTable(env.DB);
		await ensureTagsTable(env.DB);

		const [
			siteSettingsRows,
			categories,
			products,
			articles,
			articleCategories,
			tags,
			pages,
			menus,
			siteContents,
		] = await Promise.all([
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM site_settings WHERE id = 1 LIMIT 1'),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM products ORDER BY sort_order ASC, id ASC'),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM articles ORDER BY created_at DESC, id DESC'),
			queryAll<SqlRecord>(
				env.DB,
				'SELECT * FROM article_categories ORDER BY sort_order DESC, id DESC'
			),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM tags ORDER BY id ASC'),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM pages ORDER BY id ASC'),
			queryAll<SqlRecord>(env.DB, 'SELECT * FROM menus ORDER BY sort_order ASC, id ASC'),
			queryAll<SqlRecord>(
				env.DB,
				'SELECT * FROM site_contents ORDER BY type ASC, sort_order ASC, created_at DESC'
			),
		]);

		const exportedAt = new Date().toISOString();
		const payload = {
			version: '1.0.0',
			exportedAt,
			data: {
				site_settings: siteSettingsRows[0] || null,
				categories,
				products,
				articles,
				article_categories: articleCategories,
				tags,
				pages,
				menus,
				site_contents: siteContents,
			},
		};

		return NextResponse.json(payload, {
			headers: {
				'Cache-Control': 'no-store',
				'Content-Disposition': `attachment; filename="${buildSnapshotFileName(exportedAt)}"`,
			},
		});
	} catch (error) {
		console.error('Error in GET /api/site-transfer/export:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
