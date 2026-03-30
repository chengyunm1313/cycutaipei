import AppLink from '@/components/AppLink';
import Image from 'next/image';
import { resolveContentDate } from '@/lib/contentDate';

/**
 * 文章卡片元件通用介面
 * 同時支援 mock Article 與 D1 ApiArticle 的欄位
 */
interface ArticleCardData {
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	category?: string | null;
	author?: string | null;
	postDate?: string | null;
	createdAt: string;
}

/**
 * 文章卡片元件
 * 用於部落格列表頁展示文章摘要
 */
export default function ArticleCard({ article }: { article: ArticleCardData }) {
	const coverImage = article.coverImage || '/images/placeholder.jpg';
	const shouldBypassImageOptimization =
		/(^https?:\/\/)?([^/]+\.)?fbcdn\.net(\/|$)/i.test(coverImage) ||
		/(^\/api\/media\/)|(:\/\/[^/]+\/api\/media\/)/i.test(coverImage);
	const category = article.category || '未分類';
	const author = article.author || '匿名';
	const excerpt = article.excerpt || '';
	const displayDate = resolveContentDate(article);

	return (
		<AppLink href={`/blog/${article.slug}`} className='group block cursor-pointer'>
			<article className='bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
				{/* 封面圖 */}
				<div className='relative h-48 overflow-hidden bg-surface'>
					{article.coverImage ? (
						<Image
							src={coverImage}
							alt={article.title}
							fill
							unoptimized={shouldBypassImageOptimization}
							className='object-cover group-hover:scale-105 transition-transform duration-500'
							sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
					) : (
						<div className='w-full h-full flex items-center justify-center'>
							<svg
								className='w-12 h-12 text-text-light'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z'
								/>
							</svg>
						</div>
					)}
					<div className='absolute top-3 left-3'>
						<span className='text-xs font-medium px-2.5 py-1 rounded-full bg-primary/90 text-white backdrop-blur-sm'>
							{category}
						</span>
					</div>
				</div>

				{/* 內容 */}
				<div className='p-5'>
					<div className='flex items-center gap-2 text-xs text-text-light mb-2.5'>
						<span>{author}</span>
						<span>·</span>
						<time dateTime={displayDate}>
							{new Date(displayDate).toLocaleDateString('zh-TW', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</time>
					</div>
					<h3 className='text-base font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200'>
						{article.title}
					</h3>
					<p className='text-sm text-text-muted line-clamp-2 leading-relaxed'>{excerpt}</p>
					<div className='mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
						閱讀更多
						<svg
							className='w-4 h-4'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={2}
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
							/>
						</svg>
					</div>
				</div>
			</article>
		</AppLink>
	);
}
