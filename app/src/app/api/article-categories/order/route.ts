import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { articleCategories } from '@/db/schema';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';

export const runtime = 'edge';

interface UpdateOrderItem {
	id: number;
	order: number;
}

export async function PUT(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureArticleCategoriesTable(env.DB);
		const db = getDb(env.DB);
		const data = (await request.json()) as { updates?: UpdateOrderItem[] };

		if (!data.updates || !Array.isArray(data.updates)) {
			return NextResponse.json({ error: 'updates is required' }, { status: 400 });
		}

		for (const item of data.updates) {
			await db
				.update(articleCategories)
				.set({ sortOrder: item.order })
				.where(eq(articleCategories.id, item.id));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating article category order:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
