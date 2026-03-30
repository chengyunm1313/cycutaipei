import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { articles } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

// 文章資料的型別定義
interface ArticleInput {
	title: string;
	slug: string;
	excerpt?: string;
	content?: string;
	coverImage?: string;
	category?: string;
	author?: string;
	status?: 'published' | 'draft';
	seoTitle?: string;
	seoDescription?: string;
}

export async function GET(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const searchParams = request.nextUrl.searchParams;
		const status = searchParams.get('status');
		const slug = searchParams.get('slug');

		const allArticles = await db.select().from(articles).orderBy(desc(articles.createdAt)).all();

		// 若有 slug 參數，回傳單篇文章
		if (slug) {
			const found = allArticles.find((a) => a.slug === slug);
			if (!found) {
				return NextResponse.json({ error: 'Article not found' }, { status: 404 });
			}
			return NextResponse.json(found);
		}

		const filtered = status ? allArticles.filter((a) => a.status === status) : allArticles;

		return NextResponse.json(filtered);
	} catch (error) {
		console.error('Error fetching articles:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as ArticleInput;

		if (!data.title || !data.slug) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newArticle = await db
			.insert(articles)
			.values({
				title: data.title,
				slug: data.slug,
				excerpt: data.excerpt,
				content: data.content,
				coverImage: data.coverImage,
				category: data.category,
				author: data.author || 'Admin',
				status: data.status || 'draft',
				seoTitle: data.seoTitle,
				seoDescription: data.seoDescription,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['articles'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Article POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(newArticle[0], { status: 201 });
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error creating article:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
