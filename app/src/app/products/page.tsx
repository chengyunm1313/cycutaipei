'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import { fetchProducts, fetchCategories } from '@/lib/api';
import type { ApiProduct, ApiCategory } from '@/data/types';

const ITEMS_PER_PAGE = 9;

function ProductsContent() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get('q') || '';

	const [products, setProducts] = useState<ApiProduct[]>([]);
	const [categories, setCategories] = useState<ApiCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState(initialQuery);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
	const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		Promise.all([fetchProducts(), fetchCategories()])
			.then(([prodData, catData]) => {
				setProducts(prodData);
				setCategories(catData);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const filteredProducts = useMemo(() => {
		let result = [...products].filter((p) => p.status === 'published');

		if (query) {
			const q = query.toLowerCase();
			result = result.filter(
				(p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
			);
		}

		if (selectedCategory) {
			result = result.filter((p) => p.categoryId === selectedCategory);
		}

		result.sort((a, b) => {
			if (sortBy === 'newest') {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
			return a.name.localeCompare(b.name, 'zh-TW');
		});

		return result;
	}, [products, query, selectedCategory, sortBy]);

	const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
	const pagedProducts = filteredProducts.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const resetFilters = () => {
		setQuery('');
		setSelectedCategory(null);
		setSortBy('newest');
		setCurrentPage(1);
	};

	return (
		<>
			{/* 標題 */}
			<div className='mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-text'>活動資訊</h1>
				<p className='text-text-muted mt-2'>共 {filteredProducts.length} 筆活動資訊</p>
			</div>

			{/* 篩選列 */}
			<div className='bg-card rounded-2xl border border-border p-4 sm:p-5 mb-8'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
					<div className='relative'>
						<input
							type='text'
							placeholder='搜尋活動資訊...'
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setCurrentPage(1);
							}}
							className='w-full pl-9 pr-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
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
					</div>

					<select
						value={selectedCategory ?? ''}
						onChange={(e) => {
							setSelectedCategory(e.target.value ? Number(e.target.value) : null);
							setCurrentPage(1);
						}}
						className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
					>
						<option value=''>全部分類</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>

					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
						className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
					>
						<option value='newest'>最新活動</option>
						<option value='name'>名稱排序</option>
					</select>
				</div>

				{loading && (
					<div className='mt-2 flex items-center gap-2 text-xs text-text-light'>
						<div className='w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin' />
						更新中...
					</div>
				)}

				{(query || selectedCategory) && (
					<button
						onClick={resetFilters}
						className='mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors duration-200'
					>
						清除所有篩選
					</button>
				)}
			</div>

			{/* 活動資訊 Grid */}
			{pagedProducts.length > 0 ? (
				<>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
						{pagedProducts.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								categoryName={categories.find((c) => c.id === product.categoryId)?.name}
							/>
						))}
					</div>
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
					/>
				</>
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
							d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
						/>
					</svg>
					<h3 className='text-lg font-semibold text-text mb-1'>找不到符合條件的活動資訊</h3>
					<p className='text-text-muted'>請嘗試調整篩選條件或搜尋關鍵字</p>
				</div>
			)}
		</>
	);
}

/**
 * 活動資訊列表頁
 * 使用 Suspense 包裝 useSearchParams
 */
export default function ProductsPage() {
	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<Breadcrumb items={[{ label: '活動資訊' }]} />
			<Suspense
				fallback={
					<div className='text-center py-20'>
						<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
						<p className='text-text-muted'>載入中...</p>
					</div>
				}
			>
				<ProductsContent />
			</Suspense>
		</div>
	);
}
