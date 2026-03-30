import { getRequestContext } from '@cloudflare/next-on-pages';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

// 假設：未來有需要修改 order 或 batch 操作都可以在這裡處理
export async function PUT(request: Request) {
	try {
		const { env } = getRequestContext();
		const body = (await request.json()) as { updates?: { id: number; order: number }[] };

		if (!body.updates || !Array.isArray(body.updates)) {
			return Response.json({ error: 'Missing or invalid updates array' }, { status: 400 });
		}

		// Prepare batch statements
		// Note: D1支援 batch execution 來加速多筆更新
		const statements = body.updates.map((update) => {
			return env.DB.prepare(`UPDATE categories SET sort_order = ? WHERE id = ?`).bind(
				update.order,
				update.id
			);
		});

		if (statements.length > 0) {
			await env.DB.batch(statements);
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['categories'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Category order revalidate warnings:', revalidateResult.errors);
		}

		return Response.json({ success: true });
	} catch (error) {
		console.error('Failed to update category order:', error);
		return Response.json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
