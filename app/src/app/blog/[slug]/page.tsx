'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import AppLink from '@/components/AppLink';
import Breadcrumb from '@/components/Breadcrumb';
import ArticleCard from '@/components/ArticleCard';
import { fetchArticleBySlug, fetchArticles } from '@/lib/api';
import type { ApiArticle } from '@/data/types';

export const runtime = 'edge';

interface PageProps {
	params: Promise<{ slug: string }>;
}

/**
 * 文章詳細頁
 * 從 D1 API 動態載入
 */
export default function BlogPostPage({ params }: PageProps) {
	const { slug } = use(params);
	const [article, setArticle] = useState<ApiArticle | null>(null);
	const [relatedArticles, setRelatedArticles] = useState<ApiArticle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let isCancelled = false;

		const loadArticle = async () => {
			setLoading(true);
			try {
				const art = await fetchArticleBySlug(slug);
				if (isCancelled) return;
				setArticle(art);
				setError('');

				// 載入同分類的相關文章
				if (art.category) {
					try {
						const all = await fetchArticles('published');
						if (isCancelled) return;
						const related = all
							.filter((a) => a.category === art.category && a.id !== art.id)
							.slice(0, 3);
						setRelatedArticles(related);
					} catch {
						if (!isCancelled) setRelatedArticles([]);
					}
				} else {
					setRelatedArticles([]);
				}
			} catch (err) {
				if (isCancelled) return;
				setArticle(null);
				setRelatedArticles([]);
				setError(err instanceof Error ? err.message : '文章不存在');
			} finally {
				if (!isCancelled) setLoading(false);
			}
		};

		void loadArticle();
		return () => {
			isCancelled = true;
		};
	}, [slug]);

	if (loading) {
		return (
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='flex items-center justify-center py-20'>
					<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
				</div>
			</div>
		);
	}

	if (error || !article) {
		return (
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center'>
				<h1 className='text-2xl font-bold text-text mb-4'>文章不存在</h1>
				<p className='text-text-muted mb-6'>{error || '找不到此文章'}</p>
				<AppLink href='/blog' className='text-primary hover:underline'>
					返回部落格
				</AppLink>
			</div>
		);
	}

	const coverImage = article.coverImage || '';
	const author = article.author || '匿名';
	const content = article.content || '';

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<Breadcrumb items={[{ label: '部落格', href: '/blog' }, { label: article.title }]} />

			{/* 文章標頭 */}
			<header className='mb-8'>
				{article.category && (
					<div className='flex items-center gap-2 mb-4'>
						<span className='text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary'>
							{article.category}
						</span>
					</div>
				)}
				<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-text leading-tight mb-4'>
					{article.title}
				</h1>
				<div className='flex items-center gap-4 text-sm text-text-muted'>
					<div className='flex items-center gap-2'>
						<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
							<svg
								className='w-4 h-4 text-primary'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
								/>
							</svg>
						</div>
						<span className='font-medium text-text'>{author}</span>
					</div>
					<span>·</span>
					<time dateTime={article.createdAt}>
						{new Date(article.createdAt).toLocaleDateString('zh-TW', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</time>
				</div>
			</header>

			{/* 封面圖 */}
			{coverImage && (
				<div className='relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden mb-10'>
					<Image
						src={coverImage}
						alt={article.title}
						fill
						className='object-cover'
						sizes='(max-width: 1024px) 100vw, 896px'
						priority
					/>
				</div>
			)}

			{/* 文章內容 */}
			{content && (
				<div
					className='prose prose-lg max-w-none text-text
					prose-headings:text-text prose-headings:font-bold
					prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
					prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
					prose-p:text-text-muted prose-p:leading-relaxed prose-p:mb-4
					prose-li:text-text-muted prose-li:leading-relaxed
					prose-strong:text-text prose-strong:font-semibold
					prose-a:text-primary prose-a:no-underline hover:prose-a:underline
					prose-ul:my-4 prose-ol:my-4'
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			)}

			{/* 分享與返回 */}
			<div className='mt-12 pt-8 border-t border-border flex items-center justify-between'>
				<AppLink
					href='/blog'
					className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer'
				>
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
							d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
						/>
					</svg>
					返回部落格
				</AppLink>
			</div>

			{/* 相關文章 */}
			{relatedArticles.length > 0 && (
				<section className='mt-16'>
					<h2 className='text-xl font-bold text-text mb-6'>相關文章</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
						{relatedArticles.map((a) => (
							<ArticleCard key={a.id} article={a} />
						))}
					</div>
				</section>
			)}

			{/* JSON-LD 結構化資料 */}
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Article',
						headline: article.title,
						description: article.excerpt || '',
						image: coverImage,
						author: { '@type': 'Person', name: author },
						datePublished: article.createdAt,
						dateModified: article.updatedAt,
						publisher: {
							'@type': 'Organization',
							name: '產品型錄平台',
						},
					}),
				}}
			/>
		</div>
	);
}
