import { NextResponse, NextRequest } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { menus } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

interface MenuUpdatePayload {
	title?: string;
	url?: string | null;
	type?: 'system' | 'page' | 'link' | 'category_dropdown';
	pageId?: number | null;
	position?: 'top' | 'bottom' | 'child';
	parentMenuId?: number | null;
	customLink?: string | null;
	sortOrder?: number;
	target?: string;
	isActive?: boolean;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureMenusTable(env.DB);
		const db = getDb(env.DB);
		const p = await params;
		const id = parseInt(p.id, 10);
		if (isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		const results = await db.select().from(menus).where(eq(menus.id, id)).all();

		if (!results || results.length === 0) {
			return NextResponse.json({ error: 'Menu not found' }, { status: 404, headers: corsHeaders });
		}

		return NextResponse.json(results[0], { headers: corsHeaders });
	} catch (error) {
		console.error('Error in GET /api/menus/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureMenusTable(env.DB);
		const db = getDb(env.DB);
		const p = await params;
		const id = parseInt(p.id, 10);
		if (isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		const data = (await request.json()) as MenuUpdatePayload;
		const { title, url, type, pageId, position, parentMenuId, customLink, sortOrder, target, isActive } =
			data;

		const updates: MenuUpdatePayload = {};
		let hasUpdates = false;

		if (title !== undefined) {
			updates.title = title;
			hasUpdates = true;
		}
		if (url !== undefined) {
			updates.url = url;
			hasUpdates = true;
		}
		if (type !== undefined) {
			updates.type = type;
			hasUpdates = true;
		}
		if (pageId !== undefined) {
			updates.pageId = pageId;
			hasUpdates = true;
		}
		if (position !== undefined) {
			updates.position = position;
			hasUpdates = true;
		}
		if (parentMenuId !== undefined) {
			updates.parentMenuId = parentMenuId;
			hasUpdates = true;
		}
		if (customLink !== undefined) {
			updates.customLink = customLink;
			hasUpdates = true;
		}
		if (sortOrder !== undefined) {
			updates.sortOrder = sortOrder;
			hasUpdates = true;
		}
		if (target !== undefined) {
			updates.target = target;
			hasUpdates = true;
		}
		if (isActive !== undefined) {
			updates.isActive = isActive;
			hasUpdates = true;
		}

		if (!hasUpdates) {
			return NextResponse.json(
				{ error: 'No fields to update' },
				{ status: 400, headers: corsHeaders }
			);
		}

		await db.update(menus).set(updates).where(eq(menus.id, id)).run();

		const results = await db.select().from(menus).where(eq(menus.id, id)).all();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['menus'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Menu PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(results?.[0] || { success: true }, { headers: corsHeaders });
	} catch (error) {
		console.error('Error in PUT /api/menus/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureMenusTable(env.DB);
		const db = getDb(env.DB);
		const p = await params;
		const id = parseInt(p.id, 10);
		if (isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		await db.delete(menus).where(eq(menus.id, id)).run();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['menus'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Menu DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(
			{ id, message: 'Menu deleted successfully' },
			{ headers: corsHeaders }
		);
	} catch (error) {
		console.error('Error in DELETE /api/menus/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
