'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import AppLink from '@/components/AppLink';
import type { ApiSiteContent, CarouselSettings } from '@/data/types';

interface HomeCarouselProps {
	items: ApiSiteContent[];
	settings?: CarouselSettings;
}

export default function HomeCarousel({ items, settings }: HomeCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const autoPlay = settings?.autoPlay ?? true;
	const delay = (settings?.delay ?? 5) * 1000;
	const effect = settings?.effect ?? 'fade';

	const nextSlide = useCallback(() => {
		if (items.length <= 1 || isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => (prev + 1) % items.length);
		setTimeout(() => setIsTransitioning(false), 500);
	}, [items.length, isTransitioning]);

	const prevSlide = useCallback(() => {
		if (items.length <= 1 || isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
		setTimeout(() => setIsTransitioning(false), 500);
	}, [items.length, isTransitioning]);

	useEffect(() => {
		if (autoPlay && items.length > 1) {
			timerRef.current = setInterval(nextSlide, delay);
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [autoPlay, delay, items.length, nextSlide]);

	if (items.length === 0) return null;

	const currentItem = items[currentIndex];

	return (
		<section className='relative bg-gradient-to-br from-primary via-primary-dark to-blue-900 overflow-hidden h-[500px] sm:h-[600px] lg:h-[700px]'>
			{/* 背景圖片層 */}
			<div className='absolute inset-0'>
				{items.map((item, index) => (
					<div
						key={item.id}
						className={`absolute inset-0 transition-all duration-700 ease-in-out ${
							index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
						} ${
							effect === 'slide' && index !== currentIndex
								? index < currentIndex
									? '-translate-x-full'
									: 'translate-x-full'
								: ''
						}`}
						style={{
							backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					>
						{item.imageUrl && <div className='absolute inset-0 bg-black/40' />}
					</div>
				))}
			</div>

			{/* 背景裝飾 */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl' />
				<div className='absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl' />
			</div>

			{/* 內容層 */}
			<div className='relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center'>
				<div key={currentIndex} className='animate-fade-in'>
					<h1 className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6'>
						{currentItem.title || '串聯校友情誼，延續中原精神'}
					</h1>
					<p className='text-base sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed'>
						{currentItem.summary || '掌握校友會最新消息、活動資訊與校友服務內容'}
					</p>
					<div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
						<AppLink
							href={currentItem.linkUrl || '/products'}
							className='inline-flex items-center gap-2 px-7 py-3.5 bg-cta hover:bg-cta-hover text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer shadow-lg shadow-orange-500/25'
						>
							瀏覽內容
							<svg
								className='w-5 h-5'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={2}
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
								/>
							</svg>
						</AppLink>
						<AppLink
							href='/products?q='
							className='inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors duration-200 cursor-pointer backdrop-blur-sm border border-white/20'
						>
							<svg
								className='w-5 h-5'
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
							瀏覽活動
						</AppLink>
					</div>
				</div>

				{/* 切換按鈕 */}
				{items.length > 1 && (
					<>
						<button
							onClick={prevSlide}
							className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 lg:opacity-100 backdrop-blur-sm'
						>
							<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
						</button>
						<button
							onClick={nextSlide}
							className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 lg:opacity-100 backdrop-blur-sm'
						>
							<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 5l7 7-7 7'
								/>
							</svg>
						</button>

						{/* 指示器 */}
						<div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5'>
							{items.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentIndex(index)}
									className={`transition-all duration-300 rounded-full ${
										index === currentIndex
											? 'w-8 h-2.5 bg-white'
											: 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
									}`}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
}
