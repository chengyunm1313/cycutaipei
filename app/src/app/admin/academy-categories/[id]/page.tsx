'use client';

export const runtime = 'edge';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import ImageSelectInput from '@/components/ImageSelectInput';
import {
	deleteAcademyCategoryApi,
	fetchAcademyCategory,
	updateAcademyCategory,
} from '@/lib/api';
import { slugifyAscii } from '@/lib/slug';

export default function EditAcademyCategoryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const { id } = use(params);
	const categoryId = Number(id);

	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState('');
	const [sortOrder, setSortOrder] = useState<number>(0);
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (Number.isNaN(categoryId)) {
			setError('無效的分類 ID');
			setLoading(false);
			return;
		}

		fetchAcademyCategory(categoryId)
			.then((category) => {
				setName(category.name);
				setSlug(slugifyAscii(category.slug, 'academy-category'));
				setDescription(category.description || '');
				setImage(category.image || '');
				setSortOrder(category.sortOrder ?? 0);
				setIsActive(!!category.isActive);
			})
			.catch((err) => {
				console.error(err);
				setError('載入分類失敗');
			})
			.finally(() => setLoading(false));
	}, [categoryId]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError('');

		if (!name || !slug) {
			setError('請填寫分類名稱與 Slug');
			return;
		}

		setSubmitting(true);
		try {
			await updateAcademyCategory(categoryId, {
				name,
				slug: slugifyAscii(slug, 'academy-category'),
				description: description || undefined,
				image: image || undefined,
				sortOrder,
				isActive,
			});
			alert('分類已更新！');
			router.push('/admin/academy-categories');
		} catch (err) {
			setError(err instanceof Error ? err.message : '更新失敗');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('確定要刪除此分類嗎？這可能會影響關聯課程。')) return;
		try {
			await deleteAcademyCategoryApi(categoryId);
			alert('分類已刪除');
			router.push('/admin/academy-categories');
		} catch (err) {
			alert(err instanceof Error ? err.message : '刪除失敗');
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
						href='/admin/academy-categories'
						className='p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
					>
						返回
					</AppLink>
					<h1 className='text-2xl font-bold text-text'>編輯校友學院分類</h1>
				</div>
				<button
					onClick={() => void handleDelete()}
					className='px-4 py-2 text-sm font-medium text-error hover:bg-error/10 border border-error/20 rounded-lg transition-colors duration-200 cursor-pointer'
				>
					刪除分類
				</button>
			</div>

			<div className='bg-card rounded-xl border border-border p-6'>
				<form onSubmit={handleSubmit} className='space-y-5'>
					{error ? (
						<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
					) : null}

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='name' className='block text-sm font-medium text-text mb-1.5'>
								分類名稱 <span className='text-error'>*</span>
							</label>
							<input
								id='name'
								type='text'
								value={name}
								onChange={(event) => setName(event.target.value)}
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
								onChange={(event) => setSlug(slugifyAscii(event.target.value, 'academy-category'))}
								required
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
							/>
							<p className='text-xs text-text-light mt-1'>輸入中文也會自動轉成安全網址格式</p>
						</div>
					</div>

					<div>
						<label htmlFor='description' className='block text-sm font-medium text-text mb-1.5'>
							描述
						</label>
						<textarea
							id='description'
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							rows={3}
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
						/>
					</div>

					<ImageSelectInput label='分類縮圖' value={image} onChange={setImage} />

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label htmlFor='sortOrder' className='block text-sm font-medium text-text mb-1.5'>
								排序
							</label>
							<input
								id='sortOrder'
								type='number'
								value={sortOrder}
								onChange={(event) => setSortOrder(Number(event.target.value))}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<label className='flex items-center gap-2 pt-8'>
							<input
								type='checkbox'
								checked={isActive}
								onChange={(event) => setIsActive(event.target.checked)}
								className='w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20'
							/>
							<span className='text-sm text-text'>啟用此分類</span>
						</label>
					</div>

					<div className='flex gap-3 pt-2'>
						<button
							type='submit'
							disabled={submitting}
							className='px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50'
						>
							{submitting ? '儲存中...' : '儲存變更'}
						</button>
						<AppLink
							href='/admin/academy-categories'
							className='px-5 py-2.5 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors duration-200 cursor-pointer'
						>
							返回列表
						</AppLink>
					</div>
				</form>
			</div>
		</div>
	);
}
