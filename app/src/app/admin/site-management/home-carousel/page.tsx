'use client';

import { useEffect, useState } from 'react';
import ImageSelectInput from '@/components/ImageSelectInput';
import {
	createSiteContent,
	deleteSiteContent,
	fetchSiteContents,
	updateSiteContent,
	updateSiteContentOrderApi,
} from '@/lib/api';
import type { ApiSiteContent, CarouselSettings } from '@/data/types';

export default function AdminHomeCarouselPage() {
	const [items, setItems] = useState<ApiSiteContent[]>([]);
	const [loading, setLoading] = useState(true);
	const [notice, setNotice] = useState('');
	const [saving, setSaving] = useState<Record<string, boolean>>({});
	const [config, setConfig] = useState<ApiSiteContent | null>(null);
	const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>({
		autoPlay: true,
		delay: 5,
		effect: 'fade',
	});

	const loadItems = async () => {
		try {
			setLoading(true);
			const [data, configList] = await Promise.all([
				fetchSiteContents({ type: 'home_carousel' }),
				fetchSiteContents({ type: 'home_carousel_config' }),
			]);
			setItems(data);

			if (configList.length > 0) {
				const cfg = configList[0];
				setConfig(cfg);
				if (cfg.extraJson) {
					try {
						setCarouselSettings(JSON.parse(cfg.extraJson));
					} catch (e) {
						console.error('解析輪播設定失敗:', e);
					}
				}
			}
		} catch (error) {
			console.error('載入首頁輪播圖失敗:', error);
			setNotice('載入失敗，請稍後重試。');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadItems();
	}, []);

	const handleSaveConfig = async () => {
		try {
			setSaving((prev) => ({ ...prev, config: true }));
			const extraJson = JSON.stringify(carouselSettings);

			if (config) {
				const updated = await updateSiteContent(config.id, {
					...config,
					extraJson,
				});
				setConfig(updated);
			} else {
				const created = await createSiteContent({
					type: 'home_carousel_config',
					title: '輪播圖設定',
					extraJson,
					isActive: 1,
					sortOrder: 0,
				});
				setConfig(created);
			}
			setNotice('全域設定已儲存。');
		} catch (error) {
			console.error('儲存輪播設定失敗:', error);
			setNotice('設定儲存失敗。');
		} finally {
			setSaving((prev) => {
				const next = { ...prev };
				delete next.config;
				return next;
			});
		}
	};

	const handleAdd = async () => {
		try {
			const created = await createSiteContent({
				type: 'home_carousel',
				title: `圖片區塊 ${items.length + 1}`,
				summary: '首頁輪播圖文字區塊在此編輯',
				sortOrder: items.length,
				isActive: 1,
			});
			setItems((prev) => [...prev, created]);
			setNotice('已新增區塊。');
		} catch (error) {
			console.error('新增首頁輪播區塊失敗:', error);
			setNotice('新增失敗。');
		}
	};

	const patchItem = (id: string, patch: Partial<ApiSiteContent>) => {
		setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
	};

	const handleSave = async (item: ApiSiteContent) => {
		try {
			setSaving((prev) => ({ ...prev, [item.id]: true }));
			await updateSiteContent(item.id, {
				title: item.title,
				summary: item.summary,
				imageUrl: item.imageUrl,
				linkUrl: item.linkUrl,
				isActive: item.isActive,
				sortOrder: item.sortOrder,
			});
			setNotice('儲存成功。');
		} catch (error) {
			console.error('儲存首頁輪播區塊失敗:', error);
			setNotice('儲存失敗。');
		} finally {
			setSaving((prev) => {
				const next = { ...prev };
				delete next[item.id];
				return next;
			});
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm('確定刪除這個區塊？')) return;
		try {
			await deleteSiteContent(id);
			setItems((prev) => prev.filter((item) => item.id !== id));
			setNotice('已刪除區塊。');
		} catch (error) {
			console.error('刪除首頁輪播區塊失敗:', error);
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
		} catch (error) {
			console.error('更新排序失敗:', error);
			setNotice('排序更新失敗，已還原。');
			loadItems();
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
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
						網站管理 - 首頁輪播圖
					</h1>
					<p className='text-text-light mt-2'>管理首頁輪播區塊與連結設定。</p>
				</div>
				<button
					onClick={handleAdd}
					className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'
				>
					新增一個區塊
				</button>
			</div>

			{notice && (
				<div className='px-4 py-3 rounded-xl border border-border bg-surface text-sm'>{notice}</div>
			)}

			<div className='bg-white rounded-xl border border-border p-5 space-y-5'>
				<div className='flex items-center justify-between'>
					<h2 className='text-lg font-semibold text-text'>輪播全域設定</h2>
					<button
						onClick={handleSaveConfig}
						disabled={saving.config}
						className='px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60'
					>
						{saving.config ? '儲存中...' : '儲存全域設定'}
					</button>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<div>
						<label className='block text-sm font-semibold text-text mb-2'>自動播放</label>
						<div className='flex items-center gap-4 mt-1'>
							<label className='inline-flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									className='w-4 h-4 rounded border-border text-primary focus:ring-primary'
									checked={carouselSettings.autoPlay}
									onChange={(e) =>
										setCarouselSettings((prev) => ({ ...prev, autoPlay: e.target.checked }))
									}
								/>
								<span className='text-sm text-text'>啟用自動播放</span>
							</label>
						</div>
					</div>
					<div>
						<label className='block text-sm font-semibold text-text mb-2'>播放間隔 (秒)</label>
						<input
							type='number'
							min={1}
							max={20}
							className='w-full px-4 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary/20'
							value={carouselSettings.delay}
							onChange={(e) =>
								setCarouselSettings((prev) => ({ ...prev, delay: parseInt(e.target.value) || 5 }))
							}
						/>
					</div>
					<div>
						<label className='block text-sm font-semibold text-text mb-2'>切換效果</label>
						<select
							className='w-full px-3 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary/20'
							value={carouselSettings.effect}
							onChange={(e) =>
								setCarouselSettings((prev) => ({
									...prev,
									effect: e.target.value as 'fade' | 'slide',
								}))
							}
						>
							<option value='fade'>淡入淡出 (Fade)</option>
							<option value='slide'>滑動 (Slide)</option>
						</select>
					</div>
				</div>
			</div>

			<div className='space-y-5'>
				{items.map((item, index) => (
					<div
						key={item.id}
						className='bg-white rounded-xl border border-border p-5 space-y-4 shadow-sm'
					>
						<div className='flex items-center justify-between'>
							<div className='text-sm font-bold text-primary'>區塊 #{index + 1}</div>
							<div className='flex items-center gap-2'>
								<label className='inline-flex items-center gap-1.5 text-sm cursor-pointer'>
									<input
										type='checkbox'
										className='w-4 h-4 rounded border-border text-primary focus:ring-primary'
										checked={item.isActive === 1}
										onChange={(event) =>
											patchItem(item.id, { isActive: event.target.checked ? 1 : 0 })
										}
									/>
									<span className='font-medium text-text'>開啟顯示</span>
								</label>
								<div className='flex border border-border rounded-lg overflow-hidden ml-2'>
									<button
										onClick={() => moveItem(index, 'up')}
										className='px-2 py-1 bg-surface hover:bg-gray-100 text-text-muted transition-colors border-r border-border'
										title='向上移動'
									>
										↑
									</button>
									<button
										onClick={() => moveItem(index, 'down')}
										className='px-2 py-1 bg-surface hover:bg-gray-100 text-text-muted transition-colors'
										title='向下移動'
									>
										↓
									</button>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-semibold text-text mb-1.5'>標題</label>
								<input
									type='text'
									value={item.title || ''}
									onChange={(event) => patchItem(item.id, { title: event.target.value })}
									className='w-full px-4 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary/20'
									placeholder='輸入區塊標題'
								/>
							</div>
							<div>
								<label className='block text-sm font-semibold text-text mb-1.5'>按鈕連結</label>
								<input
									type='text'
									value={item.linkUrl || ''}
									onChange={(event) => patchItem(item.id, { linkUrl: event.target.value })}
									className='w-full px-4 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary/20'
									placeholder='/products 或 https://...'
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm font-semibold text-text mb-1.5'>文字說明</label>
							<textarea
								rows={2}
								value={item.summary || ''}
								onChange={(event) => patchItem(item.id, { summary: event.target.value })}
								className='w-full px-4 py-2 text-sm border border-border rounded-xl bg-surface outline-none focus:ring-2 focus:ring-primary/20'
								placeholder='輸入輔助文字說明'
							/>
						</div>

						<ImageSelectInput
							label='封面圖片'
							value={item.imageUrl || ''}
							onChange={(url) => patchItem(item.id, { imageUrl: url })}
						/>

						<div className='flex justify-end gap-3 pt-2'>
							<button
								onClick={() => handleDelete(item.id)}
								className='px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors'
							>
								刪除此區塊
							</button>
							<button
								onClick={() => handleSave(item)}
								disabled={saving[item.id]}
								className='px-6 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-lg shadow-primary/20'
							>
								{saving[item.id] ? '儲存中...' : '儲存修改'}
							</button>
						</div>
					</div>
				))}

				{items.length === 0 && (
					<div className='bg-white rounded-2xl border-2 border-dashed border-border py-16 text-center shadow-sm'>
						<p className='text-text-muted font-medium'>尚未建立輪播圖區塊。</p>
						<button
							onClick={handleAdd}
							className='mt-4 px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20'
						>
							立即新增第一個區塊
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
