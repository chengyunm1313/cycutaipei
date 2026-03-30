'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { fetchMenu, updateMenu } from '@/lib/api';
import type { ApiMenu } from '@/data/types';

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<Partial<ApiMenu>>({
		title: '',
		url: '',
		type: 'system',
		target: '_self',
		isActive: 1,
	});

	useEffect(() => {
		loadMenu();
	}, []);

	const loadMenu = async () => {
		try {
			const resolvedParams = await params;
			const data = await fetchMenu(parseInt(resolvedParams.id, 10));
			setFormData(data);
		} catch (error) {
			console.error('Error fetching menu:', error);
			alert('載入失敗');
			router.push('/admin/menus');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title?.trim()) {
			alert('請輸入標題');
			return;
		}

		setIsSubmitting(true);
		try {
			const payload = { ...formData };
			if (payload.type === 'category_dropdown') {
				payload.url = '';
			}

			const resolvedParams = await params;
			await updateMenu(parseInt(resolvedParams.id, 10), payload);
			alert('選單已更新');
			router.push('/admin/menus');
		} catch (error) {
			console.error('Error updating menu:', error);
			alert('更新失敗，請重試');
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return <div className='p-6 text-center text-text-light'>載入中...</div>;
	}

	return (
		<div className='p-6 max-w-3xl mx-auto'>
			<div className='flex items-center gap-4 mb-8'>
				<AppLink
					href='/admin/menus'
					className='p-2 hover:bg-secondary rounded-full transition-colors text-text-muted hover:text-text'
				>
					<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M10 19l-7-7m0 0l7-7m-7 7h18'
						/>
					</svg>
				</AppLink>
				<h1 className='text-3xl font-bold'>編輯選單</h1>
			</div>

			<form
				onSubmit={handleSubmit}
				className='bg-surface rounded-lg shadow-sm border border-border p-6 space-y-6'
			>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div>
						<label className='block text-sm font-medium text-text-light mb-2'>選單標題 *</label>
						<input
							type='text'
							className='w-full px-4 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary'
							value={formData.title || ''}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-text-light mb-2'>選單類型</label>
						<select
							className='w-full px-4 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary'
							value={formData.type || 'system'}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
						>
							<option value='system'>系統內建</option>
							<option value='page'>自訂頁面</option>
							<option value='link'>外部連結</option>
							<option value='category_dropdown'>分類下拉選單 (會自動帶出所有分類)</option>
						</select>
					</div>

					{formData.type !== 'category_dropdown' && (
						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-text-light mb-2'>
								URL 連結 / 路由
							</label>
							<input
								type='text'
								className='w-full px-4 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary'
								value={formData.url || ''}
								onChange={(e) => setFormData({ ...formData, url: e.target.value })}
								placeholder='例如: /products 或 https://example.com'
							/>
						</div>
					)}

					<div>
						<label className='block text-sm font-medium text-text-light mb-2'>開啟方式</label>
						<select
							className='w-full px-4 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary'
							value={formData.target || '_self'}
							onChange={(e) => setFormData({ ...formData, target: e.target.value })}
						>
							<option value='_self'>同視窗 (_self)</option>
							<option value='_blank'>開新視窗 (_blank)</option>
						</select>
					</div>

					<div className='flex items-center mt-8'>
						<label className='flex items-center cursor-pointer'>
							<input
								type='checkbox'
								className='w-5 h-5 rounded border-border text-primary focus:ring-primary bg-transparent'
								checked={formData.isActive === 1}
								onChange={(e) => setFormData({ ...formData, isActive: e.target.checked ? 1 : 0 })}
							/>
							<span className='ml-3 text-sm font-medium text-text-light'>啟用此選單</span>
						</label>
					</div>
				</div>

				<div className='flex justify-end pt-6 border-t border-border mt-8'>
					<AppLink
						href='/admin/menus'
						className='px-6 py-2 border border-border rounded-md mr-4 hover:bg-secondary transition-colors'
					>
						取消
					</AppLink>
					<button
						type='submit'
						disabled={isSubmitting}
						className='px-6 py-2 bg-primary text-text-light rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50'
					>
						{isSubmitting ? '儲存中...' : '儲存變更'}
					</button>
				</div>
			</form>
		</div>
	);
}
