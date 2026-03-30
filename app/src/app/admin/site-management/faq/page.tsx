'use client';

import AppLink from '@/components/AppLink';
import { useEffect, useState } from 'react';
import {
	createSiteContent,
	deleteSiteContent,
	fetchSiteContents,
	updateSiteContent,
	updateSiteContentOrderApi,
} from '@/lib/api';
import type { ApiSiteContent } from '@/data/types';

function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function normalizeValue(value: string): string {
	return value.trim().toLowerCase();
}

function notifySiteContentUpdated() {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event('site-content-updated'));
	}
}

const FAQ_PRESET_PAGES = [
	{ title: '所有問題', slug: 'all' },
	{ title: '運費 / 配送', slug: 'shipping' },
	{ title: '退換貨問題', slug: 'returns' },
	{ title: '訂購相關', slug: 'orders' },
	{ title: '會員相關', slug: 'membership' },
] as const;

export default function AdminFaqManagePage() {
	const [pages, setPages] = useState<ApiSiteContent[]>([]);
	const [loading, setLoading] = useState(true);
	const [notice, setNotice] = useState('');
	const [saving, setSaving] = useState<Record<string, boolean>>({});

	const loadPages = async () => {
		try {
			setLoading(true);
			const data = await fetchSiteContents({ type: 'faq_page' });
			setPages(data);
		} catch (error) {
			console.error('載入常見問題管理頁失敗:', error);
			setNotice('載入失敗，請稍後重試。');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPages();
	}, []);

	const handleCreate = async () => {
		try {
			const nextIndex = pages.length + 1;
			const created = await createSiteContent({
				type: 'faq_page',
				title: `常見問題頁面 ${nextIndex}`,
				slug: `faq-${nextIndex}`,
				summary: '常見問題專屬頁面',
				sortOrder: pages.length,
				isActive: 1,
			});
			setPages((prev) => [...prev, created]);
			setNotice('已新增常見問題頁面。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('新增常見問題頁面失敗:', error);
			setNotice('新增失敗，請稍後再試。');
		}
	};

	const handleCreatePresetPages = async () => {
		const existingTitles = new Set(pages.map((item) => normalizeValue(item.title || '')));
		const existingSlugs = new Set(pages.map((item) => normalizeValue(item.slug || '')));
		const missingPresets = FAQ_PRESET_PAGES.filter((preset) => {
			const titleKey = normalizeValue(preset.title);
			const slugKey = normalizeValue(preset.slug);
			return !existingTitles.has(titleKey) && !existingSlugs.has(slugKey);
		});

		if (missingPresets.length === 0) {
			setNotice('預設頁面皆已存在，無需建立。');
			return;
		}

		try {
			const results = await Promise.allSettled(
				missingPresets.map((preset, index) =>
					createSiteContent({
						type: 'faq_page',
						title: preset.title,
						slug: preset.slug,
						summary: '常見問題專屬頁面',
						sortOrder: pages.length + index,
						isActive: 1,
					})
				)
			);

			const successCount = results.filter((result) => result.status === 'fulfilled').length;
			if (successCount === 0) {
				setNotice('建立預設頁面失敗，請稍後再試。');
				return;
			}

			await loadPages();
			notifySiteContentUpdated();
			if (successCount === missingPresets.length) {
				setNotice(`已建立 ${successCount} 個預設頁面。`);
				return;
			}
			setNotice(`已建立 ${successCount} 個預設頁面，另有 ${missingPresets.length - successCount} 個建立失敗。`);
		} catch (error) {
			console.error('建立常見問題預設頁面失敗:', error);
			setNotice('建立預設頁面失敗，請稍後再試。');
		}
	};

	const handlePatch = (id: string, patch: Partial<ApiSiteContent>) => {
		setPages((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
	};

	const handleSave = async (item: ApiSiteContent) => {
		try {
			setSaving((prev) => ({ ...prev, [item.id]: true }));
			await updateSiteContent(item.id, {
				title: item.title,
				slug: item.slug,
				summary: item.summary,
				sortOrder: item.sortOrder,
				isActive: item.isActive,
			});
			setNotice('儲存成功。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('儲存常見問題頁面失敗:', error);
			setNotice('儲存失敗，請稍後再試。');
		} finally {
			setSaving((prev) => {
				const next = { ...prev };
				delete next[item.id];
				return next;
			});
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('確定要刪除此頁面與其問答內容？')) return;
		try {
			await deleteSiteContent(id);
			setPages((prev) => prev.filter((item) => item.id !== id));
			setNotice('已刪除頁面。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('刪除常見問題頁面失敗:', error);
			setNotice('刪除失敗。');
		}
	};

	const moveItem = async (index: number, direction: 'up' | 'down') => {
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= pages.length) return;

		const next = [...pages];
		[next[index], next[targetIndex]] = [next[targetIndex], next[index]];
		const normalized = next.map((item, order) => ({ ...item, sortOrder: order }));
		setPages(normalized);

		try {
			await updateSiteContentOrderApi(normalized.map((item) => ({ id: item.id, order: item.sortOrder })));
			notifySiteContentUpdated();
		} catch (error) {
			console.error('更新排序失敗:', error);
			setNotice('排序更新失敗，已還原。');
			loadPages();
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>網站管理 - 常見問題 / 管理頁面</h1>
					<p className='text-text-light mt-2'>
						管理常見問題頁面清單，並進入自訂義頁面編輯問答內容。
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleCreatePresetPages}
						className='px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors'
					>
						建立預設頁面
					</button>
					<button
						onClick={handleCreate}
						className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'
					>
						新增一個頁面
					</button>
				</div>
			</div>

			{notice && <div className='px-4 py-3 rounded-xl border border-border bg-surface text-sm'>{notice}</div>}

			<div className='bg-white rounded-xl border border-border overflow-hidden'>
				<table className='w-full border-collapse'>
					<thead>
						<tr className='bg-surface border-b border-border text-left'>
							<th className='py-2.5 px-4 text-sm font-semibold text-text-muted'>顯示名稱</th>
							<th className='py-2.5 px-4 text-sm font-semibold text-text-muted'>Slug</th>
							<th className='py-2.5 px-4 text-sm font-semibold text-text-muted'>啟用</th>
							<th className='py-2.5 px-4 text-sm font-semibold text-text-muted'>排序</th>
							<th className='py-2.5 px-4 text-sm font-semibold text-text-muted text-right'>操作</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-border'>
						{pages.map((item, index) => (
							<tr key={item.id}>
								<td className='py-2.5 px-4'>
									<input
										type='text'
										value={item.title || ''}
										onChange={(event) => {
											const title = event.target.value;
											handlePatch(item.id, {
												title,
												slug: item.slug || slugify(title),
											});
										}}
										className='w-full px-3 py-2 rounded-lg border border-border bg-surface'
									/>
								</td>
								<td className='py-2.5 px-4'>
									<input
										type='text'
										value={item.slug || ''}
										onChange={(event) => handlePatch(item.id, { slug: slugify(event.target.value) })}
										className='w-full px-3 py-2 rounded-lg border border-border bg-surface font-mono text-sm'
									/>
								</td>
								<td className='py-2.5 px-4'>
									<input
										type='checkbox'
										checked={item.isActive === 1}
										onChange={(event) =>
											handlePatch(item.id, { isActive: event.target.checked ? 1 : 0 })
										}
									/>
								</td>
								<td className='py-2.5 px-4 text-sm text-text-muted'>#{index + 1}</td>
								<td className='py-2.5 px-4'>
									<div className='flex justify-end items-center gap-2'>
										<button
											onClick={() => moveItem(index, 'up')}
											className='px-2 py-1 border border-border rounded text-xs'
										>
											↑
										</button>
										<button
											onClick={() => moveItem(index, 'down')}
											className='px-2 py-1 border border-border rounded text-xs'
										>
											↓
										</button>
										<AppLink
											href={`/admin/site-management/faq/${item.id}`}
											className='px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-surface'
										>
											前往編輯
										</AppLink>
										<button
											onClick={() => handleSave(item)}
											disabled={saving[item.id]}
											className='px-3 py-1.5 bg-primary text-white rounded-lg text-xs disabled:opacity-60'
										>
											{saving[item.id] ? '儲存中...' : '儲存'}
										</button>
										<button
											onClick={() => handleDelete(item.id)}
											className='px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs'
										>
											刪除
										</button>
									</div>
								</td>
							</tr>
						))}
						{pages.length === 0 && (
							<tr>
								<td colSpan={5} className='py-10 text-center text-text-light'>
									尚未建立常見問題頁面。
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
