'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ImageSelectInput from '@/components/ImageSelectInput';
import { createSiteContent, fetchSiteContents, updateSiteContent } from '@/lib/api';
import type { ApiSiteContent } from '@/data/types';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

export default function AdminHomeAboutPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState('');
	const [item, setItem] = useState<ApiSiteContent | null>(null);

	const loadItem = async () => {
		try {
			setLoading(true);
			const list = await fetchSiteContents({ type: 'home_about' });
			setItem(list[0] || null);
		} catch (error) {
			console.error('載入首頁關於我們失敗:', error);
			setNotice('載入失敗，請稍後再試。');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadItem();
	}, []);

	const ensureItem = async (): Promise<ApiSiteContent | null> => {
		if (item) return item;
		try {
			const created = await createSiteContent({
				type: 'home_about',
				title: '首頁關於我們',
				summary: '請填寫首頁關於我們摘要',
				content: '<h2>首頁關於我們</h2><p>請在此填入內容</p>',
				isActive: 1,
				sortOrder: 0,
			});
			setItem(created);
			return created;
		} catch (error) {
			console.error('建立首頁關於我們資料失敗:', error);
			setNotice('建立資料失敗，請稍後再試。');
			return null;
		}
	};

	const patchItem = (patch: Partial<ApiSiteContent>) => {
		setItem((prev) => (prev ? { ...prev, ...patch } : prev));
	};

	const handleSave = async () => {
		setNotice('');
		const current = await ensureItem();
		if (!current) return;

		try {
			setSaving(true);
			const updated = await updateSiteContent(current.id, {
				title: current.title,
				summary: current.summary,
				content: current.content,
				imageUrl: current.imageUrl,
				linkUrl: current.linkUrl,
				isActive: current.isActive,
			});
			setItem(updated);
			setNotice('儲存成功。');
		} catch (error) {
			console.error('儲存首頁關於我們失敗:', error);
			setNotice('儲存失敗。');
		} finally {
			setSaving(false);
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
		<div className='max-w-5xl mx-auto space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>網站管理 - 首頁關於我們</h1>
					<p className='text-text-light mt-2'>管理首頁的關於我們文案區塊。</p>
				</div>
				<button
					onClick={handleSave}
					disabled={saving}
					className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60'
				>
					{saving ? '儲存中...' : '儲存'}
				</button>
			</div>

			{notice && <div className='px-4 py-3 rounded-xl border border-border bg-surface text-sm'>{notice}</div>}

			{item ? (
				<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-base font-semibold text-text mb-1.5'>顯示標題</label>
							<input
								type='text'
								value={item.title || ''}
								onChange={(event) => patchItem({ title: event.target.value })}
								className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
							/>
						</div>
						<div>
							<label className='block text-base font-semibold text-text mb-1.5'>More 前往連結</label>
							<input
								type='url'
								value={item.linkUrl || ''}
								onChange={(event) => patchItem({ linkUrl: event.target.value })}
								className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
								placeholder='https://example.com/about'
							/>
						</div>
					</div>

					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>摘要</label>
						<input
							type='text'
							value={item.summary || ''}
							onChange={(event) => patchItem({ summary: event.target.value })}
							className='w-full px-4 py-2 text-base border border-border rounded-xl bg-surface'
						/>
					</div>

					<ImageSelectInput
						label='圖片'
						value={item.imageUrl || ''}
						onChange={(url) => patchItem({ imageUrl: url })}
					/>

					<div>
						<label className='block text-base font-semibold text-text mb-1.5'>內文</label>
						<div className='border border-border rounded-xl overflow-hidden'>
							<BlockNoteEditor
								initialHTML={item.content || '<p>請輸入一些內容</p>'}
								onChange={(html) => patchItem({ content: html })}
							/>
						</div>
					</div>
				</div>
			) : (
				<div className='bg-white rounded-xl border border-border p-10 text-center text-sm text-text-light'>
					尚未建立首頁關於我們內容，點擊右上角「儲存」即可建立預設內容。
				</div>
			)}
		</div>
	);
}
