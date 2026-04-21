import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ensureSiteContentsTable } from '@/db/ensureSiteContentsTable';
import type { ApiSiteContent } from '@/data/types';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { slugifyAscii } from '@/lib/slug';

export const runtime = 'edge';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

async function findById(db: D1Database, id: string): Promise<SiteContentRow | null> {
	const { results } = await db
		.prepare(
			'SELECT id, type, parent_id, title, slug, summary, content, image_url, link_url, extra_json, sort_order, is_active, created_at, updated_at FROM site_contents WHERE id = ? LIMIT 1'
		)
		.bind(id)
		.all<SiteContentRow>();

	return results?.[0] || null;
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureSiteContentsTable(env.DB);
		const { id } = await props.params;
		const found = await findById(env.DB, id);
		if (!found) {
			return NextResponse.json(
				{ error: 'Site content not found' },
				{ status: 404, headers: corsHeaders }
			);
		}

		return NextResponse.json(mapSiteContent(found), { headers: corsHeaders });
	} catch (error) {
		console.error('Error in GET /api/site-content/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureSiteContentsTable(env.DB);
		const { id } = await props.params;
		const found = await findById(env.DB, id);
		if (!found) {
			return NextResponse.json(
				{ error: 'Site content not found' },
				{ status: 404, headers: corsHeaders }
			);
		}

		const data = (await request.json()) as SiteContentPayload;
		const normalizedSlug =
			data.slug === undefined
				? found.slug
				: data.slug === null
					? null
					: slugifyAscii(data.slug, found.type || 'page');

		await env.DB
			.prepare(
				`UPDATE site_contents SET
				 parent_id = ?,
				 title = ?,
				 slug = ?,
				 summary = ?,
				 content = ?,
				 image_url = ?,
				 link_url = ?,
				 extra_json = ?,
				 sort_order = ?,
				 is_active = ?,
				 updated_at = CURRENT_TIMESTAMP
				 WHERE id = ?`
			)
			.bind(
				data.parentId !== undefined ? data.parentId : found.parent_id,
				data.title !== undefined ? data.title : found.title,
				normalizedSlug,
				data.summary !== undefined ? data.summary : found.summary,
				data.content !== undefined ? data.content : found.content,
				data.imageUrl !== undefined ? data.imageUrl : found.image_url,
				data.linkUrl !== undefined ? data.linkUrl : found.link_url,
				data.extraJson !== undefined ? data.extraJson : found.extra_json,
				data.sortOrder !== undefined ? data.sortOrder : found.sort_order,
				data.isActive !== undefined ? Number(Boolean(data.isActive)) : found.is_active,
				id
			)
			.run();

		const updated = await findById(env.DB, id);
		if (!updated) {
			return NextResponse.json(
				{ error: 'Site content not found after update' },
				{ status: 404, headers: corsHeaders }
			);
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['siteContent'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Site content PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(mapSiteContent(updated), { headers: corsHeaders });
	} catch (error) {
		console.error('Error in PUT /api/site-content/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json(
				{ error: 'Database not available' },
				{ status: 500, headers: corsHeaders }
			);
		}

		await ensureSiteContentsTable(env.DB);
		const { id } = await props.params;

		await env.DB.prepare('DELETE FROM site_contents WHERE parent_id = ?').bind(id).run();
		await env.DB.prepare('DELETE FROM site_contents WHERE id = ?').bind(id).run();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['siteContent'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Site content DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true }, { headers: corsHeaders });
	} catch (error) {
		console.error('Error in DELETE /api/site-content/[id]:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
