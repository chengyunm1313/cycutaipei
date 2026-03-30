import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { isSupportedImageFile, inferImageMimeType } from '@/lib/imageFile';

export const runtime = 'edge';

/** R2 圖片上傳 API */
export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.BUCKET) {
			return NextResponse.json({ error: 'R2 Bucket not configured' }, { status: 500 });
		}

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}
		if (!isSupportedImageFile(file)) {
			return NextResponse.json(
				{ error: 'Unsupported file type. Only JPG, PNG, GIF, WebP, SVG are allowed.' },
				{ status: 400 }
			);
		}
		const contentType = inferImageMimeType(file) || 'application/octet-stream';

		// 產生唯一檔名
		const ext = file.name.split('.').pop() || 'bin';
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

		await env.BUCKET.put(filename, file.stream(), {
			httpMetadata: {
				contentType,
			},
		});

		return NextResponse.json({
			key: filename,
			url: `/api/media/${filename}`,
		});
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
	}
}
