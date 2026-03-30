import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { articleCategories } from '@/db/schema';
import { ensureArticleCategoriesTable } from '@/db/ensureArticleCategoriesTable';

export const runtime = 'edge';

interface ArticleCategoryPayload {
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

async function ensureDefaultArticleCategories(db: ReturnType<typeof getDb>) {
	const existing = await db.select().from(articleCategories).all();
	const defaults = [
		{ name: '會務公告', slug: 'association-announcement', sortOrder: 20, isActive: true },
		{ name: '活動報導', slug: 'event-report', sortOrder: 10, isActive: true },
		{ name: '最新消息', slug: 'latest-news', sortOrder: 0, isActive: true },
	];

	// 舊版誤植預設值（分類一/分類二）若存在，先清除再補上正式分類
	const isLegacyPlaceholderOnly =
		existing.length > 0 && existing.every((item) => ['分類一', '分類二'].includes(item.name));
	if (isLegacyPlaceholderOnly) {
		await db.delete(articleCategories).all();
	}

	const latest = isLegacyPlaceholderOnly ? [] : existing;
	const existingNames = new Set(latest.map((item) => item.name));
	const existingSlugs = new Set(latest.map((item) => item.slug));
	for (const item of defaults) {
		if (existingNames.has(item.name) || existingSlugs.has(item.slug)) continue;
		await db.insert(articleCategories).values(item).onConflictDoNothing();
	}
}

export async function GET(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureArticleCategoriesTable(env.DB);
		const db = getDb(env.DB);
		await ensureDefaultArticleCategories(db);

		const searchParams = request.nextUrl.searchParams;
		const active = searchParams.get('active');

		const rows = active === '1'
			? await db
					.select()
					.from(articleCategories)
					.where(eq(articleCategories.isActive, true))
					.orderBy(desc(articleCategories.sortOrder), desc(articleCategories.id))
					.all()
			: await db
					.select()
					.from(articleCategories)
					.orderBy(desc(articleCategories.sortOrder), desc(articleCategories.id))
					.all();

		return NextResponse.json(rows);
	} catch (error) {
		console.error('Error fetching article categories:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		await ensureArticleCategoriesTable(env.DB);
		const db = getDb(env.DB);
		const data = (await request.json()) as ArticleCategoryPayload;

		if (!data.name?.trim()) {
			return NextResponse.json({ error: 'name is required' }, { status: 400 });
		}

		const name = data.name.trim();
		const slug = (data.slug || slugify(name)).trim();
		if (!slug) {
			return NextResponse.json({ error: 'slug is required' }, { status: 400 });
		}

		const existingByName = await db
			.select()
			.from(articleCategories)
			.where(eq(articleCategories.name, name))
			.limit(1);
		if (existingByName.length > 0) {
			return NextResponse.json({ error: '分類名稱已存在' }, { status: 409 });
		}

		const existingBySlug = await db
			.select()
			.from(articleCategories)
			.where(eq(articleCategories.slug, slug))
			.limit(1);
		if (existingBySlug.length > 0) {
			return NextResponse.json({ error: '分類 slug 已存在' }, { status: 409 });
		}

		const created = await db
			.insert(articleCategories)
			.values({
				name,
				slug,
				sortOrder: data.sortOrder ?? 0,
				isActive: data.isActive !== false,
			})
			.returning();

		return NextResponse.json(created[0], { status: 201 });
	} catch (error) {
		console.error('Error creating article category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
