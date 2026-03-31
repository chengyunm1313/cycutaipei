import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { asc, desc, eq } from 'drizzle-orm';
import Breadcrumb from '@/components/Breadcrumb';
import AppLink from '@/components/AppLink';
import AcademyCourseCard from '@/components/AcademyCourseCard';
import { resolveContentDate } from '@/lib/contentDate';
import { getCoverImageObjectPositionStyle } from '@/lib/coverImagePosition';
import { toYouTubeEmbedUrl } from '@/lib/youtube';
import { getDb } from '@/db/client';
import { academyCategories, academyCourses } from '@/db/schema';
import type { ApiAcademyCategory, ApiAcademyCourse } from '@/data/types';

export const runtime = 'edge';

interface PageProps {
	params: Promise<{ slug: string }>;
}

interface AcademyCourseRow {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string | null;
	categoryId: number | null;
	youtubeUrl: string | null;
	coverImage: string | null;
	coverImagePositionY: number | null;
	speaker: string | null;
	resourceLink: string | null;
	isFeatured?: boolean | number | null;
	sortOrder: number | null;
	status: string | null;
	postDate: string | null;
	createdAt: string | null;
	updatedAt?: string | null;
}

interface AcademyCategoryRow {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	image: string | null;
	sortOrder: number | null;
	isActive?: boolean | number | null;
	createdAt: string | null;
}

function normalizeAcademyCourseRow(course: AcademyCourseRow | null | undefined): ApiAcademyCourse | null {
	if (!course) return null;
	return {
		id: course.id,
		title: course.title,
		slug: course.slug,
		excerpt: course.excerpt,
		content: course.content,
		categoryId: course.categoryId,
		youtubeUrl: course.youtubeUrl,
		coverImage: course.coverImage,
		coverImagePositionY: course.coverImagePositionY ?? 50,
		speaker: course.speaker,
		resourceLink: course.resourceLink,
		isFeatured: course.isFeatured ?? false,
		sortOrder: course.sortOrder ?? 0,
		status: course.status ?? 'draft',
		postDate: course.postDate,
		createdAt: course.createdAt ?? '',
		updatedAt: course.updatedAt ?? course.createdAt ?? '',
	};
}

function normalizeAcademyCategoryRows(categories: AcademyCategoryRow[]): ApiAcademyCategory[] {
	return categories.map((item) => ({
		id: item.id,
		name: item.name,
		slug: item.slug,
		description: item.description,
		image: item.image,
		sortOrder: item.sortOrder ?? 0,
		isActive: item.isActive ?? false,
		createdAt: item.createdAt ?? '',
	}));
}

async function fetchAcademyPageData(slug: string): Promise<{
	course: ApiAcademyCourse | null;
	categories: ApiAcademyCategory[];
	allCourses: ApiAcademyCourse[];
}> {
	const { env } = getRequestContext();
	if (!env?.DB) {
		console.error('Academy page DB not available');
		return { course: null, categories: [], allCourses: [] };
	}

	const db = getDb(env.DB);
	const [course, categories, publishedCourses] = await Promise.all([
		db.select().from(academyCourses).where(eq(academyCourses.slug, slug)).get(),
		db
			.select()
			.from(academyCategories)
			.orderBy(asc(academyCategories.sortOrder), asc(academyCategories.createdAt))
			.all(),
		db
			.select()
			.from(academyCourses)
			.orderBy(
				asc(academyCourses.sortOrder),
				desc(academyCourses.postDate),
				desc(academyCourses.createdAt)
			)
			.all(),
	]);

	return {
		course: normalizeAcademyCourseRow(course),
		categories: normalizeAcademyCategoryRows(categories).filter((item) => Boolean(item.isActive)),
		allCourses: publishedCourses
			.map((item) => normalizeAcademyCourseRow(item))
			.filter((item): item is ApiAcademyCourse => Boolean(item && item.status === 'published')),
	};
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	try {
		const { course } = await fetchAcademyPageData(slug);
		if (!course || course.status !== 'published') {
			return { title: '課程未找到' };
		}
		return {
			title: course.title,
			description: course.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || undefined,
		};
	} catch {
		return { title: '課程未找到' };
	}
}

export default async function AcademyCoursePage({ params }: PageProps) {
	const { slug } = await params;

	try {
		const { course, categories, allCourses } = await fetchAcademyPageData(slug);
		if (!course || course.status !== 'published') {
			notFound();
		}

		const category = categories.find((item) => item.id === course.categoryId) || null;
		const relatedCourses = allCourses.filter((item) => item.id !== course.id).slice(0, 3);
		const embedUrl = toYouTubeEmbedUrl(course.youtubeUrl);
		const displayDate = resolveContentDate(course);

		return (
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<Breadcrumb
					items={[
						{ label: '校友學院', href: '/academy' },
						...(category ? [{ label: category.name, href: `/academy?category=${category.slug}` }] : []),
						{ label: course.title },
					]}
				/>

				<div className='grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 mb-16'>
					<div>
						<div className='rounded-3xl border border-border overflow-hidden bg-surface-alt'>
							{course.coverImage ? (
								/* eslint-disable-next-line @next/next/no-img-element */
								<img
									src={course.coverImage}
									alt={course.title}
									className='w-full aspect-[16/9] object-cover'
									style={getCoverImageObjectPositionStyle(course.coverImagePositionY)}
								/>
							) : (
								<div className='aspect-[16/9] flex items-center justify-center text-text-light'>
									尚未設定課程封面
								</div>
							)}
						</div>
					</div>

					<div>
						{category ? (
							<div className='flex flex-wrap gap-2 mb-3'>
								<AppLink
									href={`/academy?category=${category.slug}`}
									className='text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors duration-200 cursor-pointer'
								>
									{category.name}
								</AppLink>
							</div>
						) : null}

						<h1 className='text-3xl sm:text-4xl font-bold text-text mb-4'>{course.title}</h1>

						<div className='flex flex-wrap gap-4 text-sm text-text-muted mb-5'>
							{displayDate ? (
								<span>發布日期：{new Date(displayDate).toLocaleDateString('zh-TW')}</span>
							) : null}
							{course.speaker ? <span>講師／主講：{course.speaker}</span> : null}
						</div>

						<p className='text-text-muted leading-relaxed mb-6'>
							{course.excerpt?.replace(/<[^>]*>/g, '') || '尚未提供課程摘要。'}
						</p>

						<div className='flex flex-wrap gap-4'>
							{embedUrl ? (
								<a
									href='#course-video'
									className='inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer'
								>
									立即觀看
								</a>
							) : null}
							{course.youtubeUrl ? (
								<a
									href={course.youtubeUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text hover:bg-surface-alt font-semibold rounded-xl transition-colors duration-200 cursor-pointer'
								>
									前往 YouTube
								</a>
							) : null}
							{course.resourceLink ? (
								<a
									href={course.resourceLink}
									target='_blank'
									rel='noopener noreferrer'
									className='inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text hover:bg-surface-alt font-semibold rounded-xl transition-colors duration-200 cursor-pointer'
								>
									下載課程資料
								</a>
							) : null}
						</div>
					</div>
				</div>

				<div className='mb-16'>
					<h2 className='text-xl font-bold text-text mb-4'>課程內容</h2>
					{embedUrl ? (
						<div
							id='course-video'
							className='mb-8 aspect-video rounded-2xl overflow-hidden border border-border'
						>
							<iframe
								width='100%'
								height='100%'
								src={embedUrl}
								title={`${course.title} YouTube video player`}
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
								allowFullScreen
								className='w-full h-full'
							/>
						</div>
					) : null}
					<div
						className='prose prose-sm sm:prose max-w-none text-text-muted prose-headings:text-text prose-strong:text-text prose-a:text-primary prose-li:text-text-muted'
						dangerouslySetInnerHTML={{ __html: course.content || course.excerpt || '' }}
					/>
				</div>

				<section>
					<div className='flex items-end justify-between mb-6'>
						<div>
							<h2 className='text-2xl font-bold text-text'>延伸課程</h2>
							<p className='text-text-muted mt-2'>持續探索更多校友學院內容</p>
						</div>
						<AppLink
							href='/academy'
							className='hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer'
						>
							查看全部
						</AppLink>
					</div>

					{relatedCourses.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
							{relatedCourses.map((relatedCourse) => (
								<AcademyCourseCard
									key={relatedCourse.id}
									course={relatedCourse}
									categoryName={
										categories.find((item) => item.id === relatedCourse.categoryId)?.name
									}
								/>
							))}
						</div>
					) : (
						<div className='rounded-2xl border border-border bg-surface px-6 py-10 text-center text-text-light'>
							目前尚無其他課程內容。
						</div>
					)}
				</section>
			</div>
		);
	} catch (error) {
		console.error('Failed to load academy course:', error);
		notFound();
	}
}
