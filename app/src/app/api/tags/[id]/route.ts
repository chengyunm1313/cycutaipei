import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/** DELETE /api/tags/[id] — 刪除標籤 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		await ensureTagsTable(env.DB);
		const db = getDb(env.DB);
		const { id } = await params;
		const tagId = Number(id);

		if (isNaN(tagId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		await db.delete(tags).where(eq(tags.id, tagId));
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting tag:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
