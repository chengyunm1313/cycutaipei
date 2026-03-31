import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { asc, desc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { academyCategories } from '@/db/schema';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

interface AcademyCategoryInput {
	name: string;
	slug: string;
	description?: string;
	image?: string;
	sortOrder?: number;
	isActive?: boolean;
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
		const activeOnly = searchParams.get('active') === '1';

		let allCategories = await db
			.select()
			.from(academyCategories)
			.orderBy(asc(academyCategories.sortOrder), desc(academyCategories.createdAt))
			.all();

		if (activeOnly) {
			allCategories = allCategories.filter((category) => category.isActive);
		}

		if (slug) {
			const found = allCategories.find((category) => category.slug === slug);
			if (!found) {
				return NextResponse.json({ error: 'Academy category not found' }, { status: 404 });
			}
			return NextResponse.json(found);
		}

		return NextResponse.json(allCategories);
	} catch (error) {
		console.error('Error fetching academy categories:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as AcademyCategoryInput;

		if (!data.name || !data.slug) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const created = await db
			.insert(academyCategories)
			.values({
				name: data.name,
				slug: data.slug,
				description: data.description,
				image: data.image,
				sortOrder: data.sortOrder ?? 0,
				isActive: data.isActive ?? true,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['academyCategories', 'academy'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Academy category POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(created[0], { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error creating academy category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
