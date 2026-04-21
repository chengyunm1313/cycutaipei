'use client';

export const runtime = 'edge';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { fetchCategory, updateCategory, deleteCategoryApi, fetchCategories } from '@/lib/api';
import type { ApiCategory } from '@/data/types';
import ImageSelectInput from '@/components/ImageSelectInput';
import { slugifyAscii } from '@/lib/slug';

/**
 * 後台 - 編輯分類
 */
export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const { id } = use(params);
	const categoryId = Number(id);

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

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const getErrorMessage = (err: unknown, fallback: string) => {
		if (err instanceof Error && err.message) return err.message;
		return fallback;
	};

	useEffect(() => {
		if (isNaN(categoryId)) {
			setError('無效的分類 ID');
			setLoading(false);
			return;
		}

		fetchCategories()
			.then((data) => setCategories(data.filter((c) => c.id !== categoryId))) // 避免選自己為父分類
			.catch(console.error);

		fetchCategory(categoryId)
			.then((cat) => {
				setName(cat.name);
				setSlug(slugifyAscii(cat.slug, 'category'));
				setDescription(cat.description || '');
				setImage(cat.image || '');
				setCoverImage(cat.coverImage || '');

				let parsedCarousel = '';
				try {
					parsedCarousel = cat.carouselImages ? JSON.parse(cat.carouselImages).join(', ') : '';
				} catch {
					parsedCarousel = cat.carouselImages || '';
				}
				setCarouselImages(parsedCarousel);

				setSortOrder(cat.sortOrder ?? 0);
				setIsActive(cat.isActive !== undefined ? !!cat.isActive : true);
				setParentId(cat.parentId ? cat.parentId : '');
			})
			.catch((err) => {
				console.error(err);
				setError('載入分類失敗');
			})
			.finally(() => setLoading(false));
	}, [categoryId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!name || !slug) {
			setError('請填寫分類名稱與 Slug');
			return;
		}

		setSubmitting(true);
		try {
			const formattedCarousel = carouselImages
				? JSON.stringify(
						carouselImages
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean)
					)
				: undefined;

			await updateCategory(categoryId, {
				name,
				slug: slugifyAscii(slug, 'category'),
				description: description || undefined,
				image: image || undefined,
				coverImage: coverImage || undefined,
				carouselImages: formattedCarousel,
				sortOrder,
				isActive,
				parentId: parentId === '' ? null : parentId,
			});
			alert('分類已更新！');
			router.push('/admin/categories');
		} catch (err: unknown) {
			setError(getErrorMessage(err, '更新失敗'));
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('確定要刪除此分類嗎？這可能會影響關聯的產品。')) return;

		try {
			await deleteCategoryApi(categoryId);
			alert('分類已刪除');
			router.push('/admin/categories');
		} catch (err: unknown) {
			alert(`刪除失敗：${getErrorMessage(err, '未知錯誤')}`);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='max-w-2xl'>
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-3'>
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
					<h1 className='text-2xl font-bold text-text'>編輯分類</h1>
				</div>
				<button
					onClick={handleDelete}
					className='px-4 py-2 text-sm font-medium text-error hover:bg-error/10 border border-error/20 rounded-lg transition-colors duration-200 cursor-pointer'
				>
					刪除分類
				</button>
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
								onChange={(e) => setName(e.target.value)}
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
							{submitting ? '更新中...' : '儲存變更'}
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
