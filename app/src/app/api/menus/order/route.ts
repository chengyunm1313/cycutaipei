import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { menus } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

export async function PUT(request: Request) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return Response.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureMenusTable(env.DB);
		const db = getDb(env.DB);
		const body = (await request.json()) as { updates?: { id: number; order: number }[] };

		if (!body.updates || !Array.isArray(body.updates)) {
			return Response.json({ error: 'Missing or invalid updates array' }, { status: 400 });
		}

		// Drizzle D1 doesn't have a built-in batch api that takes arbitrary queries like this easily without raw SQL batch,
		// but we can execute them sequentially since there's generally < 20 menus.
		for (const update of body.updates) {
			await db.update(menus).set({ sortOrder: update.order }).where(eq(menus.id, update.id)).run();
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['menus'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Menu order revalidate warnings:', revalidateResult.errors);
		}

		return Response.json({ success: true });
	} catch (error) {
		console.error('Failed to update menu order:', error);
		return Response.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
