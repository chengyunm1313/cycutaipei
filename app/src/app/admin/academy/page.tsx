'use client';

import { useEffect, useState } from 'react';
import AppLink from '@/components/AppLink';
import { AdminPagination, SortableHeader, type SortConfig } from '@/components/AdminPagination';
import type { ApiAcademyCategory, ApiAcademyCourse } from '@/data/types';
import {
	deleteAcademyCourseApi,
	fetchAcademyCategories,
	fetchAcademyCourses,
} from '@/lib/api';

export default function AdminAcademyPage() {
	const [courseList, setCourseList] = useState<ApiAcademyCourse[]>([]);
	const [categoryList, setCategoryList] = useState<ApiAcademyCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState<SortConfig<ApiAcademyCourse>>({
		key: 'createdAt',
		direction: 'desc',
	});
	const ITEMS_PER_PAGE = 10;

	const loadData = async () => {
		try {
			const [courses, categories] = await Promise.all([
				fetchAcademyCourses(),
				fetchAcademyCategories(),
			]);
			setCourseList(courses);
			setCategoryList(categories);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadData();
	}, []);

	const getCategoryName = (categoryId: number | null) => {
		if (!categoryId) return '未分類';
		return categoryList.find((item) => item.id === categoryId)?.name || '未分類';
	};

	const handleDelete = async (id: number) => {
		if (!confirm('確定要刪除此課程嗎？')) return;
		try {
			await deleteAcademyCourseApi(id);
			await loadData();
		} catch (error) {
			alert('刪除失敗');
			console.error(error);
		}
	};

	const processedCourses = Array.from(courseList).sort((a, b) => {
		if (!sortConfig.key) return 0;
		const aValue = a[sortConfig.key];
		const bValue = b[sortConfig.key];

		if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
		if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
		if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
		if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
		return 0;
	});

	const paginatedCourses = processedCourses.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(processedCourses.length / ITEMS_PER_PAGE);

	const handleSort = (key: keyof ApiAcademyCourse) => {
		setSortConfig((current) => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

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
					<h1 className='text-2xl font-bold text-text'>校友學院管理</h1>
					<p className='text-text-muted text-sm mt-1'>管理所有課程內容</p>
				</div>
				<AppLink
					href='/admin/academy/new'
					className='inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer'
				>
					新增課程
				</AppLink>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-surface-alt'>
								<SortableHeader<ApiAcademyCourse>
									label='課程標題'
									sortKey='title'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiAcademyCourse>
									label='分類'
									sortKey='categoryId'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiAcademyCourse>
									label='狀態'
									sortKey='status'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiAcademyCourse>
									label='更新時間'
									sortKey='updatedAt'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right'>
									操作
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{paginatedCourses.length === 0 ? (
								<tr>
									<td colSpan={5} className='px-5 py-12 text-center text-text-light text-sm'>
										沒有課程內容
									</td>
								</tr>
							) : (
								paginatedCourses.map((course) => (
									<tr key={course.id} className='hover:bg-surface/50 transition-colors duration-150'>
										<td className='px-5 py-4'>
											<div className='min-w-0'>
												<p className='text-sm font-medium text-text truncate'>{course.title}</p>
												<p className='text-xs text-text-light truncate'>{course.slug}</p>
											</div>
										</td>
										<td className='px-5 py-4'>
											<span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
												{getCategoryName(course.categoryId)}
											</span>
										</td>
										<td className='px-5 py-4'>
											<span
												className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
													course.status === 'published'
														? 'bg-green-100 text-green-700 border-green-200/50'
														: 'bg-amber-100 text-amber-700 border-amber-200/50'
												}`}
											>
												{course.status === 'published' ? '已發布' : '草稿'}
											</span>
										</td>
										<td className='px-5 py-4 text-sm text-text-muted'>
											{new Date(course.updatedAt || course.createdAt).toLocaleDateString('zh-TW')}
										</td>
										<td className='px-5 py-4 text-right'>
											<div className='flex items-center justify-end gap-2'>
												<AppLink
													href={`/academy/${course.slug}`}
													className='p-1.5 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
													title='預覽'
												>
													預覽
												</AppLink>
												<AppLink
													href={`/admin/academy/${course.id}`}
													className='p-1.5 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
													title='編輯'
												>
													編輯
												</AppLink>
												<button
													onClick={() => void handleDelete(course.id)}
													className='p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors duration-200 cursor-pointer'
													title='刪除'
												>
													刪除
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
					totalItems={processedCourses.length}
					itemsPerPage={ITEMS_PER_PAGE}
				/>
			</div>
		</div>
	);
}
