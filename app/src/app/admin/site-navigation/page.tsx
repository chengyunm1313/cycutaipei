'use client';

import AppLink from '@/components/AppLink';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	createMenu,
	createPage,
	deleteMenuApi,
	deletePageApi,
	fetchMenus,
	fetchPageBySlug,
	updateMenu,
	updatePage,
} from '@/lib/api';
import type { ApiMenu, PageBlock } from '@/data/types';

type MenuPosition = 'top' | 'bottom' | 'child';

interface EditableMenu {
	id: number;
	title: string;
	url: string | null;
	type: string;
	pageId: number | null;
	position: MenuPosition;
	parentMenuId: number | null;
	customLink: string | null;
	sortOrder: number;
	target: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

function notifySiteNavigationUpdated() {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event('site-navigation-updated'));
	}
}

function normalizeMenu(menu: ApiMenu, fallbackOrder: number): EditableMenu {
	const rawPosition = (menu.position || 'top') as string;
	const position: MenuPosition =
		rawPosition === 'bottom' || rawPosition === 'child' ? rawPosition : 'top';
	return {
		id: menu.id,
		title: menu.title || '',
		url: menu.url || null,
		type: menu.type || 'link',
		pageId: menu.pageId ?? null,
		position,
		parentMenuId: menu.parentMenuId ?? null,
		customLink: menu.customLink || null,
		sortOrder: Number(menu.sortOrder ?? fallbackOrder),
		target: menu.target || '_self',
		isActive: menu.isActive === true || menu.isActive === 1,
		createdAt: menu.createdAt || '',
		updatedAt: menu.updatedAt || '',
	};
}

function getMenuDescription(menu: EditableMenu): string {
	if (menu.type === 'page') return '自訂義頁面';
	switch (menu.url) {
		case '/products':
			return '產品專屬頁面';
		case '/academy':
			return '校友學院專屬頁面';
		case '/about':
			return '關於我們專屬頁面';
		case '/blog':
			return '最新消息專屬頁面';
		case '/faq':
			return '常見問題專屬頁面';
		case '/contact':
			return '聯絡我們專屬頁面';
		default:
			return '導覽頁面';
	}
}

function normalizeMenusOrder(list: EditableMenu[]): EditableMenu[] {
	return list.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function serializeMenus(list: EditableMenu[]): string {
	return JSON.stringify(
		list.map((item) => ({
			id: item.id,
			title: item.title,
			url: item.url,
			type: item.type,
			pageId: item.pageId,
			position: item.position,
			parentMenuId: item.parentMenuId,
			customLink: item.customLink,
			sortOrder: item.sortOrder,
			target: item.target,
			isActive: item.isActive,
		}))
	);
}

function createDefaultPageBlocks(): PageBlock[] {
	return [];
}

function getEditLink(menu: EditableMenu): string | null {
	if (menu.type === 'page' && menu.pageId) {
		return `/admin/pages/${menu.pageId}`;
	}
	switch (menu.url) {
		case '/products':
			return '/admin/products';
		case '/academy':
			return '/admin/academy';
		case '/about':
			return '/admin/site-management/about';
		case '/faq':
			return '/admin/site-management/faq';
		case '/blog':
			return '/admin/articles/content';
		default:
			return null;
	}
}

function isSameMenuForSave(left: EditableMenu, right: EditableMenu): boolean {
	return (
		left.title === right.title &&
		left.url === right.url &&
		left.type === right.type &&
		left.pageId === right.pageId &&
		left.position === right.position &&
		left.parentMenuId === right.parentMenuId &&
		left.customLink === right.customLink &&
		left.sortOrder === right.sortOrder &&
		left.target === right.target &&
		left.isActive === right.isActive
	);
}

export default function AdminSiteNavigationPage() {
	const searchParams = useSearchParams();
	const [menus, setMenus] = useState<EditableMenu[]>([]);
	const [initialMenus, setInitialMenus] = useState<EditableMenu[]>([]);
	const [pendingDeleteMenus, setPendingDeleteMenus] = useState<EditableMenu[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [creating, setCreating] = useState(false);
	const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const selectedMenuIdParam = useMemo(() => {
		const raw = searchParams.get('menu');
		if (!raw) return null;
		const parsed = Number(raw);
		return Number.isNaN(parsed) ? null : parsed;
	}, [searchParams]);

	const loadMenus = useCallback(
		async (focusMenuId?: number | null) => {
			try {
				setLoading(true);
				const data = await fetchMenus();
				const normalized = normalizeMenusOrder(
					[...data]
						.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
						.map((menu, index) => normalizeMenu(menu, index + 1))
				);
				setMenus(normalized);
				setInitialMenus(normalized);
				setPendingDeleteMenus([]);

				const targetMenuId = focusMenuId ?? selectedMenuIdParam;
				const targetIndex =
					targetMenuId != null ? normalized.findIndex((item) => item.id === targetMenuId) : -1;
				setSelectedIndex(targetIndex >= 0 ? targetIndex : 0);
			} catch (error) {
				console.error('載入導覽頁面失敗:', error);
				setNotice({ type: 'error', text: '載入導覽頁面失敗，請稍後再試。' });
			} finally {
				setLoading(false);
			}
		},
		[selectedMenuIdParam]
	);

	useEffect(() => {
		void loadMenus();
	}, [loadMenus]);

	useEffect(() => {
		if (selectedMenuIdParam == null || menus.length === 0) return;
		const index = menus.findIndex((item) => item.id === selectedMenuIdParam);
		if (index >= 0) {
			setSelectedIndex(index);
		}
	}, [menus, selectedMenuIdParam]);

	const hasUnsavedChanges = useMemo(() => {
		return (
			serializeMenus(menus) !== serializeMenus(initialMenus) || pendingDeleteMenus.length > 0
		);
	}, [menus, initialMenus, pendingDeleteMenus]);

	const selectedMenu = menus[selectedIndex] || null;

	const handleSelect = (index: number) => {
		if (index < 0 || index >= menus.length) return;
		setSelectedIndex(index);
	};

	const updateSelectedMenu = (patch: Partial<EditableMenu>) => {
		if (!selectedMenu) return;
		setMenus((prev) =>
			prev.map((item, index) => (index === selectedIndex ? { ...item, ...patch } : item))
		);
	};

	const moveSelected = (direction: 'left' | 'right') => {
		if (!selectedMenu) return;
		const targetIndex = direction === 'left' ? selectedIndex - 1 : selectedIndex + 1;
		if (targetIndex < 0 || targetIndex >= menus.length) return;

		setMenus((prev) => {
			const next = [...prev];
			[next[selectedIndex], next[targetIndex]] = [next[targetIndex], next[selectedIndex]];
			return normalizeMenusOrder(next);
		});
		setSelectedIndex(targetIndex);
	};

	const handleDeleteSelected = () => {
		if (!selectedMenu || selectedMenu.type !== 'page') return;
		if (!window.confirm('確定要刪除資料!(必需按下儲存送出後，資料才會刪除。)')) return;

		setPendingDeleteMenus((prev) => [...prev, selectedMenu]);
		setMenus((prev) => normalizeMenusOrder(prev.filter((item) => item.id !== selectedMenu.id)));
		setSelectedIndex((prevIndex) => {
			if (menus.length <= 1) return 0;
			return prevIndex >= menus.length - 1 ? menus.length - 2 : prevIndex;
		});
		setNotice({ type: 'success', text: '已加入待刪除清單，請按上方「儲存」套用。' });
	};

	const handleCancelChanges = () => {
		setMenus(initialMenus);
		setPendingDeleteMenus([]);
		if (selectedMenuIdParam != null) {
			const index = initialMenus.findIndex((item) => item.id === selectedMenuIdParam);
			setSelectedIndex(index >= 0 ? index : 0);
		} else {
			setSelectedIndex(0);
		}
		setNotice(null);
	};

	const handleCreatePage = async () => {
		try {
			setCreating(true);
			setNotice(null);

			const slug = `custom-page-${Date.now().toString(36)}`;
			const page = await createPage({
				title: '自訂義頁面',
				slug,
				content_blocks: JSON.stringify(createDefaultPageBlocks()),
				in_menu: 0,
				status: 'published',
			});

			let createdMenuId: number | null = null;
			try {
				const maxOrder = menus.reduce((max, item) => Math.max(max, item.sortOrder), 0);
				const createdMenu = await createMenu({
					title: page.title || '自訂義頁面',
					url: `/${page.slug}`,
					type: 'page',
					pageId: page.id,
					position: 'top',
					parentMenuId: null,
					customLink: null,
					sortOrder: maxOrder + 1,
					target: '_self',
					isActive: true,
				});
				createdMenuId = createdMenu.id;
			} catch (menuError) {
				await deletePageApi(page.id);
				throw menuError;
			}

			await loadMenus(createdMenuId);
			notifySiteNavigationUpdated();
			setNotice({ type: 'success', text: '已新增一個頁面。' });
		} catch (error) {
			console.error('新增頁面失敗:', error);
			setNotice({ type: 'error', text: '新增失敗，請稍後再試。' });
		} finally {
			setCreating(false);
		}
	};

	const handleSave = async () => {
		if (!hasUnsavedChanges) return;
		if (menus.some((item) => item.position === 'child' && !item.parentMenuId)) {
			setNotice({ type: 'error', text: '子頁面必須指定父頁面。' });
			return;
		}

		setSaving(true);
		setNotice(null);
		try {
			const initialMap = new Map(initialMenus.map((item) => [item.id, item]));

			for (const [index, menu] of menus.entries()) {
				const normalizedMenu = { ...menu, sortOrder: index + 1 };
				const initialMenu = initialMap.get(menu.id);
				if (!initialMenu) continue;
				if (!isSameMenuForSave(normalizedMenu, initialMenu)) {
					await updateMenu(menu.id, {
						title: normalizedMenu.title,
						url: normalizedMenu.url,
						type: normalizedMenu.type,
						pageId: normalizedMenu.pageId,
						position: normalizedMenu.position,
						parentMenuId: normalizedMenu.parentMenuId,
						customLink: normalizedMenu.customLink,
						sortOrder: normalizedMenu.sortOrder,
						target: normalizedMenu.target || '_self',
						isActive: normalizedMenu.isActive,
					});
				}

				if (
					normalizedMenu.type === 'page' &&
					normalizedMenu.pageId &&
					normalizedMenu.title !== initialMenu.title
				) {
					await updatePage(normalizedMenu.pageId, { title: normalizedMenu.title });
				}
			}

			for (const deletedMenu of pendingDeleteMenus) {
				const backup = { ...deletedMenu };
				await deleteMenuApi(deletedMenu.id);
				try {
					if (deletedMenu.type === 'page') {
						if (deletedMenu.pageId) {
							await deletePageApi(deletedMenu.pageId);
						} else if (deletedMenu.url) {
							const slug = deletedMenu.url.replace(/^\/+/, '').trim();
							if (slug) {
								const page = await fetchPageBySlug(slug);
								if (page?.id) {
									await deletePageApi(page.id);
								}
							}
						}
					}
				} catch {
					await createMenu({
						title: backup.title,
						url: backup.url,
						type: backup.type,
						pageId: backup.pageId,
						position: backup.position,
						parentMenuId: backup.parentMenuId,
						customLink: backup.customLink,
						sortOrder: backup.sortOrder,
						target: backup.target || '_self',
						isActive: backup.isActive,
					});
					await loadMenus();
					notifySiteNavigationUpdated();
					throw new Error('刪除內容頁失敗，已回復導覽節點，請稍後再試。');
				}
			}

			await loadMenus(selectedMenu?.id || null);
			notifySiteNavigationUpdated();
			setNotice({ type: 'success', text: '儲存成功。' });
		} catch (error) {
			console.error('儲存導覽頁面失敗:', error);
			setNotice({
				type: 'error',
				text: error instanceof Error ? error.message : '儲存失敗，請稍後再試。',
			});
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

	const parentCandidates = menus.filter(
		(item) => item.id !== selectedMenu?.id && item.position !== 'child'
	);
	const editLink = selectedMenu ? getEditLink(selectedMenu) : null;

	return (
		<div className='max-w-[1400px] mx-auto space-y-4'>
			<div>
				<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>網站管理 - 導覽頁面</h1>
			</div>

			<div className='bg-[#1f2732] rounded-t-xl px-4 py-2 flex items-center gap-3'>
				<span className='text-white text-sm font-semibold'>導覽頁面</span>
				<button
					onClick={handleCreatePage}
					disabled={creating || saving}
					className='px-4 py-2 rounded-md bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60'
				>
					{creating ? '新增中...' : '新增一個頁面'}
				</button>
				{hasUnsavedChanges && (
					<button
						onClick={handleCancelChanges}
						disabled={saving}
						className='px-4 py-2 rounded-md bg-white text-text text-sm font-semibold hover:bg-surface disabled:opacity-60'
					>
						取消儲存
					</button>
				)}
				<button
					onClick={handleSave}
					disabled={!hasUnsavedChanges || saving}
					className='px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60'
				>
					{saving ? '儲存中...' : '儲存'}
				</button>
			</div>

			{notice && (
				<div
					className={`rounded-xl border px-4 py-3 text-sm ${
						notice.type === 'success'
							? 'bg-green-50 text-green-700 border-green-200'
							: 'bg-red-50 text-red-700 border-red-200'
					}`}
				>
					{notice.text}
				</div>
			)}

			<div className='bg-[#eceff2] rounded-xl p-4'>
				<div className='overflow-x-auto'>
					<div className='inline-flex min-w-full gap-0 bg-[#d7dce0] rounded-md overflow-hidden'>
						{menus.map((menu, index) => {
							const isActive = index === selectedIndex;
							return (
								<button
									key={menu.id}
									onClick={() => handleSelect(index)}
									className={`min-w-[200px] px-4 py-2 text-left border-r border-white/20 transition-colors ${
										isActive ? 'bg-red-500 text-white' : 'bg-transparent text-text'
									}`}
								>
									<div className='flex items-center gap-3'>
										<span
											className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
												isActive ? 'bg-red-600 text-white' : 'bg-[#6f7780] text-white'
											}`}
										>
											{index + 1}
										</span>
										<div>
											<p className='text-lg font-bold leading-tight'>{menu.title || '未命名頁面'}</p>
											<p
												className={`text-sm ${isActive ? 'text-red-100' : 'text-text-muted'}`}
											>
												{getMenuDescription(menu)}
											</p>
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				<div className='mt-4 bg-white border border-border rounded-xl'>
					<div className='px-6 py-5 border-b border-border'>
						<h2 className='text-2xl font-extrabold text-text'>編輯動作</h2>
					</div>

					{selectedMenu ? (
						<div className='px-5 py-5'>
							<div className='mb-6 flex flex-wrap items-center gap-3'>
								<button
									type='button'
									onClick={() => updateSelectedMenu({ isActive: !selectedMenu.isActive })}
									aria-pressed={selectedMenu.isActive}
									className={`inline-flex h-9 w-16 shrink-0 items-center rounded-full px-1 transition-colors ${
										selectedMenu.isActive ? 'bg-[#232c38]' : 'bg-gray-300'
									}`}
								>
									<span
										className={`h-7 w-7 rounded-full bg-white shadow-sm transition-transform ${
											selectedMenu.isActive ? 'translate-x-7' : 'translate-x-0'
										}`}
									/>
								</button>
								<span className='shrink-0 px-3 py-1.5 rounded bg-red-400 text-white text-base font-semibold leading-none'>
									開關
								</span>
							</div>

							<hr className='border-border mb-6' />

							<div className='max-w-4xl space-y-4'>
								{selectedMenu.type === 'page' && (
									<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
										<label className='text-base font-semibold text-text-muted'>id 編號</label>
										<div className='text-base text-text-light'>{selectedMenu.pageId || '-'}</div>
									</div>
								)}

								<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
									<label className='text-base font-semibold text-text-muted'>顯示名稱</label>
									<input
										type='text'
										value={selectedMenu.title}
										onChange={(event) => updateSelectedMenu({ title: event.target.value })}
										className='w-full h-10 px-4 rounded-md border border-border bg-surface text-base'
									/>
								</div>

								<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
									<label className='text-base font-semibold text-text-muted'>顯示位置</label>
									<select
										value={selectedMenu.position}
										onChange={(event) =>
											updateSelectedMenu({
												position: event.target.value as MenuPosition,
												parentMenuId:
													event.target.value === 'child'
														? selectedMenu.parentMenuId
														: null,
											})
										}
										className='w-full h-10 px-4 rounded-md border border-border bg-surface text-base'
									>
										<option value='top'>上方</option>
										<option value='bottom'>頁尾</option>
										<option value='child'>子頁面</option>
									</select>
								</div>

								{selectedMenu.position === 'child' && (
									<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
										<label className='text-base font-semibold text-text-muted'>父頁面</label>
										<select
											value={selectedMenu.parentMenuId || ''}
											onChange={(event) =>
												updateSelectedMenu({
													parentMenuId: event.target.value
														? Number(event.target.value)
														: null,
												})
											}
											className='w-full h-10 px-4 rounded-md border border-border bg-surface text-base'
										>
											<option value=''>請選擇父頁面</option>
											{parentCandidates.map((item) => (
												<option key={item.id} value={item.id}>
													{item.title}
												</option>
											))}
										</select>
									</div>
								)}

								{selectedMenu.type === 'page' && (
									<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
										<label className='text-base font-semibold text-text-muted'>自訂連結</label>
										<div>
											<input
												type='text'
												value={selectedMenu.customLink || ''}
												onChange={(event) =>
													updateSelectedMenu({
														customLink: event.target.value.trim() || null,
													})
												}
												className='w-full h-10 px-4 rounded-md border border-border bg-surface text-base'
											/>
											<p className='text-sm text-text-light mt-2'>
												有填寫自訂連結，使用者點擊會導向到該連結的頁面
											</p>
										</div>
									</div>
								)}

								<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
									<label className='text-base font-semibold text-text-muted'>編輯</label>
									{editLink ? (
										<AppLink
											href={editLink}
											target='_blank'
											className='text-primary text-sm font-semibold hover:underline w-fit'
										>
											前往編輯
										</AppLink>
									) : (
										<span className='text-base text-text-light'>-</span>
									)}
								</div>

								<div className='grid grid-cols-[140px_1fr] items-center gap-4'>
									<label className='text-base font-semibold text-text-muted'>排序</label>
									<div className='flex items-center gap-2'>
										<button
											type='button'
											onClick={() => moveSelected('left')}
											disabled={selectedIndex === 0}
											className='text-primary text-2xl disabled:opacity-30'
										>
											←
										</button>
										<button
											type='button'
											onClick={() => moveSelected('right')}
											disabled={selectedIndex >= menus.length - 1}
											className='text-primary text-2xl disabled:opacity-30'
										>
											→
										</button>
									</div>
								</div>
							</div>

							<hr className='border-border mt-8 mb-6' />

							{selectedMenu.type === 'page' && (
								<button
									type='button'
									onClick={handleDeleteSelected}
									className='px-5 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600'
								>
									刪除區塊
								</button>
							)}
						</div>
					) : (
						<div className='px-6 py-10 text-center text-sm text-text-light'>目前沒有可編輯的導覽資料。</div>
					)}
				</div>

				<div className='mt-4 flex items-center justify-between'>
					<button
						type='button'
						onClick={() => handleSelect(selectedIndex - 1)}
						disabled={selectedIndex <= 0}
						className='px-4 py-2 rounded-full border border-border text-sm text-text-muted disabled:opacity-40'
					>
						← Previous
					</button>
					<button
						type='button'
						onClick={() => handleSelect(selectedIndex + 1)}
						disabled={selectedIndex >= menus.length - 1}
						className='px-4 py-2 rounded-full border border-border text-sm text-text-muted disabled:opacity-40'
					>
						Next →
					</button>
				</div>
			</div>
		</div>
	);
}
