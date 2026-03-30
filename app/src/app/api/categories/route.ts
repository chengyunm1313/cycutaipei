import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { categories } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

interface CategoryInput {
	name: string;
	slug: string;
	description?: string;
	image?: string;
	coverImage?: string;
	carouselImages?: string; // JSON array string
	sortOrder?: number;
	isActive?: boolean;
	parentId?: number | null;
}

export async function GET(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const searchParams = request.nextUrl.searchParams;
		const slug = searchParams.get('slug');

		const allCategories = await db
			.select()
			.from(categories)
			.orderBy(asc(categories.sortOrder), desc(categories.createdAt))
			.all();

		if (slug) {
			const found = allCategories.find((c) => c.slug === slug);
			if (!found) {
				return NextResponse.json({ error: 'Category not found' }, { status: 404 });
			}
			return NextResponse.json(found);
		}

		return NextResponse.json(allCategories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as CategoryInput;

		if (!data.name || !data.slug) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newCategory = await db
			.insert(categories)
			.values({
				name: data.name,
				slug: data.slug,
				description: data.description,
				image: data.image,
				coverImage: data.coverImage,
				carouselImages: data.carouselImages,
				sortOrder: data.sortOrder ?? 0,
				isActive: data.isActive ?? true,
				parentId: data.parentId,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['categories'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Category POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(newCategory[0], { status: 201 });
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error creating category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
