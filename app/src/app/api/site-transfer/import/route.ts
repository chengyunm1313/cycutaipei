import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { ensureSiteSettingsTable } from '@/db/ensureSiteSettingsTable';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import {
	importSnapshotToDb,
	SnapshotImportError,
} from '@/lib/site-transfer/importSnapshot';
import type {
	SiteImportOptionsPayload,
	SiteSnapshotPayload,
} from '@/lib/site-transfer/types';

export const runtime = 'edge';

interface ImportRequestBody {
	payload?: SiteSnapshotPayload;
	options?: SiteImportOptionsPayload;
}

export async function POST(request: NextRequest) {
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

		const body = (await request.json().catch(() => ({}))) as ImportRequestBody;
		if (!body.payload) {
			return NextResponse.json({ error: 'payload is required' }, { status: 400 });
		}

		const result = await importSnapshotToDb({
			db: env.DB,
			payload: body.payload,
			options: body.options,
		});

		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof SnapshotImportError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error('Error in POST /api/site-transfer/import:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
