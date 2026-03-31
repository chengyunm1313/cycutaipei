'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import ImageSelectInput from '@/components/ImageSelectInput';
import CoverImagePositionControl from '@/components/CoverImagePositionControl';
import type { ApiAcademyCategory } from '@/data/types';
import { createAcademyCourse, fetchAcademyCategories } from '@/lib/api';
import { normalizeOptionalHttpUrl } from '@/lib/optionalUrl';
import { normalizeYouTubeUrl } from '@/lib/youtube';
import { DEFAULT_COVER_IMAGE_POSITION_Y } from '@/lib/coverImagePosition';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

export default function NewAcademyCoursePage() {
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [content, setContent] = useState('');
	const [categoryId, setCategoryId] = useState<number | ''>('');
	const [youtubeUrl, setYoutubeUrl] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [coverImagePositionY, setCoverImagePositionY] = useState(DEFAULT_COVER_IMAGE_POSITION_Y);
	const [speaker, setSpeaker] = useState('');
	const [resourceLink, setResourceLink] = useState('');
	const [status, setStatus] = useState<'published' | 'draft'>('draft');
	const [isFeatured, setIsFeatured] = useState(false);
	const [sortOrder, setSortOrder] = useState<number>(0);
	const [postDate, setPostDate] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [categories, setCategories] = useState<ApiAcademyCategory[]>([]);

	useEffect(() => {
		fetchAcademyCategories().then(setCategories).catch(console.error);
	}, []);

	const generateSlug = (text: string) =>
		text
			.toLowerCase()
			.replace(/[^\w\u4e00-\u9fff\s-]/g, '')
			.replace(/[\s_]+/g, '-')
			.replace(/-+/g, '-')
			.trim();

	const handleTitleChange = (value: string) => {
		setTitle(value);
		if (!slug || slug === generateSlug(title)) {
			setSlug(generateSlug(value));
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError('');

		if (!title || !slug) {
			setError('請填寫課程標題與 Slug');
			return;
		}

		const normalizedYoutubeUrl = youtubeUrl ? normalizeYouTubeUrl(youtubeUrl) : null;
		if (youtubeUrl.trim() && !normalizedYoutubeUrl) {
			setError('YouTube 連結格式不正確，請輸入完整的 YouTube 網址');
			return;
		}

		const normalizedResourceLink = resourceLink
			? normalizeOptionalHttpUrl(resourceLink)
			: null;
		if (resourceLink.trim() && !normalizedResourceLink) {
			setError('課程資料連結格式不正確，請輸入完整網址或站內路徑');
			return;
		}

		setSubmitting(true);
		try {
			const course = await createAcademyCourse({
				title,
				slug,
				excerpt: excerpt || null,
				content: content || null,
				categoryId: categoryId === '' ? null : categoryId,
				youtubeUrl: normalizedYoutubeUrl,
				coverImage: coverImage || null,
				coverImagePositionY,
				speaker: speaker || null,
				resourceLink: normalizedResourceLink,
				status,
				isFeatured,
				sortOrder,
				postDate: postDate || null,
			});
			alert('課程已新增！');
			router.push(`/admin/academy/${course.id}`);
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
					href='/admin/academy'
					className='p-2 rounded-lg hover:bg-surface transition-colors duration-200 cursor-pointer'
				>
					返回
				</AppLink>
				<h1 className='text-2xl font-bold text-text'>新增課程</h1>
			</div>

			<div className='bg-card rounded-xl border border-border p-6'>
				<form onSubmit={handleSubmit} className='space-y-5'>
					{error ? (
						<div className='bg-error/10 text-error text-sm px-4 py-2.5 rounded-lg'>{error}</div>
					) : null}

					<div>
						<label htmlFor='title' className='block text-sm font-medium text-text mb-1.5'>
							課程標題 <span className='text-error'>*</span>
						</label>
						<input
							id='title'
							type='text'
							value={title}
							onChange={(event) => handleTitleChange(event.target.value)}
							placeholder='例：AI 工具入門講堂'
							required
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
					</div>

					<div>
						<label htmlFor='slug' className='block text-sm font-medium text-text mb-1.5'>
							Slug <span className='text-error'>*</span>
						</label>
						<input
							id='slug'
							type='text'
							value={slug}
							onChange={(event) => setSlug(event.target.value)}
							required
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
						/>
					</div>

					<div>
						<label htmlFor='excerpt' className='block text-sm font-medium text-text mb-1.5'>
							課程摘要
						</label>
						<textarea
							id='excerpt'
							value={excerpt}
							onChange={(event) => setExcerpt(event.target.value)}
							rows={4}
							placeholder='簡要說明課程亮點、適合對象與收穫...'
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='categoryId' className='block text-sm font-medium text-text mb-1.5'>
								課程分類
							</label>
							<select
								id='categoryId'
								value={categoryId}
								onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : '')}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
							>
								<option value=''>未分類</option>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</div>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='postDate' className='block text-sm font-medium text-text mb-1.5'>
								發布日期
							</label>
							<input
								id='postDate'
								type='date'
								value={postDate}
								onChange={(event) => setPostDate(event.target.value)}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='speaker' className='block text-sm font-medium text-text mb-1.5'>
								講師／主講
							</label>
							<input
								id='speaker'
								type='text'
								value={speaker}
								onChange={(event) => setSpeaker(event.target.value)}
								placeholder='例：洪海蓮 理事長'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
						<div>
							<label htmlFor='youtubeUrl' className='block text-sm font-medium text-text mb-1.5'>
								YouTube 連結
							</label>
							<input
								id='youtubeUrl'
								type='url'
								value={youtubeUrl}
								onChange={(event) => setYoutubeUrl(event.target.value)}
								placeholder='https://www.youtube.com/watch?v=...'
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>
					</div>

					<ImageSelectInput label='課程封面圖' value={coverImage} onChange={setCoverImage} />
					<CoverImagePositionControl
						value={coverImagePositionY}
						onChange={setCoverImagePositionY}
						previewUrl={coverImage}
					/>

					<div>
						<label htmlFor='resourceLink' className='block text-sm font-medium text-text mb-1.5'>
							課程資料連結
						</label>
						<input
							id='resourceLink'
							type='text'
							value={resourceLink}
							onChange={(event) => setResourceLink(event.target.value)}
							placeholder='https://... 或 /files/academy.pdf'
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-text mb-1.5'>課程內容</label>
						<BlockNoteEditor initialHTML={content} onChange={setContent} />
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='col-span-2 sm:col-span-1'>
							<label htmlFor='status' className='block text-sm font-medium text-text mb-1.5'>
								狀態
							</label>
							<select
								id='status'
								value={status}
								onChange={(event) => setStatus(event.target.value as 'published' | 'draft')}
								className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
							>
								<option value='draft'>草稿</option>
								<option value='published'>已發布</option>
							</select>
						</div>
						<div className='col-span-2 sm:col-span-1'>
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
					</div>

					<label className='flex items-center gap-2'>
						<input
							type='checkbox'
							checked={isFeatured}
							onChange={(event) => setIsFeatured(event.target.checked)}
							className='w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/20'
						/>
						<span className='text-sm text-text'>設為精選課程</span>
					</label>

					<div className='flex gap-3 pt-2'>
						<button
							type='submit'
							disabled={submitting}
							className='px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50'
						>
							{submitting ? '新增中...' : '新增課程'}
						</button>
						<AppLink
							href='/admin/academy'
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
