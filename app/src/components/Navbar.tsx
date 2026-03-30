'use client';

import AppLink from '@/components/AppLink';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCategories, fetchMenus, fetchSiteSettings } from '@/lib/api';
import type { ApiCategory, ApiMenu } from '@/data/types';
import { buildCategoryTree, type CategoryNodes } from '@/lib/treeUtils';

const fallbackMenus: ApiMenu[] = [
	{
		id: -1,
		title: '首頁',
		url: '/',
		type: 'link',
		pageId: null,
		position: 'top',
		parentMenuId: null,
		customLink: null,
		sortOrder: 1,
		target: '_self',
		isActive: 1,
		createdAt: '',
		updatedAt: '',
	},
	{
		id: -2,
		title: '文章',
		url: '/blog',
		type: 'link',
		pageId: null,
		position: 'top',
		parentMenuId: null,
		customLink: null,
		sortOrder: 2,
		target: '_self',
		isActive: 1,
		createdAt: '',
		updatedAt: '',
	},
	{
		id: -3,
		title: '產品',
		url: '/products',
		type: 'link',
		pageId: null,
		position: 'top',
		parentMenuId: null,
		customLink: null,
		sortOrder: 3,
		target: '_self',
		isActive: 1,
		createdAt: '',
		updatedAt: '',
	},
	{
		id: -4,
		title: '關於我們',
		url: '/about',
		type: 'link',
		pageId: null,
		position: 'top',
		parentMenuId: null,
		customLink: null,
		sortOrder: 4,
		target: '_self',
		isActive: 1,
		createdAt: '',
		updatedAt: '',
	},
	{
		id: -5,
		title: '常見問題',
		url: '/faq',
		type: 'link',
		pageId: null,
		position: 'top',
		parentMenuId: null,
		customLink: null,
		sortOrder: 5,
		target: '_self',
		isActive: 1,
		createdAt: '',
		updatedAt: '',
	},
];

interface MenuLinkProps {
	menu: ApiMenu;
	className: string;
	children: ReactNode;
	onClick?: () => void;
}

function normalizePosition(menu: ApiMenu): 'top' | 'bottom' | 'child' {
	if (menu.position === 'bottom' || menu.position === 'child') return menu.position;
	return 'top';
}

function isMenuActive(menu: ApiMenu): boolean {
	return menu.isActive === true || menu.isActive === 1;
}

function resolveMenuHref(menu: ApiMenu): string {
	const custom = menu.customLink?.trim();
	if (custom) return custom;
	return menu.url || '#';
}

function isExternalUrl(url: string): boolean {
	return /^(https?:)?\/\//.test(url);
}

function MenuLinkItem({ menu, className, children, onClick }: MenuLinkProps) {
	const href = resolveMenuHref(menu);
	const target = menu.target || (isExternalUrl(href) ? '_blank' : '_self');
	const rel = target === '_blank' ? 'noopener noreferrer' : undefined;

	if (isExternalUrl(href)) {
		return (
			<a href={href} target={target} rel={rel} className={className} onClick={onClick}>
				{children}
			</a>
		);
	}

	return (
		<AppLink href={href} target={target} className={className} onClick={onClick}>
			{children}
		</AppLink>
	);
}

/**
 * 響應式導覽列
 * 包含 Logo、導覽連結、搜尋框、行動版漢堡選單
 */
export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryList, setCategoryList] = useState<ApiCategory[]>([]);
	const [menuList, setMenuList] = useState<ApiMenu[]>(fallbackMenus);
	const [siteName, setSiteName] = useState('產品型錄平台');
	const router = useRouter();

	useEffect(() => {
		fetchCategories().then(setCategoryList).catch(console.error);
		fetchMenus({ activeOnly: true })
			.then((menus) => {
				const activeMenus = menus
					.filter((menu) => isMenuActive(menu))
					.sort((a, b) => a.sortOrder - b.sortOrder);
				setMenuList(activeMenus);
			})
			.catch(() => {
				setMenuList(fallbackMenus);
			});

		fetchSiteSettings()
			.then((settings) => {
				if (settings.siteName?.trim()) {
					setSiteName(settings.siteName.trim());
				}
			})
			.catch(console.error);
	}, []);

	const topMenus = useMemo(
		() =>
			menuList
				.filter((menu) => normalizePosition(menu) === 'top')
				.sort((a, b) => a.sortOrder - b.sortOrder),
		[menuList]
	);

	const categoryTree = useMemo(() => buildCategoryTree(categoryList), [categoryList]);

	const childMenusByParent = useMemo(() => {
		const map = new Map<number, ApiMenu[]>();
		for (const menu of menuList) {
			if (normalizePosition(menu) !== 'child' || !menu.parentMenuId) continue;
			const current = map.get(menu.parentMenuId) || [];
			current.push(menu);
			map.set(menu.parentMenuId, current);
		}
		for (const [, items] of map.entries()) {
			items.sort((a, b) => a.sortOrder - b.sortOrder);
		}
		return map;
	}, [menuList]);

	const handleSearch = (event: FormEvent) => {
		event.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery('');
			setMobileOpen(false);
		}
	};

	return (
		<nav className='fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo */}
					<AppLink href='/' className='flex items-center gap-2 cursor-pointer group'>
						<div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-dark transition-colors duration-200'>
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
									d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
								/>
							</svg>
						</div>
						<span className='text-lg font-bold text-text'>{siteName}</span>
					</AppLink>

					{/* 桌面版導覽 */}
					<div className='hidden sm:flex items-center gap-1'>
						{topMenus.map((menu) => {
							if (menu.type === 'category_dropdown') {
								const renderCategoryMenu = (nodes: CategoryNodes[]) => {
									return nodes.map((cat) => {
										const hasChildren = cat.children.length > 0;
										return (
											<div key={cat.id} className='relative group/sub'>
												<AppLink
													href={`/category/${cat.slug}`}
													className='flex items-center justify-between px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer'
												>
													{cat.name}
													{hasChildren && (
														<svg
															className='w-3.5 h-3.5 -rotate-90'
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
													)}
												</AppLink>
												{hasChildren && (
													<div className='absolute left-full top-0 ml-px w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 py-2'>
														{renderCategoryMenu(cat.children)}
													</div>
												)}
											</div>
										);
									});
								};

								return (
									<div key={menu.id} className='relative group'>
										<button className='px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5 cursor-pointer flex items-center gap-1'>
											{menu.title}
											<svg
												className='w-4 h-4 group-hover:rotate-180 transition-transform duration-200'
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
										<div className='absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 overflow-visible'>
											{renderCategoryMenu(categoryTree)}
										</div>
									</div>
								);
							}

							const childMenus = childMenusByParent.get(menu.id) || [];
							if (childMenus.length > 0) {
								return (
									<div key={menu.id} className='relative group'>
										<MenuLinkItem
											menu={menu}
											className='px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5 cursor-pointer flex items-center gap-1'
										>
											{menu.title}
											<svg
												className='w-4 h-4 group-hover:rotate-180 transition-transform duration-200'
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
										</MenuLinkItem>
										<div className='absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2'>
											{childMenus.map((childMenu) => (
												<MenuLinkItem
													key={childMenu.id}
													menu={childMenu}
													className='block px-4 py-2 text-sm text-text-muted hover:text-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer'
												>
													{childMenu.title}
												</MenuLinkItem>
											))}
										</div>
									</div>
								);
							}

							return (
								<MenuLinkItem
									key={menu.id}
									menu={menu}
									className='px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors duration-200 rounded-lg hover:bg-primary/5 cursor-pointer'
								>
									{menu.title}
								</MenuLinkItem>
							);
						})}
					</div>

					{/* 桌面版搜尋 */}
					<form onSubmit={handleSearch} className='hidden lg:flex items-center'>
						<div className='relative'>
							<input
								type='text'
								placeholder='搜尋產品...'
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className='w-56 pl-9 pr-4 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
							<svg
								className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
								/>
							</svg>
						</div>
					</form>

					{/* 行動版漢堡選單按鈕 */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className='sm:hidden p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
						aria-label='開啟選單'
					>
						{mobileOpen ? (
							<svg
								className='w-6 h-6 text-text'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
							</svg>
						) : (
							<svg
								className='w-6 h-6 text-text'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* 行動版展開選單 */}
			{mobileOpen && (
				<div className='sm:hidden bg-white border-t border-border animate-fade-in'>
					<div className='px-4 py-3 space-y-1'>
						<form onSubmit={handleSearch} className='mb-3'>
							<div className='relative'>
								<input
									type='text'
									placeholder='搜尋產品...'
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									className='w-full pl-9 pr-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
								/>
								<svg
									className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
									/>
								</svg>
							</div>
						</form>
						{topMenus.map((menu) => {
							if (menu.type === 'category_dropdown') {
								const renderMobileCategories = (nodes: CategoryNodes[], depth = 0) => {
									return nodes.map((cat) => (
										<div key={cat.id}>
											<AppLink
												href={`/category/${cat.slug}`}
												onClick={() => setMobileOpen(false)}
												className='block px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer'
												style={{ paddingLeft: `${(depth + 1) * 0.75}rem` }}
											>
												{cat.name}
											</AppLink>
											{cat.children.length > 0 && renderMobileCategories(cat.children, depth + 1)}
										</div>
									));
								};

								return (
									<div key={menu.id} className='border-t border-border pt-2 mt-2 mb-2'>
										<p className='px-3 py-1.5 text-xs font-semibold text-text-light uppercase tracking-wider'>
											{menu.title}
										</p>
										{renderMobileCategories(categoryTree)}
									</div>
								);
							}

							const childMenus = childMenusByParent.get(menu.id) || [];
							return (
								<div key={menu.id}>
									<MenuLinkItem
										menu={menu}
										onClick={() => setMobileOpen(false)}
										className='block px-3 py-2.5 text-sm font-medium text-text-muted hover:text-primary rounded-lg hover:bg-primary/5 transition-colors duration-200 cursor-pointer'
									>
										{menu.title}
									</MenuLinkItem>
									{childMenus.length > 0 && (
										<div className='pl-4'>
											{childMenus.map((childMenu) => (
												<MenuLinkItem
													key={childMenu.id}
													menu={childMenu}
													onClick={() => setMobileOpen(false)}
													className='block px-3 py-2 text-sm text-text-light hover:text-primary rounded-lg hover:bg-primary/5 transition-colors duration-200 cursor-pointer'
												>
													{childMenu.title}
												</MenuLinkItem>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</nav>
	);
}
