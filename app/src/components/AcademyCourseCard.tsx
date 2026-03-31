import Image from 'next/image';
import AppLink from '@/components/AppLink';
import type { ApiAcademyCourse } from '@/data/types';
import { resolveContentDate } from '@/lib/contentDate';

export default function AcademyCourseCard({
	course,
	categoryName,
}: {
	course: ApiAcademyCourse;
	categoryName?: string;
}) {
	const coverImage =
		course.coverImage ||
		'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop';
	const displayDate = resolveContentDate(course);

	return (
		<AppLink
			href={`/academy/${course.slug}`}
			className='group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer'
		>
			<div className='relative aspect-[4/3] overflow-hidden bg-surface-alt'>
				<Image
					src={coverImage}
					alt={course.title}
					fill
					className='object-cover group-hover:scale-105 transition-transform duration-500'
					sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
				/>
			</div>

			<div className='p-4 sm:p-5'>
				<div className='flex items-center justify-between gap-3 mb-2'>
					{categoryName ? (
						<p className='text-xs font-medium text-primary'>{categoryName}</p>
					) : (
						<span />
					)}
					{displayDate ? (
						<p className='text-xs text-text-light'>
							{new Date(displayDate).toLocaleDateString('zh-TW')}
						</p>
					) : null}
				</div>

				<h3 className='text-base font-semibold text-text group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2'>
					{course.title}
				</h3>

				<p className='text-sm text-text-muted line-clamp-2 mb-3'>
					{course.excerpt?.replace(/<[^>]*>/g, '') || '暫無課程摘要'}
				</p>

				{course.speaker ? (
					<p className='text-xs text-text-light line-clamp-1'>講師／主講：{course.speaker}</p>
				) : null}
			</div>
		</AppLink>
	);
}
