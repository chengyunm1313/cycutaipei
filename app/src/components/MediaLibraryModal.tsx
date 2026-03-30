'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMediaList, uploadFile } from '@/lib/api';
import type { MediaObject } from '@/lib/api';
import { isSupportedImageFile } from '@/lib/imageFile';

interface MediaLibraryModalProps {
	onClose: () => void;
	onSelect: (url: string) => void;
}

const KNOWN_IMAGE_LIBRARY_HOSTS = ['images.unsplash.com', 'images.pexels.com', 'cdn.pixabay.com'];

function parseUrl(value: string): URL | null {
	try {
		return new URL(value);
	} catch {
		return null;
	}
}

function isKnownImageLibraryHost(hostname: string): boolean {
	const normalized = hostname.toLowerCase();
	return KNOWN_IMAGE_LIBRARY_HOSTS.some((host) => normalized === host || normalized.endsWith(`.${host}`));
}

async function ensureImageReachable(url: string): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const img = new Image();
		const timer = window.setTimeout(() => {
			img.src = '';
			reject(new Error('圖片驗證逾時'));
		}, 8000);

		img.onload = () => {
			window.clearTimeout(timer);
			resolve();
		};
		img.onerror = () => {
			window.clearTimeout(timer);
			reject(new Error('圖片載入失敗'));
		};
		img.referrerPolicy = 'no-referrer';
		img.src = url;
	});
}

export default function MediaLibraryModal({ onClose, onSelect }: MediaLibraryModalProps) {
	const [mediaList, setMediaList] = useState<MediaObject[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [externalUrl, setExternalUrl] = useState('');
	const [externalUrlError, setExternalUrlError] = useState<string | null>(null);
	const [externalUrlHint, setExternalUrlHint] = useState<string | null>(null);
	const [validatingExternalUrl, setValidatingExternalUrl] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const loadMedia = useCallback(async () => {
		try {
			const list = await fetchMediaList();
			setMediaList(
				list.sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime())
			);
		} catch (err) {
			console.error('Failed to load media:', err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadMedia();
	}, [loadMedia]);

	const handleUpload = async (files: FileList | File[]) => {
		const fileArray = Array.from(files).filter(isSupportedImageFile);
		if (fileArray.length === 0) {
			alert('請選擇 JPG、PNG、GIF、WebP、SVG 圖片檔案');
			return;
		}

		setUploading(true);
		try {
			for (const file of fileArray) {
				await uploadFile(file);
			}
			await loadMedia();
		} catch (err) {
			alert(err instanceof Error ? err.message : '上傳失敗');
		} finally {
			setUploading(false);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	};
	const handleDragLeave = () => setDragOver(false);
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		if (e.dataTransfer.files.length > 0) {
			handleUpload(e.dataTransfer.files);
		}
	};

	const handleUseExternalUrl = async () => {
		const normalizedUrl = externalUrl.trim();
		if (!normalizedUrl) {
			setExternalUrlError('請先輸入圖片連結');
			setExternalUrlHint(null);
			return;
		}

		const parsed = parseUrl(normalizedUrl);
		if (!parsed) {
			setExternalUrlError('連結格式不正確，請輸入完整網址');
			setExternalUrlHint(null);
			return;
		}

		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
			setExternalUrlError('僅支援 http / https 圖片連結');
			setExternalUrlHint(null);
			return;
		}

		setExternalUrlError(null);
		setExternalUrlHint(
			isKnownImageLibraryHost(parsed.hostname)
				? '已偵測常見圖庫來源，可直接使用。'
				: '此連結非常見圖庫來源，若圖片可載入仍可使用。'
		);
		setValidatingExternalUrl(true);
		try {
			await ensureImageReachable(normalizedUrl);
			onSelect(normalizedUrl);
		} catch {
			setExternalUrlError('此連結目前無法載入圖片，請確認是可直接開啟圖片檔的網址');
		} finally {
			setValidatingExternalUrl(false);
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
			<div className='bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden'>
				{/* 標題與按鈕列 */}
				<div className='flex items-center justify-between p-6 border-b border-border flex-shrink-0'>
					<h2 className='text-xl font-bold text-text'>選擇媒體</h2>
					<div className='flex gap-3'>
						<button
							onClick={() => fileInputRef.current?.click()}
							disabled={uploading}
							className='px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50'
						>
							{uploading ? '上傳中...' : '上傳圖片'}
						</button>
						<button
							onClick={onClose}
							className='p-2 text-text-light hover:text-text hover:bg-surface rounded-lg transition-colors'
						>
							<svg
								className='w-5 h-5'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
								strokeWidth={2}
							>
								<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>
					</div>
					<input
						ref={fileInputRef}
						type='file'
						accept='image/*,.svg'
						multiple
						className='hidden'
						onChange={(e) => e.target.files && handleUpload(e.target.files)}
					/>
				</div>

				{/* 內容區 */}
				<div
					className='flex-1 overflow-y-auto p-6 relative'
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<div className='mb-5 rounded-xl border border-border bg-surface p-4'>
						<div className='text-sm font-semibold text-text mb-1'>使用外部圖片連結</div>
						<p className='text-xs text-text-muted mb-3'>
							可直接貼上圖片網址，支援 Unsplash / Pexels / Pixabay 等知名圖庫。
						</p>
						<div className='flex flex-col sm:flex-row gap-2'>
							<input
								type='url'
								value={externalUrl}
								onChange={(e) => {
									setExternalUrl(e.target.value);
									setExternalUrlError(null);
									setExternalUrlHint(null);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										void handleUseExternalUrl();
									}
								}}
								placeholder='https://images.unsplash.com/...'
								className='flex-1 px-3 py-2 rounded-lg border border-border bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
							/>
							<button
								type='button'
								onClick={() => void handleUseExternalUrl()}
								disabled={validatingExternalUrl}
								className='px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50'
							>
								{validatingExternalUrl ? '驗證中...' : '使用此連結'}
							</button>
						</div>
						{externalUrlError && <p className='mt-2 text-xs text-red-600'>{externalUrlError}</p>}
						{!externalUrlError && externalUrlHint && (
							<p className='mt-2 text-xs text-text-muted'>{externalUrlHint}</p>
						)}
					</div>

					{/* 拖曳上傳遮罩 */}
					{dragOver && (
						<div className='absolute inset-0 z-10 bg-primary/10 border-4 border-dashed border-primary/50 m-6 rounded-xl flex items-center justify-center pointer-events-none'>
							<p className='text-lg font-medium text-primary'>放開以開始上傳圖片</p>
						</div>
					)}

					{loading ? (
						<div className='flex justify-center py-12'>
							<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
						</div>
					) : mediaList.length === 0 ? (
						<div className='text-center py-12 text-text-muted'>
							<p>沒有找到圖片，可先上傳或直接貼上外部圖片連結</p>
						</div>
					) : (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
							{mediaList.map((item) => (
								<div
									key={item.key}
									onClick={() => onSelect(item.url)}
									className='group cursor-pointer aspect-square rounded-xl border border-border overflow-hidden bg-surface relative hover:border-primary transition-colors'
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={item.url}
										alt={item.key}
										className='w-full h-full object-cover group-hover:scale-105 transition-transform'
										loading='lazy'
									/>
									<div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center'>
										<div className='opacity-0 group-hover:opacity-100 bg-white/90 text-primary px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm transition-opacity'>
											選擇插入
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
