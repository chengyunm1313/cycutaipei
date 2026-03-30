import AppLink from '@/components/AppLink';
import Image from 'next/image';
import type { ApiCategory } from '@/data/types';

/**
 * 分類入口卡片
 * 展示分類圖片、名稱、描述、活動數量
 */
export default function CategoryCard({
	category,
	productCount = 0,
}: {
	category: ApiCategory;
	productCount?: number;
}) {
	const imageUrl =
		category.image ||
		'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop';
	const isFacebookCdnImage = /(^https?:\/\/)?([^/]+\.)?fbcdn\.net(\/|$)/i.test(imageUrl);
	return (
		<AppLink
			href={`/category/${category.slug}`}
			className='group relative block rounded-2xl overflow-hidden aspect-[3/2] cursor-pointer'
		>
			{/* 背景圖片 */}
			<Image
				src={imageUrl}
				alt={category.name}
				fill
				unoptimized={isFacebookCdnImage}
				className='object-cover group-hover:scale-110 transition-transform duration-700'
				sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
			/>

			{/* 漸層遮罩 */}
			<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

			{/* 內容 */}
			<div className='absolute bottom-0 left-0 right-0 p-5'>
				<h3 className='text-lg font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300'>
					{category.name}
				</h3>
				<p className='text-sm text-gray-300 line-clamp-1 mb-1.5'>{category.description}</p>
				<div className='flex items-center gap-1.5 text-xs text-gray-400'>
					<span>{productCount} 筆活動</span>
					<svg
						className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300'
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
				</div>
			</div>
		</AppLink>
	);
}
