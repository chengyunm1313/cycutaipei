import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { products } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { clampCoverImagePositionY } from '@/lib/coverImagePosition';
import { slugifyAscii } from '@/lib/slug';

export const runtime = 'edge';

interface ProductInput {
	name: string;
	slug: string;
	description?: string;
	content?: string;
	price?: number;
	categoryId?: number;
	subcategoryId?: number | null;
	keywords?: string;
	purchaseLink?: string;
	catalogLink?: string;
	introVideoUrl?: string;
	listImage?: string;
	coverImagePositionY?: number;
	images?: string;
	specs?: string;
	isFeatured?: boolean;
	sortOrder?: number;
	status?: 'published' | 'draft';
	postDate?: string | null;
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
		const categoryId = searchParams.get('categoryId');
		const search = searchParams.get('q');
		const limit = searchParams.get('limit');
		const slug = searchParams.get('slug');

		let allProducts = await db
			.select()
			.from(products)
			.orderBy(asc(products.sortOrder), desc(products.createdAt))
			.all();

		if (slug) {
			const found = allProducts.find((p) => p.slug === slug);
			if (!found) {
				return NextResponse.json({ error: 'Product not found' }, { status: 404 });
			}
			return NextResponse.json(found);
		}

		if (status) {
			allProducts = allProducts.filter((p) => p.status === status);
		}
		if (categoryId) {
			allProducts = allProducts.filter((p) => p.categoryId === Number(categoryId));
		}
		if (search) {
			const q = search.toLowerCase();
			allProducts = allProducts.filter(
				(p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
			);
		}
		if (limit) {
			allProducts = allProducts.slice(0, Number(limit));
		}

		return NextResponse.json(allProducts);
	} catch (error) {
		console.error('Error fetching products:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as ProductInput;
		const normalizedSlug = slugifyAscii(data.slug || data.name || '', 'activity');

		if (!data.name || !normalizedSlug) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newProduct = await db
			.insert(products)
			.values({
				name: data.name,
				slug: normalizedSlug,
				description: data.description,
				content: data.content,
				price: data.price,
				categoryId: data.categoryId,
				subcategoryId: data.subcategoryId,
				keywords: data.keywords,
				purchaseLink: data.purchaseLink,
				catalogLink: data.catalogLink,
				introVideoUrl: data.introVideoUrl,
				listImage: data.listImage,
				coverImagePositionY: clampCoverImagePositionY(data.coverImagePositionY),
				images: data.images,
				specs: data.specs,
				isFeatured: data.isFeatured ?? false,
				sortOrder: data.sortOrder ?? 0,
				status: data.status || 'published',
				postDate: data.postDate ?? null,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['products'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Product POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(newProduct[0], { status: 201 });
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error creating product:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
