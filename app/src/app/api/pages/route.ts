import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';

export const runtime = 'edge';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

interface PageCreatePayload {
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

export async function GET(request: NextRequest) {
	try {
		const db = getDatabaseOrThrow();
		const { searchParams } = new URL(request.url);
		const slug = searchParams.get('slug');
		const inMenu = searchParams.get('inMenu');

		if (slug) {
			const { results } = await db.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).all<PageRow>();
			if (!results || results.length === 0) {
				return NextResponse.json(
					{ error: 'Page not found' },
					{ status: 404, headers: corsHeaders }
				);
			}
			return NextResponse.json(results[0], { headers: corsHeaders });
		}

		const query =
			inMenu === 'true'
				? 'SELECT * FROM pages WHERE in_menu = 1 AND status = "published" ORDER BY created_at DESC'
				: 'SELECT * FROM pages ORDER BY created_at DESC';
		const { results } = await db.prepare(query).all<PageRow>();

		return NextResponse.json(results || [], { headers: corsHeaders });
	} catch (error) {
		console.error('Error in GET /api/pages:', error);
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
		const db = getDatabaseOrThrow();
		const data = (await request.json()) as PageCreatePayload;
		const title = data.title?.trim();
		const slug = data.slug?.trim();

		if (!title || !slug) {
			return NextResponse.json(
				{ error: 'title and slug are required' },
				{ status: 400, headers: corsHeaders }
			);
		}

		const inMenuValue = data.in_menu ? 1 : 0;
		const statusValue = data.status || 'published';

		const { success, error } = await db
			.prepare(
				`INSERT INTO pages (title, slug, content_blocks, in_menu, status, seo_title, seo_description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				title,
				slug,
				data.content_blocks || JSON.stringify([]),
				inMenuValue,
				statusValue,
				data.seoTitle || null,
				data.seoDescription || null
			)
			.run();

		if (!success) {
			console.error('Failed to insert page:', error);
			return NextResponse.json(
				{ error: 'Failed to create page' },
				{ status: 500, headers: corsHeaders }
			);
		}

		const { results } = await db
			.prepare('SELECT * FROM pages WHERE slug = ? ORDER BY id DESC LIMIT 1')
			.bind(slug)
			.all<PageRow>();

		const revalidateResult = triggerSiteRevalidation({ scopes: ['pages'] });
		if (revalidateResult.errors.length > 0) {
			console.error('Page POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(results?.[0] || { success: true }, {
			status: 201,
			headers: corsHeaders,
		});
	} catch (error) {
		console.error('Error in POST /api/pages:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500, headers: corsHeaders }
		);
	}
}
