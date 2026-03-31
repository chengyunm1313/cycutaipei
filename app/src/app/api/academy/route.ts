import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { asc, desc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { academyCourses } from '@/db/schema';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { normalizeOptionalHttpUrl } from '@/lib/optionalUrl';
import { normalizeYouTubeUrl } from '@/lib/youtube';

export const runtime = 'edge';

interface AcademyCourseInput {
	title: string;
	slug: string;
	excerpt?: string | null;
	content?: string | null;
	categoryId?: number | null;
	youtubeUrl?: string | null;
	coverImage?: string | null;
	speaker?: string | null;
	resourceLink?: string | null;
	isFeatured?: boolean;
	sortOrder?: number;
	status?: 'published' | 'draft';
	postDate?: string | null;
}

export async function GET(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const searchParams = request.nextUrl.searchParams;
		const status = searchParams.get('status');
		const categoryId = searchParams.get('categoryId');
		const search = searchParams.get('q');
		const limit = searchParams.get('limit');
		const slug = searchParams.get('slug');

		let allCourses = await db
			.select()
			.from(academyCourses)
			.orderBy(
				asc(academyCourses.sortOrder),
				desc(academyCourses.postDate),
				desc(academyCourses.createdAt)
			)
			.all();

		if (slug) {
			const found = allCourses.find((course) => course.slug === slug);
			if (!found) {
				return NextResponse.json({ error: 'Academy course not found' }, { status: 404 });
			}
			return NextResponse.json(found);
		}

		if (status) {
			allCourses = allCourses.filter((course) => course.status === status);
		}
		if (categoryId) {
			allCourses = allCourses.filter((course) => course.categoryId === Number(categoryId));
		}
		if (search) {
			const q = search.toLowerCase();
			allCourses = allCourses.filter(
				(course) =>
					course.title?.toLowerCase().includes(q) || course.excerpt?.toLowerCase().includes(q)
			);
		}
		if (limit) {
			allCourses = allCourses.slice(0, Number(limit));
		}

		return NextResponse.json(allCourses);
	} catch (error) {
		console.error('Error fetching academy courses:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as AcademyCourseInput;

		if (!data.title || !data.slug) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const normalizedYouTubeUrl = data.youtubeUrl ? normalizeYouTubeUrl(data.youtubeUrl) : null;
		if (data.youtubeUrl && !normalizedYouTubeUrl) {
			return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
		}

		const normalizedResourceLink = data.resourceLink
			? normalizeOptionalHttpUrl(data.resourceLink)
			: null;
		if (data.resourceLink && !normalizedResourceLink) {
			return NextResponse.json({ error: 'Invalid resource link' }, { status: 400 });
		}

		const created = await db
			.insert(academyCourses)
			.values({
				title: data.title,
				slug: data.slug,
				excerpt: data.excerpt,
				content: data.content,
				categoryId: data.categoryId,
				youtubeUrl: normalizedYouTubeUrl,
				coverImage: data.coverImage,
				speaker: data.speaker,
				resourceLink: normalizedResourceLink,
				isFeatured: data.isFeatured ?? false,
				sortOrder: data.sortOrder ?? 0,
				status: data.status || 'published',
				postDate: data.postDate ?? null,
			})
			.returning();

		const revalidateResult = triggerSiteRevalidation({
			scopes: ['academy', 'academyCategories'],
		});
		if (revalidateResult.errors.length > 0) {
			console.error('Academy POST revalidate warnings:', revalidateResult.errors);
		}

		return NextResponse.json(created[0], { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
		}
		console.error('Error creating academy course:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
