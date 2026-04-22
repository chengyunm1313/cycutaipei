'use client';

export const runtime = 'edge';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
	createSiteContent,
	deleteSiteContent,
	fetchSiteContent,
	fetchSiteContents,
	updateSiteContent,
	updateSiteContentOrderApi,
} from '@/lib/api';
import type { ApiSiteContent } from '@/data/types';
import { slugifyAscii } from '@/lib/slug';

function notifySiteContentUpdated() {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event('site-content-updated'));
	}
}

export default function AdminFaqCustomEditPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [loading, setLoading] = useState(true);
	const [savingPage, setSavingPage] = useState(false);
	const [notice, setNotice] = useState('');
	const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});

	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [summary, setSummary] = useState('');
	const [items, setItems] = useState<ApiSiteContent[]>([]);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [page, faqItems] = await Promise.all([
				fetchSiteContent(id),
				fetchSiteContents({ type: 'faq_item', parentId: id }),
			]);

			if (page.type !== 'faq_page') {
				alert('這不是常見問題頁面');
				router.push('/admin/site-management/faq');
				return;
			}

			setTitle(page.title || '');
			setSlug(page.slug || '');
			setSummary(page.summary || '');
			setItems(faqItems);
		} catch (error) {
			console.error('載入常見問題自訂頁失敗:', error);
			alert('載入失敗');
			router.push('/admin/site-management/faq');
		} finally {
			setLoading(false);
		}
	}, [id, router]);

	useEffect(() => {
		if (!id) return;
		loadData();
	}, [id, loadData]);

	const handleSavePage = async () => {
		setNotice('');
		if (!title.trim()) {
			setNotice('請填寫頁面名稱。');
			return;
		}
		try {
			setSavingPage(true);
			await updateSiteContent(id, {
				title: title.trim(),
				slug: slug.trim() || slugifyAscii(title, 'faq-page'),
				summary: summary.trim() || null,
			});
			setNotice('頁面資訊已儲存。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('儲存頁面失敗:', error);
			setNotice('儲存失敗，請稍後再試。');
		} finally {
			setSavingPage(false);
		}
	};

	const handleItemPatch = (itemId: string, patch: Partial<ApiSiteContent>) => {
		setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
	};

	const handleAddItem = async () => {
		try {
			const created = await createSiteContent({
				type: 'faq_item',
				parentId: id,
				title: '請填寫問題',
				content: '<p>請填寫回答</p>',
				sortOrder: items.length,
				isActive: 1,
			});
			setItems((prev) => [...prev, created]);
			setNotice('已新增一筆資訊。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('新增常見問題項目失敗:', error);
			setNotice('新增失敗。');
		}
	};

	const handleSaveItem = async (item: ApiSiteContent) => {
		try {
			setSavingItems((prev) => ({ ...prev, [item.id]: true }));
			await updateSiteContent(item.id, {
				title: item.title,
				content: item.content,
				isActive: item.isActive,
				sortOrder: item.sortOrder,
			});
			setNotice('問答已儲存。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('儲存常見問題項目失敗:', error);
			setNotice('儲存失敗。');
		} finally {
			setSavingItems((prev) => {
				const next = { ...prev };
				delete next[item.id];
				return next;
			});
		}
	};

	const handleDeleteItem = async (itemId: string) => {
		if (!confirm('確定刪除此問答？')) return;
		try {
			await deleteSiteContent(itemId);
			setItems((prev) => prev.filter((item) => item.id !== itemId));
			setNotice('已刪除問答。');
			notifySiteContentUpdated();
		} catch (error) {
			console.error('刪除問答失敗:', error);
			setNotice('刪除失敗。');
		}
	};

	const moveItem = async (index: number, direction: 'up' | 'down') => {
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= items.length) return;

		const next = [...items];
		[next[index], next[targetIndex]] = [next[targetIndex], next[index]];
		const normalized = next.map((item, order) => ({ ...item, sortOrder: order }));
		setItems(normalized);

		try {
			await updateSiteContentOrderApi(
				normalized.map((item) => ({ id: item.id, order: item.sortOrder }))
			);
			notifySiteContentUpdated();
		} catch (error) {
			console.error('更新排序失敗:', error);
			setNotice('排序更新失敗，已還原。');
			loadData();
		}
	};

	if (loading) {
		return <div className='p-8 text-center text-text-muted'>載入中...</div>;
	}

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
					網站管理 - 常見問題 / 自訂義頁面
				</h1>
				<div className='flex gap-2'>
					<button
						onClick={() => router.push('/admin/site-management/faq')}
						className='px-4 py-2 rounded-xl border border-border text-sm font-semibold'
					>
						返回管理頁面
					</button>
					<button
						onClick={handleSavePage}
						disabled={savingPage}
						className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60'
					>
						{savingPage ? '儲存中...' : '儲存'}
					</button>
				</div>
			</div>

			{notice && (
				<div className='px-4 py-3 rounded-xl border border-border bg-surface text-sm'>{notice}</div>
			)}

			<div className='bg-white rounded-xl border border-border p-5 space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>頁面名稱</label>
						<input
							type='text'
							value={title}
							onChange={(event) => {
								setTitle(event.target.value);
								if (!slug) setSlug(slugifyAscii(event.target.value, 'faq-page'));
							}}
							className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
						/>
					</div>
					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>Slug</label>
						<input
							type='text'
							value={slug}
							onChange={(event) => setSlug(slugifyAscii(event.target.value, 'faq-page'))}
							className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface font-mono'
						/>
					</div>
				</div>
				<div>
					<label className='block text-base font-semibold text-text mb-1.5'>頁面說明</label>
					<input
						type='text'
						value={summary}
						onChange={(event) => setSummary(event.target.value)}
						className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
					/>
				</div>
			</div>

			<div className='bg-white rounded-xl border border-border p-5 space-y-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-bold text-text'>問答清單</h2>
					<button
						onClick={handleAddItem}
						className='px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold'
					>
						新增一筆資訊
					</button>
				</div>

				<div className='space-y-5'>
					{items.map((item, index) => (
						<div key={item.id} className='border border-border rounded-xl p-4 space-y-3'>
							<div className='flex items-center justify-between gap-3'>
								<div className='flex items-center gap-2 text-xs text-text-muted'>
									<span>#{index + 1}</span>
									<label className='inline-flex items-center gap-1'>
										<input
											type='checkbox'
											checked={item.isActive === 1}
											onChange={(event) =>
												handleItemPatch(item.id, { isActive: event.target.checked ? 1 : 0 })
											}
										/>
										啟用
									</label>
								</div>
								<div className='flex items-center gap-2'>
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
									<button
										onClick={() => handleSaveItem(item)}
										disabled={savingItems[item.id]}
										className='px-3 py-1.5 bg-primary text-white rounded-lg text-xs disabled:opacity-60'
									>
										{savingItems[item.id] ? '儲存中...' : '儲存'}
									</button>
									<button
										onClick={() => handleDeleteItem(item.id)}
										className='px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs'
									>
										刪除
									</button>
								</div>
							</div>

							<div>
								<label className='block text-base font-semibold text-text mb-1.5'>問題</label>
								<input
									type='text'
									value={item.title || ''}
									onChange={(event) => handleItemPatch(item.id, { title: event.target.value })}
									className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
								/>
							</div>
							<div>
								<label className='block text-base font-semibold text-text mb-1.5'>回答</label>
								<textarea
									rows={6}
									value={item.content || ''}
									onChange={(event) => handleItemPatch(item.id, { content: event.target.value })}
									className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
									placeholder='輸入一些內容'
								/>
							</div>
						</div>
					))}

					{items.length === 0 && (
						<div className='py-10 text-center text-text-light'>
							尚未建立問答，請點擊「新增一筆資訊」。
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
