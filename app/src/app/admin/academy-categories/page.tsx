'use client';

export const runtime = 'edge';

import { useEffect, useMemo, useState } from 'react';
import AppLink from '@/components/AppLink';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { AdminPagination, SortableHeader, type SortConfig } from '@/components/AdminPagination';
import type { ApiAcademyCategory } from '@/data/types';
import {
	deleteAcademyCategoryApi,
	fetchAcademyCategories,
	updateAcademyCategoryOrderApi,
} from '@/lib/api';

export default function AdminAcademyCategoriesPage() {
	const [categoryList, setCategoryList] = useState<ApiAcademyCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState<SortConfig<ApiAcademyCategory>>({
		key: 'id',
		direction: 'asc',
	});
	const ITEMS_PER_PAGE = 20;

	const loadData = async () => {
		try {
			const categories = await fetchAcademyCategories();
			setCategoryList(categories);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setIsMounted(true);
		void loadData();
	}, []);

	const handleDelete = async (id: number) => {
		if (!confirm('確定要刪除此分類嗎？')) return;
		try {
			await deleteAcademyCategoryApi(id);
			await loadData();
		} catch (error) {
			alert('刪除失敗');
			console.error(error);
		}
	};

	const processedCategories = useMemo(() => {
		return Array.from(categoryList).sort((a, b) => {
			if (!sortConfig.key) return 0;
			const aValue = a[sortConfig.key];
			const bValue = b[sortConfig.key];
			if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
			if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
			if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
			return 0;
		});
	}, [categoryList, sortConfig]);

	const paginatedCategories = processedCategories.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(processedCategories.length / ITEMS_PER_PAGE);

	const handleSort = (key: keyof ApiAcademyCategory) => {
		setSortConfig((current) => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

	const onDragEnd = async (result: DropResult) => {
		if (!result.destination) return;
		if (result.source.index === result.destination.index) return;

		const updatedCategories = Array.from(categoryList);
		const [reorderedItem] = updatedCategories.splice(result.source.index, 1);
		updatedCategories.splice(result.destination.index, 0, reorderedItem);
		setCategoryList(updatedCategories);

		try {
			const updates = updatedCategories.map((category, index) => ({ id: category.id, order: index }));
			await updateAcademyCategoryOrderApi(updates);
		} catch (error) {
			console.error('Failed to update academy category order', error);
			await loadData();
		}
	};

	if (loading || !isMounted) {
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
					<h1 className='text-2xl font-bold text-text'>校友學院分類</h1>
					<p className='text-text-muted text-sm mt-1'>管理課程分類與顯示順序</p>
				</div>
				<AppLink
					href='/admin/academy-categories/new'
					className='inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer'
				>
					新增分類
				</AppLink>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<table className='w-full'>
					<thead>
						<tr className='bg-surface-alt'>
							<SortableHeader<ApiAcademyCategory>
								label='ID'
								sortKey='id'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<SortableHeader<ApiAcademyCategory>
								label='分類名稱'
								sortKey='name'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<SortableHeader<ApiAcademyCategory>
								label='Slug'
								sortKey='slug'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<SortableHeader<ApiAcademyCategory>
								label='狀態'
								sortKey='isActive'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<th className='px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right w-24'>
								操作
							</th>
						</tr>
					</thead>
					<DragDropContext onDragEnd={(result) => void onDragEnd(result)}>
						<Droppable
							droppableId='academy-categories-table'
							isDropDisabled={sortConfig.key !== 'id' || sortConfig.direction !== 'asc'}
						>
							{(provided) => (
								<tbody
									className='divide-y divide-border'
									{...provided.droppableProps}
									ref={provided.innerRef}
								>
									{paginatedCategories.length === 0 ? (
										<tr>
											<td colSpan={5} className='px-5 py-12 text-center text-text-light text-sm'>
												沒有分類
											</td>
										</tr>
									) : (
										paginatedCategories.map((category, index) => (
											<Draggable
												key={category.id.toString()}
												draggableId={category.id.toString()}
												index={index}
												isDragDisabled={sortConfig.key !== 'id' || sortConfig.direction !== 'asc'}
											>
												{(draggableProvided) => (
													<tr
														ref={draggableProvided.innerRef}
														{...draggableProvided.draggableProps}
														className='hover:bg-surface/50 transition-colors duration-150'
													>
														<td className='px-5 py-4 w-12'>
															<div
																{...draggableProvided.dragHandleProps}
																className='text-text-muted cursor-grab active:cursor-grabbing'
															>
																≡
															</div>
														</td>
														<td className='px-5 py-4 text-sm font-medium text-text'>{category.name}</td>
														<td className='px-5 py-4 text-sm text-text-muted'>{category.slug}</td>
														<td className='px-5 py-4 text-sm text-text-muted'>
															{category.isActive ? '啟用' : '停用'}
														</td>
														<td className='px-5 py-4 text-right'>
															<div className='flex items-center justify-end gap-2'>
																<AppLink
																	href={`/admin/academy-categories/${category.id}`}
																	className='p-1.5 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
																>
																	編輯
																</AppLink>
																<button
																	onClick={() => void handleDelete(category.id)}
																	className='p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors duration-200 cursor-pointer'
																>
																	刪除
																</button>
															</div>
														</td>
													</tr>
												)}
											</Draggable>
										))
									)}
									{provided.placeholder}
								</tbody>
							)}
						</Droppable>
					</DragDropContext>
				</table>
				<AdminPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					totalItems={processedCategories.length}
					itemsPerPage={ITEMS_PER_PAGE}
				/>
			</div>
		</div>
	);
}
