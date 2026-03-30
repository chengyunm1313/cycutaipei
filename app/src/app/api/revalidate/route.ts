import { NextRequest, NextResponse } from 'next/server';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { normalizeSiteCacheScopes } from '@/lib/siteCache';

export const runtime = 'edge';

interface RevalidatePayload {
	scopes?: unknown;
	secret?: string;
	includePaths?: boolean;
}

function checkRevalidateToken(request: NextRequest, payload: RevalidatePayload): boolean {
	const expectedToken = process.env.REVALIDATE_TOKEN?.trim();
	if (!expectedToken) return true;

	const headerToken = request.headers.get('x-revalidate-token')?.trim();
	const bodyToken = typeof payload.secret === 'string' ? payload.secret.trim() : '';

	return headerToken === expectedToken || bodyToken === expectedToken;
}

export async function POST(request: NextRequest) {
	try {
		const payload = (await request.json().catch(() => ({}))) as RevalidatePayload;
		if (!checkRevalidateToken(request, payload)) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const scopes = normalizeSiteCacheScopes(payload.scopes);
		const result = triggerSiteRevalidation({
			scopes,
			includePaths: payload.includePaths !== false,
		});

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error('Error in POST /api/revalidate:', error);
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
