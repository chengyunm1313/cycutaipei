'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMediaList, uploadFile, deleteMedia } from '@/lib/api';
import type { MediaObject } from '@/lib/api';
import { isSupportedImageFile } from '@/lib/imageFile';

/**
 * 後台 - 媒體管理頁面
 * 瀏覽 R2 Bucket 中所有已上傳的圖片，支援上傳、刪除、複製 URL
 */
export default function MediaPage() {
	const [mediaList, setMediaList] = useState<MediaObject[]>([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const loadMedia = useCallback(async () => {
		try {
			const list = await fetchMediaList();
			// 依上傳時間降序排列
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

	/** 上傳檔案 */
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

	/** 刪除媒體 */
	const handleDelete = async (key: string) => {
		if (!confirm(`確定要刪除 ${key} 嗎？\n此操作無法復原。`)) return;
		try {
			await deleteMedia(key);
			setMediaList((prev) => prev.filter((m) => m.key !== key));
		} catch (err) {
			alert(err instanceof Error ? err.message : '刪除失敗');
		}
	};

	/** 複製 URL */
	const handleCopyUrl = async (item: MediaObject) => {
		const fullUrl = `${window.location.origin}${item.url}`;
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopiedKey(item.key);
			setTimeout(() => setCopiedKey(null), 2000);
		} catch {
			// fallback
			prompt('複製以下 URL：', fullUrl);
		}
	};

	/** Drag & Drop */
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

	/** 格式化檔案大小 */
	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	return (
		<div className='max-w-7xl mx-auto'>
			{/* 標題列 */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-text'>媒體管理</h1>
					<p className='text-sm text-text-muted mt-1'>
						管理所有上傳的圖片，共 {mediaList.length} 個檔案
					</p>
				</div>
				<button
					onClick={() => fileInputRef.current?.click()}
					disabled={uploading}
					className='inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50'
				>
					<svg
						className='w-4 h-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
					>
						<path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
					</svg>
					{uploading ? '上傳中...' : '上傳圖片'}
				</button>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*,.svg'
					multiple
					className='hidden'
					onChange={(e) => e.target.files && handleUpload(e.target.files)}
				/>
			</div>

			{/* 拖曳上傳區 */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors duration-200 ${
					dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
				}`}
			>
				<svg
					className='w-10 h-10 text-text-light mx-auto mb-3'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5'
					/>
				</svg>
				<p className='text-sm text-text-muted'>拖曳圖片到此區域上傳</p>
				<p className='text-xs text-text-light mt-1'>支援 JPG, PNG, GIF, WebP, SVG 等格式</p>
			</div>

			{/* 載入中 */}
			{loading ? (
				<div className='flex items-center justify-center py-20'>
					<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
				</div>
			) : mediaList.length === 0 ? (
				<div className='text-center py-20'>
					<svg
						className='w-16 h-16 text-text-light mx-auto mb-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
						/>
					</svg>
					<h3 className='text-lg font-semibold text-text mb-1'>尚未上傳任何媒體</h3>
					<p className='text-text-muted'>點擊上方「上傳圖片」或拖曳圖片到此頁面</p>
				</div>
			) : (
				/* 圖片 Grid */
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
					{mediaList.map((item) => (
						<div
							key={item.key}
							className='group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200'
						>
							{/* 圖片預覽 */}
							<div className='relative aspect-square bg-surface overflow-hidden'>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={item.url}
									alt={item.key}
									className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
									loading='lazy'
								/>
								{/* Hover 遮罩 */}
								<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2'>
									{/* 複製 URL */}
									<button
										onClick={() => handleCopyUrl(item)}
										className='p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors cursor-pointer'
										title='複製 URL'
									>
										{copiedKey === item.key ? (
											<svg
												className='w-5 h-5 text-green-400'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={2}
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M4.5 12.75l6 6 9-13.5'
												/>
											</svg>
										) : (
											<svg
												className='w-5 h-5 text-white'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={2}
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184'
												/>
											</svg>
										)}
									</button>
									{/* 刪除 */}
									<button
										onClick={() => handleDelete(item.key)}
										className='p-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg backdrop-blur-sm transition-colors cursor-pointer'
										title='刪除'
									>
										<svg
											className='w-5 h-5 text-white'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={2}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* 檔案資訊 */}
							<div className='p-3'>
								<p className='text-xs font-medium text-text truncate' title={item.key}>
									{item.key}
								</p>
								<div className='flex items-center justify-between mt-1'>
									<span className='text-[11px] text-text-light'>{formatSize(item.size)}</span>
									<span className='text-[11px] text-text-light'>
										{new Date(item.uploaded).toLocaleDateString('zh-TW', {
											month: 'short',
											day: 'numeric',
										})}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 上傳中遮罩 */}
			{uploading && (
				<div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50'>
					<div className='bg-card rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4'>
						<div className='w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin' />
						<p className='text-sm font-medium text-text'>上傳中...</p>
					</div>
				</div>
			)}
		</div>
	);
}
