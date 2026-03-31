import { getRequestContext } from '@cloudflare/next-on-pages';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

export async function PUT(request: Request) {
	try {
		const { env } = getRequestContext();
		const body = (await request.json()) as { updates?: { id: number; order: number }[] };

		if (!body.updates || !Array.isArray(body.updates)) {
			return Response.json({ error: 'Missing or invalid updates array' }, { status: 400 });
		}

		const statements = body.updates.map((update) =>
			env.DB.prepare(`UPDATE academy_categories SET sort_order = ? WHERE id = ?`).bind(
				update.order,
				update.id
			)
		);

		if (statements.length > 0) {
			await env.DB.batch(statements);
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['academyCategories', 'academy'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Academy category order revalidate warnings:', revalidateResult.errors);
		}

		return Response.json({ success: true });
	} catch (error) {
		console.error('Failed to update academy category order:', error);
		return Response.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
