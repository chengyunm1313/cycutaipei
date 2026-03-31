import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { academyCourses } from '@/db/schema';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { normalizeOptionalHttpUrl } from '@/lib/optionalUrl';
import { normalizeYouTubeUrl } from '@/lib/youtube';
import { clampCoverImagePositionY } from '@/lib/coverImagePosition';

export const runtime = 'edge';

interface AcademyCourseUpdateInput {
	title?: string;
	slug?: string;
	excerpt?: string | null;
	content?: string | null;
	categoryId?: number | null;
	youtubeUrl?: string | null;
	coverImage?: string | null;
	coverImagePositionY?: number;
	speaker?: string | null;
	resourceLink?: string | null;
	isFeatured?: boolean;
	sortOrder?: number;
	status?: 'published' | 'draft';
	postDate?: string | null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const courseId = Number(id);
		if (Number.isNaN(courseId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const result = await db.select().from(academyCourses).where(eq(academyCourses.id, courseId)).get();

		if (!result) {
			return NextResponse.json({ error: 'Academy course not found' }, { status: 404 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching academy course:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const courseId = Number(id);
		if (Number.isNaN(courseId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as AcademyCourseUpdateInput;

		const normalizedYouTubeUrl =
			data.youtubeUrl === undefined
				? undefined
				: data.youtubeUrl
					? normalizeYouTubeUrl(data.youtubeUrl)
					: null;
		if (data.youtubeUrl && !normalizedYouTubeUrl) {
			return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
		}

		const normalizedResourceLink =
			data.resourceLink === undefined
				? undefined
				: data.resourceLink
					? normalizeOptionalHttpUrl(data.resourceLink)
					: null;
		if (data.resourceLink && !normalizedResourceLink) {
			return NextResponse.json({ error: 'Invalid resource link' }, { status: 400 });
		}

		const updated = await db
			.update(academyCourses)
			.set({
				title: data.title,
				slug: data.slug,
				excerpt: data.excerpt,
				content: data.content,
				categoryId: data.categoryId,
				youtubeUrl: normalizedYouTubeUrl,
				coverImage: data.coverImage,
				coverImagePositionY:
					data.coverImagePositionY === undefined
						? undefined
						: clampCoverImagePositionY(data.coverImagePositionY),
				speaker: data.speaker,
				resourceLink: normalizedResourceLink,
				isFeatured: data.isFeatured,
				sortOrder: data.sortOrder,
				status: data.status,
				postDate: data.postDate ?? null,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(academyCourses.id, courseId))
			.returning();

		if (updated.length === 0) {
			return NextResponse.json({ error: 'Academy course not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({
			scopes: ['academy', 'academyCategories'],
		});
		if (revalidateResult.errors.length > 0) {
			console.error('Academy PUT revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(updated[0]);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error updating academy course:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const courseId = Number(id);
		if (Number.isNaN(courseId)) {
			return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
		}

		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const deleted = await db
			.delete(academyCourses)
			.where(eq(academyCourses.id, courseId))
			.returning();

		if (deleted.length === 0) {
			return NextResponse.json({ error: 'Academy course not found' }, { status: 404 });
		}

		const revalidateResult = triggerSiteRevalidation({
			scopes: ['academy', 'academyCategories'],
		});
		if (revalidateResult.errors.length > 0) {
			console.error('Academy DELETE revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting academy course:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
