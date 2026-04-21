import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { slugifyAscii } from '@/lib/slug';

export const runtime = 'edge';

/** GET /api/categories/[id] — 取得單一分類 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const found = await db.select().from(categories).where(eq(categories.id, categoryId)).all();

		if (found.length === 0) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		return NextResponse.json(found[0]);
	} catch (error) {
		console.error('Error fetching category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** PUT /api/categories/[id] — 更新分類 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const data = (await request.json()) as {
			name?: string;
			slug?: string;
			description?: string;
			image?: string;
			coverImage?: string;
			carouselImages?: string;
			sortOrder?: number;
			isActive?: boolean;
			parentId?: number | null;
		};
		const normalizedSlug =
			data.slug === undefined ? undefined : slugifyAscii(data.slug || data.name || '', 'category');

		const updated = await db
			.update(categories)
			.set({
				...data,
				slug: normalizedSlug,
			})
			.where(eq(categories.id, categoryId))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['categories'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Category PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated[0]);
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** DELETE /api/categories/[id] — 刪除分類 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		await db.delete(categories).where(eq(categories.id, categoryId));

		const revalidateResult = triggerSiteRevalidation({ scopes: ['categories'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Category DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
