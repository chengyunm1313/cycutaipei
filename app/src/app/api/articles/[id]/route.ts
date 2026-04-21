import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { articles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { clampCoverImagePositionY } from '@/lib/coverImagePosition';
import { slugifyAscii } from '@/lib/slug';

export const runtime = 'edge';

/** GET /api/articles/[id] — 取得單篇文章 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const { id } = await params;
		const articleId = Number(id);

		if (isNaN(articleId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const found = await db.select().from(articles).where(eq(articles.id, articleId)).all();

		if (found.length === 0) {
			return NextResponse.json({ error: 'Article not found' }, { status: 404 });
		}

		return NextResponse.json(found[0]);
	} catch (error) {
		console.error('Error fetching article:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** PUT /api/articles/[id] — 更新文章 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const { id } = await params;
		const articleId = Number(id);

		if (isNaN(articleId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const data = (await request.json()) as {
			title?: string;
			slug?: string;
			excerpt?: string;
			content?: string;
			coverImage?: string;
			coverImagePositionY?: number;
			category?: string;
			author?: string;
			status?: 'published' | 'draft';
			seoTitle?: string;
			seoDescription?: string;
			postDate?: string | null;
		};
		const normalizedSlug =
			data.slug === undefined ? undefined : slugifyAscii(data.slug || data.title || '', 'article');

		const updated = await db
			.update(articles)
			.set({
				title: data.title,
				slug: normalizedSlug,
				excerpt: data.excerpt,
				content: data.content,
				coverImage: data.coverImage,
				coverImagePositionY:
					data.coverImagePositionY === undefined
						? undefined
						: clampCoverImagePositionY(data.coverImagePositionY),
				category: data.category,
				author: data.author,
				status: data.status,
				seoTitle: data.seoTitle,
				seoDescription: data.seoDescription,
				postDate: data.postDate ?? null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(articles.id, articleId))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: 'Article not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['articles'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Article PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated[0]);
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error updating article:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** DELETE /api/articles/[id] — 刪除文章 */
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
		const articleId = Number(id);

		if (isNaN(articleId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		await db.delete(articles).where(eq(articles.id, articleId));

		const revalidateResult = triggerSiteRevalidation({ scopes: ['articles'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Article DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting article:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
