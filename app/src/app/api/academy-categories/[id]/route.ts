import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { academyCategories } from '@/db/schema';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const found = await db
			.select()
			.from(academyCategories)
			.where(eq(academyCategories.id, categoryId))
			.get();

		if (!found) {
			return NextResponse.json({ error: 'Academy category not found' }, { status: 404 });
		}

		return NextResponse.json(found);
	} catch (error) {
		console.error('Error fetching academy category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const data = (await request.json()) as {
			name?: string;
			slug?: string;
			description?: string;
			image?: string;
			sortOrder?: number;
			isActive?: boolean;
		};

		const updated = await db
			.update(academyCategories)
			.set({
				...data,
			})
			.where(eq(academyCategories.id, categoryId))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: 'Academy category not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['academyCategories', 'academy'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Academy category PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated[0]);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
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
		const db = getDb(env.DB);
		const { id } = await params;
		const categoryId = Number(id);

		if (Number.isNaN(categoryId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		await db.delete(academyCategories).where(eq(academyCategories.id, categoryId));

		const revalidateResult = triggerSiteRevalidation({ scopes: ['academyCategories', 'academy'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Academy category DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting academy category:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
