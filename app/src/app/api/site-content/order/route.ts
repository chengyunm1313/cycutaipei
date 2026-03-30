import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

interface OrderPayload {
	updates?: { id: string; order: number }[];
}

export async function PUT(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureSiteContentsTable(env.DB);
		const body = (await request.json()) as OrderPayload;

		if (!body.updates || !Array.isArray(body.updates)) {
			return NextResponse.json({ error: 'Missing or invalid updates array' }, { status: 400 });
		}

		for (const item of body.updates) {
			await env.DB
				.prepare('UPDATE site_contents SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
				.bind(item.order, item.id)
				.run();
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['siteContent'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Site content order revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Failed to update site content order:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
