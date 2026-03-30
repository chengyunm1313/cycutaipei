import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

/** GET: 取得單一產品 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const productId = Number(id);
		if (isNaN(productId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);

		const result = await db.select().from(products).where(eq(products.id, productId)).get();

		if (!result) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching product:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

interface ProductUpdateInput {
	name?: string;
	slug?: string;
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
	images?: string;
	specs?: string;
	isFeatured?: boolean;
	sortOrder?: number;
	status?: 'published' | 'draft';
	postDate?: string | null;
}

/** PUT: 更新產品 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const productId = Number(id);
		if (isNaN(productId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as ProductUpdateInput;

		const updated = await db
			.update(products)
			.set({
				name: data.name,
				slug: data.slug,
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
				images: data.images,
				specs: data.specs,
				isFeatured: data.isFeatured,
				sortOrder: data.sortOrder,
				status: data.status,
				postDate: data.postDate ?? null,
			})
			.where(eq(products.id, productId))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['products'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Product PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated[0]);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error updating product:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** DELETE: 刪除產品 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const productId = Number(id);
		if (isNaN(productId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);

		const deleted = await db.delete(products).where(eq(products.id, productId)).returning();

		if (deleted.length === 0) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['products'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Product DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting product:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
