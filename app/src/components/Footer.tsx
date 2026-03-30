'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLink from '@/components/AppLink';
import CurrentYear from '@/components/CurrentYear';
import { fetchCategories, fetchMenus, fetchSiteSettings } from '@/lib/api';
import type { ApiCategory, ApiMenu } from '@/data/types';

function resolveMenuHref(menu: ApiMenu): string {
	const custom = menu.customLink?.trim();
	if (custom) return custom;
	return menu.url || '#';
}

function isExternalUrl(url: string): boolean {
	return /^(https?:)?\/\//.test(url);
}

/**
 * 底部頁尾
 * 改由瀏覽器端抓取站台設定，避免靜態頁面把 build 階段的 fallback 內容固定下來。
 */
export default function Footer() {
	const [siteName, setSiteName] = useState('中原大學台北市校友會');
	const [siteDescription, setSiteDescription] = useState(
		'串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。'
	);
	const [bottomMenus, setBottomMenus] = useState<ApiMenu[]>([]);
	const [productCategories, setProductCategories] = useState<ApiCategory[]>([]);
	const [contactPhone, setContactPhone] = useState('');
	const [contactEmail, setContactEmail] = useState('');
	const [contactAddress, setContactAddress] = useState('');
	const [copyright, setCopyright] = useState('');

	useEffect(() => {
		let cancelled = false;

		Promise.all([
			fetchSiteSettings(),
			fetchMenus({ activeOnly: true, position: 'bottom' }),
			fetchCategories(),
		])
			.then(([settings, menus, categoryList]) => {
				if (cancelled) return;

				const nextSiteName = settings.siteName?.trim() || '中原大學台北市校友會';
				setSiteName(nextSiteName);
				setSiteDescription(
					settings.metaDescription?.trim() ||
						'串聯中原大學台北市校友情誼，提供最新消息、活動資訊與校友會相關服務。'
				);
				setContactPhone(settings.phone?.trim() || '');
				setContactEmail(settings.email?.trim() || '');
				setContactAddress(settings.address?.trim() || '');
				setCopyright(
					settings.copyright?.trim() || `© ${new Date().getFullYear()} ${nextSiteName}. All rights reserved.`
				);

				setBottomMenus(
					Array.isArray(menus)
						? [...menus].sort((a, b) => a.sortOrder - b.sortOrder)
						: []
				);
				setProductCategories(
					Array.isArray(categoryList)
						? categoryList
								.filter((item) => item.isActive)
								.sort((a, b) => a.sortOrder - b.sortOrder)
								.slice(0, 8)
						: []
				);
			})
			.catch((error) => {
				console.error('Footer load error:', error);
				if (cancelled) return;
				setCopyright((current) => current || `© ${new Date().getFullYear()} 中原大學台北市校友會. All rights reserved.`);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const quickLinks = useMemo(
		() =>
			bottomMenus.length > 0
				? bottomMenus.map((menu) => ({
						id: menu.id,
						title: menu.title,
						href: resolveMenuHref(menu),
						target: menu.target || '_self',
					}))
				: [
						{ id: 'home', title: '首頁', href: '/', target: '_self' },
						{ id: 'products', title: '活動資訊', href: '/products', target: '_self' },
						{ id: 'blog', title: '最新消息', href: '/blog', target: '_self' },
					],
		[bottomMenus]
	);

	return (
		<footer className='bg-text text-white'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
					<div>
						<div className='flex items-center gap-2 mb-4'>
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
										d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
									/>
								</svg>
							</div>
							<span className='text-lg font-bold'>{siteName}</span>
						</div>
						<p className='text-sm text-gray-400 leading-relaxed mb-4'>{siteDescription}</p>
					</div>

					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>快速連結</h3>
						<ul className='space-y-2.5'>
							{quickLinks.map((item) => (
								<li key={item.id}>
									{isExternalUrl(item.href) ? (
										<a
											href={item.href}
											target={item.target}
											rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
											className='text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer'
										>
											{item.title}
										</a>
									) : (
										<AppLink
											href={item.href}
											target={item.target}
											className='text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer'
										>
											{item.title}
										</AppLink>
									)}
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>活動分類</h3>
						<ul className='space-y-2.5'>
							{productCategories.length > 0 ? (
								productCategories.map((cat) => (
									<li key={cat.id}>
										<AppLink
											href={`/category/${cat.slug}`}
											className='text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer'
										>
											{cat.name}
										</AppLink>
									</li>
								))
							) : (
								<li className='text-sm text-gray-500'>尚無可顯示的分類</li>
							)}
						</ul>
					</div>

					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider mb-4'>聯絡我們</h3>
						<ul className='space-y-3'>
							<li className='flex items-start gap-2.5'>
								<svg
									className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M15 10.5a3 3 0 11-6 0 3 3 0 016 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z'
									/>
								</svg>
								<span className='text-sm text-gray-400'>{contactAddress || '尚未提供地址'}</span>
							</li>
							<li className='flex items-start gap-2.5'>
								<svg
									className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
									/>
								</svg>
								<span className='text-sm text-gray-400'>
									{contactEmail || '請透過 Facebook 粉專聯絡'}
								</span>
							</li>
							<li className='flex items-start gap-2.5'>
								<svg
									className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z'
									/>
								</svg>
								<span className='text-sm text-gray-400'>{contactPhone || '電話資訊尚未公開'}</span>
							</li>
						</ul>
					</div>
				</div>

				<div className='border-t border-gray-700 mt-10 pt-8 text-center'>
					<p className='text-sm text-gray-500'>
						{copyright || (
							<>
								© <CurrentYear defaultYear={2026} /> {siteName}. All rights reserved.
							</>
						)}
					</p>
				</div>
			</div>
		</footer>
	);
}
