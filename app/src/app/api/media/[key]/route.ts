import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

/** R2 圖片讀取 Proxy */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
	try {
		const { key } = await params;
		const { env } = getRequestContext();

		if (!env?.BUCKET) {
			return new NextResponse('Bucket not configured', { status: 500 });
		}

		const object = await env.BUCKET.get(key);
		if (!object) {
			return new NextResponse('Not Found', { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		headers.set('cache-control', 'public, max-age=31536000, immutable');

		return new NextResponse(object.body, { headers });
	} catch (error) {
		console.error('Media fetch error:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}

/** R2 媒體刪除 API */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ key: string }> }
) {
	try {
		const { key } = await params;
		const { env } = getRequestContext();

		if (!env?.BUCKET) {
			return NextResponse.json({ error: 'Bucket not configured' }, { status: 500 });
		}

		await env.BUCKET.delete(key);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Media delete error:', error);
		return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
	}
}
