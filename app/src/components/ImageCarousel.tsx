'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * 產品圖片輪播元件
 * 支援多張圖片切換與縮圖預覽
 */
export default function ImageCarousel({
	images,
	productName,
}: {
	images: string[];
	productName: string;
}) {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeImage = images[activeIndex] || '';
	const shouldBypassImageOptimization =
		/(^https?:\/\/)?([^/]+\.)?fbcdn\.net(\/|$)/i.test(activeImage) ||
		/(^\/api\/media\/)|(:\/\/[^/]+\/api\/media\/)/i.test(activeImage);

	if (images.length === 0) return null;

	return (
		<div className='space-y-3'>
			{/* 主圖 */}
			<div className='relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-alt'>
				<Image
					src={activeImage}
					alt={`${productName} - 圖片 ${activeIndex + 1}`}
					fill
					unoptimized={shouldBypassImageOptimization}
					className='object-cover'
					sizes='(max-width: 768px) 100vw, 50vw'
					priority
				/>

				{/* 左右箭頭 */}
				{images.length > 1 && (
					<>
						<button
							onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
							className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 cursor-pointer shadow-sm'
							aria-label='上一張圖片'
						>
							<svg
								className='w-5 h-5 text-text'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M15.75 19.5L8.25 12l7.5-7.5'
								/>
							</svg>
						</button>
						<button
							onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
							className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200 cursor-pointer shadow-sm'
							aria-label='下一張圖片'
						>
							<svg
								className='w-5 h-5 text-text'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
							</svg>
						</button>
					</>
				)}

				{/* 圖片計數 */}
				{images.length > 1 && (
					<div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm'>
						{activeIndex + 1} / {images.length}
					</div>
				)}
			</div>

			{/* 縮圖列 */}
			{images.length > 1 && (
				<div className='flex gap-2 overflow-x-auto pb-1'>
					{images.map((img, index) => (
						(() => {
							const shouldBypassThumbOptimization =
								/(^https?:\/\/)?([^/]+\.)?fbcdn\.net(\/|$)/i.test(img) ||
								/(^\/api\/media\/)|(:\/\/[^/]+\/api\/media\/)/i.test(img);
							return (
						<button
							key={index}
							onClick={() => setActiveIndex(index)}
							className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
								index === activeIndex
									? 'border-primary ring-2 ring-primary/20'
									: 'border-border hover:border-primary/50'
							}`}
							aria-label={`查看圖片 ${index + 1}`}
						>
							<Image
								src={img}
								alt={`${productName} - 縮圖 ${index + 1}`}
								fill
								unoptimized={shouldBypassThumbOptimization}
								className='object-cover'
								sizes='64px'
							/>
						</button>
							);
						})()
					))}
				</div>
			)}
		</div>
	);
}
