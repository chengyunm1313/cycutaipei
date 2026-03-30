import type { Metadata } from 'next';
import AppLink from '@/components/AppLink';

import ProductCard from '@/components/ProductCard';
import Breadcrumb from '@/components/Breadcrumb';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { getCategoryPath, getAllCategoryIds } from '@/lib/treeUtils';

export const runtime = 'edge';

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const categories = await fetchCategories();
	const category = categories.find((c) => c.slug === slug);
	if (!category) return { title: '分類未找到' };
	return {
		title: category.name,
		description: category.description || '',
	};
}

/**
 * 分類頁
 * 展示特定分類下的產品列表
 */
export default async function CategoryPage({ params }: PageProps) {
	const { slug } = await params;
	const [allProducts, allCategories] = await Promise.all([fetchProducts(), fetchCategories()]);

	const category = allCategories.find((c) => c.slug === slug);
	if (!category) {
		return (
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				<Breadcrumb items={[{ label: '全部產品', href: '/products' }, { label: '分類未找到' }]} />
				<div className='mt-6 rounded-2xl border border-border bg-surface px-6 py-10 text-center'>
					<h1 className='text-2xl font-bold text-text'>分類未找到</h1>
					<p className='mt-3 text-text-muted'>此分類可能已下架或尚未建立。</p>
					<div className='mt-6'>
						<AppLink
							href='/products'
							className='inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark'
						>
							返回全部產品
						</AppLink>
					</div>
				</div>
			</div>
		);
	}

	const categoryIds = getAllCategoryIds(category.id, allCategories);
	const categoryProducts = allProducts.filter(
		(p) => p.categoryId && categoryIds.includes(p.categoryId) && p.status === 'published'
	);

	const categoryPath = getCategoryPath(category.id, allCategories);
	const breadcrumbItems = [
		{ label: '全部產品', href: '/products' },
		...categoryPath.map((cat) => ({ label: cat.name, href: `/category/${cat.slug}` })),
	];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<Breadcrumb items={breadcrumbItems} />

			{/* 分類標頭 */}
			<div className='mb-8'>
				<h1 className='text-2xl sm:text-3xl font-bold text-text'>{category.name}</h1>
				<p className='text-text-muted mt-2'>{category.description}</p>
				<p className='text-sm text-text-light mt-1'>共 {categoryProducts.length} 項產品</p>
			</div>

			{/* 產品列表 */}
			{categoryProducts.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
					{categoryProducts.map((product) => (
						<ProductCard key={product.id} product={product} categoryName={category.name} />
					))}
				</div>
			) : (
				<div className='text-center py-20'>
					<svg
						className='w-16 h-16 text-text-light mx-auto mb-4'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
						/>
					</svg>
					<h3 className='text-lg font-semibold text-text mb-1'>此分類尚無產品</h3>
					<p className='text-text-muted'>敬請期待更多產品上架</p>
				</div>
			)}
		</div>
	);
}
