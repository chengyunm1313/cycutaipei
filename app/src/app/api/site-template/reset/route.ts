import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { ensureSiteSettingsTable } from '@/db/ensureSiteSettingsTable';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import { buildInitialSiteSnapshot } from '@/lib/site-template/buildSnapshot';
import {
	importSnapshotToDb,
	SnapshotImportError,
} from '@/lib/site-transfer/importSnapshot';

export const runtime = 'edge';

export async function POST() {
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

		const payload = buildInitialSiteSnapshot();
		const result = await importSnapshotToDb({
			db: env.DB,
			payload,
			options: { mode: 'full' },
		});

		return NextResponse.json({
			...result,
			templateId: 'system-initial-state',
			action: 'reset',
		});
	} catch (error) {
		if (error instanceof SnapshotImportError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error('Error in POST /api/site-template/reset:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
