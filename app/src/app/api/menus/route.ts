import { NextResponse, NextRequest } from 'next/server';
import type { SQL } from 'drizzle-orm';
import { and, asc, eq } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { ensureMenusTable } from '@/db/ensureMenusTable';
import { menus } from '@/db/schema';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

type MenuType = 'system' | 'page' | 'link' | 'category_dropdown';
type MenuPosition = 'top' | 'bottom' | 'child';

interface MenuPayload {
	title?: string;
	url?: string | null;
	type?: MenuType;
	pageId?: number | null;
	position?: MenuPosition;
	parentMenuId?: number | null;
	customLink?: string | null;
	sortOrder?: number;
	target?: string;
	isActive?: boolean;
}

const DEFAULT_MENUS = [
	{ title: '首頁', url: '/', sortOrder: 1 },
	{ title: '文章', url: '/blog', sortOrder: 2 },
	{ title: '產品', url: '/products', sortOrder: 3 },
	{ title: '關於我們', url: '/about', sortOrder: 4 },
	{ title: '常見問題', url: '/faq', sortOrder: 5 },
] as const;

async function ensureDefaultMenus(db: ReturnType<typeof getDb>) {
	const currentMenus = await db.select().from(menus).all();
	const existingUrls = new Set(currentMenus.map((item) => item.url));
	for (const item of DEFAULT_MENUS) {
		if (existingUrls.has(item.url)) continue;
		await db.insert(menus).values({
			title: item.title,
			url: item.url,
			type: 'link',
			sortOrder: item.sortOrder,
			target: '_self',
			isActive: true,
			position: 'top',
		});
	}
}

async function backfillPageIds(envDb: D1Database) {
	await envDb
		.prepare(
			`UPDATE menus
       SET page_id = (
         SELECT id FROM pages WHERE ('/' || slug) = menus.url LIMIT 1
       )
       WHERE type = 'page' AND page_id IS NULL AND url IS NOT NULL`
		)
		.run();
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
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
		await ensureDefaultMenus(db);
		await backfillPageIds(env.DB);

		const searchParams = request.nextUrl.searchParams;
		const active = searchParams.get('active');
		const type = searchParams.get('type');
		const position = searchParams.get('position');
		const parentId = searchParams.get('parentId');
		const conditions: SQL[] = [];

		if (active === '1') {
			conditions.push(eq(menus.isActive, true));
		}
		if (type) {
			conditions.push(eq(menus.type, type as MenuType));
		}
		if (position) {
			conditions.push(eq(menus.position, position as MenuPosition));
		}
		if (parentId) {
			const parsedParentId = Number(parentId);
			if (Number.isNaN(parsedParentId)) {
				return NextResponse.json(
					{ error: 'Invalid parentId query parameter' },
					{ status: 400, headers: corsHeaders }
				);
			}
			conditions.push(eq(menus.parentMenuId, parsedParentId));
		}

		const list =
			conditions.length > 0
				? await db.select().from(menus).where(and(...conditions)).orderBy(asc(menus.sortOrder)).all()
				: await db.select().from(menus).orderBy(asc(menus.sortOrder)).all();

		return NextResponse.json(list, { headers: corsHeaders });
	} catch (error) {
		console.error('Error fetching menus:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function POST(request: NextRequest) {
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
		const data = (await request.json()) as MenuPayload;

		const {
			title,
			url,
			type,
			pageId,
			position,
			parentMenuId,
			customLink,
			sortOrder,
			target,
			isActive,
		} = data;

		if (!title || !type) {
			return NextResponse.json(
				{ error: 'title and type are required' },
				{ status: 400, headers: corsHeaders }
			);
		}

		const newMenu = await db
			.insert(menus)
			.values({
				title,
				url: url || null,
				type,
				pageId: pageId ?? null,
				position: position || 'top',
				parentMenuId: parentMenuId ?? null,
				customLink: customLink || null,
				sortOrder: sortOrder ?? 0,
				target: target || '_self',
				isActive: isActive !== false,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['menus'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Menu POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(newMenu[0], { status: 201, headers: corsHeaders });
	} catch (error) {
		console.error('Error creating menu:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
