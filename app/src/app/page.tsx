import HomeCarousel from '@/components/HomeCarousel';
import AppLink from '@/components/AppLink';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import AcademyCourseCard from '@/components/AcademyCourseCard';
import {
	fetchAcademyCategories,
	fetchAcademyCourses,
	fetchCategories,
	fetchProducts,
	fetchSiteSettings,
	fetchSiteContents,
} from '@/lib/api';

export const runtime = 'edge';

/**
 * 首頁
 * Hero 區塊 + 精選活動 + 活動分類 + 最新活動
 */
export default async function HomePage() {
	const [
		products,
		categories,
		academyCourses,
		academyCategories,
		siteSettings,
		carouselItems,
		homeAboutList,
		carouselConfig,
	] = await Promise.all([
		fetchProducts(),
		fetchCategories(),
		fetchAcademyCourses({ status: 'published' }),
		fetchAcademyCategories(true),
		fetchSiteSettings(),
		fetchSiteContents({ type: 'home_carousel', activeOnly: true }),
		fetchSiteContents({ type: 'home_about', activeOnly: true }),
		fetchSiteContents({ type: 'home_carousel_config' }),
	]);

	const activeCategories = categories.filter((category) => category.isActive);
	const featuredProducts = products.filter((p) => p.status === 'published').slice(0, 4);
	const latestProducts = products.filter((p) => p.status === 'published').slice(0, 6);
	const featuredAcademyCourses = academyCourses
		.filter((course) => course.status === 'published' && course.isFeatured)
		.slice(0, 3);
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
		homeAbout?.summary || '串聯校友情誼、促進母校互動，持續推動校友交流與會務發展。';
	const homeAboutContent =
		homeAbout?.content ||
		'<p>我們致力於促進校友與母校之間的互動、互惠，透過活動、公告與服務資訊，凝聚中原人在台北的連結與認同。</p>';
	const homeAboutLink = homeAbout?.linkUrl || '/about';
	const homeAboutImage = homeAbout?.imageUrl || '';
	const joinLink =
		siteSettings.contactLink?.trim() ||
		siteSettings.facebookUrl?.trim() ||
		'/about';
	const academyLink = siteSettings.youtubeUrl?.trim() || '/academy';
	const joinLinkExternal = /^https?:\/\//.test(joinLink);
	const academyLinkExternal = /^https?:\/\//.test(academyLink);

	return (
		<>
			{/* ===== Hero 區塊 (輪播) ===== */}
			<HomeCarousel items={carouselItems} settings={carouselSettings} />

			{/* ===== 精選活動 ===== */}
			<section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
				<div className='flex items-end justify-between mb-8'>
					<div>
						<h2 className='text-2xl sm:text-3xl font-bold text-text'>精選活動</h2>
						<p className='text-text-muted mt-2'>精選近期活動與校友交流重點內容</p>
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
							目前尚無精選活動。
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
								了解更多
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

			{/* ===== 精選課程 ===== */}
			<section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
				<div className='flex items-end justify-between mb-8'>
					<div>
						<h2 className='text-2xl sm:text-3xl font-bold text-text'>精選課程</h2>
						<p className='text-text-muted mt-2'>透過影片課程延伸校友交流與知識分享</p>
					</div>
					<AppLink
						href='/academy'
						className='hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer'
					>
						查看全部
					</AppLink>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
					{featuredAcademyCourses.length > 0 ? (
						featuredAcademyCourses.map((course) => (
							<AcademyCourseCard
								key={course.id}
								course={course}
								categoryName={
									academyCategories.find((category) => category.id === course.categoryId)?.name
								}
							/>
						))
					) : (
						<div className='sm:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-surface px-6 py-10 text-center text-text-light'>
							目前尚無精選課程。
						</div>
					)}
				</div>
			</section>

			{/* ===== 活動分類 ===== */}
			<section className='py-18 lg:py-24 bg-surface-alt/70 border-y border-border/70'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='max-w-3xl mx-auto text-center mb-12 lg:mb-14'>
						<p className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-[0.18em] uppercase bg-primary/10 text-primary mb-4'>
							快速導覽
						</p>
						<h2 className='text-3xl sm:text-4xl font-bold text-text'>活動分類</h2>
						<p className='text-text-muted mt-3 text-base sm:text-lg'>
							把首頁中段當成導覽樞紐，依主題快速找到適合參與的校友活動與服務內容。
						</p>
					</div>

					<div className='rounded-[2rem] border border-border/80 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.28)] px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-9'>
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
									目前尚未建立活動分類。
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* ===== 行動 CTA ===== */}
			<section className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
				<div className='rounded-[2rem] overflow-hidden border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-white to-cta/[0.08] shadow-[0_24px_80px_-48px_rgba(37,99,235,0.45)]'>
					<div className='grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0'>
						<div className='px-6 py-8 sm:px-8 lg:px-10 lg:py-10 border-b lg:border-b-0 lg:border-r border-primary/10'>
							<p className='text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3'>
								立即行動
							</p>
							<h2 className='text-3xl sm:text-4xl font-bold text-text leading-tight'>
								想加入校友會，或立即參加近期活動？
							</h2>
							<p className='text-text-muted mt-4 max-w-2xl'>
								我們把最常用的兩個入口放在首頁，讓校友可以直接完成加入、聯繫與活動報名，不需要再往下找。
							</p>
							<div className='flex flex-wrap gap-3 mt-6'>
								<a
									href={joinLink}
									target={joinLinkExternal ? '_blank' : '_self'}
									rel={joinLinkExternal ? 'noreferrer' : undefined}
									className='inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors duration-200'
								>
									加入校友會
								</a>
								<AppLink
									href='/products'
									className='inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-border text-text text-sm font-semibold hover:bg-surface-alt transition-colors duration-200'
								>
									立即報名活動
								</AppLink>
								<a
									href={academyLink}
									target={academyLinkExternal ? '_blank' : '_self'}
									rel={academyLinkExternal ? 'noreferrer' : undefined}
									className='inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-border text-text text-sm font-semibold hover:bg-surface-alt transition-colors duration-200'
								>
									觀看課程影片
								</a>
							</div>
						</div>

						<div className='px-6 py-8 sm:px-8 lg:px-10 lg:py-10'>
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<div className='rounded-2xl bg-white/80 border border-primary/10 p-5'>
									<p className='text-sm font-semibold text-text'>加入校友會</p>
									<p className='text-sm text-text-muted mt-2'>
										透過粉專或聯絡入口，快速完成入會洽詢與會務聯繫。
									</p>
								</div>
								<div className='rounded-2xl bg-white/80 border border-primary/10 p-5'>
									<p className='text-sm font-semibold text-text'>活動報名</p>
									<p className='text-sm text-text-muted mt-2'>
										近期講座、聯誼、健行與會員活動都能從首頁直接進入。
									</p>
								</div>
								<div className='rounded-2xl bg-white/80 border border-primary/10 p-5'>
									<p className='text-sm font-semibold text-text'>校友學院</p>
									<p className='text-sm text-text-muted mt-2'>
										從精選課程與影音內容延伸學習，累積更多交流與知識分享。
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ===== 最新活動 ===== */}
			<section className='bg-surface-alt'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20'>
					<div className='flex items-end justify-between mb-8'>
						<div>
							<h2 className='text-2xl sm:text-3xl font-bold text-text'>最新活動</h2>
							<p className='text-text-muted mt-2'>近期發布的活動資訊與報名內容</p>
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
								目前尚無最新活動資料。
							</div>
						)}
					</div>
				</div>
			</section>
		</>
	);
}
