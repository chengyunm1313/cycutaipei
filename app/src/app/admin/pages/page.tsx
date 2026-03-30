'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import { fetchPages, deletePageApi, updatePage } from '@/lib/api';
import type { ApiPage } from '@/data/types';

export default function PagesAdmin() {
	const [pages, setPages] = useState<ApiPage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState<number | null>(null);
	const router = useRouter();

	useEffect(() => {
		loadPages();
	}, []);

	const loadPages = async () => {
		try {
			setIsLoading(true);
			const data = await fetchPages();
			setPages(data);
		} catch (error) {
			console.error('Failed to load pages', error);
			alert('載入頁面失敗，請稍後再試。');
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await deletePageApi(id);
			await loadPages();
			setIsConfirmingDelete(null);
		} catch (error) {
			console.error('Failed to delete page', error);
			alert('刪除失敗，請稍後再試。');
		}
	};

	const handleToggleInMenu = async (id: number, currentStatus: number) => {
		try {
			const newStatus = currentStatus === 1 ? 0 : 1;
			await updatePage(id, { in_menu: newStatus });
			setPages((prev) => prev.map((p) => (p.id === id ? { ...p, in_menu: newStatus } : p)));
		} catch (error) {
			console.error('Failed to update in_menu status', error);
			alert('更新失敗，請稍後再試。');
		}
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='space-y-6 max-w-6xl mx-auto'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-black text-text tracking-tight'>頁面管理</h1>
					<p className='text-text-light mt-2'>
						管理自訂頁面（如關於我們、企業簡介等），並設定是否加入導覽列
					</p>
				</div>
				<AppLink
					href='/admin/pages/new'
					className='inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow active:scale-95'
				>
					<svg
						className='w-5 h-5'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
					</svg>
					新增頁面
				</AppLink>
			</div>

			<div className='bg-white rounded-2xl border border-border overflow-hidden shadow-sm'>
				<div className='overflow-x-auto'>
					<table className='w-full text-left border-collapse'>
						<thead>
							<tr className='bg-surface border-b border-border'>
								<th className='py-4 px-6 text-sm font-semibold text-text-muted'>標題</th>
								<th className='py-4 px-6 text-sm font-semibold text-text-muted'>網址 Slug</th>
								<th className='py-4 px-6 text-sm font-semibold text-text-muted'>顯示狀態</th>
								<th className='py-4 px-6 text-sm font-semibold text-text-muted text-right'>操作</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{pages.length === 0 ? (
								<tr>
									<td colSpan={5} className='py-12 text-center text-text-light'>
										<div className='flex flex-col items-center justify-center gap-3'>
											<svg
												className='w-12 h-12 text-border'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={1}
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
												/>
											</svg>
											<p>目前還沒有任何頁面</p>
											<AppLink
												href='/admin/pages/new'
												className='text-primary hover:text-primary-dark font-medium'
											>
												立即建立
											</AppLink>
										</div>
									</td>
								</tr>
							) : (
								pages.map((page) => (
									<tr
										key={page.id}
										className='hover:bg-surface/50 transition-colors duration-150 group'
									>
										<td className='py-4 px-6'>
											<span className='font-medium text-text'>{page.title}</span>
										</td>
										<td className='py-4 px-6 text-text-muted font-mono text-sm'>/{page.slug}</td>
										<td className='py-4 px-6'>
											<button
												onClick={() => handleToggleInMenu(page.id, page.in_menu)}
												className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95 ${
													page.in_menu === 1
														? 'bg-green-100 text-green-800 hover:bg-green-200'
														: 'bg-gray-100 text-gray-800 hover:bg-gray-200 opacity-60'
												}`}
											>
												{page.in_menu === 1 ? '顯示中' : '隱藏'}
											</button>
										</td>
										<td className='py-4 px-6'>
											<div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
												<AppLink
													href={`/${page.slug}`}
													target='_blank'
													className='p-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors'
													title='查看前台'
												>
													<svg
														className='w-5 h-5'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={1.5}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
														/>
													</svg>
												</AppLink>
												<AppLink
													href={`/admin/pages/${page.id}`}
													className='p-2 text-text-light hover:text-primary hover:bg-primary/5 rounded-lg transition-colors'
													title='編輯'
												>
													<svg
														className='w-5 h-5'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={1.5}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
														/>
													</svg>
												</AppLink>
												{isConfirmingDelete === page.id ? (
													<div className='flex items-center gap-1'>
														<button
															onClick={() => handleDelete(page.id)}
															className='p-1 border border-error text-error hover:bg-error/5 rounded text-xs px-2 font-medium'
														>
															確認
														</button>
														<button
															onClick={() => setIsConfirmingDelete(null)}
															className='p-1 border border-border text-text-muted hover:bg-surface rounded text-xs px-2'
														>
															取消
														</button>
													</div>
												) : (
													<button
														onClick={() => setIsConfirmingDelete(page.id)}
														className='p-2 text-text-light hover:text-error hover:bg-error/5 rounded-lg transition-colors'
														title='刪除'
													>
														<svg
															className='w-5 h-5'
															fill='none'
															viewBox='0 0 24 24'
															strokeWidth={1.5}
															stroke='currentColor'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
															/>
														</svg>
													</button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
