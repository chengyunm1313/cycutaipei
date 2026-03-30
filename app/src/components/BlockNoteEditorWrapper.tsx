'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Block } from '@blocknote/core';
import MediaLibraryModal from './MediaLibraryModal';
import { uploadFile as apiUploadFile } from '@/lib/api';

interface BlockNoteEditorWrapperProps {
	onChange: (html: string) => void;
	onStatsChange?: (stats: { chars: number; words: number; readTime: number }) => void;
	initialContent?: Block[];
	initialHTML?: string;
	placeholder?: string;
}

interface TinyEditorInstance {
	getContent: () => string;
	setContent: (content: string) => void;
	insertContent: (content: string) => void;
	focus: () => void;
}

interface TinyBlobInfo {
	blob: () => Blob;
	filename?: () => string;
}

function escapeHtmlAttr(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function stripHtml(html: string): string {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function computeTextStats(html: string): { chars: number; words: number; readTime: number } {
	const text = stripHtml(html);
	const chars = text.length;
	const words = text ? text.split(/[\s\u3000]+/).filter(Boolean).length : 0;
	const readTime = Math.max(1, Math.ceil(chars / 400));
	return { chars, words, readTime };
}

function blockNoteBlocksToHtml(blocks?: Block[]): string {
	if (!blocks?.length) return '';

	const fragments = blocks
		.map((block) => {
			const parts = Array.isArray(block.content)
				? block.content
						.map((item) => {
							if (typeof item === 'string') return item;
							if (item && typeof item === 'object' && 'text' in item) {
								const text = item.text;
								return typeof text === 'string' ? text : '';
							}
							return '';
						})
						.join('')
				: '';
			const safeText = escapeHtmlAttr(parts);
			if (block.type === 'heading') return `<h2>${safeText}</h2>`;
			return `<p>${safeText}</p>`;
		})
		.filter(Boolean);

	return fragments.join('');
}

/**
 * TinyMCE 編輯器包裝元件
 * 保留原 BlockNote 介面，避免影響既有後台頁面呼叫方式。
 */
export default function BlockNoteEditorWrapper({
	onChange,
	onStatsChange,
	initialContent,
	initialHTML,
	placeholder,
}: BlockNoteEditorWrapperProps) {
	const editorRef = useRef<TinyEditorInstance | null>(null);
	const statsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSyncedValueRef = useRef('');
	const [mounted, setMounted] = useState(false);
	const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
	const initialValue = useMemo(
		() => initialHTML ?? blockNoteBlocksToHtml(initialContent),
		[initialContent, initialHTML]
	);

	const emitChange = useCallback(
		(html: string) => {
			lastSyncedValueRef.current = html;
			onChange(html);
			if (!onStatsChange) return;

			if (statsTimerRef.current) clearTimeout(statsTimerRef.current);
			statsTimerRef.current = setTimeout(() => {
				onStatsChange(computeTextStats(html));
			}, 250);
		},
		[onChange, onStatsChange]
	);

	const handleEditorChange = useCallback(
		(html: string) => {
			emitChange(html);
		},
		[emitChange]
	);

	const handleSelectMedia = useCallback(
		(url: string) => {
			setIsMediaModalOpen(false);
			if (!editorRef.current) return;

			const safeUrl = escapeHtmlAttr(url.trim());
			if (!safeUrl) return;

			editorRef.current.insertContent(`<img src="${safeUrl}" alt="" />`);
			const html = editorRef.current.getContent();
			emitChange(html);
		},
		[emitChange]
	);

	useEffect(() => {
		if (!editorRef.current) return;
		if (initialValue === lastSyncedValueRef.current) return;

		const currentContent = editorRef.current.getContent();
		if (initialValue !== currentContent) {
			editorRef.current.setContent(initialValue);
		}
		lastSyncedValueRef.current = initialValue;
	}, [initialValue]);

	useEffect(() => {
		if (!initialValue) {
			onChange('');
			if (onStatsChange) {
				onStatsChange({ chars: 0, words: 0, readTime: 1 });
			}
			lastSyncedValueRef.current = '';
			return;
		}
		const initialStats = computeTextStats(initialValue);
		onChange(initialValue);
		onStatsChange?.(initialStats);
		lastSyncedValueRef.current = initialValue;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			if (statsTimerRef.current) clearTimeout(statsTimerRef.current);
		};
	}, []);

	// 確保 TinyMCE 僅在客戶端渲染，避免 SSR 水合不匹配
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className='relative flex flex-col border border-border rounded-xl bg-surface shadow-sm'>
				<div className='flex items-center gap-2 p-3 bg-surface-alt border-b border-border'>
					<div className='h-8 w-36 bg-surface rounded-lg animate-pulse' />
				</div>
				<div className='bg-white' style={{ height: 520 }}>
					<div className='p-4 text-text-muted text-sm'>{placeholder || '開始撰寫內容...'}</div>
				</div>
			</div>
		);
	}

	return (
		<div className='relative flex flex-col border border-border rounded-xl bg-surface shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200'>
			<div className='flex items-center gap-2 p-3 bg-surface-alt border-b border-border'>
				<button
					type='button'
					onClick={() => setIsMediaModalOpen(true)}
					className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text bg-card hover:bg-surface border border-border hover:border-primary/50 shadow-sm rounded-lg transition-all'
				>
					<svg
						className='w-4 h-4 text-primary'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
						/>
					</svg>
					從媒體庫插入圖片
				</button>
			</div>

			<div className='bg-white'>
				<Editor
					tinymceScriptSrc='https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js'
					licenseKey='gpl'
					initialValue={initialValue}
					onInit={(_, editor) => {
						editorRef.current = editor as unknown as TinyEditorInstance;
					}}
					onEditorChange={handleEditorChange}
					init={{
						height: 520,
						menubar: false,
						branding: false,
						promotion: false,
						placeholder: placeholder || '開始撰寫內容...',
						plugins: [
							'advlist',
							'autolink',
							'lists',
							'link',
							'image',
							'charmap',
							'preview',
							'searchreplace',
							'visualblocks',
							'code',
							'fullscreen',
							'insertdatetime',
							'media',
							'table',
							'wordcount',
						],
						toolbar:
							'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat code',
						content_style:
							'body { font-family: "Noto Sans TC", "Inter", system-ui, sans-serif; font-size: 16px; line-height: 1.8; margin: 1rem; padding: 0; } p { margin-block-start: 0; } body[data-mce-placeholder]:not(.mce-visualblocks)::before { color: #9ca3af; font-style: normal; }',
						automatic_uploads: true,
						paste_data_images: true,
						images_upload_handler: async (blobInfo: TinyBlobInfo): Promise<string> => {
							try {
								const blob = blobInfo.blob();
								const fallbackExt = blob.type.split('/')[1] || 'png';
								const fileName = blobInfo.filename?.() || `image-${Date.now()}.${fallbackExt}`;
								const file = new File([blob], fileName, {
									type: blob.type || 'image/png',
								});
								const result = await apiUploadFile(file);
								return result.url;
							} catch (error) {
								console.error('TinyMCE 圖片上傳失敗:', error);
								throw new Error('圖片上傳失敗，請稍後再試。');
							}
						},
					}}
				/>
			</div>

			{isMediaModalOpen && (
				<MediaLibraryModal
					onClose={() => setIsMediaModalOpen(false)}
					onSelect={handleSelectMedia}
				/>
			)}

			<style jsx global>{`
				.tox-tinymce {
					border: 0 !important;
					border-radius: 0 !important;
				}
				.tox .tox-toolbar__primary {
					background: #f8fafc !important;
				}
				.tox .tox-edit-area__iframe {
					background: #fff !important;
				}
				.mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
					color: #9ca3af !important;
					font-style: normal !important;
				}
			`}</style>
		</div>
	);
}
