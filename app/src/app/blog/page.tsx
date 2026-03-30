'use client';

import { useState, useMemo, useEffect } from 'react';
import ArticleCard from '@/components/ArticleCard';
import Breadcrumb from '@/components/Breadcrumb';
import { fetchArticles } from '@/lib/api';
import type { ApiArticle } from '@/data/types';

/**
 * 部落格列表頁
 * 從 D1 API 動態載入文章
 */
export default function BlogPage() {
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [articles, setArticles] = useState<ApiArticle[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchArticles('published')
			.then(setArticles)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	// 從文章中動態收集分類
	const categories = useMemo(() => {
		const cats = new Set<string>();
		articles.forEach((a) => {
			if (a.category) cats.add(a.category);
		});
		return Array.from(cats).sort();
	}, [articles]);

	const filteredArticles = useMemo(() => {
		let result = articles;
		if (selectedCategory) {
			result = result.filter((a) => a.category === selectedCategory);
		}
		return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [articles, selectedCategory]);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<Breadcrumb items={[{ label: '最新消息' }]} />

			{/* 標題 */}
			<div className='mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-text'>最新消息</h1>
				<p className='text-text-muted mt-2'>校友會公告、活動紀錄與最新動態</p>
			</div>

			{/* 分類篩選 */}
			<div className='flex flex-wrap gap-2 mb-8'>
				<button
					onClick={() => setSelectedCategory('')}
					className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${
						!selectedCategory
							? 'bg-primary text-white border-primary'
							: 'bg-card text-text-muted border-border hover:border-primary/30 hover:text-primary'
					}`}
				>
					全部
				</button>
				{categories.map((cat) => (
					<button
						key={cat}
						onClick={() => setSelectedCategory(cat)}
						className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 cursor-pointer ${
							selectedCategory === cat
								? 'bg-primary text-white border-primary'
								: 'bg-card text-text-muted border-border hover:border-primary/30 hover:text-primary'
						}`}
					>
						{cat}
					</button>
				))}
			</div>

			{/* 載入中 */}
			{loading ? (
				<div className='flex items-center justify-center py-20'>
					<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
				</div>
			) : filteredArticles.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{filteredArticles.map((article) => (
						<ArticleCard key={article.id} article={article} />
					))}
				</div>
			) : (
				<div className='text-center py-20'>
					<svg
						className='w-16 h-16 text-text-light mx-auto mb-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z'
						/>
					</svg>
					<h3 className='text-lg font-semibold text-text mb-1'>此分類尚無最新消息</h3>
					<p className='text-text-muted'>請嘗試選擇其他分類</p>
				</div>
			)}
		</div>
	);
}
