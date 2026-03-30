import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import { tags } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'edge';

/** GET /api/tags — 取得所有標籤 */
export async function GET() {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		await ensureTagsTable(env.DB);
		const db = getDb(env.DB);
		const allTags = await db.select().from(tags).orderBy(desc(tags.createdAt)).all();
		return NextResponse.json(allTags);
	} catch (error) {
		console.error('Error fetching tags:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

/** POST /api/tags — 建立新標籤 */
export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}
		await ensureTagsTable(env.DB);
		const db = getDb(env.DB);
		const data = (await request.json()) as { name: string; slug: string };

		if (!data.name || !data.slug) {
			return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 });
		}

		const newTag = await db
			.insert(tags)
			.values({
				name: data.name,
				slug: data.slug,
			})
			.returning();

		return NextResponse.json(newTag[0]);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : '';
		if (message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Tag name or slug already exists' }, { status: 409 });
		}
		console.error('Error creating tag:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
