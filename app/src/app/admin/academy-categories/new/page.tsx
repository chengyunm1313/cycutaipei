'use client';

export const runtime = 'edge';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import ImageSelectInput from '@/components/ImageSelectInput';
import { createAcademyCategory } from '@/lib/api';
import { slugifyAscii } from '@/lib/slug';

export default function NewAcademyCategoryPage() {
	const router = useRouter();
	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');
	const [description, setDescription] = useState('');
	const [image, setImage] = useState('');
	const [sortOrder, setSortOrder] = useState<number>(0);
	const [isActive, setIsActive] = useState(true);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleNameChange = (value: string) => {
		setName(value);
		if (!slug || slug === slugifyAscii(name, 'academy-category')) {
			setSlug(slugifyAscii(value, 'academy-category'));
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError('');

		if (!name || !slug) {
			setError('請填寫分類名稱與 Slug');
			return;
		}

		setSubmitting(true);
		try {
			await createAcademyCategory({
				name,
				slug: slugifyAscii(slug, 'academy-category'),
				description: description || undefined,
				image: image || undefined,
				sortOrder,
				isActive,
			});
			alert('分類已新增！');
			router.push('/admin/academy-categories');
		} catch (err) {
			setError(err instanceof Error ? err.message : '新增失敗');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='max-w-2xl'>
			<div className='flex items-center gap-3 mb-6'>
				<AppLink
					href='/admin/academy-categories'
					className='p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
				>
					返回
				</AppLink>
				<h1 className='text-2xl font-bold text-text'>新增校友學院分類</h1>
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
								onChange={(event) => handleNameChange(event.target.value)}
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
							{submitting ? '新增中...' : '新增分類'}
						</button>
						<AppLink
							href='/admin/academy-categories'
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
