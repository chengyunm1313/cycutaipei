import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import AppLink from '@/components/AppLink';
import ImageCarousel from '@/components/ImageCarousel';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';
import { fetchProductBySlug, fetchProducts, fetchCategory, fetchSiteSettings } from '@/lib/api';
import type { ApiProduct } from '@/data/types';
import { parseImageValue } from '@/lib/imageValue';

export const runtime = 'edge';

interface PageProps {
	params: Promise<{ slug: string }>;
}

type ProductSpec = { label: string; value: string };

function parseProductSpecs(rawSpecs: string | null): ProductSpec[] {
	if (!rawSpecs) return [];
	try {
		const parsed = JSON.parse(rawSpecs) as unknown;
		if (Array.isArray(parsed)) {
			return parsed
				.filter((item) => item && typeof item === 'object')
				.map((item) => {
					const obj = item as Record<string, unknown>;
					return {
						label: typeof obj.label === 'string' ? obj.label : String(obj.label ?? ''),
						value: typeof obj.value === 'string' ? obj.value : String(obj.value ?? ''),
					};
				})
				.filter((item) => item.label !== '' || item.value !== '');
		}
		if (parsed && typeof parsed === 'object') {
			return Object.entries(parsed as Record<string, unknown>).map(([label, value]) => ({
				label,
				value: value == null ? '' : String(value),
			}));
		}
		return [];
	} catch {
		return [];
	}
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	try {
		const product = await fetchProductBySlug(slug);
		return {
			title: product.name,
			description: product.description?.replace(/<[^>]*>/g, '').substring(0, 160),
		};
	} catch {
		return { title: '產品未找到' };
	}
}

/**
 * 產品詳細頁
 * 圖片輪播 + 產品資訊 + 規格表 + 相關產品
 */
export default async function ProductPage({ params }: PageProps) {
	const { slug } = await params;

	try {
		const product = await fetchProductBySlug(slug);
		const [category, allProducts, settings] = await Promise.all([
			product.categoryId ? fetchCategory(product.categoryId) : Promise.resolve(null),
			fetchProducts({ categoryId: product.categoryId || undefined, status: 'published' }),
			fetchSiteSettings(),
		]);

		// 相關產品：同分類的其他產品
		const relatedProducts = allProducts.filter((p: ApiProduct) => p.id !== product.id).slice(0, 3);

		const images = parseImageValue(product.images);
		const specs = parseProductSpecs(product.specs);

		// Schema.org JSON-LD
		const jsonLd = {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description?.replace(/<[^>]*>/g, '').substring(0, 200),
			image: images,
			brand: {
				'@type': 'Organization',
				name: '中原大學台北市校友會',
			},
		};

		return (
			<>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
					<Breadcrumb
						items={[
							{ label: '活動資訊', href: '/products' },
							...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
							{ label: product.name },
						]}
					/>

					{/* 產品主體 */}
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16'>
						{/* 左側：圖片輪播 */}
						<ImageCarousel images={images} productName={product.name} />

						{/* 右側：產品資訊 */}
						<div>
							{/* 分類 */}
							{category && (
								<div className='flex flex-wrap gap-2 mb-3'>
									<AppLink
										href={`/category/${category.slug}`}
										className='text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors duration-200 cursor-pointer'
									>
										{category.name}
									</AppLink>
								</div>
							)}

							{/* 名稱 */}
							<h1 className='text-2xl sm:text-3xl font-bold text-text mb-4'>{product.name}</h1>

							{/* 價格 */}
							{product.price && (
								<p className='text-3xl font-bold text-primary mb-6'>
									NT$ {product.price.toLocaleString()}
								</p>
							)}

							{/* 簡述 */}
							<p className='text-text-muted leading-relaxed mb-6'>
								{product.description?.replace(/<[^>]*>/g, '').substring(0, 300)}...
							</p>

							{/* 規格表 */}
							{specs.length > 0 && (
								<div className='bg-card rounded-2xl border border-border overflow-hidden'>
									<div className='px-5 py-3 bg-surface-alt border-b border-border'>
										<h2 className='text-sm font-semibold text-text'>產品規格</h2>
									</div>
									<div className='divide-y divide-border'>
										{specs.map((spec, index) => (
											<div key={index} className='flex px-5 py-3 text-sm'>
												<span className='w-32 flex-shrink-0 font-medium text-text-muted'>
													{spec.label}
												</span>
												<span className='text-text'>{spec.value}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* 聯絡 CTA */}
							<div className='mt-8 flex flex-wrap gap-4'>
								{product.purchaseLink && (
									<a
										href={product.purchaseLink}
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer'
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
												d='M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
											/>
										</svg>
										立即報名
									</a>
								)}
								<a
									href={settings.contactLink || 'mailto:contact@example.com'}
									className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors duration-200 cursor-pointer ${
										product.purchaseLink
											? 'bg-surface border border-border text-text hover:bg-surface-alt'
											: 'bg-cta hover:bg-cta-hover text-white'
									}`}
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
											d='M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75'
										/>
									</svg>
									洽詢活動資訊
								</a>
								{product.catalogLink && (
									<a
										href={product.catalogLink}
										target='_blank'
										rel='noopener noreferrer'
										className='inline-flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text hover:bg-surface-alt font-semibold rounded-xl transition-colors duration-200 cursor-pointer'
									>
										<svg
											className='w-5 h-5 text-primary'
											fill='none'
											viewBox='0 0 24 24'
											strokeWidth={2}
											stroke='currentColor'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3'
											></path>
										</svg>
										下載活動附件
									</a>
								)}
							</div>
						</div>
					</div>

					{/* 活動內容 */}
					<div className='mb-16'>
						<h2 className='text-xl font-bold text-text mb-4'>活動內容</h2>
						{product.introVideoUrl && (
							<div className='mb-8 aspect-video rounded-2xl overflow-hidden border border-border'>
								<iframe
									width='100%'
									height='100%'
									src={product.introVideoUrl.replace('watch?v=', 'embed/')}
									title='YouTube video player'
									allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
									allowFullScreen
									className='w-full h-full'
								></iframe>
							</div>
						)}
						<div
							className='prose prose-sm sm:prose max-w-none text-text-muted
              prose-headings:text-text prose-strong:text-text
              prose-a:text-primary prose-li:text-text-muted'
							dangerouslySetInnerHTML={{ __html: product.content || product.description || '' }}
						/>
					</div>

					{/* 相關活動 */}
					{relatedProducts.length > 0 && (
						<div>
							<h2 className='text-xl font-bold text-text mb-6'>相關活動</h2>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
								{relatedProducts.map((p: ApiProduct) => (
									<ProductCard key={p.id} product={p} categoryName={category?.name} />
								))}
							</div>
						</div>
					)}
				</div>
			</>
		);
	} catch {
		notFound();
	}
}
