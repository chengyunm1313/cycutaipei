import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { eq, ne } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { articleCategories, articles } from '@/db/schema';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';

export const runtime = 'edge';

interface UpdateArticleCategoryPayload {
	name?: string;
	slug?: string;
	sortOrder?: number;
	isActive?: boolean;
}

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureArticleCategoriesTable(env.DB);
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);
		if (Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const payload = (await request.json()) as UpdateArticleCategoryPayload;
		const found = await db
			.select()
			.from(articleCategories)
			.where(eq(articleCategories.id, categoryId))
			.limit(1);
		if (found.length === 0) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		const current = found[0];
		const nextName = payload.name?.trim() || current.name;
		const nextSlug = (payload.slug?.trim() || slugify(nextName) || current.slug).trim();

		const duplicateName = await db
			.select()
			.from(articleCategories)
			.where(ne(articleCategories.id, categoryId))
			.all();
		if (duplicateName.some((c) => c.name === nextName)) {
			return NextResponse.json({ error: '分類名稱已存在' }, { status: 409 });
		}
		if (duplicateName.some((c) => c.slug === nextSlug)) {
			return NextResponse.json({ error: '分類 slug 已存在' }, { status: 409 });
		}

		const updated = await db
			.update(articleCategories)
			.set({
				name: nextName,
				slug: nextSlug,
				sortOrder: payload.sortOrder ?? current.sortOrder,
				isActive: payload.isActive ?? current.isActive,
			})
			.where(eq(articleCategories.id, categoryId))
			.returning();

		if (nextName !== current.name) {
			await db
				.update(articles)
				.set({ category: nextName, updatedAt: new Date().toISOString() })
				.where(eq(articles.category, current.name));
		}

		return NextResponse.json(updated[0]);
	} catch (error) {
		console.error('Error updating article category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureArticleCategoriesTable(env.DB);
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);
		if (Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const found = await db
			.select()
			.from(articleCategories)
			.where(eq(articleCategories.id, categoryId))
			.limit(1);
		if (found.length === 0) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		const categoryName = found[0].name;
		await db.delete(articleCategories).where(eq(articleCategories.id, categoryId));
		await db
			.update(articles)
			.set({ category: null, updatedAt: new Date().toISOString() })
			.where(eq(articles.category, categoryName));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting article category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
