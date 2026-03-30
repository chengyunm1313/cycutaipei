'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { fetchProducts, fetchCategories, deleteProductApi } from '@/lib/api';
import type { ApiProduct, ApiCategory } from '@/data/types';
import { AdminPagination, SortableHeader, type SortConfig } from '@/components/AdminPagination';
import { getPrimaryImageUrl } from '@/lib/imageValue';

/**
 * 後台 - 活動資訊管理頁面
 * 從 D1 API 動態載入資料
 */
export default function AdminProductsPage() {
	const [productList, setProductList] = useState<ApiProduct[]>([]);
	const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
	const [loading, setLoading] = useState(true);

	// Pagination & Sorting state
	const [currentPage, setCurrentPage] = useState(1);
	const [sortConfig, setSortConfig] = useState<SortConfig<ApiProduct>>({
		key: 'createdAt',
		direction: 'desc',
	});
	const ITEMS_PER_PAGE = 10;

	const loadData = async () => {
		try {
			const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
			setProductList(prods);
			setCategoryList(cats);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleDelete = async (id: number) => {
		if (!confirm('確定要刪除此產品嗎？')) return;
		try {
			await deleteProductApi(id);
			loadData();
		} catch (error) {
			alert('刪除失敗');
			console.error(error);
		}
	};

	const getCategoryName = (categoryId: number | null) => {
		if (!categoryId) return '未分類';
		const cat = categoryList.find((c) => c.id === categoryId);
		return cat?.name || '未分類';
	};

	const processedProducts = Array.from(productList).sort((a, b) => {
		if (!sortConfig.key) return 0;
		const aValue = a[sortConfig.key];
		const bValue = b[sortConfig.key];

		if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
		if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

		if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
		if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
		return 0;
	});

	const paginatedProducts = processedProducts.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);

	const handleSort = (key: keyof ApiProduct) => {
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
					<h1 className='text-2xl font-bold text-text'>活動資訊管理</h1>
					<p className='text-text-muted text-sm mt-1'>管理所有活動資訊資料</p>
				</div>
				<AppLink
					href='/admin/products/new'
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
					新增活動資訊
				</AppLink>
			</div>

			{/* 活動資訊表格 */}
			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-surface-alt'>
								<th className='px-5 py-3 text-left w-16'>
									<span className='sr-only'>圖片</span>
								</th>
								<SortableHeader<ApiProduct>
									label='活動資訊'
									sortKey='name'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiProduct>
									label='分類'
									sortKey='categoryId'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiProduct>
									label='狀態'
									sortKey='status'
									sortConfig={sortConfig}
									onSort={handleSort}
								/>
								<SortableHeader<ApiProduct>
									label='更新時間'
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
							{paginatedProducts.length === 0 ? (
								<tr>
									<td colSpan={6} className='px-5 py-12 text-center text-text-light text-sm'>
										沒有活動資訊
									</td>
								</tr>
							) : (
								paginatedProducts.map((product) => {
									const previewImage = product.listImage || getPrimaryImageUrl(product.images);
									return (
										<tr
											key={product.id}
											className='hover:bg-surface/50 transition-colors duration-150'
										>
											<td className='px-5 py-4'>
												<div className='flex items-center gap-3'>
													<div className='w-12 h-12 rounded-lg bg-surface-alt flex-shrink-0 border border-border flex items-center justify-center text-text-light text-xs overflow-hidden'>
														{previewImage ? (
															/* eslint-disable-next-line @next/next/no-img-element */
															<img
																src={previewImage}
																alt={product.name}
																className='w-full h-full object-cover'
															/>
														) : (
															'無圖片'
														)}
													</div>
													<div className='min-w-0'>
														<p className='text-sm font-medium text-text truncate'>{product.name}</p>
														<p className='text-xs text-text-light truncate'>{product.slug}</p>
													</div>
												</div>
											</td>
											<td className='px-5 py-4'>
												<span className='text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary'>
													{getCategoryName(product.categoryId)}
												</span>
											</td>
											<td className='px-5 py-4'>
												<span
													className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
														product.status === 'published'
															? 'bg-green-100 text-green-700 border-green-200/50'
															: 'bg-amber-100 text-amber-700 border-amber-200/50'
													}`}
												>
													{product.status === 'published' ? '已上架' : '草稿'}
												</span>
											</td>
											<td className='px-5 py-4 text-sm text-text-muted'>
												{new Date(product.createdAt).toLocaleDateString('zh-TW')}
											</td>
											<td className='px-5 py-4 text-right'>
												<div className='flex items-center justify-end gap-2'>
													<AppLink
														href={`/product/${product.slug}`}
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
														href={`/admin/products/${product.id}`}
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
														onClick={() => handleDelete(product.id)}
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
									);
								})
							)}
						</tbody>
					</table>
				</div>
				<AdminPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					totalItems={processedProducts.length}
					itemsPerPage={ITEMS_PER_PAGE}
				/>
			</div>
		</div>
	);
}
