import AppLink from '@/components/AppLink';
import Image from 'next/image';
import type { ApiProduct } from '@/data/types';
import { parseImageValue } from '@/lib/imageValue';
import { getCoverImageObjectPositionStyle } from '@/lib/coverImagePosition';

/**
 * 產品卡片元件
 * 顯示產品圖片、名稱、簡述、分類、標籤
 */
export default function ProductCard({
	product,
	categoryName,
}: {
	product: ApiProduct;
	categoryName?: string;
}) {
	const images = parseImageValue(product.images);
	const firstImage =
		product.listImage ||
		images[0] ||
		'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
	const shouldBypassImageOptimization =
		/(^https?:\/\/)?([^/]+\.)?fbcdn\.net(\/|$)/i.test(firstImage) ||
		/(^\/api\/media\/)|(:\/\/[^/]+\/api\/media\/)/i.test(firstImage);

	return (
		<AppLink
			href={`/product/${product.slug}`}
			className='group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer'
		>
			{/* 產品圖片 */}
			<div className='relative aspect-[4/3] overflow-hidden bg-surface-alt'>
				<Image
					src={firstImage}
					alt={product.name}
					fill
					unoptimized={shouldBypassImageOptimization}
					className='object-cover group-hover:scale-105 transition-transform duration-500'
					style={getCoverImageObjectPositionStyle(product.coverImagePositionY)}
					sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
				/>
			</div>

			{/* 卡片內容 */}
			<div className='p-4 sm:p-5'>
				{/* 分類標籤 */}
				{categoryName && <p className='text-xs font-medium text-primary mb-1.5'>{categoryName}</p>}

				{/* 產品名稱 */}
				<h3 className='text-base font-semibold text-text group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2'>
					{product.name}
				</h3>

				{/* 描述（使用正則去除 HTML 標記作為簡述） */}
				<p className='text-sm text-text-muted line-clamp-2 mb-3'>
					{product.description?.replace(/<[^>]*>/g, '') || '暫無描述'}
				</p>
			</div>
		</AppLink>
	);
}
