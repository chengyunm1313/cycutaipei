import type { SiteSnapshotPayload } from '@/lib/site-transfer/types';
import {
	getSiteTemplateDefinition,
	getSiteTemplateIndex,
	SITE_TEMPLATE_MIN_ARTICLES,
	SITE_TEMPLATE_MIN_PRODUCT_IMAGES,
	SITE_TEMPLATE_VERSION,
	type SiteTemplateArticle,
	type SiteTemplateDefinition,
	type SiteTemplateModuleType,
} from '@/lib/site-template/templates';

function buildMenus(
	baseId: number,
	now: string,
	moduleType: SiteTemplateModuleType = 'product_catalog'
) {
	const articleLabel = moduleType === 'brand_image' ? '最新消息' : '文章';
	const productLabel = moduleType === 'brand_image' ? '活動資訊' : '產品';

	return [
		{
			id: baseId + 501,
			title: '首頁',
			url: '/',
			type: 'link',
			page_id: null,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 1,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: baseId + 502,
			title: articleLabel,
			url: '/blog',
			type: 'link',
			page_id: null,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 2,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: baseId + 503,
			title: productLabel,
			url: '/products',
			type: 'link',
			page_id: null,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 3,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: baseId + 504,
			title: '關於我們',
			url: '/about',
			type: 'link',
			page_id: null,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 4,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: baseId + 505,
			title: '常見問題',
			url: '/faq',
			type: 'link',
			page_id: null,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 5,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: baseId + 506,
			title: '聯絡我們',
			url: '/contact-us',
			type: 'page',
			page_id: baseId + 601,
			position: 'top',
			parent_menu_id: null,
			custom_link: null,
			sort_order: 6,
			target: '_self',
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
	];
}

function buildContactUsPage(baseId: number, now: string) {
	return {
		id: baseId + 601,
		title: '聯絡我們',
		slug: 'contact-us',
		content_blocks: JSON.stringify([
			{
				id: 'contact-hero-1',
				type: 'hero',
				data: {
					title: '聯絡我們',
					subtitle: '我們很樂意傾聽您的聲音！不論是產品諮詢或是業務合作，請隨時與我們聯繫。',
					imageUrl:
						'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
					ctaText: '',
					ctaLink: '',
				},
			},
			{
				id: 'contact-block-1',
				type: 'text',
				data: {
					content: `
						<div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
							<div>
								<h3 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #111827;">🏢 總公司資訊</h3>
								<ul style="list-style-type: none; padding: 0; margin: 0; color: #4b5563;">
									<li style="margin-bottom: 0.5rem;"><strong>📍 地址：</strong> 台北市信義區信義路五段 7 號</li>
									<li style="margin-bottom: 0.5rem;"><strong>🕒 營業時間：</strong> 週一至週五 09:00 - 18:00 (國定假日休息)</li>
								</ul>
							</div>
							
							<div>
								<h3 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #111827;">🤝 業務與合作洽詢</h3>
								<p style="color: #4b5563; margin-bottom: 0.5rem;">針對經銷代理、大型採購或異業結盟，歡迎與我們的業務團隊聯繫：</p>
								<ul style="list-style-type: none; padding: 0; margin: 0; color: #4b5563;">
									<li style="margin-bottom: 0.5rem;"><strong>📞 業務專線：</strong> (02) 1234-5678 分機 101</li>
									<li style="margin-bottom: 0.5rem;"><strong>✉️ 業務信箱：</strong> sales@example.com</li>
								</ul>
							</div>

							<div>
								<h3 style="border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #111827;">🛠️ 技術支援與客戶服務</h3>
								<p style="color: #4b5563; margin-bottom: 0.5rem;">如您在使用產品時遇到任何問題，或需要售後服務：</p>
								<ul style="list-style-type: none; padding: 0; margin: 0; color: #4b5563;">
									<li style="margin-bottom: 0.5rem;"><strong>📞 客服專線：</strong> 0800-000-000</li>
									<li style="margin-bottom: 0.5rem;"><strong>✉️ 客服信箱：</strong> service@example.com</li>
								</ul>
							</div>
						</div>
					`,
					align: 'left',
				},
			},
		]),
		in_menu: 0,
		status: 'published',
		seo_title: '聯絡我們',
		seo_description: '歡迎與我們聯繫',
		created_at: now,
		updated_at: now,
	};
}

function buildInitialSiteContents(now: string) {
	const faqPageId = 'initial-faq-page-1';
	return [
		{
			id: 'initial-home-carousel-1',
			type: 'home_carousel',
			parent_id: null,
			title: '專業產品型錄解決方案',
			slug: null,
			summary: '歡迎使用產品型錄平台，您可以先套用主題模板，再依客戶需求快速微調內容。',
			content: null,
			image_url:
				'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			link_url: '/products',
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: 'initial-home-about-1',
			type: 'home_about',
			parent_id: null,
			title: '關於我們',
			slug: null,
			summary: '這是系統初始內容，可直接編輯或改用主題模板快速建站。',
			content:
				'<p>我們提供快速建站所需的內容骨架，包含首頁、產品、文章、關於我們與常見問題。您可依專案需求修改文字、圖片與連結。</p>',
			image_url:
				'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			link_url: '/about',
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: 'initial-about-page-1',
			type: 'about_page',
			parent_id: null,
			title: '公司簡介',
			slug: 'company-profile',
			summary: '這是預設的關於我們頁面，您可直接在後台修改內容。',
			content: null,
			image_url: null,
			link_url: null,
			extra_json: JSON.stringify({
				image2:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				image3:
					'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				content_blocks: [
					{
						id: 'about-block-1',
						type: 'hero',
						data: {
							title: '公司簡介',
							subtitle: '這是預設的關於我們頁面，您可直接在後台修改內容。',
							imageUrl:
								'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
							ctaText: '聯絡我們',
							ctaLink: '/contact-us',
						},
					},
					{
						id: 'about-block-2',
						type: 'text',
						data: {
							content:
								'<h2>歡迎使用系統初始狀態</h2><p>這份內容是可編輯的起始版本，建議依客戶品牌與產業情境更新。</p>',
							align: 'left',
						},
					},
				],
			}),
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: faqPageId,
			type: 'faq_page',
			parent_id: null,
			title: '常見問題',
			slug: 'all',
			summary: '以下為系統預設 FAQ，可直接於後台編輯。',
			content: null,
			image_url: null,
			link_url: null,
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: 'initial-faq-item-1',
			type: 'faq_item',
			parent_id: faqPageId,
			title: '如何快速開始建站？',
			slug: null,
			summary: null,
			content: '<p>可先使用「主題模板」一鍵套用，再依專案需求調整。</p>',
			image_url: null,
			link_url: null,
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: 'initial-faq-item-2',
			type: 'faq_item',
			parent_id: faqPageId,
			title: '回到初始狀態會發生什麼事？',
			slug: null,
			summary: null,
			content: '<p>系統會先下載備份，再用初始內容覆蓋全站資料。</p>',
			image_url: null,
			link_url: null,
			extra_json: null,
			sort_order: 1,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
	];
}

function buildSiteContents(definition: SiteTemplateDefinition, now: string) {
	const prefix = definition.id;
	const faqPageId = `${prefix}-faq-page-1`;

	const baseRows = [
		{
			id: `${prefix}-home-carousel-1`,
			type: 'home_carousel',
			parent_id: null,
			title: definition.hero.title,
			slug: null,
			summary: definition.hero.summary,
			content: null,
			image_url: definition.hero.imageUrl,
			link_url: definition.hero.linkUrl,
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: `${prefix}-home-about-1`,
			type: 'home_about',
			parent_id: null,
			title: definition.homeAbout.title,
			slug: null,
			summary: definition.homeAbout.summary,
			content: definition.homeAbout.content,
			image_url: definition.homeAbout.imageUrl,
			link_url: definition.homeAbout.linkUrl,
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: `${prefix}-about-page-1`,
			type: 'about_page',
			parent_id: null,
			title: definition.about.title,
			slug: definition.about.slug,
			summary: definition.about.summary,
			content: null,
			image_url: null,
			link_url: null,
			extra_json: JSON.stringify({
				image2: definition.about.image2,
				image3: definition.about.image3,
				content_blocks: [
					{
						id: 'about-block-1',
						type: 'hero',
						data: {
							title: definition.about.title,
							subtitle: definition.about.summary,
							imageUrl: definition.about.imageUrl,
							ctaText: '聯絡我們',
							ctaLink: '/contact-us',
						},
					},
					{
						id: 'about-block-2',
						type: 'text',
						data: {
							content: definition.about.content,
							align: 'left',
						},
					},
				],
			}),
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
		{
			id: faqPageId,
			type: 'faq_page',
			parent_id: null,
			title: definition.faq.title,
			slug: definition.faq.slug,
			summary: definition.faq.summary,
			content: null,
			image_url: null,
			link_url: null,
			extra_json: null,
			sort_order: 0,
			is_active: 1,
			created_at: now,
			updated_at: now,
		},
	];

	const faqRows = definition.faq.items.map((item, index) => ({
		id: `${prefix}-faq-item-${index + 1}`,
		type: 'faq_item',
		parent_id: faqPageId,
		title: item.question,
		slug: null,
		summary: null,
		content: `<p>${item.answer}</p>`,
		image_url: null,
		link_url: null,
		extra_json: null,
		sort_order: index,
		is_active: 1,
		created_at: now,
		updated_at: now,
	}));

	return [...baseRows, ...faqRows];
}

function collectUniqueNonEmptyStrings(values: Array<string | null | undefined>) {
	const list: string[] = [];
	const seen = new Set<string>();
	for (const value of values) {
		const normalized = value?.trim();
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		list.push(normalized);
	}
	return list;
}

function buildProductCarouselImages(
	definition: SiteTemplateDefinition,
	imageUrl: string,
	extraImages: string[] = []
) {
	const images = collectUniqueNonEmptyStrings([
		imageUrl,
		...extraImages,
		definition.about.image2,
		definition.about.image3,
	]);

	if (images.length === 0) return [];

	while (images.length < SITE_TEMPLATE_MIN_PRODUCT_IMAGES) {
		images.push(images[images.length - 1]);
	}

	return images.slice(0, SITE_TEMPLATE_MIN_PRODUCT_IMAGES);
}

function buildFallbackTemplateArticles(definition: SiteTemplateDefinition): SiteTemplateArticle[] {
	const categoryNames = definition.articleCategories
		.map((item) => item.name.trim())
		.filter(Boolean);
	const defaultCategories =
		categoryNames.length > 0 ? categoryNames : ['產業洞察', '產品應用', '公司消息'];
	const pickCategory = (index: number) => defaultCategories[index % defaultCategories.length];

	return [
		{
			title: `${definition.industry}導入實務：從需求盤點到上線`,
			slug: `${definition.id}-implementation-playbook`,
			excerpt: `整理 ${definition.industry}專案常見導入節點與驗收重點，協助團隊更快完成規劃。`,
			content:
				'<h2>需求盤點</h2><p>先明確目標、預算與時程，再拆解可執行里程碑。</p><h2>導入節奏</h2><p>建議先以小範圍試點驗證，確認成效後再擴大部署。</p>',
			category: pickCategory(0),
			coverImageUrl: definition.hero.imageUrl,
		},
		{
			title: `${definition.subcategory}選型指南：評估重點與採購建議`,
			slug: `${definition.id}-selection-guide`,
			excerpt: `彙整 ${definition.subcategory}常見選型原則，幫助快速比較可行方案。`,
			content:
				'<h2>選型原則</h2><p>建議從使用情境、維護成本與供應穩定性三面向評估。</p><h2>採購建議</h2><p>建立規格與驗收標準，可有效降低溝通與返工成本。</p>',
			category: pickCategory(1),
			coverImageUrl: definition.homeAbout.imageUrl,
		},
		{
			title: `${definition.siteName}案例分享：流程優化的三個做法`,
			slug: `${definition.id}-case-study`,
			excerpt: '透過標準化流程與節點管理，提升專案交付穩定度與執行效率。',
			content:
				'<h2>標準化流程</h2><p>用固定模板管理需求、規格與時程，降低溝通落差。</p><h2>持續優化</h2><p>定期回顧關鍵指標，逐步提升交付效率與品質。</p>',
			category: pickCategory(2),
			coverImageUrl: definition.about.image2,
		},
		{
			title: `${definition.subcategory}常見問題整理：導入前必看`,
			slug: `${definition.id}-faq-highlights`,
			excerpt: '整理客戶最常詢問的導入、維護與合作問題，快速完成前期評估。',
			content:
				'<h2>導入準備</h2><p>建議先盤點現況資料與目標成效，讓規劃更具體。</p><h2>合作建議</h2><p>明確責任分工與檢核節點，可降低執行風險。</p>',
			category: pickCategory(0),
			coverImageUrl: definition.about.image3,
		},
		{
			title: `${definition.industry}產業趨勢解析：未來三年的關鍵發展`,
			slug: `${definition.id}-industry-trends`,
			excerpt: `從市場數據與客戶回饋，盤點 ${definition.industry}未來的發展方向與機會。`,
			content:
				'<h2>自動化與數位轉型</h2><p>提高營運效率已是各個產業的共同目標，及早評估能取得市場先機。</p><h2>合規與永續發展</h2><p>因應法規要求與市場趨勢，將永續目標納入長期發展策略。</p>',
			category: pickCategory(1),
			coverImageUrl: definition.hero.imageUrl,
		},
		{
			title: `為何選擇${definition.siteName}？三大核心服務優勢`,
			slug: `${definition.id}-core-advantages`,
			excerpt: `深入了解 ${definition.siteName}的技術能量與服務優勢，為您打造最佳解決方案。`,
			content:
				'<h2>專業團隊支援</h2><p>具備豐富的產業經驗與專案執行能力，確保每項交付皆達高品質要求。</p><h2>客製化彈性</h2><p>針對不同應用場景，提供靈活的配套方案與長遠的技術支援。</p>',
			category: pickCategory(2),
			coverImageUrl: definition.homeAbout.imageUrl,
		},
	];
}

function buildTemplateArticles(definition: SiteTemplateDefinition) {
	const normalizedBase = definition.articles
		.map((item) => ({
			...item,
			title: item.title.trim(),
			slug: item.slug.trim(),
			excerpt: item.excerpt.trim(),
			category: item.category.trim(),
		}))
		.filter((item) => item.title && item.slug);

	const articles: SiteTemplateArticle[] = [];
	const seenSlugs = new Set<string>();
	for (const item of normalizedBase) {
		if (seenSlugs.has(item.slug)) continue;
		seenSlugs.add(item.slug);
		articles.push(item);
	}

	if (articles.length >= SITE_TEMPLATE_MIN_ARTICLES) return articles;

	for (const fallback of buildFallbackTemplateArticles(definition)) {
		if (articles.length >= SITE_TEMPLATE_MIN_ARTICLES) break;
		if (seenSlugs.has(fallback.slug)) continue;
		seenSlugs.add(fallback.slug);
		articles.push(fallback);
	}

	return articles;
}

export function buildInitialSiteSnapshot(
	exportedAt = new Date().toISOString()
): SiteSnapshotPayload {
	const baseId = 9900;
	return {
		version: `${SITE_TEMPLATE_VERSION}-initial`,
		exportedAt,
		data: {
			site_settings: {
				id: 1,
				site_name: '產品型錄平台',
				site_title: '產品型錄平台',
				logo_url: null,
				footer_logo_url: null,
				favicon_url: null,
				social_share_image_url: null,
				meta_description: '企業產品型錄與內容管理系統',
				meta_keywords: '產品型錄,CMS,企業網站',
				updated_at: exportedAt,
			},
			categories: [],
			products: [],
			articles: [],
			article_categories: [
				{
					id: baseId + 301,
					name: '技術分享',
					slug: 'tech-share',
					sort_order: 0,
					is_active: 1,
					created_at: exportedAt,
				},
				{
					id: baseId + 302,
					name: '產業動態',
					slug: 'industry-trends',
					sort_order: 1,
					is_active: 1,
					created_at: exportedAt,
				},
				{
					id: baseId + 303,
					name: '公司新聞',
					slug: 'company-news',
					sort_order: 2,
					is_active: 1,
					created_at: exportedAt,
				},
			],
			tags: [],
			pages: [buildContactUsPage(baseId, exportedAt)],
			menus: buildMenus(baseId, exportedAt),
			site_contents: buildInitialSiteContents(exportedAt),
		},
	};
}

export function buildSiteTemplateSnapshot(
	templateId: string,
	exportedAt = new Date().toISOString()
): SiteSnapshotPayload | null {
	const definition = getSiteTemplateDefinition(templateId);
	if (!definition) return null;
	const templateIndex = getSiteTemplateIndex(templateId);
	if (templateIndex < 0) return null;
	const baseId = (templateIndex + 1) * 1000;

	const categories = definition.categories.map((item, index) => ({
		id: baseId + index + 1,
		name: item.name,
		slug: item.slug,
		description: item.description,
		image: item.imageUrl,
		cover_image: item.imageUrl,
		carousel_images: JSON.stringify([item.imageUrl]),
		sort_order: index,
		is_active: 1,
		parent_id: null,
		created_at: exportedAt,
	}));

	const categoryIdBySlug = new Map(categories.map((item) => [item.slug, item.id]));

	const products = definition.products.map((item, index) => {
		const productImages = buildProductCarouselImages(
			definition,
			item.imageUrl,
			item.carouselImageUrls || []
		);

		return {
			id: baseId + 101 + index,
			name: item.name,
			slug: item.slug,
			description: item.description,
			content: item.content,
			price: null,
			category_id: categoryIdBySlug.get(item.categorySlug) || null,
			subcategory_id: null,
			keywords: item.keywords,
			purchase_link: null,
			catalog_link: `/product/${item.slug}`,
			intro_video_url: null,
			list_image: item.imageUrl,
			images: JSON.stringify(productImages),
			specs: JSON.stringify(item.specs),
			is_featured: item.isFeatured ? 1 : 0,
			sort_order: index,
			status: 'published',
			created_at: exportedAt,
		};
	});

	const templateArticles = buildTemplateArticles(definition);
	const articles = templateArticles.map((item, index) => ({
		id: baseId + 201 + index,
		title: item.title,
		slug: item.slug,
		excerpt: item.excerpt,
		content: item.content,
		cover_image: item.coverImageUrl,
		category: item.category,
		author: '系統模板',
		status: 'published',
		seo_title: item.title,
		seo_description: item.excerpt,
		created_at: exportedAt,
		updated_at: exportedAt,
	}));

	const articleCategories = definition.articleCategories.map((item, index) => ({
		id: baseId + 301 + index,
		name: item.name,
		slug: item.slug,
		sort_order: index,
		is_active: 1,
		created_at: exportedAt,
	}));

	const tags = definition.tags.map((item, index) => ({
		id: baseId + 401 + index,
		name: item.name,
		slug: item.slug,
		created_at: exportedAt,
	}));

	return {
		version: SITE_TEMPLATE_VERSION,
		exportedAt,
		data: {
			site_settings: {
				id: 1,
				site_name: definition.siteName,
				site_title: definition.siteTitle,
				logo_url: null,
				footer_logo_url: null,
				favicon_url: null,
				social_share_image_url: definition.hero.imageUrl,
				meta_description: definition.metaDescription,
				meta_keywords: definition.tags.map((item) => item.name).join(','),
				updated_at: exportedAt,
			},
			categories,
			products,
			articles,
			article_categories: articleCategories,
			tags,
			pages: [buildContactUsPage(baseId, exportedAt)],
			menus: buildMenus(baseId, exportedAt, definition.moduleType),
			site_contents: buildSiteContents(definition, exportedAt),
		},
	};
}
