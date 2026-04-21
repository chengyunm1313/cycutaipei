import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import type { ApiSiteContent } from '@/data/types';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { slugifyAscii } from '@/lib/slug';

export const runtime = 'edge';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface SiteContentRow {
	id: string;
	type: string;
	parent_id: string | null;
	title: string | null;
	slug: string | null;
	summary: string | null;
	content: string | null;
	image_url: string | null;
	link_url: string | null;
	extra_json: string | null;
	sort_order: number;
	is_active: number;
	created_at: string;
	updated_at: string;
}

interface SiteContentPayload {
	id?: string;
	type?: string;
	parentId?: string | null;
	title?: string | null;
	slug?: string | null;
	summary?: string | null;
	content?: string | null;
	imageUrl?: string | null;
	linkUrl?: string | null;
	extraJson?: string | null;
	sortOrder?: number;
	isActive?: boolean | number;
}

function mapSiteContent(row: SiteContentRow): ApiSiteContent {
	return {
		id: row.id,
		type: row.type,
		parentId: row.parent_id,
		title: row.title,
		slug: row.slug,
		summary: row.summary,
		content: row.content,
		imageUrl: row.image_url,
		linkUrl: row.link_url,
		extraJson: row.extra_json,
		sortOrder: row.sort_order,
		isActive: row.is_active,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function createContentId(prefix: string): string {
	const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, '').slice(0, 24) || 'item';
	const random = Math.random().toString(36).slice(2, 8);
	return `${safePrefix}-${Date.now()}-${random}`;
}

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

		await ensureSiteContentsTable(env.DB);
		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get('type');
		const parentId = searchParams.get('parentId');
		const active = searchParams.get('active');
		const slug = searchParams.get('slug');

		let query =
			'SELECT id, type, parent_id, title, slug, summary, content, image_url, link_url, extra_json, sort_order, is_active, created_at, updated_at FROM site_contents WHERE 1 = 1';
		const bindings: Array<string | number> = [];

		if (type) {
			query += ' AND type = ?';
			bindings.push(type);
		}
		if (parentId) {
			query += ' AND parent_id = ?';
			bindings.push(parentId);
		}
		if (active === '1') {
			query += ' AND is_active = 1';
		}
		if (slug) {
			query += ' AND slug = ?';
			bindings.push(slug);
		}

		query += ' ORDER BY sort_order ASC, created_at DESC';

		const { results } = await env.DB
			.prepare(query)
			.bind(...bindings)
			.all<SiteContentRow>();

		return NextResponse.json((results || []).map(mapSiteContent), { headers: corsHeaders });
	} catch (error) {
		console.error('Error in GET /api/site-content:', error);
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

		await ensureSiteContentsTable(env.DB);
		const data = (await request.json()) as SiteContentPayload;
		if (!data.type) {
			return NextResponse.json(
				{ error: 'type is required' },
				{ status: 400, headers: corsHeaders }
			);
		}

		const id = data.id || createContentId(data.type);
		const isActive = data.isActive === undefined ? 1 : Number(Boolean(data.isActive));
		const normalizedSlug =
			data.slug === undefined || data.slug === null
				? data.slug
				: slugifyAscii(data.slug, data.type || 'page');

		await env.DB
			.prepare(
				`INSERT INTO site_contents
				 (id, type, parent_id, title, slug, summary, content, image_url, link_url, extra_json, sort_order, is_active)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				data.type,
				data.parentId || null,
				data.title || null,
				normalizedSlug || null,
				data.summary || null,
				data.content || null,
				data.imageUrl || null,
				data.linkUrl || null,
				data.extraJson || null,
				data.sortOrder || 0,
				isActive
			)
			.run();

		const { results } = await env.DB
			.prepare(
				'SELECT id, type, parent_id, title, slug, summary, content, image_url, link_url, extra_json, sort_order, is_active, created_at, updated_at FROM site_contents WHERE id = ? LIMIT 1'
			)
			.bind(id)
			.all<SiteContentRow>();

		if (!results?.[0]) {
			return NextResponse.json(
				{ error: 'Failed to create site content' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['siteContent'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Site content POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(mapSiteContent(results[0]), { status: 201, headers: corsHeaders });
	} catch (error) {
		console.error('Error in POST /api/site-content:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
