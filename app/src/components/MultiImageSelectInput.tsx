'use client';

import { useMemo, useState } from 'react';
import MediaLibraryModal from './MediaLibraryModal';

interface MultiImageSelectInputProps {
	value: string[];
	onChange: (urls: string[]) => void;
	label?: string;
}

/**
 * 多張圖片選擇器（輪播用）
 * 支援新增、切換、刪除目前圖片與縮圖預覽。
 */
export default function MultiImageSelectInput({
	value,
	onChange,
	label = '輪播圖片',
}: MultiImageSelectInputProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const images = useMemo(() => value.filter((item) => item.trim() !== ''), [value]);

	const addImage = (url: string) => {
		const normalized = url.trim();
		if (!normalized) return;
		if (images.includes(normalized)) {
			setActiveIndex(images.indexOf(normalized));
			return;
		}
		onChange([...images, normalized]);
		setActiveIndex(images.length);
	};

	const removeActiveImage = () => {
		if (images.length === 0) return;
		const next = images.filter((_, index) => index !== activeIndex);
		onChange(next);
		setActiveIndex((prev) => {
			if (next.length === 0) return 0;
			return Math.min(prev, next.length - 1);
		});
	};

	const moveActiveImage = (direction: 'left' | 'right') => {
		if (images.length <= 1) return;
		const targetIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
		if (targetIndex < 0 || targetIndex >= images.length) return;

		const next = [...images];
		[next[activeIndex], next[targetIndex]] = [next[targetIndex], next[activeIndex]];
		onChange(next);
		setActiveIndex(targetIndex);
	};

	const currentImage = images[activeIndex];

	return (
		<div>
			<label className='block text-sm font-medium text-text mb-1.5'>{label}</label>

			{images.length > 0 ? (
				<div className='space-y-2'>
					<div className='relative rounded-xl overflow-hidden border border-border aspect-video bg-surface'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={currentImage} alt={`Carousel ${activeIndex + 1}`} className='w-full h-full object-cover' />

						{images.length > 1 && (
							<>
								<button
									type='button'
									onClick={() =>
										setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
									}
									className='absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-text flex items-center justify-center shadow-sm'
									aria-label='上一張圖片'
								>
									<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
										<path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
									</svg>
								</button>
								<button
									type='button'
									onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
									className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-text flex items-center justify-center shadow-sm'
									aria-label='下一張圖片'
								>
									<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
										<path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
									</svg>
								</button>
							</>
						)}

						<div className='absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full'>
							{activeIndex + 1} / {images.length}
						</div>
					</div>

					<div className='flex gap-2 overflow-x-auto pb-1'>
						{images.map((url, index) => (
							<button
								type='button'
								key={`${url}-${index}`}
								onClick={() => setActiveIndex(index)}
								className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 ${
									index === activeIndex ? 'border-primary' : 'border-border hover:border-primary/50'
								}`}
								aria-label={`切換到第 ${index + 1} 張`}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={url} alt={`thumb ${index + 1}`} className='w-full h-full object-cover' />
							</button>
						))}
					</div>

					<div className='flex flex-wrap gap-2'>
						<button
							type='button'
							onClick={() => setIsModalOpen(true)}
							className='px-3 py-1.5 text-sm font-medium bg-white text-primary rounded-lg border border-border hover:border-primary/40'
						>
							新增圖片
						</button>
						<button
							type='button'
							onClick={removeActiveImage}
							className='px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600'
						>
							移除目前圖片
						</button>
						<button
							type='button'
							onClick={() => moveActiveImage('left')}
							disabled={images.length <= 1}
							className='px-3 py-1.5 text-sm font-medium bg-surface border border-border rounded-lg hover:bg-surface-alt disabled:opacity-50'
						>
							往前
						</button>
						<button
							type='button'
							onClick={() => moveActiveImage('right')}
							disabled={images.length <= 1}
							className='px-3 py-1.5 text-sm font-medium bg-surface border border-border rounded-lg hover:bg-surface-alt disabled:opacity-50'
						>
							往後
						</button>
					</div>
				</div>
			) : (
				<button
					type='button'
					onClick={() => setIsModalOpen(true)}
					className='w-full flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-surface hover:bg-primary/5 transition-all text-text-muted hover:text-primary gap-2'
				>
					<svg className='w-8 h-8 opacity-50' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z'
						/>
					</svg>
					<span className='text-sm font-medium'>新增輪播圖片（可多張）</span>
				</button>
			)}

			{isModalOpen && (
				<MediaLibraryModal
					onClose={() => setIsModalOpen(false)}
					onSelect={(url) => {
						addImage(url);
						setIsModalOpen(false);
					}}
				/>
			)}
		</div>
	);
}
