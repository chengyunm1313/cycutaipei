'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import AppLink from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import ImageSelectInput from '@/components/ImageSelectInput';
import { fetchArticleCategories } from '@/lib/api';
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

const DRAFT_KEY = 'article_draft_autosave';

/**
 * 後台 - 新增最新消息頁面
 * 沉浸式寫作介面，左側主編輯區 + 右側設定面板
 */
export default function NewArticlePage() {
	const router = useRouter();
	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [category, setCategory] = useState('');
	const [coverImage, setCoverImage] = useState('');
	const [seoTitle, setSeoTitle] = useState('');
	const [seoDescription, setSeoDescription] = useState('');
	const [postDate, setPostDate] = useState('');
	const [editorContent, setEditorContent] = useState('');
	const [initialEditorHtml, setInitialEditorHtml] = useState('');
	const [stats, setStats] = useState({ chars: 0, words: 0, readTime: 1 });
	const [lastSaved, setLastSaved] = useState<string | null>(null);
	const [showSeoPanel, setShowSeoPanel] = useState(false);
	const [coverPreviewError, setCoverPreviewError] = useState(false);
	const [articleCategoryList, setArticleCategoryList] = useState<ApiArticleCategory[]>([]);
	const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// 從 localStorage 恢復草稿
	useEffect(() => {
		const saved = localStorage.getItem(DRAFT_KEY);
		if (saved) {
			try {
				const data = JSON.parse(saved);
				if (data.title) setTitle(data.title);
				if (data.slug) setSlug(data.slug);
				if (data.excerpt) setExcerpt(data.excerpt);
				if (data.category) setCategory(data.category);
				if (data.coverImage) setCoverImage(data.coverImage);
				if (data.seoTitle) setSeoTitle(data.seoTitle);
				if (data.seoDescription) setSeoDescription(data.seoDescription);
				if (data.postDate) setPostDate(data.postDate);
				if (data.editorContent) {
					setEditorContent(data.editorContent);
					setInitialEditorHtml(data.editorContent);
				}
				if (data.lastSaved) setLastSaved(data.lastSaved);
			} catch {
				// 忽略解析錯誤
			}
		}
	}, []);

	useEffect(() => {
		fetchArticleCategories(true).then(setArticleCategoryList).catch(console.error);
	}, []);

	// 自動儲存（debounce 2 秒）
	const autoSave = useCallback(() => {
		if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
		autoSaveTimer.current = setTimeout(() => {
			const data = {
				title,
				slug,
				excerpt,
				category,
				coverImage,
				seoTitle,
				seoDescription,
				postDate,
				editorContent,
				lastSaved: new Date().toISOString(),
			};
			localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
			setLastSaved(data.lastSaved);
		}, 2000);
	}, [title, slug, excerpt, category, coverImage, seoTitle, seoDescription, postDate, editorContent]);

	// 每次表單變動觸發 autoSave
	useEffect(() => {
		if (title || editorContent) {
			autoSave();
		}
	}, [
		title,
		slug,
		excerpt,
		category,
		coverImage,
		seoTitle,
		seoDescription,
		editorContent,
		autoSave,
	]);

	const handleTitleChange = (value: string) => {
		setTitle(value);
		const autoSlug = value
			.toLowerCase()
			.replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
			.replace(/^-|-$/g, '');
		setSlug(autoSlug);
		if (!seoTitle) setSeoTitle(`${value} | 中原大學台北市校友會`);
	};

	const handleSave = async (status: 'published' | 'draft') => {
		if (!title.trim()) {
			alert('請輸入最新消息標題');
			return;
		}
		const articleData = {
			title,
			slug,
			excerpt,
			category,
			coverImage,
			content: editorContent,
			seoTitle,
			seoDescription,
			postDate: postDate || null,
			status,
		};
		try {
			const { createArticle } = await import('@/lib/api');
			const newArticle = await createArticle(articleData);
			// 清除自動儲存
			localStorage.removeItem(DRAFT_KEY);
			alert(`最新消息已${status === 'published' ? '發佈' : '儲存為草稿'}！`);
			router.push(`/admin/articles/${newArticle.id}`);
		} catch (err) {
			console.error('儲存最新消息失敗：', err);
			alert('儲存失敗，請稍後再試');
		}
	};

	const clearDraft = () => {
		if (confirm('確定要清除自動儲存的草稿嗎？')) {
			localStorage.removeItem(DRAFT_KEY);
			setTitle('');
			setSlug('');
			setExcerpt('');
			setCategory('');
			setCoverImage('');
			setSeoTitle('');
			setSeoDescription('');
			setEditorContent('');
			setInitialEditorHtml('');
			setLastSaved(null);
		}
	};

	return (
		<div className='flex flex-col h-[calc(100vh-4rem)]'>
			{/* 頂部工具列 */}
			<div className='flex items-center justify-between px-1 py-3 border-b border-border flex-shrink-0'>
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
					<h1 className='text-lg font-bold text-text'>新增最新消息</h1>
					{lastSaved && (
						<span className='text-xs text-text-light flex items-center gap-1'>
							<svg
								className='w-3 h-3'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
							已自動儲存 {new Date(lastSaved).toLocaleTimeString('zh-TW')}
						</span>
					)}
				</div>
				<div className='flex items-center gap-2'>
					{/* 統計 */}
					<div className='hidden sm:flex items-center gap-3 px-3 py-1.5 text-xs text-text-light border-r border-border mr-1'>
						<span>{stats.chars.toLocaleString()} 字</span>
						<span>·</span>
						<span>約 {stats.readTime} 分鐘閱讀</span>
					</div>
					<button
						onClick={clearDraft}
						className='px-3 py-2 text-sm font-medium text-text-light hover:text-text bg-transparent hover:bg-surface rounded-lg transition-colors duration-200 cursor-pointer'
						title='清除草稿'
					>
						清除
					</button>
					<button
						onClick={() => handleSave('draft')}
						className='px-4 py-2 text-sm font-medium text-text-muted bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors duration-200 cursor-pointer'
					>
						儲存草稿
					</button>
					<button
						onClick={() => handleSave('published')}
						className='px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer'
					>
						發佈最新消息
					</button>
				</div>
			</div>

			{/* 主體：左側編輯 + 右側設定 */}
			<div className='flex flex-1 overflow-hidden'>
				{/* 左側 - 主編輯區 */}
				<div className='flex-1 overflow-y-auto'>
					<div className='max-w-3xl mx-auto py-8 px-4'>
						{/* 標題輸入 - 無邊框大標題風格 */}
						<input
							type='text'
							value={title}
							onChange={(e) => handleTitleChange(e.target.value)}
							placeholder='輸入最新消息標題...'
							className='w-full text-3xl font-bold text-text bg-transparent outline-none border-none placeholder:text-text-light/40 mb-2'
						/>
						{slug && <p className='text-xs text-text-light font-mono mb-6'>/blog/{slug}</p>}

						{/* 封面圖預覽 */}
						{coverImage && !coverPreviewError && (
							<div className='relative w-full h-56 rounded-xl overflow-hidden mb-6 bg-surface'>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={coverImage}
									alt='封面預覽'
									className='w-full h-full object-cover'
									onError={() => setCoverPreviewError(true)}
								/>
								<button
									onClick={() => {
										setCoverImage('');
										setCoverPreviewError(false);
									}}
									className='absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors cursor-pointer'
								>
									<svg
										className='w-4 h-4'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={2}
										stroke='currentColor'
									>
										<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
									</svg>
								</button>
							</div>
						)}

						{/* 摘要 - 無邊框 */}
						<textarea
							value={excerpt}
							onChange={(e) => setExcerpt(e.target.value)}
							placeholder='撰寫一段簡短摘要，讓讀者快速了解文章內容...'
							rows={2}
							className='w-full text-base text-text-muted bg-transparent outline-none border-none resize-none placeholder:text-text-light/40 mb-8 leading-relaxed'
						/>

						{/* 分隔線 */}
						<div className='h-px bg-border mb-6' />

						{/* BlockNote 編輯器 */}
						<div className='bg-white rounded-xl border border-border overflow-hidden shadow-sm'>
							<BlockNoteEditor
								onChange={setEditorContent}
								onStatsChange={setStats}
								placeholder='開始撰寫你的文章內容...'
								initialHTML={initialEditorHtml}
							/>
						</div>
					</div>
				</div>

				{/* 右側 - 設定面板 */}
				<div className='hidden lg:block w-72 border-l border-border bg-card overflow-y-auto flex-shrink-0'>
					<div className='p-4 space-y-5'>
						{/* 分類 */}
						<div>
							<label className='block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2'>
								分類
							</label>
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 cursor-pointer'
							>
								<option value=''>選擇分類</option>
								{articleCategoryList.map((cat) => (
									<option key={cat.id} value={cat.name}>
										{cat.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2'>
								原始發文日期
							</label>
							<input
								type='date'
								value={postDate}
								onChange={(e) => setPostDate(e.target.value)}
								className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						{/* Slug */}
						<div>
							<label className='block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2'>
								Slug
							</label>
							<input
								type='text'
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder='article-slug'
								className='w-full px-3 py-2 text-sm font-mono bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
							/>
						</div>

						{/* 封面圖片 */}
						<div>
							<ImageSelectInput
								label='封面圖片'
								value={coverImage}
								onChange={(url: string) => {
									setCoverImage(url);
									setCoverPreviewError(false);
								}}
							/>
						</div>

						{/* SEO 設定（可收合） */}
						<div className='border-t border-border pt-4'>
							<button
								onClick={() => setShowSeoPanel(!showSeoPanel)}
								className='flex items-center justify-between w-full text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer'
							>
								<span className='flex items-center gap-1.5'>
									<svg
										className='w-3.5 h-3.5'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={2}
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
										/>
									</svg>
									SEO 設定
								</span>
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
								<div className='space-y-3 mt-3'>
									<div>
										<label className='block text-xs font-medium text-text-light mb-1'>
											SEO 標題
										</label>
										<input
											type='text'
											value={seoTitle}
											onChange={(e) => setSeoTitle(e.target.value)}
											placeholder='搜尋引擎顯示的標題'
											className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200'
										/>
										<p className='text-[10px] text-text-light mt-1'>{seoTitle.length}/60 字元</p>
									</div>
									<div>
										<label className='block text-xs font-medium text-text-light mb-1'>
											SEO 描述
										</label>
										<textarea
											value={seoDescription}
											onChange={(e) => setSeoDescription(e.target.value)}
											placeholder='搜尋引擎顯示的描述文字'
											rows={3}
											className='w-full px-3 py-2 text-sm bg-surface rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none'
										/>
										<p className='text-[10px] text-text-light mt-1'>
											{seoDescription.length}/160 字元
										</p>
									</div>
									{/* Google 搜尋結果預覽 */}
									{(seoTitle || title) && (
										<div className='bg-surface rounded-lg p-3 border border-border'>
											<p className='text-[10px] text-text-light mb-1.5 uppercase tracking-widest'>
												Google 預覽
											</p>
											<p className='text-sm text-[#1a0dab] font-medium leading-snug truncate'>
												{seoTitle || title || '文章標題'}
											</p>
											<p className='text-xs text-[#006621] mt-0.5 truncate'>
												example.com/blog/{slug || 'article-slug'}
											</p>
											<p className='text-xs text-[#545454] mt-0.5 line-clamp-2 leading-relaxed'>
												{seoDescription || excerpt || '文章描述會顯示在這裡...'}
											</p>
										</div>
									)}
								</div>
							)}
						</div>

						{/* 寫作小提示 */}
						<div className='border-t border-border pt-4'>
							<p className='text-xs font-semibold text-text-muted uppercase tracking-wider mb-2'>
								寫作提示
							</p>
							<div className='space-y-2 text-xs text-text-light'>
								<div className='flex items-start gap-2'>
									<kbd className='px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono border border-border flex-shrink-0'>
										/
									</kbd>
									<span>插入區塊（標題、列表、圖片...）</span>
								</div>
								<div className='flex items-start gap-2'>
									<kbd className='px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono border border-border flex-shrink-0'>
										Ctrl+B
									</kbd>
									<span>粗體</span>
								</div>
								<div className='flex items-start gap-2'>
									<kbd className='px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono border border-border flex-shrink-0'>
										Ctrl+I
									</kbd>
									<span>斜體</span>
								</div>
								<div className='flex items-start gap-2'>
									<kbd className='px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono border border-border flex-shrink-0'>
										Ctrl+K
									</kbd>
									<span>插入連結</span>
								</div>
								<div className='flex items-start gap-2'>
									<kbd className='px-1.5 py-0.5 bg-surface rounded text-[10px] font-mono border border-border flex-shrink-0'>
										---
									</kbd>
									<span>分隔線</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
