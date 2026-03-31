'use client';

export const runtime = 'edge';

import { use, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import ImageSelectInput from '@/components/ImageSelectInput';
import CoverImagePositionControl from '@/components/CoverImagePositionControl';
import EditorPublishToolbar from '@/components/admin/EditorPublishToolbar';
import type { ApiAcademyCategory } from '@/data/types';
import {
	deleteAcademyCourseApi,
	fetchAcademyCategories,
	fetchAcademyCourse,
	updateAcademyCourse,
} from '@/lib/api';
import { normalizeOptionalHttpUrl } from '@/lib/optionalUrl';
import { normalizeYouTubeUrl } from '@/lib/youtube';
import { DEFAULT_COVER_IMAGE_POSITION_Y } from '@/lib/coverImagePosition';
import { slugifyAscii } from '@/lib/slug';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

export default function EditAcademyCoursePage({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const { id } = use(params);
	const courseId = Number(id);

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
	const [categories, setCategories] = useState<ApiAcademyCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [submittingAction, setSubmittingAction] = useState<'published' | 'draft' | null>(null);

	useEffect(() => {
		if (Number.isNaN(courseId)) {
			setError('無效的課程 ID');
			setLoading(false);
			return;
		}

		Promise.all([fetchAcademyCourse(courseId), fetchAcademyCategories()])
			.then(([course, categoryList]) => {
				setTitle(course.title);
				setSlug(slugifyAscii(course.slug, 'academy-course'));
				setExcerpt(course.excerpt || '');
				setContent(course.content || '');
				setCategoryId(course.categoryId ?? '');
				setYoutubeUrl(course.youtubeUrl || '');
				setCoverImage(course.coverImage || '');
				setCoverImagePositionY(course.coverImagePositionY ?? DEFAULT_COVER_IMAGE_POSITION_Y);
				setSpeaker(course.speaker || '');
				setResourceLink(course.resourceLink || '');
				setStatus(course.status as 'published' | 'draft');
				setIsFeatured(!!course.isFeatured);
				setSortOrder(course.sortOrder ?? 0);
				setPostDate(course.postDate || '');
				setCategories(categoryList);
			})
			.catch((err) => {
				console.error(err);
				setError('載入課程失敗');
			})
			.finally(() => setLoading(false));
	}, [courseId]);

	const handleSave = async (nextStatus: 'published' | 'draft') => {
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
		setSubmittingAction(nextStatus);
		try {
			await updateAcademyCourse(courseId, {
				title,
				slug: slugifyAscii(slug, 'academy-course'),
				excerpt: excerpt || null,
				content: content || null,
				categoryId: categoryId === '' ? null : categoryId,
				youtubeUrl: normalizedYoutubeUrl,
				coverImage: coverImage || null,
				coverImagePositionY,
				speaker: speaker || null,
				resourceLink: normalizedResourceLink,
				status: nextStatus,
				isFeatured,
				sortOrder,
				postDate: postDate || null,
			});
			setStatus(nextStatus);
			alert(`課程已${nextStatus === 'published' ? '發布' : '儲存為草稿'}！`);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : '更新失敗');
		} finally {
			setSubmitting(false);
			setSubmittingAction(null);
		}
	};

	const handleDelete = async () => {
		if (!confirm('確定要刪除此課程嗎？此動作無法復原。')) return;
		try {
			await deleteAcademyCourseApi(courseId);
			alert('課程已刪除');
			router.push('/admin/academy');
			router.refresh();
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
			<EditorPublishToolbar
				backHref='/admin/academy'
				title='編輯課程'
				status={status}
				onSaveDraft={() => void handleSave('draft')}
				onPublish={() => void handleSave('published')}
				isSubmitting={submitting}
				submittingAction={submittingAction}
				meta='狀態顯示集中在上方，避免編輯完內容卻忘記切成已發布。'
				extraActions={
					<button
						type='button'
						onClick={() => void handleDelete()}
						className='inline-flex min-h-11 items-center justify-center rounded-xl border border-error/20 px-5 py-2.5 text-sm font-medium text-error transition-colors duration-200 hover:bg-error/10'
					>
						刪除課程
					</button>
				}
			/>

			<div className='bg-card rounded-xl border border-border p-6'>
				<form onSubmit={(event) => event.preventDefault()} className='space-y-5'>
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
							onChange={(event) => setTitle(event.target.value)}
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
							onChange={(event) => setSlug(slugifyAscii(event.target.value, 'academy-course'))}
							required
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 font-mono'
						/>
						<p className='mt-1 text-xs text-text-light'>
							課程網址會自動限制為英數與連字號，避免前台課程頁 404。
						</p>
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
							className='w-full px-4 py-2.5 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-text mb-1.5'>課程內容</label>
						<BlockNoteEditor initialHTML={content} onChange={setContent} />
					</div>

					<div className='grid grid-cols-2 gap-4'>
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
				</form>
			</div>
		</div>
	);
}
