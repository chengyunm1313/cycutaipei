'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLink from '@/components/AppLink';
import { fetchArticles, fetchArticleCategories } from '@/lib/api';
import type { ApiArticle } from '@/data/types';
import { AdminPagination, SortableHeader, type SortConfig } from '@/components/AdminPagination';

type TabFilter = 'all' | 'published' | 'draft';

/**
 * 後台 - 文章內容管理列表
 * 排版對齊產品管理操作節奏，強化篩選與可讀性
 */
export default function AdminArticlesContentPage() {
	const [tab, setTab] = useState<TabFilter>('all');
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [availableCategories, setAvailableCategories] = useState<string[]>([]);
	const [articles, setArticles] = useState<ApiArticle[]>([]);
	const [loading, setLoading] = useState(true);

	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState<SortConfig<ApiArticle>>({
		key: 'createdAt',
		direction: 'desc',
	});
	const ITEMS_PER_PAGE = 10;

	useEffect(() => {
		Promise.all([fetchArticles(), fetchArticleCategories(true)])
			.then(([articleRows, categoryRows]) => {
				setArticles(articleRows);
				setAvailableCategories(categoryRows.map((c) => c.name));
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const processedArticles = useMemo(() => {
		const keyword = search.trim().toLowerCase();
		const result = articles.filter((article) => {
			const matchTab = tab === 'all' || article.status === tab;
			const matchCategory =
				categoryFilter === 'all' || (article.category || '').trim() === categoryFilter;
			const matchSearch =
				!keyword ||
				article.title.toLowerCase().includes(keyword) ||
				(article.category || '').toLowerCase().includes(keyword) ||
				(article.author || '').toLowerCase().includes(keyword);

			return matchTab && matchCategory && matchSearch;
		});

		if (sortConfig.key) {
			result.sort((a, b) => {
				const aValue = a[sortConfig.key as keyof ApiArticle];
				const bValue = b[sortConfig.key as keyof ApiArticle];
				if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
				if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
				if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
				if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [articles, tab, categoryFilter, search, sortConfig]);

	const paginatedArticles = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return processedArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [processedArticles, currentPage]);

	const totalPages = Math.ceil(processedArticles.length / ITEMS_PER_PAGE);

	const handleSort = (key: keyof ApiArticle) => {
		setSortConfig((current) => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

	useEffect(() => {
		setCurrentPage(1);
	}, [search, tab, categoryFilter]);

	const publishedCount = articles.filter((a) => a.status === 'published').length;
	const draftCount = articles.filter((a) => a.status === 'draft').length;

	const tabs: { key: TabFilter; label: string; count: number }[] = [
		{ key: 'all', label: '全部', count: articles.length },
		{ key: 'published', label: '已發佈', count: publishedCount },
		{ key: 'draft', label: '草稿', count: draftCount },
	];

	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div>
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-text'>文章管理 - 內容管理</h1>
					<p className='text-text-muted text-sm mt-1'>以表格方式維護文章內容與發佈狀態</p>
				</div>
				<AppLink
					href='/admin/articles/new'
					className='inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer'
				>
					<svg
						className='w-4 h-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
					</svg>
					新增文章
				</AppLink>
			</div>

			<div className='flex flex-col gap-3 mb-4'>
				<div className='flex flex-wrap items-center gap-2'>
					{tabs.map((item) => (
						<button
							key={item.key}
							onClick={() => setTab(item.key)}
							className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
								tab === item.key
									? 'bg-card text-text shadow-sm border border-border'
									: 'text-text-muted hover:text-text bg-surface'
							}`}
						>
							{item.label}
							<span className='ml-1 opacity-60'>({item.count})</span>
						</button>
					))}
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<button
						onClick={() => setCategoryFilter('all')}
						className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
							categoryFilter === 'all'
								? 'bg-primary text-white'
								: 'bg-surface text-text-muted hover:text-text'
						}`}
					>
						所有分類
					</button>
					{availableCategories.map((name) => (
						<button
							key={name}
							onClick={() => setCategoryFilter(name)}
							className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
								categoryFilter === name
									? 'bg-primary text-white'
									: 'bg-surface text-text-muted hover:text-text'
							}`}
						>
							{name}
						</button>
					))}
				</div>

				<div className='relative max-w-xs'>
					<svg
						className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
						/>
					</svg>
					<input
						type='text'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder='搜尋文章標題 / 作者 / 分類...'
						className='w-full pl-9 pr-4 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
					/>
				</div>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-surface-alt'>
								<SortableHeader<ApiArticle>
									label='文章標題'
									sortKey='title'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiArticle>
									label='分類'
									sortKey='category'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiArticle>
									label='作者'
									sortKey='author'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiArticle>
									label='狀態'
									sortKey='status'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiArticle>
									label='日期'
									sortKey='createdAt'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right'>
									操作
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{paginatedArticles.length === 0 ? (
								<tr>
									<td colSpan={6} className='px-5 py-12 text-center'>
										<p className='text-text-light text-sm'>
											{search || categoryFilter !== 'all'
												? '沒有符合目前篩選條件的文章'
												: '目前沒有文章'}
										</p>
									</td>
								</tr>
							) : (
								paginatedArticles.map((article) => (
									<tr
										key={article.id}
										className='hover:bg-surface/50 transition-colors duration-150'
									>
										<td className='px-5 py-4'>
											<div className='min-w-0'>
												<p className='text-sm font-medium text-text truncate max-w-xs'>
													{article.title}
												</p>
												<p className='text-xs text-text-light truncate max-w-xs mt-0.5'>
													{article.excerpt || '無摘要'}
												</p>
											</div>
										</td>
										<td className='px-5 py-4'>
											<span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
												{article.category || '未分類'}
											</span>
										</td>
										<td className='px-5 py-4 text-sm text-text-muted'>{article.author || '-'}</td>
										<td className='px-5 py-4'>
											<span
												className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
													article.status === 'published'
														? 'bg-green-100 text-green-700 border-green-200/50'
														: 'bg-amber-100 text-amber-700 border-amber-200/50'
												}`}
											>
												{article.status === 'published' ? '已發佈' : '草稿'}
											</span>
										</td>
										<td className='px-5 py-4 text-sm text-text-muted'>
											{new Date(article.createdAt).toLocaleDateString('zh-TW')}
										</td>
										<td className='px-5 py-4 text-right'>
											<div className='flex items-center justify-end gap-1'>
												<AppLink
													href={`/blog/${article.slug}`}
													className='p-1.5 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
													title='預覽'
												>
													<svg
														className='w-4 h-4 text-text-muted'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={2}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
														/>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
														/>
													</svg>
												</AppLink>
												<AppLink
													href={`/admin/articles/${article.id}`}
													className='p-1.5 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
													title='編輯'
												>
													<svg
														className='w-4 h-4 text-text-muted'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={2}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
														/>
													</svg>
												</AppLink>
												<button
													onClick={async () => {
														if (!confirm(`確定要刪除「${article.title}」嗎？`)) return;
														try {
															const { deleteArticleApi } = await import('@/lib/api');
															await deleteArticleApi(article.id);
															setArticles((prev) => prev.filter((a) => a.id !== article.id));
														} catch {
															alert('刪除失敗');
														}
													}}
													className='p-1.5 rounded-lg hover:bg-error/10 transition-colors duration-200 cursor-pointer'
													title='刪除'
												>
													<svg
														className='w-4 h-4 text-error'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={2}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
				<AdminPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					totalItems={processedArticles.length}
					itemsPerPage={ITEMS_PER_PAGE}
				/>
			</div>
		</div>
	);
}
