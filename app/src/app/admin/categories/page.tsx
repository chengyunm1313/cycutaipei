'use client';

export const runtime = 'edge';

import { useState, useEffect, useMemo } from 'react';
import AppLink from '@/components/AppLink';
import type { ApiCategory } from '@/data/types';
import { fetchCategories, deleteCategoryApi } from '@/lib/api';
import { AdminPagination, SortableHeader, type SortConfig } from '@/components/AdminPagination';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { buildCategoryTree, type CategoryNodes } from '@/lib/treeUtils';

/**
 * 後台 - 分類管理頁面
 * 從 D1 API 動態載入
 */
export default function AdminCategoriesPage() {
	const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [isMounted, setIsMounted] = useState(false);

	// Pagination & Sorting state
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState<SortConfig<ApiCategory>>({
		key: 'id',
		direction: 'asc',
	});
	const ITEMS_PER_PAGE = 20; // 分類通常較多，設為 20

	const loadData = async () => {
		try {
			const cats = await fetchCategories();
			setCategoryList(cats);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setIsMounted(true);
		loadData();
	}, []);

	const handleDelete = async (id: number) => {
		if (!confirm('確定要刪除此分類嗎？')) return;
		try {
			await deleteCategoryApi(id);
			loadData();
		} catch (error) {
			alert('刪除失敗');
			console.error(error);
		}
	};

	// 將樹狀結構轉回扁平列表供顯示，並加上深度資訊
	const flattenTree = (nodes: CategoryNodes[], depth = 0): (ApiCategory & { depth: number })[] => {
		const result: (ApiCategory & { depth: number })[] = [];
		nodes.forEach((node) => {
			result.push({ ...node, depth });
			if (node.children && node.children.length > 0) {
				result.push(...flattenTree(node.children, depth + 1));
			}
		});
		return result;
	};

	const processedCategories = useMemo(() => {
		// 如果是自定義排序，則走原本的排序邏輯
		if (sortConfig.key !== 'id' || sortConfig.direction !== 'asc') {
			return Array.from(categoryList)
				.sort((a, b) => {
					if (!sortConfig.key) return 0;
					const aValue = a[sortConfig.key];
					const bValue = b[sortConfig.key];
					if (aValue === undefined || aValue === null)
						return sortConfig.direction === 'asc' ? 1 : -1;
					if (bValue === undefined || bValue === null)
						return sortConfig.direction === 'asc' ? -1 : 1;
					if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
					if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
					return 0;
				})
				.map((cat) => ({ ...cat, depth: 0 }));
		}

		// 預設（ID 升冪）時：顯示 WordPress 式的階層結構
		const tree = buildCategoryTree(categoryList);
		return flattenTree(tree);
	}, [categoryList, sortConfig]);

	const paginatedCategories = processedCategories.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(processedCategories.length / ITEMS_PER_PAGE);

	const handleSort = (key: keyof ApiCategory) => {
		setSortConfig((current) => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
	};

	const onDragEnd = async (result: DropResult) => {
		if (!result.destination) return;

		const sourceIndex = result.source.index;
		const destinationIndex = result.destination.index;

		if (sourceIndex === destinationIndex) return;

		// Client side update for optimistic UI
		const updatedCategories = Array.from(categoryList);
		const [reorderedItem] = updatedCategories.splice(sourceIndex, 1);
		updatedCategories.splice(destinationIndex, 0, reorderedItem);

		setCategoryList(updatedCategories);

		// Prepare ordering payload (assuming a batch update API or similar will be handled in api.ts)
		try {
			// Dynamic import to avoid circular dependency or SSR issues
			const { updateCategoryOrderApi } = await import('@/lib/api');
			const updates = updatedCategories.map((c, idx) => ({ id: c.id, order: idx }));
			await updateCategoryOrderApi(updates);
		} catch (error) {
			console.error('Failed to update category order', error);
			// Optionally revert state on failure
			loadData();
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
					<h1 className='text-2xl font-bold text-text'>分類管理</h1>
					<p className='text-text-muted text-sm mt-1'>管理活動資訊分類</p>
				</div>
				<AppLink
					href='/admin/categories/new'
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
					新增分類
				</AppLink>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<table className='w-full'>
					<thead>
						<tr className='bg-surface-alt'>
							<SortableHeader<ApiCategory>
								label='ID'
								sortKey='id'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<th className='px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-16'>
								縮圖
							</th>
							<SortableHeader<ApiCategory>
								label='分類名稱'
								sortKey='name'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<SortableHeader<ApiCategory>
								label='Slug'
								sortKey='slug'
								sortConfig={sortConfig}
								onSort={handleSort}
							/>
							<SortableHeader<ApiCategory>
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
					<DragDropContext onDragEnd={onDragEnd}>
						<Droppable
							droppableId='categories-table'
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
										paginatedCategories.map(
											(cat: ApiCategory & { depth: number }, index: number) => (
												<Draggable
													key={cat.id.toString()}
													draggableId={cat.id.toString()}
													index={index}
													isDragDisabled={sortConfig.key !== 'id' || sortConfig.direction !== 'asc'}
												>
													{(provided, snapshot) => (
														<tr
															ref={provided.innerRef}
															{...provided.draggableProps}
															className={`hover:bg-surface/50 transition-colors duration-150 ${
																snapshot.isDragging ? 'bg-surface shadow-lg z-10' : ''
															}`}
															style={provided.draggableProps.style}
														>
															<td className='px-5 py-4 w-12'>
																<div
																	{...provided.dragHandleProps}
																	className={`p-1 -ml-1 flex items-center justify-center ${
																		sortConfig.key !== 'id' || sortConfig.direction !== 'asc'
																			? 'text-border cursor-not-allowed'
																			: 'text-text-muted hover:text-text cursor-grab active:cursor-grabbing'
																	}`}
																	title={
																		sortConfig.key !== 'id' || sortConfig.direction !== 'asc'
																			? '請先按 ID 升冪排序才能拖曳'
																			: '拖曳排序'
																	}
																>
																	<svg
																		className='w-5 h-5 opacity-50'
																		fill='none'
																		viewBox='0 0 24 24'
																		stroke='currentColor'
																	>
																		<path
																			strokeLinecap='round'
																			strokeLinejoin='round'
																			strokeWidth={2}
																			d='M4 8h16M4 16h16'
																		/>
																	</svg>
																</div>
															</td>
															<td className='px-5 py-4 text-sm text-text-muted'>{cat.id}</td>
															<td className='px-5 py-4 w-16'>
																{cat.image ? (
																	<div className='w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0 border border-border'>
																		{/* eslint-disable-next-line @next/next/no-img-element */}
																		<img
																			src={cat.image}
																			alt={cat.name}
																			className='w-full h-full object-cover'
																		/>
																	</div>
																) : (
																	<div className='w-10 h-10 rounded-lg bg-surface-alt border border-dashed border-border flex items-center justify-center text-text-muted text-xs flex-shrink-0'>
																		無
																	</div>
																)}
															</td>
															<td className='px-5 py-4'>
																<div className='flex items-center gap-1.5'>
																	{cat.depth > 0 && (
																		<span className='inline-block text-text-light/50 font-mono'>
																			{'—'.repeat(cat.depth)}
																		</span>
																	)}
																	<p className='text-sm font-medium text-text'>{cat.name}</p>
																</div>
																<p className='text-xs text-text-light mt-1 pl-[calc(1.25rem*var(--depth,0))]'>
																	{cat.description || '暫無描述'}
																</p>
															</td>
															<td className='px-5 py-4 text-sm text-text-muted font-mono'>
																{cat.slug}
															</td>
															<td className='px-5 py-4'>
																{!!cat.isActive ? (
																	<span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200/50'>
																		啟用
																	</span>
																) : (
																	<span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200/50'>
																		停用
																	</span>
																)}
															</td>
															<td className='px-5 py-4 text-right w-24'>
																<div className='flex items-center justify-end gap-2'>
																	<AppLink
																		href={`/admin/categories/${cat.id}`}
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
																		onClick={() => handleDelete(cat.id)}
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
													)}
												</Draggable>
											)
										)
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
