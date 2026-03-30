import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PageRow {
	id: number;
	title: string;
	slug: string;
	content_blocks: string | null;
	in_menu: number;
	status: string;
	seo_title: string | null;
	seo_description: string | null;
	created_at: string;
	updated_at: string;
}

interface PageUpdatePayload {
	title?: string;
	slug?: string;
	content_blocks?: string | null;
	in_menu?: number | boolean;
	status?: string;
	seoTitle?: string | null;
	seoDescription?: string | null;
}

function getDatabaseOrThrow() {
	const { env } = getRequestContext();
	if (!env?.DB) {
		throw new Error('Database connection not found');
	}
	return env.DB;
}

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const params = await props.params;
		const db = getDatabaseOrThrow();
		const id = Number(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		const { results } = await db.prepare('SELECT * FROM pages WHERE id = ?').bind(id).all<PageRow>();
		if (!results || results.length === 0) {
			return NextResponse.json({ error: 'Page not found' }, { status: 404, headers: corsHeaders });
		}

		return NextResponse.json(results[0], { headers: corsHeaders });
	} catch (error) {
		console.error('Error fetching page:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const params = await props.params;
		const db = getDatabaseOrThrow();
		const id = Number(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		const data = (await request.json()) as PageUpdatePayload;
		const { results: existing } = await db.prepare('SELECT * FROM pages WHERE id = ?').bind(id).all<PageRow>();
		if (!existing || existing.length === 0) {
			return NextResponse.json({ error: 'Page not found' }, { status: 404, headers: corsHeaders });
		}

		const current = existing[0];
		const title = data.title !== undefined ? data.title : current.title;
		const slug = data.slug !== undefined ? data.slug : current.slug;
		const contentBlocks =
			data.content_blocks !== undefined ? data.content_blocks : current.content_blocks;
		const inMenu = data.in_menu !== undefined ? (data.in_menu ? 1 : 0) : current.in_menu;
		const status = data.status !== undefined ? data.status : current.status;
		const seoTitle = data.seoTitle !== undefined ? data.seoTitle : current.seo_title;
		const seoDescription =
			data.seoDescription !== undefined ? data.seoDescription : current.seo_description;

		const { success } = await db
			.prepare(
				`UPDATE pages
         SET title = ?, slug = ?, content_blocks = ?, in_menu = ?, status = ?, seo_title = ?, seo_description = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
			)
			.bind(title, slug, contentBlocks, inMenu, status, seoTitle, seoDescription, id)
			.run();

		if (!success) {
			return NextResponse.json(
				{ error: 'Failed to update page' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const { results: updated } = await db.prepare('SELECT * FROM pages WHERE id = ?').bind(id).all<PageRow>();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['pages'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Page PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated?.[0] || { success: true }, { headers: corsHeaders });
	} catch (error) {
		console.error('Error updating page:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
	try {
		const params = await props.params;
		const db = getDatabaseOrThrow();
		const id = Number(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400, headers: corsHeaders });
		}

		const { success } = await db.prepare('DELETE FROM pages WHERE id = ?').bind(id).run();
		if (!success) {
			return NextResponse.json(
				{ error: 'Failed to delete page' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const revalidateResult = triggerSiteRevalidation({ scopes: ['pages'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Page DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true }, { headers: corsHeaders });
	} catch (error) {
		console.error('Error deleting page:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}
