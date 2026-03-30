'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	createArticleCategory,
	deleteArticleCategoryApi,
	fetchArticleCategories,
	updateArticleCategory,
} from '@/lib/api';
import type { ApiArticleCategory } from '@/data/types';

type EditableCategory = {
	id: number | string;
	name: string;
	slug: string;
	sortOrder: number;
	isActive: boolean;
};

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function normalizeSortOrder(list: EditableCategory[]): EditableCategory[] {
	const total = list.length;
	return list.map((item, index) => ({
		...item,
		sortOrder: total - index,
	}));
}

/**
 * 後台 - 最新消息分類管理
 * 參考舊版 CMS 操作流程，支援新增、排序、開關、刪除
 */
export default function AdminArticleCategoriesPage() {
	const [items, setItems] = useState<EditableCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [tempCounter, setTempCounter] = useState(0);

	const loadData = async () => {
		setLoading(true);
		try {
			const rows = await fetchArticleCategories();
			const mapped: EditableCategory[] = rows
				.sort((a, b) => Number(b.sortOrder) - Number(a.sortOrder) || b.id - a.id)
				.map((row: ApiArticleCategory) => ({
					id: row.id,
					name: row.name,
					slug: row.slug,
					sortOrder: Number(row.sortOrder || 0),
					isActive: Boolean(row.isActive),
				}));
			setItems(normalizeSortOrder(mapped));
		} catch (error) {
			console.error(error);
			alert('載入最新消息分類失敗');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const hasEmptyName = useMemo(() => items.some((item) => !item.name.trim()), [items]);

	const moveItem = (index: number, direction: 'up' | 'down') => {
		const target = direction === 'up' ? index - 1 : index + 1;
		if (target < 0 || target >= items.length) return;
		const copied = [...items];
		const [moved] = copied.splice(index, 1);
		copied.splice(target, 0, moved);
		setItems(normalizeSortOrder(copied));
	};

	const handleAdd = () => {
		const next = [...items];
		next.push({
			id: `new-${tempCounter + 1}`,
			name: '',
			slug: '',
			sortOrder: 0,
			isActive: true,
		});
		setTempCounter((value) => value + 1);
		setItems(normalizeSortOrder(next));
	};

	const handleDelete = async (row: EditableCategory) => {
		if (!confirm(`確定要刪除分類「${row.name || '未命名'}」嗎？`)) return;

		if (typeof row.id === 'string') {
			setItems((prev) => normalizeSortOrder(prev.filter((item) => item.id !== row.id)));
			return;
		}

		try {
			await deleteArticleCategoryApi(row.id);
			setItems((prev) => normalizeSortOrder(prev.filter((item) => item.id !== row.id)));
		} catch (error) {
			console.error(error);
			alert('刪除分類失敗');
		}
	};

	const handleSave = async () => {
		if (hasEmptyName) {
			alert('請先填寫所有分類名稱');
			return;
		}

		setSaving(true);
		try {
			for (const item of items) {
				const payload = {
					name: item.name.trim(),
					slug: item.slug?.trim() || slugify(item.name),
					sortOrder: item.sortOrder,
					isActive: item.isActive,
				};
				if (typeof item.id === 'string') {
					await createArticleCategory(payload);
				} else {
					await updateArticleCategory(item.id, payload);
				}
			}

			await loadData();
			alert('最新消息分類已儲存');
		} catch (error) {
			console.error(error);
			alert(error instanceof Error ? error.message : '儲存失敗');
		} finally {
			setSaving(false);
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
			<div className='flex flex-wrap items-end justify-between gap-3 mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-text'>最新消息管理 - 分類管理</h1>
					<p className='text-text-muted text-sm mt-1'>管理最新消息分類、排序與顯示狀態</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleAdd}
						className='px-4 py-2.5 text-sm font-medium rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors duration-200 cursor-pointer'
					>
						新增分類
					</button>
					<button
						onClick={handleSave}
						disabled={saving || items.length === 0}
						className='px-4 py-2.5 text-sm font-medium rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white transition-colors duration-200 cursor-pointer'
					>
						{saving ? '儲存中...' : '儲存'}
					</button>
				</div>
			</div>

			<div className='bg-card rounded-xl border border-border overflow-hidden'>
				<div className='bg-text px-5 py-3 text-white text-sm font-semibold'>最新消息分類清單</div>
				<div className='p-5 border-b border-border text-xs text-text-light'>
					提示：排序數字越大會排越前，建議先用上下箭頭調整順序後再儲存。
				</div>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead>
							<tr className='bg-surface-alt'>
								<th className='px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider'>
									分類名稱
								</th>
								<th className='px-5 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider'>
									Slug
								</th>
								<th className='px-5 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider w-36'>
									排序
								</th>
								<th className='px-5 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider w-36'>
									開關
								</th>
								<th className='px-5 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider w-24'>
									操作
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{items.length === 0 ? (
								<tr>
									<td colSpan={5} className='px-5 py-12 text-center text-sm text-text-light'>
										目前沒有最新消息分類，請先新增。
									</td>
								</tr>
							) : (
								items.map((item, index) => (
									<tr key={item.id} className='hover:bg-surface/50 transition-colors duration-150'>
										<td className='px-5 py-4'>
											<input
												type='text'
												value={item.name}
												onChange={(e) => {
													const name = e.target.value;
													setItems((prev) =>
														prev.map((row) =>
															row.id === item.id
																? {
																	...row,
																	name,
																	slug: row.slug || slugify(name),
																}
																: row
														)
													);
												}}
												placeholder='請輸入分類名稱'
												className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
											/>
										</td>
										<td className='px-5 py-4'>
											<input
												type='text'
												value={item.slug}
												onChange={(e) => {
													const slug = e.target.value;
													setItems((prev) =>
														prev.map((row) => (row.id === item.id ? { ...row, slug } : row))
													);
												}}
												placeholder='分類 slug'
												className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
											/>
										</td>
										<td className='px-5 py-4'>
											<div className='flex items-center justify-center gap-2'>
												<button
													type='button'
													onClick={() => moveItem(index, 'up')}
													className='p-2 rounded-lg border border-border hover:bg-surface transition-colors duration-200 disabled:opacity-40 cursor-pointer'
													disabled={index === 0}
													title='上移'
												>
													↑
												</button>
												<button
													type='button'
													onClick={() => moveItem(index, 'down')}
													className='p-2 rounded-lg border border-border hover:bg-surface transition-colors duration-200 disabled:opacity-40 cursor-pointer'
													disabled={index === items.length - 1}
													title='下移'
												>
													↓
												</button>
												<span className='text-xs text-text-light w-8 text-right'>
													{item.sortOrder}
												</span>
											</div>
										</td>
										<td className='px-5 py-4'>
											<div className='flex justify-center'>
												<button
													type='button'
													onClick={() => {
														setItems((prev) =>
															prev.map((row) =>
																row.id === item.id ? { ...row, isActive: !row.isActive } : row
															)
														);
													}}
													className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 cursor-pointer ${
														item.isActive ? 'bg-primary' : 'bg-border'
													}`}
												>
													<span
														className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
															item.isActive ? 'translate-x-6' : 'translate-x-1'
														}`}
													/>
												</button>
											</div>
										</td>
										<td className='px-5 py-4 text-right'>
											<button
												type='button'
												onClick={() => handleDelete(item)}
												className='px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm transition-colors duration-200 cursor-pointer'
											>
												刪除
											</button>
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
