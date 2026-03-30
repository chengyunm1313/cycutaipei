import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

/** R2 媒體列表 API — 列出 Bucket 中所有物件 */
export async function GET() {
	try {
		const { env } = getRequestContext();
		if (!env?.BUCKET) {
			return NextResponse.json({ error: 'R2 Bucket not configured' }, { status: 500 });
		}

		const listed = await env.BUCKET.list({ limit: 500 });
		const objects = listed.objects.map((obj: { key: string; size: number; uploaded: Date }) => ({
			key: obj.key,
			size: obj.size,
			uploaded: obj.uploaded.toISOString(),
			url: `/api/media/${obj.key}`,
		}));

		return NextResponse.json({ objects });
	} catch (error) {
		console.error('Error listing media:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
