'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPage, updatePage } from '@/lib/api';
import type { ApiPage, PageBlock, BlockType } from '@/data/types';
import dynamic from 'next/dynamic';
import ImageSelectInput from '@/components/ImageSelectInput';

const BlockNoteEditor = dynamic(() => import('@/components/BlockNoteEditorWrapper'), {
	ssr: false,
});

interface PageFormProps {
	initialData?: ApiPage;
}

export default function PageForm({ initialData }: PageFormProps) {
	const router = useRouter();
	const isEditing = !!initialData;

	const [title, setTitle] = useState(initialData?.title || '');
	const [slug, setSlug] = useState(initialData?.slug || '');
	const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
	const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
	const [blocks, setBlocks] = useState<PageBlock[]>(() => {
		if (initialData?.content_blocks) {
			try {
				return JSON.parse(initialData.content_blocks);
			} catch (e) {
				return [];
			}
		}
		return [];
	});

	// 使用 ref 儲存 text block 的即時 content，避免每次打字觸發 setBlocks 導致 TinyMCE 重新渲染
	const textBlockContentsRef = useRef<Record<string, string>>(
		(() => {
			const initial: Record<string, string> = {};
			if (initialData?.content_blocks) {
				try {
					const parsed: PageBlock[] = JSON.parse(initialData.content_blocks);
					for (const block of parsed) {
						if (block.type === 'text') {
							initial[block.id] = block.data.content || '';
						}
					}
				} catch {
					// 忽略解析錯誤
				}
			}
			return initial;
		})()
	);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleAddBlock = (type: BlockType) => {
		const newBlock: PageBlock = {
			id: Math.random().toString(36).substring(2, 9),
			type,
			data: {},
		};

		if (type === 'hero') {
			newBlock.data = {
				title: '新 Hero 區塊',
				subtitle: '',
				imageUrl: '',
				ctaText: '',
				ctaLink: '',
			};
		} else if (type === 'text') {
			newBlock.data = { content: '', align: 'left' };
			textBlockContentsRef.current[newBlock.id] = '';
		} else if (type === 'image') {
			newBlock.data = { url: '', alt: '' };
		} else if (type === 'carousel') {
			newBlock.data = { images: [''] };
		}

		setBlocks([...blocks, newBlock]);
	};

	const handleUpdateBlock = (id: string, newData: PageBlock['data']) => {
		setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: newData } : b)));
	};

	// text block 的 content 變更只更新 ref，不觸發重新渲染
	const handleTextContentChange = useCallback((blockId: string, html: string) => {
		textBlockContentsRef.current[blockId] = html;
	}, []);

	const handleRemoveBlock = (id: string) => {
		setBlocks(blocks.filter((b) => b.id !== id));
		// 清除對應的 text content ref
		delete textBlockContentsRef.current[id];
	};

	const moveBlock = (index: number, direction: 'up' | 'down') => {
		if (direction === 'up' && index > 0) {
			const newBlocks = [...blocks];
			[newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
			setBlocks(newBlocks);
		} else if (direction === 'down' && index < blocks.length - 1) {
			const newBlocks = [...blocks];
			[newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
			setBlocks(newBlocks);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title || !slug) {
			alert('請填寫標題與網址 Slug');
			return;
		}

		try {
			setIsSubmitting(true);
			// 送出前將 ref 中的 text content 合併回 blocks
			const mergedBlocks = blocks.map((b) => {
				if (b.type === 'text' && textBlockContentsRef.current[b.id] !== undefined) {
					return { ...b, data: { ...b.data, content: textBlockContentsRef.current[b.id] } };
				}
				return b;
			});
			const payload: Partial<ApiPage> = {
				title,
				slug,
				status: 'published', // 預設強制為 published
				seoTitle,
				seoDescription,
				content_blocks: JSON.stringify(mergedBlocks),
			};

			if (isEditing && initialData.id) {
				await updatePage(initialData.id, payload);
			} else {
				await createPage(payload);
			}

			router.push('/admin/pages');
			router.refresh();
		} catch (error) {
			console.error('Failed to save page:', error);
			alert('儲存失敗，請檢查網址 Slug 是否重複或稍後再試。');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='max-w-4xl mx-auto pb-24'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-3xl font-black text-text tracking-tight'>
					{isEditing ? '編輯頁面' : '新增頁面'}
				</h1>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						onClick={() => router.back()}
						className='px-4 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors'
					>
						取消
					</button>
					<button
						type='submit'
						disabled={isSubmitting}
						className='px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50'
					>
						{isSubmitting ? '儲存中...' : '儲存'}
					</button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2 space-y-6'>
					{/* 基本資料 */}
					<div className='bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4'>
						<h2 className='text-lg font-semibold text-text'>基本設定</h2>
						<div>
							<label className='block text-sm font-medium text-text mb-1'>標題 *</label>
							<input
								type='text'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className='w-full px-4 py-2 bg-surface rounded-lg border border-border focus:border-primary outline-none transition-colors'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-text mb-1'>網址 Slug *</label>
							<input
								type='text'
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								className='w-full px-4 py-2 bg-surface rounded-lg border border-border focus:border-primary outline-none transition-colors font-mono text-sm'
								required
								placeholder='例如：about-us'
							/>
						</div>
					</div>

					{/* 區塊編輯器 */}
					<div className='bg-white p-6 rounded-2xl border border-border shadow-sm'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-lg font-semibold text-text'>頁面內容區塊</h2>
							<div className='flex items-center gap-2'>
								<button
									type='button'
									onClick={() => handleAddBlock('hero')}
									className='px-3 py-1 text-xs bg-surface hover:bg-primary/10 hover:text-primary rounded text-text-muted transition-colors'
								>
									+ Hero 區塊
								</button>
								<button
									type='button'
									onClick={() => handleAddBlock('text')}
									className='px-3 py-1 text-xs bg-surface hover:bg-primary/10 hover:text-primary rounded text-text-muted transition-colors'
								>
									+ 內容文字
								</button>
								<button
									type='button'
									onClick={() => handleAddBlock('image')}
									className='px-3 py-1 text-xs bg-surface hover:bg-primary/10 hover:text-primary rounded text-text-muted transition-colors'
								>
									+ 單圖
								</button>
								<button
									type='button'
									onClick={() => handleAddBlock('carousel')}
									className='px-3 py-1 text-xs bg-surface hover:bg-primary/10 hover:text-primary rounded text-text-muted transition-colors'
								>
									+ 輪播
								</button>
							</div>
						</div>

						<div className='space-y-4'>
							{blocks.length === 0 && (
								<div className='p-8 text-center text-text-light border-2 border-dashed border-border rounded-xl'>
									目前沒有任何區塊，點擊上方按鈕新增
								</div>
							)}
							{blocks.map((block, index) => (
								<div
									key={block.id}
									className='border border-border rounded-xl p-4 bg-surface/30 relative group'
								>
									{/* 區塊操作列 */}
									<div className='absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
										<button
											type='button'
											onClick={() => moveBlock(index, 'up')}
											disabled={index === 0}
											className='p-1 text-text-light hover:text-primary disabled:opacity-30'
										>
											↑
										</button>
										<button
											type='button'
											onClick={() => moveBlock(index, 'down')}
											disabled={index === blocks.length - 1}
											className='p-1 text-text-light hover:text-primary disabled:opacity-30'
										>
											↓
										</button>
										<button
											type='button'
											onClick={() => handleRemoveBlock(block.id)}
											className='p-1 text-text-light hover:text-error ml-2'
										>
											✕
										</button>
									</div>

									{/* 區塊類型標籤 */}
									<div className='mb-3 inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded uppercase tracking-wider'>
										{block.type} BLOCK
									</div>

									{/* 區塊表單內容 */}
									<div className='space-y-3 mt-2'>
										{block.type === 'hero' && (
											<>
												<input
													type='text'
													placeholder='主標題'
													className='w-full px-3 py-2 bg-white rounded border border-border text-sm'
													value={block.data.title || ''}
													onChange={(e) =>
														handleUpdateBlock(block.id, { ...block.data, title: e.target.value })
													}
												/>
												<input
													type='text'
													placeholder='副標題'
													className='w-full px-3 py-2 bg-white rounded border border-border text-sm'
													value={block.data.subtitle || ''}
													onChange={(e) =>
														handleUpdateBlock(block.id, { ...block.data, subtitle: e.target.value })
													}
												/>
												<div className='mb-2'>
													<ImageSelectInput
														label='背景圖片'
														value={block.data.imageUrl || ''}
														onChange={(url) =>
															handleUpdateBlock(block.id, { ...block.data, imageUrl: url })
														}
													/>
												</div>
												<div className='flex gap-2'>
													<input
														type='text'
														placeholder='按鈕文字'
														className='w-1/3 px-3 py-2 bg-white rounded border border-border text-sm'
														value={block.data.ctaText || ''}
														onChange={(e) =>
															handleUpdateBlock(block.id, {
																...block.data,
																ctaText: e.target.value,
															})
														}
													/>
													<input
														type='text'
														placeholder='按鈕連結 (例：/contact)'
														className='flex-1 px-3 py-2 bg-white rounded border border-border text-sm font-mono'
														value={block.data.ctaLink || ''}
														onChange={(e) =>
															handleUpdateBlock(block.id, {
																...block.data,
																ctaLink: e.target.value,
															})
														}
													/>
												</div>
											</>
										)}

										{block.type === 'text' && (
											<>
												<div className='flex gap-2 mb-2'>
													<label className='text-xs text-text-muted flex items-center gap-1'>
														<input
															type='radio'
															name={`align-${block.id}`}
															checked={block.data.align === 'left'}
															onChange={() =>
																handleUpdateBlock(block.id, { ...block.data, align: 'left' })
															}
														/>{' '}
														靠左
													</label>
													<label className='text-xs text-text-muted flex items-center gap-1'>
														<input
															type='radio'
															name={`align-${block.id}`}
															checked={block.data.align === 'center'}
															onChange={() =>
																handleUpdateBlock(block.id, { ...block.data, align: 'center' })
															}
														/>{' '}
														置中
													</label>
												</div>
												<div className='border border-border rounded-lg bg-white'>
													<BlockNoteEditor
														key={block.id}
														initialHTML={block.data.content || ''}
														onChange={(html) => handleTextContentChange(block.id, html)}
													/>
												</div>
											</>
										)}

										{block.type === 'image' && (
											<>
												<div className='mb-2'>
													<ImageSelectInput
														label='單一圖片'
														value={block.data.url || ''}
														onChange={(url) =>
															handleUpdateBlock(block.id, { ...block.data, url: url })
														}
													/>
												</div>
												<input
													type='text'
													placeholder='替代文字 (Alt text)'
													className='w-full px-3 py-2 bg-white rounded border border-border text-sm'
													value={block.data.alt || ''}
													onChange={(e) =>
														handleUpdateBlock(block.id, { ...block.data, alt: e.target.value })
													}
												/>
											</>
										)}

										{block.type === 'carousel' && (
											<div className='space-y-4'>
												{(block.data.images || []).map((url: string, imgIndex: number) => (
													<div
														key={imgIndex}
														className='relative p-4 border border-border rounded-lg bg-white/50 group'
													>
														<ImageSelectInput
															label={`輪播圖片 ${imgIndex + 1}`}
															value={url}
															onChange={(newUrl) => {
																const newImages = [...(block.data.images || [])];
																newImages[imgIndex] = newUrl;
																handleUpdateBlock(block.id, { ...block.data, images: newImages });
															}}
														/>
														<button
															type='button'
															onClick={() => {
																const newImages = [...(block.data.images || [])];
																newImages.splice(imgIndex, 1);
																handleUpdateBlock(block.id, { ...block.data, images: newImages });
															}}
															className='absolute top-2 right-2 p-1.5 text-text-light hover:text-error opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-error/5 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-border z-10'
															title='移除圖片'
														>
															<svg
																className='w-4 h-4'
																fill='none'
																viewBox='0 0 24 24'
																strokeWidth={2}
																stroke='currentColor'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	d='M6 18L18 6M6 6l12 12'
																/>
															</svg>
														</button>
													</div>
												))}
												<button
													type='button'
													onClick={() => {
														const newImages = [...(block.data.images || [])];
														newImages.push('');
														handleUpdateBlock(block.id, { ...block.data, images: newImages });
													}}
													className='w-full py-3 border-2 border-dashed border-border text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2'
												>
													<svg
														className='w-4 h-4'
														fill='none'
														viewBox='0 0 24 24'
														strokeWidth={2}
														stroke='currentColor'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															d='M12 4.5v15m7.5-7.5h-15'
														/>
													</svg>
													新增輪播圖片
												</button>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className='space-y-6'>
					{/* SEO 設定 */}
					<div className='bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4'>
						<h2 className='text-lg font-semibold text-text'>SEO 設定</h2>
						<div>
							<label className='block text-sm font-medium text-text mb-1'>SEO 標題</label>
							<input
								type='text'
								value={seoTitle}
								onChange={(e) => setSeoTitle(e.target.value)}
								className='w-full px-4 py-2 bg-surface rounded-lg border border-border focus:border-primary outline-none text-sm'
								placeholder='保留空白則使用頁面標題'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-text mb-1'>SEO 描述</label>
							<textarea
								value={seoDescription}
								onChange={(e) => setSeoDescription(e.target.value)}
								rows={3}
								className='w-full px-4 py-2 bg-surface rounded-lg border border-border focus:border-primary outline-none text-sm'
							/>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}
