'use client';

import AppLink from '@/components/AppLink';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ToastProvider';
import type { Permission } from '@/data/types';
import { fetchMenus, fetchSiteContents } from '@/lib/api';

/**
 * 後台 CMS Layout
 * 包含 AuthProvider、登入檢查、角色權限過濾側邊欄
 */

interface SidebarItem {
	label: string;
	href?: string;
	permission: Permission;
	icon: ReactNode;
	subItems?: SidebarSubItem[];
}

interface SidebarSubItem {
	label: string;
	href?: string;
	subItems?: SidebarSubItem[];
	/** 僅 admin 可見 */
	adminOnly?: boolean;
}

const sidebarItemsBase: SidebarItem[] = [
	{
		label: 'Dashboard',
		href: '/admin',
		permission: 'dashboard',
		icon: (
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
					d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
				/>
			</svg>
		),
	},
	{
		label: '產品管理',
		permission: 'products',
		icon: (
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
					d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
				/>
			</svg>
		),
		subItems: [
			{ label: '分類管理', href: '/admin/categories' },
			{ label: '產品內容', href: '/admin/products' },
		],
	},
	{
		label: '文章管理',
		permission: 'articles',
		icon: (
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
					d='M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z'
				/>
			</svg>
		),
		subItems: [
			{ label: '分類管理', href: '/admin/articles/categories' },
			{ label: '內容管理', href: '/admin/articles/content' },
		],
	},
	{
		label: '網站管理',
		permission: 'pages',
		icon: (
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
					d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
				/>
			</svg>
		),
		subItems: [
			{ label: '網站資訊', href: '/admin/site-settings' },
			{ label: '匯入匯出', href: '/admin/site-management/import-export', adminOnly: true },
			{ label: '主題模板', href: '/admin/site-management/theme-templates', adminOnly: true },
			{
				label: '導覽頁面',
				subItems: [{ label: '管理頁面', href: '/admin/site-navigation' }],
			},
			{
				label: '關於我們',
				subItems: [{ label: '管理頁面', href: '/admin/site-management/about' }],
			},
			{
				label: '常見問題',
				subItems: [{ label: '管理頁面', href: '/admin/site-management/faq' }],
			},
			{ label: '首頁輪播圖', href: '/admin/site-management/home-carousel' },
			{ label: '首頁關於我們', href: '/admin/site-management/home-about' },
		],
	},
	{
		label: '媒體管理',
		href: '/admin/media',
		permission: 'media',
		icon: (
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
					d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z'
				/>
			</svg>
		),
	},
	{
		label: '使用者管理',
		href: '/admin/users',
		permission: 'users',
		icon: (
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
					d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
				/>
			</svg>
		),
	},
];

/**
 * 需要權限驗證的後台內容
 */
function AdminContent({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { isAuthenticated, currentUser, logout, hasPermission } = useAuth();
	const [aboutPageMenus, setAboutPageMenus] = useState<{ id: string; title: string }[]>([]);
	const [faqPageMenus, setFaqPageMenus] = useState<{ id: string; title: string }[]>([]);
	const [navigationPageMenus, setNavigationPageMenus] = useState<
		{ menuId: number; pageId: number | null; title: string }[]
	>([]);
	const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
		產品管理: false,
		文章管理: false,
		網站管理: false,
		'網站管理::導覽頁面': false,
		'網站管理::關於我們': false,
		'網站管理::常見問題': false,
	});

	useEffect(() => {
		if (!isAuthenticated && pathname !== '/admin/login') {
			router.replace('/admin/login');
		}
	}, [isAuthenticated, pathname, router]);

	const loadSiteContentMenus = useCallback(async () => {
		try {
			const [aboutPages, faqPages, customNavigationPages] = await Promise.all([
				fetchSiteContents({ type: 'about_page' }),
				fetchSiteContents({ type: 'faq_page' }),
				fetchMenus({ type: 'page' }),
			]);

			setAboutPageMenus(
				aboutPages.map((item) => ({
					id: item.id,
					title: item.title?.trim() || '未命名頁面',
				}))
			);
			setFaqPageMenus(
				faqPages.map((item) => ({
					id: item.id,
					title: item.title?.trim() || '未命名頁面',
				}))
			);
			setNavigationPageMenus(
				customNavigationPages
					.map((item) => ({
						menuId: item.id,
						pageId: item.pageId ?? null,
						title: item.title?.trim() || '未命名頁面',
						sortOrder: item.sortOrder || 0,
					}))
					.sort((a, b) => a.sortOrder - b.sortOrder)
					.map((item) => ({ menuId: item.menuId, pageId: item.pageId, title: item.title }))
			);
		} catch (error) {
			console.error('載入網站管理動態選單失敗:', error);
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated || pathname === '/admin/login') return;

		const initTimer = window.setTimeout(() => {
			void loadSiteContentMenus();
		}, 0);
		const handleUpdated = () => {
			void loadSiteContentMenus();
		};
		const handleNavigationUpdated = () => {
			void loadSiteContentMenus();
		};
		window.addEventListener('site-content-updated', handleUpdated);
		window.addEventListener('site-navigation-updated', handleNavigationUpdated);
		return () => {
			window.clearTimeout(initTimer);
			window.removeEventListener('site-content-updated', handleUpdated);
			window.removeEventListener('site-navigation-updated', handleNavigationUpdated);
		};
	}, [isAuthenticated, pathname, loadSiteContentMenus]);

	const sidebarItems = useMemo(() => {
		return sidebarItemsBase.map((item) => {
			if (item.label !== '網站管理' || !item.subItems) return item;

			const aboutCustomSubItems: SidebarSubItem[] = aboutPageMenus.map((page) => ({
				label: page.title,
				href: `/admin/site-management/about/${page.id}`,
			}));

			const faqCustomSubItems: SidebarSubItem[] = faqPageMenus.map((page) => ({
				label: page.title,
				href: `/admin/site-management/faq/${page.id}`,
			}));

			const navigationSubItems: SidebarSubItem[] = item.subItems.map((subItem): SidebarSubItem => {
				if (subItem.label !== '導覽頁面' || !subItem.subItems) return subItem;
				const customPageSubItems: SidebarSubItem[] = navigationPageMenus.map((page) => ({
					label: page.title,
					href:
						page.pageId != null
							? `/admin/pages/${page.pageId}`
							: `/admin/site-navigation?menu=${page.menuId}`,
				}));
				return {
					...subItem,
					subItems: [...subItem.subItems, ...customPageSubItems],
				};
			});

			const groupedSubItems: SidebarSubItem[] = navigationSubItems.map(
				(subItem): SidebarSubItem => {
					if (subItem.label === '關於我們' && subItem.subItems) {
						return {
							...subItem,
							subItems: [...subItem.subItems, ...aboutCustomSubItems],
						};
					}
					if (subItem.label === '常見問題' && subItem.subItems) {
						return {
							...subItem,
							subItems: [...subItem.subItems, ...faqCustomSubItems],
						};
					}
					return subItem;
				}
			);

			return {
				...item,
				subItems: groupedSubItems,
			};
		});
	}, [aboutPageMenus, faqPageMenus, navigationPageMenus]);

	// 登入頁直接渲染（不套用側邊欄）
	if (pathname === '/admin/login') {
		return <>{children}</>;
	}

	// 未登入 → 等待 redirect
	if (!isAuthenticated) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-surface'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	// 根據角色過濾側邊欄項目，並過濾 adminOnly 子項目
	const isAdmin = currentUser?.role === 'admin';
	const filterAdminOnlySubs = (subs: SidebarSubItem[]): SidebarSubItem[] =>
		subs
			.filter((sub) => !sub.adminOnly || isAdmin)
			.map((sub) => (sub.subItems ? { ...sub, subItems: filterAdminOnlySubs(sub.subItems) } : sub));
	const visibleItems = sidebarItems
		.filter((item) => hasPermission(item.permission))
		.map((item) =>
			item.subItems ? { ...item, subItems: filterAdminOnlySubs(item.subItems) } : item
		);

	return (
		<div className='min-h-screen flex bg-surface'>
			{/* 側邊欄 */}
			<aside className='hidden lg:flex lg:flex-col w-60 bg-card border-r border-border'>
				<div className='p-5 border-b border-border'>
					<AppLink href='/admin' className='flex items-center gap-2 cursor-pointer'>
						<div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
							<svg
								className='w-5 h-5 text-white'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'
								/>
							</svg>
						</div>
						<span className='text-sm font-bold text-text'>CMS 管理後台</span>
					</AppLink>
				</div>

				<nav className='flex-1 p-3 space-y-1'>
					{visibleItems.map((item) => {
						const isArticleContentPath =
							pathname === '/admin/articles' ||
							pathname.startsWith('/admin/articles/content') ||
							pathname.startsWith('/admin/articles/new') ||
							/^\/admin\/articles\/\d+/.test(pathname);
						const currentQuery = searchParams.toString();
						const collectSubHrefs = (subItems: SidebarSubItem[]): string[] => {
							const hrefs: string[] = [];
							const walk = (items: SidebarSubItem[]) => {
								for (const subItem of items) {
									if (subItem.href) hrefs.push(subItem.href);
									if (subItem.subItems?.length) {
										walk(subItem.subItems);
									}
								}
							};
							walk(subItems);
							return hrefs;
						};
						const getHrefScore = (href: string): number => {
							if (href === '/admin/articles/content') {
								return isArticleContentPath ? 3000 : -1;
							}

							const [hrefPath, hrefQuery = ''] = href.split('?');
							const pathMatched =
								pathname === hrefPath ||
								(pathname.startsWith(`${hrefPath}/`) && hrefPath !== '/admin');
							if (!pathMatched) return -1;

							if (!hrefQuery) {
								if (pathname === hrefPath) {
									return currentQuery ? 100 + hrefPath.length : 2000 + hrefPath.length;
								}
								return 1000 + hrefPath.length;
							}

							const expectedParams = new URLSearchParams(hrefQuery);
							for (const [key, value] of expectedParams.entries()) {
								if (searchParams.get(key) !== value) return -1;
							}
							return 4000 + href.length;
						};

						const allSubHrefs = item.subItems ? collectSubHrefs(item.subItems) : [];
						let activeSubHref: string | undefined;
						let bestScore = -1;
						for (const href of allSubHrefs) {
							const score = getHrefScore(href);
							if (score > bestScore) {
								bestScore = score;
								activeSubHref = href;
							}
						}

						const isActive = item.href
							? item.href === '/admin'
								? pathname === '/admin'
								: pathname.startsWith(item.href)
							: Boolean(activeSubHref);

						if (item.subItems) {
							const isExpanded = expandedMenus[item.label] ?? false;
							return (
								<div key={item.label} className='space-y-1'>
									<button
										onClick={() =>
											setExpandedMenus((prev) => ({ ...prev, [item.label]: !isExpanded }))
										}
										className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
											isActive
												? 'bg-primary/10 text-primary'
												: 'text-text-muted hover:text-text hover:bg-surface'
										}`}
									>
										<div className='flex items-center gap-3'>
											{item.icon}
											{item.label}
										</div>
										<svg
											className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={2}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M19.5 8.25l-7.5 7.5-7.5-7.5'
											/>
										</svg>
									</button>
									{isExpanded && (
										<div className='pl-11 pr-3 py-1 space-y-1'>
											{item.subItems.map((subItem) => {
												if (subItem.subItems?.length) {
													const subGroupKey = `${item.label}::${subItem.label}`;
													const isSubGroupActive = subItem.subItems.some(
														(child) => child.href === activeSubHref
													);
													const isSubGroupExpanded = expandedMenus[subGroupKey] ?? false;
													return (
														<div key={subGroupKey} className='space-y-1'>
															<button
																onClick={() =>
																	setExpandedMenus((prev) => ({
																		...prev,
																		[subGroupKey]: !isSubGroupExpanded,
																	}))
																}
																className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
																	isSubGroupActive
																		? 'text-primary bg-primary/5'
																		: 'text-text-muted hover:text-text hover:bg-surface'
																}`}
															>
																{subItem.label}
																<svg
																	className={`w-3.5 h-3.5 transition-transform duration-200 ${
																		isSubGroupExpanded ? 'rotate-180' : ''
																	}`}
																	fill='none'
																	viewBox='0 0 24 24'
																	strokeWidth={2}
																	stroke='currentColor'
																>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		d='M19.5 8.25l-7.5 7.5-7.5-7.5'
																	/>
																</svg>
															</button>
															{isSubGroupExpanded && (
																<div className='pl-3 space-y-1'>
																	{subItem.subItems.map((childItem) => {
																		if (!childItem.href) return null;
																		const isChildActive = childItem.href === activeSubHref;
																		return (
																			<AppLink
																				key={childItem.href}
																				href={childItem.href}
																				className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
																					isChildActive
																						? 'text-primary bg-primary/5'
																						: 'text-text-muted hover:text-text hover:bg-surface'
																				}`}
																			>
																				{childItem.label}
																			</AppLink>
																		);
																	})}
																</div>
															)}
														</div>
													);
												}

												const isSubActive = subItem.href === activeSubHref;
												if (!subItem.href) return null;
												return (
													<AppLink
														key={subItem.href}
														href={subItem.href}
														className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
															isSubActive
																? 'text-primary bg-primary/5'
																: 'text-text-muted hover:text-text hover:bg-surface'
														}`}
													>
														{subItem.label}
													</AppLink>
												);
											})}
										</div>
									)}
								</div>
							);
						}

						return (
							<AppLink
								key={item.label}
								href={item.href!}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
									isActive
										? 'bg-primary/10 text-primary'
										: 'text-text-muted hover:text-text hover:bg-surface'
								}`}
							>
								{item.icon}
								{item.label}
							</AppLink>
						);
					})}
				</nav>

				<div className='p-3 border-t border-border'>
					{/* 當前使用者 */}
					<div className='flex items-center gap-3 px-3 py-2.5 mb-1'>
						<div className='w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold'>
							{currentUser?.displayName?.charAt(0) || 'U'}
						</div>
						<div className='min-w-0'>
							<p className='text-xs font-medium text-text truncate'>{currentUser?.displayName}</p>
							<p className='text-[10px] text-text-light truncate'>{currentUser?.username}</p>
						</div>
					</div>

					<AppLink
						href='/'
						className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface transition-colors duration-200 cursor-pointer'
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
						前台預覽
					</AppLink>
					<button
						onClick={logout}
						className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-colors duration-200 cursor-pointer w-full'
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
								d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
							/>
						</svg>
						登出
					</button>
				</div>
			</aside>

			{/* 主要內容 */}
			<main className='flex-1 p-6 lg:p-8 overflow-auto'>{children}</main>
		</div>
	);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<AuthProvider>
			<ToastProvider>
				<Suspense
					fallback={
						<div className='min-h-screen flex items-center justify-center bg-surface'>
							<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
						</div>
					}
				>
					<AdminContent>{children}</AdminContent>
				</Suspense>
			</ToastProvider>
		</AuthProvider>
	);
}
