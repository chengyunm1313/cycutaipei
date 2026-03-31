'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import AcademyCourseCard from '@/components/AcademyCourseCard';
import { fetchAcademyCategories, fetchAcademyCourses } from '@/lib/api';
import type { ApiAcademyCategory, ApiAcademyCourse } from '@/data/types';
import { resolveContentDate } from '@/lib/contentDate';

const ITEMS_PER_PAGE = 9;

function AcademyContent() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const initialCategorySlug = searchParams.get('category') || '';

	const [courses, setCourses] = useState<ApiAcademyCourse[]>([]);
	const [categories, setCategories] = useState<ApiAcademyCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState(initialQuery);
	const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);
	const [sortBy, setSortBy] = useState<'newest' | 'title'>('newest');
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		Promise.all([fetchAcademyCourses(), fetchAcademyCategories(true)])
			.then(([courseData, categoryData]) => {
				setCourses(courseData);
				setCategories(categoryData);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		setQuery(initialQuery);
		setSelectedCategorySlug(initialCategorySlug);
		setCurrentPage(1);
	}, [initialQuery, initialCategorySlug]);

	const filteredCourses = useMemo(() => {
		const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);

		let result = [...courses].filter((course) => course.status === 'published');

		if (query) {
			const q = query.toLowerCase();
			result = result.filter(
				(course) =>
					course.title.toLowerCase().includes(q) || course.excerpt?.toLowerCase().includes(q)
			);
		}

		if (selectedCategory) {
			result = result.filter((course) => course.categoryId === selectedCategory.id);
		}

		result.sort((a, b) => {
			if (sortBy === 'newest') {
				return new Date(resolveContentDate(b)).getTime() - new Date(resolveContentDate(a)).getTime();
			}
			return a.title.localeCompare(b.title, 'zh-TW');
		});

		return result;
	}, [categories, courses, query, selectedCategorySlug, sortBy]);

	const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
	const pagedCourses = filteredCourses.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const resetFilters = () => {
		setQuery('');
		setSelectedCategorySlug('');
		setSortBy('newest');
		setCurrentPage(1);
	};

	return (
		<>
			<div className='mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-text'>校友學院</h1>
				<p className='text-text-muted mt-2'>共 {filteredCourses.length} 筆課程內容</p>
			</div>

			<div className='bg-card rounded-2xl border border-border p-4 sm:p-5 mb-8'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
					<div className='relative'>
						<input
							type='text'
							placeholder='搜尋課程內容...'
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
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
						value={selectedCategorySlug}
						onChange={(event) => {
							setSelectedCategorySlug(event.target.value);
							setCurrentPage(1);
						}}
						className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
					>
						<option value=''>全部分類</option>
						{categories.map((category) => (
							<option key={category.id} value={category.slug}>
								{category.name}
							</option>
						))}
					</select>

					<select
						value={sortBy}
						onChange={(event) => setSortBy(event.target.value as 'newest' | 'title')}
						className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
					>
						<option value='newest'>最新課程</option>
						<option value='title'>名稱排序</option>
					</select>
				</div>

				{loading ? (
					<div className='mt-2 flex items-center gap-2 text-xs text-text-light'>
						<div className='w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin' />
						更新中...
					</div>
				) : null}

				{(query || selectedCategorySlug) && (
					<button
						onClick={resetFilters}
						className='mt-3 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer transition-colors duration-200'
					>
						清除所有篩選
					</button>
				)}
			</div>

			{pagedCourses.length > 0 ? (
				<>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
						{pagedCourses.map((course) => (
							<AcademyCourseCard
								key={course.id}
								course={course}
								categoryName={categories.find((category) => category.id === course.categoryId)?.name}
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
					<h3 className='text-lg font-semibold text-text mb-1'>找不到符合條件的課程內容</h3>
					<p className='text-text-muted'>請嘗試調整篩選條件或搜尋關鍵字</p>
				</div>
			)}
		</>
	);
}

export default function AcademyPage() {
	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<Breadcrumb items={[{ label: '校友學院' }]} />
			<Suspense
				fallback={
					<div className='text-center py-20'>
						<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
						<p className='text-text-muted'>載入中...</p>
					</div>
				}
			>
				<AcademyContent />
			</Suspense>
		</div>
	);
}
