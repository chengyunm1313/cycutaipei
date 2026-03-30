'use client';

export const runtime = 'edge';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import dynamic from 'next/dynamic';
import AppLink from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import { fetchArticle, fetchArticleCategories, updateArticle } from '@/lib/api';
import ImageSelectInput from '@/components/ImageSelectInput';
import { useToast } from '@/components/ToastProvider';
import type { ApiArticleCategory } from '@/data/types';

// BlockNote 必須以 dynamic import 載入（不支援 SSR）
const BlockNoteEditor = dynamic<{
	onChange: (html: string) => void;
	onStatsChange?: (stats: { chars: number; words: number; readTime: number }) => void;
	placeholder?: string;
	initialHTML?: string;
}>(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
	loading: () => (
		<div className='h-[500px] bg-surface rounded-lg animate-pulse flex items-center justify-center'>
			<p className='text-text-light text-sm'>編輯器載入中...</p>
		</div>
	),
});

/**
 * 後台 - 編輯文章頁面
 * 從 D1 載入既有資料，修改後儲存
 */
export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const articleId = Number(id);
	const router = useRouter();
	const { showToast } = useToast();

	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [category, setCategory] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [seoTitle, setSeoTitle] = useState('');
	const [seoDescription, setSeoDescription] = useState('');
	const [editorContent, setEditorContent] = useState('');
	const [initialEditorHtml, setInitialEditorHtml] = useState('');
	const [author, setAuthor] = useState('');
	const [stats, setStats] = useState({ chars: 0, words: 0, readTime: 1 });
	const [showSeoPanel, setShowSeoPanel] = useState(false);
	const [articleCategoryList, setArticleCategoryList] = useState<ApiArticleCategory[]>([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// 載入文章資料
	useEffect(() => {
		if (isNaN(articleId)) {
			setError('無效的文章 ID');
			setLoading(false);
			return;
		}

		fetchArticle(articleId)
			.then((article) => {
				setTitle(article.title);
				setSlug(article.slug);
				setExcerpt(article.excerpt || '');
				setCategory(article.category || '');
				setCoverImage(article.coverImage || '');
				setSeoTitle(article.seoTitle || '');
				setSeoDescription(article.seoDescription || '');
				setEditorContent(article.content || '');
				setInitialEditorHtml(article.content || '');
				setAuthor(article.author || '');
			})
			.catch((err) => {
				setError(err instanceof Error ? err.message : '載入文章失敗');
			})
			.finally(() => setLoading(false));
	}, [articleId]);

	useEffect(() => {
		fetchArticleCategories(true).then(setArticleCategoryList).catch(console.error);
	}, []);

	// 自動儲存邏輯
	const triggerAutoSave = useCallback(() => {
		if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
		autoSaveTimer.current = setTimeout(() => {
			// 自動儲存至 localStorage
			const draftKey = `article_edit_${articleId}`;
			localStorage.setItem(
				draftKey,
				JSON.stringify({
					title,
					slug,
					excerpt,
					category,
					coverImage,
					seoTitle,
					seoDescription,
					editorContent,
				})
			);
		}, 2000);
	}, [
		articleId,
		title,
		slug,
		excerpt,
		category,
		coverImage,
		seoTitle,
		seoDescription,
		editorContent,
	]);

	useEffect(() => {
		if (!loading) triggerAutoSave();
		return () => {
			if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
		};
	}, [triggerAutoSave, loading]);

	const handleSave = async (status: 'published' | 'draft') => {
		if (!title.trim()) {
			showToast('請輸入文章標題', 'error');
			return;
		}

		setSaving(true);
		try {
			await updateArticle(articleId, {
				title,
				slug,
				excerpt,
				category,
				coverImage,
				content: editorContent,
				author,
				seoTitle,
				seoDescription,
				status,
			});
			// 清除自動儲存
			localStorage.removeItem(`article_edit_${articleId}`);
			showToast(`文章已${status === 'published' ? '發佈' : '儲存為草稿'}！`, 'success');
			// router.push('/admin/articles'); // 移除自動跳轉
			router.refresh(); // 重新整理資料，確保狀態同步
		} catch (err) {
			showToast(err instanceof Error ? err.message : '儲存失敗', 'error');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='max-w-2xl mx-auto py-20 text-center'>
				<p className='text-error mb-4'>{error}</p>
				<AppLink href='/admin/articles/content' className='text-primary hover:underline'>
					返回文章列表
				</AppLink>
			</div>
		);
	}

	return (
		<div className='max-w-[1400px] mx-auto'>
			{/* 頂部工具列 */}
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-3'>
					<AppLink
						href='/admin/articles/content'
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
					<h1 className='text-xl font-bold text-text'>編輯文章</h1>
				</div>
				<div className='flex items-center gap-3'>
					{/* 字數統計 */}
					<div className='hidden sm:flex items-center gap-3 text-xs text-text-light mr-2'>
						<span>{stats.chars} 字</span>
						<span>{stats.words} 詞</span>
						<span>≈ {stats.readTime} 分鐘</span>
					</div>
					<button
						onClick={() => handleSave('draft')}
						disabled={saving}
						className='px-4 py-2 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors duration-200 cursor-pointer disabled:opacity-50'
					>
						儲存草稿
					</button>
					<button
						onClick={() => handleSave('published')}
						disabled={saving}
						className='px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50'
					>
						{saving ? '儲存中...' : '發佈'}
					</button>
				</div>
			</div>

			{/* 主要內容區 */}
			<div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
				{/* 左側：主編輯區 */}
				<div className='space-y-4'>
					{/* 標題 */}
					<input
						type='text'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='文章標題'
						className='w-full text-2xl font-bold px-1 py-2 bg-transparent border-none outline-none text-text placeholder:text-text-light/40'
					/>

					{/* Slug */}
					<div className='flex items-center gap-2 text-sm'>
						<span className='text-text-light'>/blog/</span>
						<input
							type='text'
							value={slug}
							onChange={(e) => setSlug(e.target.value)}
							className='flex-1 px-2 py-1 bg-surface rounded border border-border text-text-muted font-mono text-sm outline-none focus:border-primary'
						/>
					</div>

					{/* 編輯器 */}
					<div className='bg-card rounded-xl border border-border min-h-[500px]'>
						<BlockNoteEditor
							onChange={setEditorContent}
							onStatsChange={setStats}
							placeholder='開始撰寫文章內容...'
							initialHTML={initialEditorHtml}
						/>
					</div>
				</div>

				{/* 右側：設定面板 */}
				<div className='space-y-4'>
					{/* 摘要 */}
					<div className='bg-card rounded-xl border border-border p-4'>
						<label className='block text-sm font-medium text-text mb-2'>摘要</label>
						<textarea
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder='簡短描述文章內容...'
							rows={3}
							className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border outline-none focus:border-primary resize-none'
						/>
					</div>

					{/* 分類 */}
					<div className='bg-card rounded-xl border border-border p-4'>
						<label className='block text-sm font-medium text-text mb-2'>分類</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border outline-none focus:border-primary cursor-pointer'
						>
							<option value=''>選擇分類</option>
							{articleCategoryList.map((cat) => (
								<option key={cat.id} value={cat.name}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					{/* 封面圖 */}
					<div className='bg-card rounded-xl border border-border p-4'>
						<ImageSelectInput
							label='封面圖'
							value={coverImage}
							onChange={(url: string) => setCoverImage(url)}
						/>
					</div>

					{/* 作者 */}
					<div className='bg-card rounded-xl border border-border p-4'>
						<label className='block text-sm font-medium text-text mb-2'>作者</label>
						<input
							type='text'
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							placeholder='作者名稱'
							className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border outline-none focus:border-primary'
						/>
					</div>

					{/* SEO 設定 */}
					<div className='bg-card rounded-xl border border-border p-4'>
						<button
							type='button'
							onClick={() => setShowSeoPanel(!showSeoPanel)}
							className='flex items-center justify-between w-full text-sm font-medium text-text cursor-pointer'
						>
							SEO 設定
							<svg
								className={`w-4 h-4 transition-transform duration-200 ${showSeoPanel ? 'rotate-180' : ''}`}
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
						{showSeoPanel && (
							<div className='mt-3 space-y-3'>
								<div>
									<label className='block text-xs text-text-muted mb-1'>SEO 標題</label>
									<input
										type='text'
										value={seoTitle}
										onChange={(e) => setSeoTitle(e.target.value)}
										placeholder='SEO 標題'
										className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border outline-none focus:border-primary'
									/>
								</div>
								<div>
									<label className='block text-xs text-text-muted mb-1'>SEO 描述</label>
									<textarea
										value={seoDescription}
										onChange={(e) => setSeoDescription(e.target.value)}
										placeholder='SEO 描述'
										rows={2}
										className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border outline-none focus:border-primary resize-none'
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
