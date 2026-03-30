import HomeCarousel from '@/components/HomeCarousel';
import AppLink from '@/components/AppLink';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { fetchCategories, fetchProducts, fetchSiteContents } from '@/lib/api';

export const runtime = 'edge';

/**
 * 首頁
 * Hero 區塊 + 精選產品 + 產品分類 + 最新產品
 */
export default async function HomePage() {
	const [products, categories, carouselItems, homeAboutList, carouselConfig] = await Promise.all([
		fetchProducts(),
		fetchCategories(),
		fetchSiteContents({ type: 'home_carousel', activeOnly: true }),
		fetchSiteContents({ type: 'home_about', activeOnly: true }),
		fetchSiteContents({ type: 'home_carousel_config' }),
	]);

	const activeCategories = categories.filter((category) => category.isActive);
	const featuredProducts = products.filter((p) => p.status === 'published').slice(0, 4);
	const latestProducts = products.filter((p) => p.status === 'published').slice(0, 6);
	const homeAbout = homeAboutList[0];

	let carouselSettings = undefined;
	if (carouselConfig.length > 0 && carouselConfig[0].extraJson) {
		try {
			carouselSettings = JSON.parse(carouselConfig[0].extraJson);
		} catch (e) {
			console.error('Failed to parse carousel settings', e);
		}
	}

	const homeAboutTitle = homeAbout?.title || '關於我們';
	const homeAboutSummary =
		homeAbout?.summary || '持續提供穩定、可靠且可快速導入的產品型錄解決方案。';
	const homeAboutContent =
		homeAbout?.content ||
		'<p>我們專注於企業產品展示與內容管理，協助團隊快速建立品牌網站，並有效維護型錄與知識內容。</p>';
	const homeAboutLink = homeAbout?.linkUrl || '/about';
	const homeAboutImage = homeAbout?.imageUrl || '';

	return (
		<>
			{/* ===== Hero 區塊 (輪播) ===== */}
			<HomeCarousel items={carouselItems} settings={carouselSettings} />

			{/* ===== 精選產品 ===== */}
			<section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
				<div className='flex items-end justify-between mb-8'>
					<div>
						<h2 className='text-2xl sm:text-3xl font-bold text-text'>精選產品</h2>
						<p className='text-text-muted mt-2'>為您推薦的優質產品</p>
					</div>
					<AppLink
						href='/products'
						className='hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer'
					>
						查看全部
					</AppLink>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
					{featuredProducts.length > 0 ? (
						featuredProducts.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								categoryName={activeCategories.find((c) => c.id === product.categoryId)?.name}
							/>
						))
					) : (
						<div className='sm:col-span-2 lg:col-span-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center text-text-light'>
							目前尚無精選產品。
						</div>
					)}
				</div>
			</section>

			{/* ===== 首頁關於我們 ===== */}
			<section className='bg-surface-alt'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
						<div>
							<h2 className='text-2xl sm:text-3xl font-bold text-text'>{homeAboutTitle}</h2>
							<p className='text-text-muted mt-3'>{homeAboutSummary}</p>
							<div
								className='prose prose-slate max-w-none mt-4'
								dangerouslySetInnerHTML={{ __html: homeAboutContent }}
							/>
							<a
								href={homeAboutLink}
								target={homeAboutLink.startsWith('http') ? '_blank' : '_self'}
								rel={homeAboutLink.startsWith('http') ? 'noreferrer' : undefined}
								className='inline-flex mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'
							>
								More 前往連結
							</a>
						</div>
						<div className='rounded-2xl border border-border overflow-hidden bg-white min-h-[260px]'>
							{homeAboutImage ? (
								<div
									className='w-full h-full min-h-[260px] bg-cover bg-center'
									style={{ backgroundImage: `url(${homeAboutImage})` }}
								/>
							) : (
								<div className='w-full h-full min-h-[260px] flex items-center justify-center text-text-light'>
									尚未設定圖片
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* ===== 產品分類 ===== */}
			<section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
				<div className='text-center mb-10'>
					<h2 className='text-2xl sm:text-3xl font-bold text-text'>產品分類</h2>
					<p className='text-text-muted mt-2'>依類別瀏覽我們的產品線</p>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
					{activeCategories.length > 0 ? (
						activeCategories.map((category) => (
							<CategoryCard
								key={category.id}
								category={category}
								productCount={products.filter((p) => p.categoryId === category.id).length}
							/>
						))
					) : (
						<div className='sm:col-span-2 lg:col-span-4 rounded-2xl border border-border bg-surface px-6 py-10 text-center text-text-light'>
							目前尚未建立產品分類。
						</div>
					)}
				</div>
			</section>

			{/* ===== 最新產品 ===== */}
			<section className='bg-surface-alt'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
					<div className='flex items-end justify-between mb-8'>
						<div>
							<h2 className='text-2xl sm:text-3xl font-bold text-text'>最新產品</h2>
							<p className='text-text-muted mt-2'>最近上架的產品資訊</p>
						</div>
						<AppLink
							href='/products'
							className='hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer'
						>
							查看全部
						</AppLink>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
						{latestProducts.length > 0 ? (
							latestProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									categoryName={activeCategories.find((c) => c.id === product.categoryId)?.name}
								/>
							))
						) : (
							<div className='sm:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-white px-6 py-10 text-center text-text-light'>
								目前尚無最新產品資料。
							</div>
						)}
					</div>
				</div>
			</section>
		</>
	);
}
