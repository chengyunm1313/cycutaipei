'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { fetchProducts, fetchCategories, fetchArticles } from '@/lib/api';

/**
 * 後台 CMS - Dashboard 頁面
 * 統計數據來自 D1 API 即時查詢
 */
export default function AdminDashboard() {
	const [counts, setCounts] = useState({
		products: '-',
		published: '-',
		categories: '-',
		articles: '-',
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([fetchProducts(), fetchCategories(), fetchArticles()])
			.then(([prods, cats, arts]) => {
				setCounts({
					products: String(prods.length),
					published: String(prods.filter((p) => p.status === 'published').length),
					categories: String(cats.length),
					articles: String(arts.length),
				});
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const stats = [
		{ label: '產品總數', value: counts.products, color: 'bg-primary' },
		{ label: '已上架', value: counts.published, color: 'bg-success' },
		{ label: '產品分類', value: counts.categories, color: 'bg-secondary' },
		{ label: '文章數量', value: counts.articles, color: 'bg-cta' },
	];

	const recentActions = [{ action: '系統', target: '資料已從 D1 載入', time: '剛剛' }];

	return (
		<div>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold text-text'>Dashboard</h1>
				<p className='text-text-muted mt-1'>管理您的產品型錄</p>
			</div>

			{/* 統計卡片 */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
				{stats.map((stat) => (
					<div
						key={stat.label}
						className='bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow duration-200'
					>
						<div className='flex items-center justify-between mb-3'>
							<div
								className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
							>
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
						</div>
						<p className={`text-2xl font-bold text-text ${loading ? 'animate-pulse' : ''}`}>
							{stat.value}
						</p>
						<p className='text-sm text-text-muted mt-0.5'>{stat.label}</p>
					</div>
				))}
			</div>

			{/* 快捷操作 + 最近動態 */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* 快捷操作 */}
				<div className='bg-card rounded-xl border border-border p-5'>
					<h2 className='text-sm font-semibold text-text mb-4'>快捷操作</h2>
					<div className='grid grid-cols-2 gap-3'>
						<AppLink
							href='/admin/products/new'
							className='flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-primary/5 transition-colors duration-200 cursor-pointer group'
						>
							<div className='w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200'>
								<svg
									className='w-4 h-4 text-primary'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
								</svg>
							</div>
							<span className='text-sm font-medium text-text'>新增產品</span>
						</AppLink>
						<AppLink
							href='/admin/articles/new'
							className='flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-primary/5 transition-colors duration-200 cursor-pointer group'
						>
							<div className='w-9 h-9 bg-cta/10 rounded-lg flex items-center justify-center group-hover:bg-cta/20 transition-colors duration-200'>
								<svg
									className='w-4 h-4 text-cta'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
								</svg>
							</div>
							<span className='text-sm font-medium text-text'>新增文章</span>
						</AppLink>
						<AppLink
							href='/admin/products'
							className='flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-primary/5 transition-colors duration-200 cursor-pointer group'
						>
							<div className='w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-200'>
								<svg
									className='w-4 h-4 text-secondary'
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
							<span className='text-sm font-medium text-text'>管理產品</span>
						</AppLink>
						<AppLink
							href='/'
							className='flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-primary/5 transition-colors duration-200 cursor-pointer group'
						>
							<div className='w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors duration-200'>
								<svg
									className='w-4 h-4 text-success'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={2}
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
									/>
								</svg>
							</div>
							<span className='text-sm font-medium text-text'>前台預覽</span>
						</AppLink>
					</div>
				</div>

				{/* 最近動態 */}
				<div className='bg-card rounded-xl border border-border p-5'>
					<h2 className='text-sm font-semibold text-text mb-4'>最近動態</h2>
					<div className='space-y-3'>
						{recentActions.map((item, index) => (
							<div key={index} className='flex items-center gap-3 text-sm'>
								<div className='w-2 h-2 bg-primary rounded-full flex-shrink-0' />
								<div className='flex-1 min-w-0'>
									<span className='text-text-muted'>{item.action}</span>
									<span className='font-medium text-text ml-1 truncate'>{item.target}</span>
								</div>
								<span className='text-text-light text-xs flex-shrink-0'>{item.time}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
