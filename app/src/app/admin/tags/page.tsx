'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { fetchTags, createTag, deleteTagApi } from '@/lib/api';
import type { ApiTag } from '@/data/types';

/**
 * 後台 - 標籤管理頁面
 */
export default function AdminTagsPage() {
	const [tagList, setTagList] = useState<ApiTag[]>([]);
	const [loading, setLoading] = useState(true);
	const [newTagName, setNewTagName] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const loadData = async () => {
		try {
			const data = await fetchTags();
			setTagList(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const handleAddTag = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTagName.trim()) return;

		setSubmitting(true);
		try {
			// 分生 slug: 轉小寫，移除特殊字元，空白轉連字號
			const slug = newTagName
				.trim()
				.toLowerCase()
				.replace(/[^\w\u4e00-\u9fff\s-]/g, '')
				.replace(/[\s_]+/g, '-')
				.replace(/-+/g, '-')
				.trim();

			await createTag({ name: newTagName.trim(), slug });
			setNewTagName('');
			loadData();
		} catch (error: unknown) {
			alert(error instanceof Error ? error.message : '新增失敗，標籤可能已存在');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteTag = async (id: number, name: string) => {
		if (!confirm(`確定要刪除標籤「${name}」嗎？`)) return;

		try {
			await deleteTagApi(id);
			loadData();
		} catch {
			alert('刪除失敗');
		}
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
					<h1 className='text-2xl font-bold text-text'>標籤管理</h1>
					<p className='text-text-muted text-sm mt-1'>預留功能，尚未接入產品/文章流程</p>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* 左側：新增標籤 */}
				<div className='lg:col-span-1'>
					<div className='bg-card rounded-xl border border-border p-5 sticky top-6'>
						<h2 className='text-sm font-semibold text-text mb-4 uppercase tracking-wider'>
							快速新增標籤
						</h2>
						<form onSubmit={handleAddTag} className='space-y-4'>
							<div>
								<label className='block text-xs text-text-light mb-1.5'>標籤名稱</label>
								<input
									type='text'
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									placeholder='例：IoT'
									className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
								/>
							</div>
							<button
								type='submit'
								disabled={submitting || !newTagName.trim()}
								className='w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50'
							>
								{submitting ? '新增中...' : '新增標籤'}
							</button>
						</form>
					</div>
				</div>

				{/* 右側：標籤列表 */}
				<div className='lg:col-span-2'>
					<div className='bg-card rounded-xl border border-border p-6'>
						{tagList.length === 0 ? (
							<div className='text-center py-10'>
								<p className='text-text-light text-sm'>目前尚無任何標籤</p>
							</div>
						) : (
							<div className='flex flex-wrap gap-3'>
								{tagList.map((tag) => (
									<div
										key={tag.id}
										className='group flex items-center gap-2 px-4 py-2 bg-surface rounded-lg border border-border hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md'
									>
										<svg
											className='w-3.5 h-3.5 text-text-light'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={2}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z'
											/>
											<path strokeLinecap='round' strokeLinejoin='round' d='M6 6h.008v.008H6V6z' />
										</svg>
										<div className='flex flex-col'>
											<span className='text-sm font-medium text-text'>{tag.name}</span>
											<span className='text-[10px] text-text-light font-mono leading-none'>
												{tag.slug}
											</span>
										</div>
										<button
											onClick={() => handleDeleteTag(tag.id, tag.name)}
											className='ml-2 p-1 rounded hover:bg-error/10 transition-colors duration-200 cursor-pointer text-text-light hover:text-error'
											title='刪除'
										>
											<svg
												className='w-3.5 h-3.5'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={2}
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M6 18L18 6M6 6l12 12'
												/>
											</svg>
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
