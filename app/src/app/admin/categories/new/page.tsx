'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { createCategory, fetchCategories } from '@/lib/api';
import type { ApiCategory } from '@/data/types';
import ImageSelectInput from '@/components/ImageSelectInput';
import { slugifyAscii } from '@/lib/slug';

/**
 * 後台 - 新增分類
 */
export default function NewCategoryPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [carouselImages, setCarouselImages] = useState('');
	const [sortOrder, setSortOrder] = useState<number>(0);
	const [isActive, setIsActive] = useState<boolean>(true);
	const [parentId, setParentId] = useState<number | ''>('');
	const [categories, setCategories] = useState<ApiCategory[]>([]);

	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const getErrorMessage = (err: unknown, fallback: string) => {
		if (err instanceof Error && err.message) return err.message;
		return fallback;
	};

	useEffect(() => {
		fetchCategories()
			.then((data) => setCategories(data))
			.catch(console.error);
	}, []);

	// 自動產生 slug
	const handleNameChange = (value: string) => {
		setName(value);
		if (!slug || slug === slugifyAscii(name, 'category')) {
			setSlug(slugifyAscii(value, 'category'));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!name || !slug) {
			setError('請填寫分類名稱與 Slug');
			return;
		}

		setSubmitting(true);
		try {
			await createCategory({
				name,
				slug: slugifyAscii(slug, 'category'),
				description: description || undefined,
				image: image || undefined,
				coverImage: coverImage || undefined,
				carouselImages: carouselImages || undefined,
				sortOrder,
				isActive,
				parentId: parentId === '' ? null : parentId,
			});
			alert('分類已新增！');
			router.push('/admin/categories');
		} catch (err: unknown) {
			setError(getErrorMessage(err, '新增失敗'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='max-w-2xl'>
			<div className='flex items-center gap-3 mb-6'>
				<AppLink
					href='/admin/categories'
					className='p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
				>
					<svg
						className='w-5 h-5 text-text-muted'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
						/>
					</svg>
				</AppLink>
				<h1 className='text-2xl font-bold text-text'>新增分類</h1>
			</div>

			<div className='bg-card rounded-xl border border-border p-6'>
				<form onSubmit={handleSubmit} className='space-y-5'>
					{error && (
						<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
					)}

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='name' className='block text-sm font-medium text-text mb-1.5'>
								分類名稱 <span className='text-error'>*</span>
							</label>
							<input
								id='name'
								type='text'
								value={name}
								onChange={(e) => handleNameChange(e.target.value)}
								placeholder='例：微控制器'
								required
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='slug' className='block text-sm font-medium text-text mb-1.5'>
								Slug <span className='text-error'>*</span>
							</label>
							<input
								id='slug'
								type='text'
								value={slug}
								onChange={(e) => setSlug(slugifyAscii(e.target.value, 'category'))}
								placeholder='mcu'
								required
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
							/>
							<p className='text-xs text-text-light mt-1'>輸入中文也會自動轉成安全網址格式</p>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='parentId' className='block text-sm font-medium text-text mb-1.5'>
								父分類
							</label>
							<select
								id='parentId'
								value={parentId}
								onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
							>
								<option value=''>無 (作為主分類)</option>
								{categories.map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.name}
									</option>
								))}
							</select>
						</div>

						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='sortOrder' className='block text-sm font-medium text-text mb-1.5'>
								排序 (數字越小越前面)
							</label>
							<input
								id='sortOrder'
								type='number'
								value={sortOrder}
								onChange={(e) => setSortOrder(Number(e.target.value))}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='description' className='block text-sm font-medium text-text mb-1.5'>
							描述
						</label>
						<textarea
							id='description'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='簡要描述此分類...'
							rows={3}
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<ImageSelectInput label='分類縮圖' value={image} onChange={setImage} />
						</div>

						<div className='col-span-2 sm:col-span-1'>
							<ImageSelectInput label='分類封面圖片' value={coverImage} onChange={setCoverImage} />
						</div>
					</div>

					<div>
						<label htmlFor='carouselImages' className='block text-sm font-medium text-text mb-1.5'>
							輪播圖片 (多張圖片 URL 以逗號分隔)
						</label>
						<input
							id='carouselImages'
							type='text'
							value={carouselImages}
							onChange={(e) => setCarouselImages(e.target.value)}
							placeholder='https://..., https://...'
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
					</div>

					<div className='flex items-center gap-2'>
						<input
							id='isActive'
							type='checkbox'
							checked={isActive}
							onChange={(e) => setIsActive(e.target.checked)}
							className='w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20'
						/>
						<label htmlFor='isActive' className='block text-sm font-medium text-text'>
							啟用此分類
						</label>
					</div>

					<div className='flex gap-3 pt-2'>
						<button
							type='submit'
							disabled={submitting}
							className='px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{submitting ? '新增中...' : '新增分類'}
						</button>
						<AppLink
							href='/admin/categories'
							className='px-5 py-2.5 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors duration-200 cursor-pointer'
						>
							取消
						</AppLink>
					</div>
				</form>
			</div>
		</div>
	);
}
