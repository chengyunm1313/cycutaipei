import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { ensureSiteSettingsTable } from '@/db/ensureSiteSettingsTable';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import { buildSiteTemplateSnapshot } from '@/lib/site-template/buildSnapshot';
import { getSiteTemplateMetaList } from '@/lib/site-template/templates';
import {
	importSnapshotToDb,
	SnapshotImportError,
} from '@/lib/site-transfer/importSnapshot';

export const runtime = 'edge';

interface ApplyTemplateRequestBody {
	templateId?: unknown;
}

export async function GET() {
	try {
		return NextResponse.json({
			templates: getSiteTemplateMetaList(),
		});
	} catch (error) {
		console.error('Error in GET /api/site-template:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
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

		const body = (await request.json().catch(() => ({}))) as ApplyTemplateRequestBody;
		if (typeof body.templateId !== 'string' || !body.templateId.trim()) {
			return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
		}

		const templateId = body.templateId.trim();
		const payload = buildSiteTemplateSnapshot(templateId);
		if (!payload) {
			return NextResponse.json({ error: `Template not found: ${templateId}` }, { status: 400 });
		}

		const result = await importSnapshotToDb({
			db: env.DB,
			payload,
			options: { mode: 'full' },
		});

		return NextResponse.json({
			...result,
			templateId,
		});
	} catch (error) {
		if (error instanceof SnapshotImportError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		console.error('Error in POST /api/site-template:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
