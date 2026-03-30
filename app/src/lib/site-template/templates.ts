export interface SiteTemplateCategory {
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
}

export interface SiteTemplateProduct {
	name: string;
	slug: string;
	categorySlug: string;
	description: string;
	content: string;
	keywords: string;
	specs: Record<string, string>;
	imageUrl: string;
	carouselImageUrls?: string[];
	isFeatured?: boolean;
}

export interface SiteTemplateArticle {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	category: string;
	coverImageUrl: string;
}

export interface SiteTemplateFaqItem {
	question: string;
	answer: string;
}

export interface SiteTemplateSummary {
	site_settings: number;
	categories: number;
	products: number;
	articles: number;
	article_categories: number;
	tags: number;
	pages: number;
	menus: number;
	site_contents: number;
	site_contents_breakdown: {
		home_carousel: number;
		home_about: number;
		about_page: number;
		faq_page: number;
		contact_page: number;
		faq_item: number;
	};
}

export type SiteTemplateModuleType = 'product_catalog' | 'brand_image';

export interface SiteTemplateMeta {
	id: string;
	moduleType: SiteTemplateModuleType;
	industry: string;
	subcategory: string;
	label: string;
	description: string;
	summary: SiteTemplateSummary;
}

export interface SiteTemplateDefinition extends SiteTemplateMeta {
	siteName: string;
	siteTitle: string;
	metaDescription: string;
	hero: {
		title: string;
		summary: string;
		imageUrl: string;
		linkUrl: string;
	};
	homeAbout: {
		title: string;
		summary: string;
		content: string;
		imageUrl: string;
		linkUrl: string;
	};
	about: {
		title: string;
		slug: string;
		summary: string;
		content: string;
		imageUrl: string;
		image2: string;
		image3: string;
		linkUrl?: string;
	};
	faq: {
		title: string;
		slug: string;
		summary: string;
		items: SiteTemplateFaqItem[];
	};
	categories: SiteTemplateCategory[];
	products: SiteTemplateProduct[];
	articles: SiteTemplateArticle[];
	articleCategories: Array<{ name: string; slug: string }>;
	tags: Array<{ name: string; slug: string }>;
}

export const SITE_TEMPLATE_VERSION = '1.0.0-template';
export const SITE_TEMPLATE_MIN_PRODUCT_IMAGES = 3;
export const SITE_TEMPLATE_MIN_ARTICLES = 6;

const ARTICLE_CATEGORIES = [
	{ name: '產業洞察', slug: 'industry-insights' },
	{ name: '產品應用', slug: 'product-application' },
	{ name: '公司消息', slug: 'company-news' },
] as const;

const BRAND_ARTICLE_CATEGORIES = [
	{ name: '最新消息', slug: 'latest-news' },
	{ name: '活動報導', slug: 'event-report' },
	{ name: '組織公告', slug: 'organization-announcement' },
] as const;

function buildSummary(
	definition: Pick<
		SiteTemplateDefinition,
		'categories' | 'products' | 'articles' | 'articleCategories' | 'tags' | 'faq'
	>
): SiteTemplateSummary {
	const faqItemCount = definition.faq.items.length;
	const siteContentsCount = 1 + 1 + 1 + 1 + 1 + faqItemCount;
	return {
		site_settings: 1,
		categories: definition.categories.length,
		products: definition.products.length,
		articles: Math.max(definition.articles.length, SITE_TEMPLATE_MIN_ARTICLES),
		article_categories: definition.articleCategories.length,
		tags: definition.tags.length,
		pages: 1,
		menus: 6,
		site_contents: siteContentsCount,
		site_contents_breakdown: {
			home_carousel: 1,
			home_about: 1,
			about_page: 1,
			faq_page: 1,
			contact_page: 1,
			faq_item: faqItemCount,
		},
	};
}

const TEMPLATE_SEEDS: Omit<SiteTemplateDefinition, 'summary'>[] = [
	{
		id: 'manufacturing-industrial-equipment',
		moduleType: 'product_catalog',
		industry: '製造業',
		subcategory: '工業設備',
		label: '製造業 / 工業設備',
		description: '適合工廠自動化、設備代理與工業維保型錄網站。',
		siteName: '宏鈦工業設備型錄',
		siteTitle: '宏鈦工業設備整合服務',
		metaDescription: '提供工廠自動化設備、檢測模組與維保方案，協助產線穩定升級。',
		hero: {
			title: '打造穩定高效的智慧工廠產線',
			summary: '從自動化設備到品質檢測與維保，快速導入符合產線需求的工業解決方案。',
			imageUrl:
				'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於宏鈦工業設備',
			summary: '深耕製造現場導入，協助客戶提升產能、穩定良率並降低維護成本。',
			content:
				'<p>我們專注於工廠自動化與設備整合，提供從評估、選型到導入維護的一站式服務。團隊具備跨設備、跨產線整合經驗，可快速建立標準化導入流程。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '公司簡介',
			slug: 'company-profile',
			summary: '以設備整合與售後服務，成為製造業長期合作夥伴。',
			content:
				'<h2>我們的使命</h2><p>協助製造業以更低風險完成設備升級與產線優化。</p><h2>服務項目</h2><p>設備代理、客製治具、技術訓練、維護保養與備品管理。</p>',
			imageUrl:
				'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '工業設備常見問題',
			slug: 'all',
			summary: '導入流程、交期與售後服務常見問題。',
			items: [
				{
					question: '設備導入前需要準備哪些資料？',
					answer: '建議先提供目前產線流程、產量目標、現有設備清單與預算區間，以利快速評估。',
				},
				{
					question: '是否提供現場勘查與導入規劃？',
					answer: '提供。專案啟動後可安排現場勘查，並提出設備配置與工序串接建議。',
				},
				{
					question: '交期通常需要多久？',
					answer: '標準設備約 2 至 6 週，客製化專案依整合難度約 6 至 12 週。',
				},
				{
					question: '是否提供教育訓練？',
					answer: '提供操作與維護訓練，並可依班別安排現場教學與操作手冊。',
				},
				{
					question: '保固與維修怎麼計算？',
					answer: '設備標準保固一年，另可選擇延長保固與年度維護合約。',
				},
				{
					question: '可否分階段導入？',
					answer: '可以，常見做法為先導入關鍵工站，再依成效擴展至全線。',
				},
			],
		},
		categories: [
			{
				name: '自動化設備',
				slug: 'automation-equipment',
				description: '提升產線效率與穩定度的核心設備。',
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '檢測與量測',
				slug: 'inspection-measurement',
				description: '品質檢測與製程監控解決方案。',
				imageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '維修保養耗材',
				slug: 'maintenance-supplies',
				description: '維保工具、耗材與備品管理。',
				imageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '高速伺服驅動模組 A1',
				slug: 'servo-drive-a1',
				categorySlug: 'automation-equipment',
				description: '高精度定位控制，適合高速組裝線。',
				content: '<p>支援多軸同步控制，搭配即時監控介面，縮短調機時間。</p>',
				keywords: '伺服,驅動,自動化',
				specs: { 輸入電壓: '220V', 最大輸出: '3kW', 通訊介面: 'EtherCAT' },
				imageUrl:
					'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '六軸搬運機械手臂 M6',
				slug: 'robot-arm-m6',
				categorySlug: 'automation-equipment',
				description: '穩定搬運與點位重複精度，適用多工站串接。',
				content: '<p>支援視覺定位模組，可快速整合包裝與分揀流程。</p>',
				keywords: '機械手臂,搬運,自動化',
				specs: { 負載能力: '12kg', 臂展: '1450mm', 重複精度: '±0.03mm' },
				imageUrl:
					'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '線上瑕疵檢測相機 V2',
				slug: 'vision-camera-v2',
				categorySlug: 'inspection-measurement',
				description: 'AI 視覺檢測，支援多樣缺陷判讀。',
				content: '<p>可即時輸出檢測報表，降低人工目檢誤差。</p>',
				keywords: '視覺檢測,相機,品檢',
				specs: { 解析度: '12MP', 影格率: '120fps', 防護等級: 'IP54' },
				imageUrl:
					'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '數位扭力量測器 TQ-50',
				slug: 'torque-meter-tq50',
				categorySlug: 'inspection-measurement',
				description: '快速量測扭力值，提升鎖附品質一致性。',
				content: '<p>提供 USB 匯出與歷史紀錄追蹤，利於品質追溯。</p>',
				keywords: '扭力,量測,品質',
				specs: { 量測範圍: '0.1-50 N.m', 精度: '±0.5%', 顯示: 'OLED' },
				imageUrl:
					'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '工業潤滑維護組 ML-10',
				slug: 'maintenance-lubrication-ml10',
				categorySlug: 'maintenance-supplies',
				description: '延長設備壽命的定期潤滑與清潔方案。',
				content: '<p>包含常用維保耗材組，適合建立定期保養制度。</p>',
				keywords: '維修,潤滑,保養',
				specs: { 適用設備: '輸送/滾輪/軸承', 內容物: '10件組', 保存期限: '24個月' },
				imageUrl:
					'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '備品管理標準箱 SP-40',
				slug: 'spare-parts-box-sp40',
				categorySlug: 'maintenance-supplies',
				description: '零件分類與快速取用，提高維修效率。',
				content: '<p>可搭配條碼標籤，讓備品盤點與補貨更即時。</p>',
				keywords: '備品,倉儲,維保',
				specs: { 容量: '40L', 分格數: '12格', 材質: '耐衝擊 PP' },
				imageUrl:
					'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '工廠自動化導入前的 5 個評估重點',
				slug: 'factory-automation-5-checkpoints',
				excerpt: '從產線瓶頸到 ROI 指標，整理導入自動化前必看的評估框架。',
				content: '<h2>先找出產線瓶頸</h2><p>建議先以節拍時間、良率與停機原因建立改善優先序。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '視覺檢測系統如何縮短品檢週期',
				slug: 'vision-inspection-cycle-optimization',
				excerpt: '透過線上檢測與異常回饋，降低人力負擔並穩定產品品質。',
				content: '<h2>建立即時回饋機制</h2><p>將檢測結果回饋到工站參數，可大幅降低重工比例。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '自動化', slug: 'automation' },
			{ name: '設備整合', slug: 'equipment-integration' },
			{ name: '品檢', slug: 'quality-inspection' },
			{ name: '維護保養', slug: 'maintenance' },
			{ name: '工業 4.0', slug: 'industry-4' },
			{ name: '產線升級', slug: 'production-upgrade' },
		],
	},
	{
		id: 'beauty-health-supplements-brand-catalog',
		moduleType: 'product_catalog',
		industry: '美妝',
		subcategory: '保健食品（品牌型錄）',
		label: '美妝 / 保健食品（品牌型錄）',
		description: '適合品牌官網型錄，快速展示主打商品、成分與品牌故事。',
		siteName: '沐采美妍品牌型錄',
		siteTitle: '沐采美妍｜保健與美容品牌型錄',
		metaDescription: '整合美妝與保健產品資訊，協助品牌快速建立線上型錄與內容行銷。',
		hero: {
			title: '打造品牌型錄，讓產品價值被看見',
			summary: '以清晰的產品分類、主打特色與內容行銷，強化品牌信任與轉換。',
			imageUrl:
				'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於沐采美妍',
			summary: '以科學配方與品牌美學為核心，持續打造值得信賴的日常保養選擇。',
			content:
				'<p>我們結合配方研發與品牌設計，建立從產品教育到型錄展示的一致體驗，協助消費者快速理解產品價值與適用族群。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '品牌故事',
			slug: 'brand-story',
			summary: '從原料溯源到配方開發，堅持透明且可追溯的品牌承諾。',
			content:
				'<h2>品牌理念</h2><p>以日常可持續的保養哲學，讓每個人都能安心使用。</p><h2>品質流程</h2><p>嚴選原料、第三方檢驗、明確標示，建立長期信任。</p>',
			imageUrl:
				'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '品牌型錄常見問題',
			slug: 'all',
			summary: '常見購買、使用方式與成分問題。',
			items: [
				{
					question: '如何選擇適合自己的產品？',
					answer: '可先依肌膚/體質需求篩選，再參考成分、建議使用方式與注意事項。',
				},
				{
					question: '是否提供成分與檢驗資訊？',
					answer: '每項產品頁面皆可放置成分與檢驗報告摘要，方便快速查閱。',
				},
				{
					question: '產品是否可搭配使用？',
					answer: '可以，建議依照早晚與品項功效分層使用，降低刺激風險。',
				},
				{
					question: '多久能看到使用效果？',
					answer: '保養品建議至少持續 2 至 4 週，保健品建議依標示持續補充。',
				},
				{
					question: '孕婦或特殊體質可使用嗎？',
					answer: '建議先諮詢專業醫師，並詳閱產品標示與禁忌成分。',
				},
				{
					question: '品牌是否提供合作代工？',
					answer: '可支援 ODM/OEM 洽詢，含打樣、包裝與上市規劃。',
				},
			],
		},
		categories: [
			{
				name: '保養系列',
				slug: 'skincare-series',
				description: '日常清潔、保濕與修護產品。',
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '保健系列',
				slug: 'health-supplement-series',
				description: '日常營養補給與機能保健。',
				imageUrl:
					'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '品牌禮盒',
				slug: 'gift-set-series',
				description: '節慶與企業送禮的組合方案。',
				imageUrl:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '胺基酸潔顏慕斯',
				slug: 'amino-cleanser-mousse',
				categorySlug: 'skincare-series',
				description: '溫和清潔、維持肌膚水潤平衡。',
				content: '<p>細緻泡沫帶走多餘油脂，適合日常早晚清潔。</p>',
				keywords: '潔顏,胺基酸,保養',
				specs: { 容量: '150ml', 適用膚質: '全膚質', 主要成分: '胺基酸界面活性劑' },
				imageUrl:
					'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '玻尿酸修護精華',
				slug: 'hyaluronic-repair-serum',
				categorySlug: 'skincare-series',
				description: '高效保濕與舒緩，強化肌膚屏障。',
				content: '<p>質地清爽不黏膩，適合妝前與夜間保養。</p>',
				keywords: '精華液,保濕,修護',
				specs: { 容量: '30ml', 質地: '水凝精華', 使用時機: '早晚皆可' },
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '膠原亮妍飲',
				slug: 'collagen-beauty-drink',
				categorySlug: 'health-supplement-series',
				description: '補充膠原蛋白與維生素，維持日常好氣色。',
				content: '<p>獨立包裝設計，外出攜帶方便。</p>',
				keywords: '膠原蛋白,保健飲,美容',
				specs: { 規格: '10入/盒', 主要成分: '膠原蛋白胜肽', 建議食用: '每日1包' },
				imageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '晶透葉黃素膠囊',
				slug: 'lutein-capsules',
				categorySlug: 'health-supplement-series',
				description: '提供日常營養補給，維持晶亮活力。',
				content: '<p>搭配玉米黃素與維生素 E，適合長時間用眼族群。</p>',
				keywords: '葉黃素,保健,營養',
				specs: { 規格: '60顆', 主要成分: '葉黃素+玉米黃素', 建議食用: '每日2顆' },
				imageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '輕奢保養旅行組',
				slug: 'premium-travel-kit',
				categorySlug: 'gift-set-series',
				description: '旅行外出的一站式保養組合。',
				content: '<p>收錄清潔、化妝水與精華，適合短期旅行。</p>',
				keywords: '旅行組,禮盒,保養',
				specs: { 件數: '5件組', 包裝: '防潑收納袋', 適用情境: '旅行/出差' },
				imageUrl:
					'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '品牌經典節慶禮盒',
				slug: 'classic-festival-gift-box',
				categorySlug: 'gift-set-series',
				description: '企業贈禮與節慶檔期主打方案。',
				content: '<p>可搭配客製卡片與包裝，提升品牌辨識。</p>',
				keywords: '節慶禮盒,企業贈禮,品牌',
				specs: { 內容物: '精華+保健飲', 客製服務: 'LOGO/卡片', MOQ: '100盒' },
				imageUrl:
					'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '品牌型錄官網該如何規劃內容架構？',
				slug: 'brand-catalog-content-architecture',
				excerpt: '用首頁、產品頁與 FAQ 三層架構，快速建立可轉換的品牌網站。',
				content: '<h2>首頁先說價值</h2><p>先讓訪客知道品牌差異，再引導到產品分類與重點內容。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '如何把保健品特色寫成好懂的產品頁',
				slug: 'supplement-product-page-writing',
				excerpt: '從成分、適用族群到建議食用方式，建立清晰且可信的資訊表達。',
				content: '<h2>先寫適用族群</h2><p>再補上成分來源與食用建議，能有效提升閱讀完成率。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '保養', slug: 'skin-care' },
			{ name: '保健', slug: 'health-care' },
			{ name: '品牌型錄', slug: 'brand-catalog' },
			{ name: '成分解析', slug: 'ingredient-analysis' },
			{ name: '美妝趨勢', slug: 'beauty-trend' },
			{ name: '禮盒方案', slug: 'gift-solution' },
		],
	},
	{
		id: 'building-materials-construction-company',
		moduleType: 'product_catalog',
		industry: '建材',
		subcategory: '建設公司',
		label: '建材 / 建設公司',
		description: '適合建材供應商與建設公司展示材料、案例與施工流程。',
		siteName: '鼎曜建材工程型錄',
		siteTitle: '鼎曜建材工程｜建材與施工整合',
		metaDescription: '提供建材產品、工程案例與技術服務，協助建案穩定推進。',
		hero: {
			title: '建材與工程整合，一站式完成',
			summary: '從材料選型到工程落地，兼顧品質、工期與預算控管。',
			imageUrl:
				'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於鼎曜建材工程',
			summary: '多年建案執行經驗，提供從規格建議到施工管理的完整服務。',
			content:
				'<p>團隊擅長建材選型、現場協調與工程節點管理，確保每個案場在預期工期內穩定交付。</p>',
			imageUrl:
				'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '工程團隊介紹',
			slug: 'team-introduction',
			summary: '以標準化流程與透明管理，提升工程交付品質。',
			content:
				'<h2>專案流程</h2><p>需求盤點、材料建議、施工排程、品質查核與驗收。</p><h2>服務承諾</h2><p>以可追溯的工務紀錄，降低溝通成本與返工風險。</p>',
			imageUrl:
				'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '建材與工程常見問題',
			slug: 'all',
			summary: '報價、交期與施工配合常見問題。',
			items: [
				{
					question: '如何選擇合適的建材規格？',
					answer: '會依建案用途、預算與法規條件提供 2 至 3 套建議方案。',
				},
				{
					question: '是否提供樣品與測試資料？',
					answer: '可提供樣品、規格書與檢測報告，協助設計端與業主評估。',
				},
				{
					question: '建材交期如何安排？',
					answer: '標準品約 1 至 3 週，特殊客製品依工廠排程約 4 至 8 週。',
				},
				{
					question: '可以協助現場施工管理嗎？',
					answer: '可安排工務人員進場協調，提供安裝建議與品質檢核。',
				},
				{
					question: '售後保固如何計算？',
					answer: '依建材類型提供對應保固年限，並有維修與保養方案可選。',
				},
				{
					question: '可否支援跨縣市工程？',
					answer: '可以，已建立北中南合作施工網絡，可彈性調度。',
				},
			],
		},
		categories: [
			{
				name: '外牆與防水',
				slug: 'facade-waterproofing',
				description: '外牆材料與防水工程系統。',
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '室內建材',
				slug: 'interior-materials',
				description: '地坪、牆面與天花板建材。',
				imageUrl:
					'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '工程配套',
				slug: 'construction-support',
				description: '工地管理與配套施作工具。',
				imageUrl:
					'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '高彈性外牆防水塗層 W1',
				slug: 'waterproof-coating-w1',
				categorySlug: 'facade-waterproofing',
				description: '適用新建案與舊屋翻修的外牆防水方案。',
				content: '<p>具抗 UV 與高附著特性，可延長外牆維護週期。</p>',
				keywords: '防水,外牆,塗層',
				specs: { 包裝: '20kg/桶', 延展率: '250%', 適用基材: '水泥/磁磚' },
				imageUrl:
					'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '透氣防霉底漆 P2',
				slug: 'anti-mold-primer-p2',
				categorySlug: 'facade-waterproofing',
				description: '降低壁癌與發霉風險，提升塗層附著。',
				content: '<p>適合潮濕環境牆面翻修前打底。</p>',
				keywords: '底漆,防霉,翻修',
				specs: { 包裝: '18L', 乾燥時間: '2小時', 覆蓋率: '每桶約90㎡' },
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '耐磨 SPC 地板系列',
				slug: 'spc-flooring-series',
				categorySlug: 'interior-materials',
				description: '商辦與住宅常用的耐磨地坪方案。',
				content: '<p>鎖扣式安裝效率高，維護成本低。</p>',
				keywords: '地板,SPC,室內建材',
				specs: { 厚度: '5mm', 耐磨等級: 'AC4', 表面處理: 'UV Coating' },
				imageUrl:
					'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '吸音天花板模組 C3',
				slug: 'acoustic-ceiling-c3',
				categorySlug: 'interior-materials',
				description: '改善空間回音，提升會議與教學品質。',
				content: '<p>提供多尺寸模組，可快速完成大面積安裝。</p>',
				keywords: '吸音,天花板,建材',
				specs: { NRC: '0.85', 尺寸: '600x600mm', 防火等級: 'Class A' },
				imageUrl:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '工地圍籬快速安裝組',
				slug: 'site-fence-kit',
				categorySlug: 'construction-support',
				description: '提高工地安全與動線管理效率。',
				content: '<p>模組化設計，可重複拆裝與跨案場使用。</p>',
				keywords: '工地,圍籬,安全',
				specs: { 單片寬度: '2m', 材質: '鍍鋅鋼材', 耐候性: '戶外等級' },
				imageUrl:
					'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '工程進度看板套件',
				slug: 'project-kanban-kit',
				categorySlug: 'construction-support',
				description: '現場進度透明化，提升跨單位溝通效率。',
				content: '<p>支援每日工項更新與責任區標示。</p>',
				keywords: '工程管理,看板,工務',
				specs: { 尺寸: '120x240cm', 材質: '磁吸白板', 配件: '磁條/標籤' },
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '建材選型常見的三個成本盲點',
				slug: 'construction-material-cost-blindspots',
				excerpt: '從初期採購到維護週期，解析建材成本的完整計算方式。',
				content: '<h2>看總持有成本</h2><p>不只看初期單價，應納入施工效率與後續維護成本。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '外牆防水施工如何降低返工機率',
				slug: 'waterproofing-rework-reduction',
				excerpt: '材料選擇與施工節點管理，是降低返工的兩大關鍵。',
				content: '<h2>先做基面檢查</h2><p>確認含水率與裂縫狀況，再進行底塗與主塗層施工。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '建材', slug: 'construction-materials' },
			{ name: '防水', slug: 'waterproofing' },
			{ name: '室內裝修', slug: 'interior-design' },
			{ name: '工程管理', slug: 'project-management' },
			{ name: '工地安全', slug: 'site-safety' },
			{ name: '案例分享', slug: 'case-study' },
		],
	},
	{
		id: 'medical-devices-medical-supplies',
		moduleType: 'product_catalog',
		industry: '醫療器材',
		subcategory: '醫療用品',
		label: '醫療器材 / 醫療用品',
		description: '適合醫療器材代理、耗材供應與 B2B 採購展示。',
		siteName: '康睿醫療器材型錄',
		siteTitle: '康睿醫療器材｜專業醫療用品供應',
		metaDescription: '提供醫療器材與醫療耗材型錄，支援院所採購與專業諮詢。',
		hero: {
			title: '專業醫療用品，穩定供應到位',
			summary: '涵蓋診療設備、檢測耗材與院所配套，協助醫療單位快速採購。',
			imageUrl:
				'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於康睿醫療',
			summary: '專注醫療器材與耗材供應管理，重視品質、追溯與交付效率。',
			content:
				'<p>我們提供醫療器材選型建議、採購支援與售後服務，協助院所建立穩定且可追溯的供應流程。</p>',
			imageUrl:
				'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '服務與品質',
			slug: 'service-quality',
			summary: '以標準化流程管理醫療產品供應，確保院所採購安心。',
			content:
				'<h2>供應流程</h2><p>需求確認、品項建議、批次追蹤與售後支援。</p><h2>品質管理</h2><p>提供產品證明文件與批次管理機制，確保採購可追溯。</p>',
			imageUrl:
				'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '醫療器材常見問題',
			slug: 'all',
			summary: '採購、文件與售後支援常見問題。',
			items: [
				{
					question: '是否提供醫療器材文件與證明？',
					answer: '可依產品提供合規文件、規格書與批次資訊。',
				},
				{ question: '大量採購是否有專案價格？', answer: '可依採購量與合作期間提供專案報價。' },
				{
					question: '交貨週期通常多久？',
					answer: '常備品可於 3 至 7 天交付，特殊品項依供應狀況調整。',
				},
				{ question: '是否提供教育訓練？', answer: '提供基本操作說明，必要時可安排原廠技術支援。' },
				{ question: '耗材可否定期配送？', answer: '可建立固定配送排程，降低缺料風險。' },
				{
					question: '售後維修流程為何？',
					answer: '收到報修後會先遠端排查，再安排到場檢修或返廠處理。',
				},
			],
		},
		categories: [
			{
				name: '診療設備',
				slug: 'diagnostic-equipment',
				description: '基礎診療與監測設備。',
				imageUrl:
					'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '檢測耗材',
				slug: 'testing-consumables',
				description: '日常檢測與實驗耗材。',
				imageUrl:
					'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '院所配套用品',
				slug: 'hospital-supplies',
				description: '病房與院所日常配套用品。',
				imageUrl:
					'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '多參數生理監測儀 PM-8',
				slug: 'patient-monitor-pm8',
				categorySlug: 'diagnostic-equipment',
				description: '即時監測生命徵象，適用門診與病房。',
				content: '<p>整合心電、血氧與血壓監測，介面直覺易操作。</p>',
				keywords: '監測儀,醫療設備,病房',
				specs: { 顯示器: '12 吋', 監測項目: 'ECG/SpO2/NIBP', 供電: 'AC+電池' },
				imageUrl:
					'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '可攜式超音波探頭 US-3',
				slug: 'portable-ultrasound-us3',
				categorySlug: 'diagnostic-equipment',
				description: '移動檢查更便利，提升現場診療效率。',
				content: '<p>支援平板連接與即時影像存檔。</p>',
				keywords: '超音波,探頭,可攜式',
				specs: { 連線: 'USB-C', 成像模式: 'B/M 模式', 重量: '280g' },
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '拋棄式檢測試劑盒 DT-20',
				slug: 'disposable-test-kit-dt20',
				categorySlug: 'testing-consumables',
				description: '快速檢測流程，適合高頻率使用情境。',
				content: '<p>單支包裝，便於控管使用與保存。</p>',
				keywords: '試劑,檢測,耗材',
				specs: { 規格: '20入', 保存條件: '2-30°C', 包裝: '單支無菌' },
				imageUrl:
					'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '採樣拭子套組 SW-100',
				slug: 'sampling-swab-sw100',
				categorySlug: 'testing-consumables',
				description: '採樣流程標準化，降低污染風險。',
				content: '<p>提供完整採樣配件，利於快速作業。</p>',
				keywords: '採樣,拭子,醫療耗材',
				specs: { 規格: '100支/盒', 材質: '醫療級纖維', 包裝: '獨立包裝' },
				imageUrl:
					'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '醫療級防護手套 G-Blue',
				slug: 'medical-gloves-gblue',
				categorySlug: 'hospital-supplies',
				description: '高彈性防護手套，適合長時間配戴。',
				content: '<p>強化耐拉伸與貼合度，提升操作舒適性。</p>',
				keywords: '手套,防護,醫療用品',
				specs: { 材質: '丁腈', 規格: '100入/盒', 尺寸: 'S/M/L' },
				imageUrl:
					'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '病房清潔消毒組 DC-5',
				slug: 'ward-disinfection-dc5',
				categorySlug: 'hospital-supplies',
				description: '日常清潔與消毒流程標準套件。',
				content: '<p>可搭配院所清潔 SOP 使用，提升環境維護效率。</p>',
				keywords: '消毒,清潔,病房',
				specs: { 套件內容: '5件組', 適用場域: '病房/門診', 保存期限: '18個月' },
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '醫療耗材採購如何兼顧成本與品質',
				slug: 'medical-supply-procurement-balance',
				excerpt: '建立分級採購與追溯制度，降低斷貨與品質爭議。',
				content: '<h2>先建立品項分級</h2><p>依使用頻率與風險等級，制定不同採購策略。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '院所導入可攜式設備的三個重點',
				slug: 'portable-device-adoption-checklist',
				excerpt: '從訓練、資料管理到維護計畫，提升新設備導入成功率。',
				content: '<h2>先做流程盤點</h2><p>明確設備使用場景與責任分工，才能降低導入阻力。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '醫療器材', slug: 'medical-device' },
			{ name: '醫療耗材', slug: 'medical-consumables' },
			{ name: '院所採購', slug: 'hospital-procurement' },
			{ name: '品質追溯', slug: 'quality-traceability' },
			{ name: '臨床應用', slug: 'clinical-application' },
			{ name: '供應管理', slug: 'supply-management' },
		],
	},
	{
		id: 'traditional-industry-textile-footwear-plastic-injection',
		moduleType: 'product_catalog',
		industry: '傳統產業',
		subcategory: '布料 / 鞋材 / 塑膠射出',
		label: '傳統產業（布料 / 鞋材 / 塑膠射出）',
		description: '適合 OEM/ODM 工廠快速展示材質、製程與客製能力。',
		siteName: '匯辰傳產材料型錄',
		siteTitle: '匯辰傳產材料｜布料、鞋材、塑膠射出',
		metaDescription: '整合傳統產業材料與製程能力，快速建置接單展示型錄。',
		hero: {
			title: '把製程實力轉成可成交的型錄內容',
			summary: '展示材質、打樣與量產能力，讓客戶快速理解工廠價值。',
			imageUrl:
				'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於匯辰傳產材料',
			summary: '提供多品項材料與彈性生產排程，支援品牌快速打樣與量產。',
			content:
				'<p>我們聚焦布料、鞋材與塑膠射出加工，具備少量多樣與穩定交期能力，協助品牌快速推動產品開發。</p>',
			imageUrl:
				'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '製程能力',
			slug: 'manufacturing-capability',
			summary: '從打樣到量產，建立可複製的品質與交付流程。',
			content:
				'<h2>加工流程</h2><p>打樣確認、材料測試、製程排程、品質檢驗與出貨管理。</p><h2>合作模式</h2><p>支援 OEM/ODM 與跨國品牌採購合作。</p>',
			imageUrl:
				'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '傳產接單常見問題',
			slug: 'all',
			summary: '打樣、MOQ 與交期常見問題。',
			items: [
				{ question: '可否提供打樣服務？', answer: '可提供打樣，並依需求調整材質、尺寸與顏色。' },
				{
					question: '最小訂購量（MOQ）是多少？',
					answer: '依品項不同，MOQ 約 300 至 1000 件不等。',
				},
				{ question: '量產交期多久？', answer: '打樣確認後，量產通常約 30 至 45 天。' },
				{ question: '可否做客製包裝？', answer: '可提供品牌標籤、外盒與出貨包裝客製。' },
				{
					question: '是否有品質檢驗機制？',
					answer: '有，包含進料檢驗、製程抽檢與出貨前最終檢驗。',
				},
				{ question: '可否處理多國出貨？', answer: '可配合貿易條件安排出口文件與報關流程。' },
			],
		},
		categories: [
			{
				name: '功能布料',
				slug: 'functional-fabrics',
				description: '吸濕排汗、防潑與彈性機能布料。',
				imageUrl:
					'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '鞋材配件',
				slug: 'footwear-components',
				description: '鞋底、鞋面與結構配件材料。',
				imageUrl:
					'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '塑膠射出件',
				slug: 'plastic-injection-parts',
				description: '精密塑膠射出與客製模具開發。',
				imageUrl:
					'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '高透氣機能布 F-01',
				slug: 'breathable-fabric-f01',
				categorySlug: 'functional-fabrics',
				description: '兼具透氣與快乾特性，適合運動服飾。',
				content: '<p>可搭配多色打樣，提升開發效率。</p>',
				keywords: '機能布,透氣,紡織',
				specs: { 成分: '聚酯纖維 92%', 克重: '180g/m2', 功能: '快乾' },
				imageUrl:
					'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '防潑水彈性布 F-08',
				slug: 'water-repellent-fabric-f08',
				categorySlug: 'functional-fabrics',
				description: '戶外服飾常用防潑水面料。',
				content: '<p>兼顧彈性與耐磨，適合長時間使用情境。</p>',
				keywords: '防潑水,彈性布,戶外',
				specs: { 成分: '尼龍+彈性纖維', 克重: '210g/m2', 功能: '防潑水' },
				imageUrl:
					'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '輕量化鞋底材 M-20',
				slug: 'lightweight-sole-m20',
				categorySlug: 'footwear-components',
				description: '降低鞋重並維持支撐性。',
				content: '<p>可依鞋款需求調整硬度與紋路。</p>',
				keywords: '鞋底,鞋材,輕量化',
				specs: { 材質: 'EVA', 硬度: '55-65 Shore C', 顏色: '客製' },
				imageUrl:
					'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '耐磨鞋跟片 H-5',
				slug: 'heel-pad-h5',
				categorySlug: 'footwear-components',
				description: '強化鞋跟耐磨與支撐。',
				content: '<p>適合長距離行走鞋款與工作鞋。</p>',
				keywords: '鞋跟,耐磨,鞋材',
				specs: { 厚度: '5mm', 材質: 'TPU', 規格: '多尺寸' },
				imageUrl:
					'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '精密外殼射出件 PI-300',
				slug: 'injection-case-pi300',
				categorySlug: 'plastic-injection-parts',
				description: '適用電子與工具外殼的射出件。',
				content: '<p>支援模流分析與尺寸公差控制。</p>',
				keywords: '射出,外殼,塑膠件',
				specs: { 材質: 'ABS/PC', 尺寸公差: '±0.1mm', 生產方式: '量產' },
				imageUrl:
					'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '扣件模組射出件 PI-120',
				slug: 'injection-fastener-pi120',
				categorySlug: 'plastic-injection-parts',
				description: '多規格扣件與結構件射出加工。',
				content: '<p>可依應用場景調整材質與耐熱等級。</p>',
				keywords: '扣件,射出件,OEM',
				specs: { 材質: 'PA66', 耐熱: '120°C', MOQ: '5000 pcs' },
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '傳統產業如何用型錄提升接單效率',
				slug: 'traditional-industry-catalog-sales',
				excerpt: '把製程能力與品項規格整理成型錄，是提高詢單品質的關鍵。',
				content: '<h2>規格先標準化</h2><p>先整理材質、尺寸、MOQ 與交期，能減少反覆溝通。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '塑膠射出打樣到量產的流程建議',
				slug: 'plastic-injection-sample-to-mass',
				excerpt: '從模具評估、試模到量產驗收，掌握每個節點降低風險。',
				content: '<h2>先明確公差要求</h2><p>在試模前明確尺寸公差，可大幅縮短修模次數。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '布料', slug: 'fabric' },
			{ name: '鞋材', slug: 'footwear-material' },
			{ name: '塑膠射出', slug: 'plastic-injection' },
			{ name: 'OEM', slug: 'oem' },
			{ name: '打樣', slug: 'sampling' },
			{ name: '量產', slug: 'mass-production' },
		],
	},
	{
		id: 'trading-company-import-export',
		moduleType: 'product_catalog',
		industry: '貿易公司',
		subcategory: '進出口商',
		label: '貿易公司 / 進出口商',
		description: '適合進出口商快速整理品項、供應能力與服務流程。',
		siteName: '寰宇進出口型錄',
		siteTitle: '寰宇進出口｜全球採購與供應整合',
		metaDescription: '展示進出口品項與供應能力，協助企業快速建立國際貿易型錄。',
		hero: {
			title: '跨國採購與供應，讓交易更有效率',
			summary: '以清楚的品項分類與流程說明，快速建立客戶信任與詢單轉換。',
			imageUrl:
				'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於寰宇進出口',
			summary: '連結多國供應資源，提供穩定採購、驗貨與物流服務。',
			content:
				'<p>我們整合供應商管理、品質驗貨與國際物流，協助客戶縮短採購時程並降低供應風險。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '服務流程',
			slug: 'service-flow',
			summary: '從採購詢價到出貨報關，提供完整可追溯流程。',
			content:
				'<h2>交易管理</h2><p>需求確認、供應商比價、打樣驗證、量產出貨與售後追蹤。</p><h2>風險控管</h2><p>建立交期與品質監控機制，降低跨國交易不確定性。</p>',
			imageUrl:
				'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '進出口常見問題',
			slug: 'all',
			summary: 'MOQ、付款條件與物流安排常見問題。',
			items: [
				{
					question: '可否協助尋找替代供應商？',
					answer: '可以，會依規格與預算提供多家供應商方案。',
				},
				{ question: '最小採購量如何計算？', answer: '依產品與工廠條件不同，可協助評估最適 MOQ。' },
				{ question: '是否提供驗貨服務？', answer: '提供出貨前抽檢與第三方驗貨服務。' },
				{ question: '付款條件有哪些？', answer: '常見為 T/T、L/C，可依合作模式討論。' },
				{ question: '物流配送支援哪些方式？', answer: '可安排海運、空運與快遞，並提供報關文件。' },
				{
					question: '如何降低跨國採購風險？',
					answer: '建議透過分批出貨、驗貨機制與合約條款控管風險。',
				},
			],
		},
		categories: [
			{
				name: '工業用品',
				slug: 'industrial-supplies',
				description: '機械零件與工業配套用品。',
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '消費商品',
				slug: 'consumer-goods',
				description: '零售與通路常見商品品項。',
				imageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '物流包裝',
				slug: 'logistics-packaging',
				description: '跨國運輸包裝與保護材料。',
				imageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '高強度工業軸承 B-620',
				slug: 'industrial-bearing-b620',
				categorySlug: 'industrial-supplies',
				description: '適合高負載運轉設備的常備軸承。',
				content: '<p>穩定供貨並提供批次追蹤，降低設備停機風險。</p>',
				keywords: '軸承,工業用品,採購',
				specs: { 材質: '鉻鋼', 尺寸: '620 系列', 包裝: '50pcs/箱' },
				imageUrl:
					'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '工業級電源供應器 PS-48',
				slug: 'industrial-power-supply-ps48',
				categorySlug: 'industrial-supplies',
				description: '穩壓輸出，適合自動化設備採購。',
				content: '<p>多規格可選，支援長期合作供貨。</p>',
				keywords: '電源供應器,工業,進出口',
				specs: { 輸出: '48V', 功率: '350W', 認證: 'CE' },
				imageUrl:
					'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '多功能家用品組 HG-10',
				slug: 'home-goods-hg10',
				categorySlug: 'consumer-goods',
				description: '通路熱銷品項，適合節慶檔期採購。',
				content: '<p>可客製包裝與多語系標示，便於跨國銷售。</p>',
				keywords: '消費商品,家用品,通路',
				specs: { 件數: '10件組', 材質: '混合材質', 包裝: '彩盒' },
				imageUrl:
					'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '品牌周邊禮贈品套組 GP-30',
				slug: 'gift-promo-pack-gp30',
				categorySlug: 'consumer-goods',
				description: '企業活動與通路促銷常用禮贈方案。',
				content: '<p>支援客製印刷與分批出貨安排。</p>',
				keywords: '禮贈品,品牌周邊,OEM',
				specs: { 規格: '30件/套', 客製: 'Logo印刷', MOQ: '500套' },
				imageUrl:
					'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '重件防震包裝箱 PK-45',
				slug: 'shockproof-box-pk45',
				categorySlug: 'logistics-packaging',
				description: '跨國運輸防震保護，降低損耗風險。',
				content: '<p>適合機械零件與高價值商品出口包裝。</p>',
				keywords: '包裝箱,防震,物流',
				specs: { 尺寸: '45x35x30cm', 材質: '五層瓦楞', 承重: '25kg' },
				imageUrl:
					'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '防潮貨櫃乾燥包 DS-100',
				slug: 'container-dry-bag-ds100',
				categorySlug: 'logistics-packaging',
				description: '降低長途海運受潮與品質風險。',
				content: '<p>適用多種貨櫃運輸情境，部署快速。</p>',
				keywords: '防潮,貨櫃,海運',
				specs: { 規格: '100g/包', 包裝: '200包/箱', 適用: '20/40呎貨櫃' },
				imageUrl:
					'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '進出口商如何建立高效率型錄網站',
				slug: 'import-export-catalog-playbook',
				excerpt: '用分類、FAQ 與流程頁，讓客戶快速理解合作方式。',
				content:
					'<h2>先整理合作流程</h2><p>把詢價、打樣、下單、出貨節點明確化，能提升詢單品質。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '跨國採購專案如何降低交期風險',
				slug: 'global-procurement-leadtime-risk-control',
				excerpt: '多供應商策略與分批出貨，是降低延誤風險的實務作法。',
				content: '<h2>建立預警機制</h2><p>每週追蹤原料、排程與物流節點，及早調整方案。</p>',
				category: '公司消息',
				coverImageUrl:
					'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '進出口', slug: 'import-export' },
			{ name: '國際採購', slug: 'global-sourcing' },
			{ name: '供應鏈', slug: 'supply-chain' },
			{ name: '驗貨', slug: 'inspection' },
			{ name: '物流', slug: 'logistics' },
			{ name: '報關', slug: 'customs-clearance' },
		],
	},
	{
		id: 'information-software-development',
		moduleType: 'product_catalog',
		industry: '資訊服務',
		subcategory: '軟體開發',
		label: '資訊服務 / 軟體開發',
		description: '適合軟體開發、系統整合與 SaaS 服務商展示技術服務。',
		siteName: '雲築軟體開發型錄',
		siteTitle: '雲築軟體｜企業數位轉型與客製化開發',
		metaDescription: '提供企業級系統開發、SaaS 解決方案與數位轉型諮詢。',
		hero: {
			title: '加速企業數位轉型的技術夥伴',
			summary: '從需求訪談到系統上線，提供穩定且高擴充性的雲端軟體解決方案。',
			imageUrl:
				'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於雲築軟體開發',
			summary: '結合多年的跨產業系統整合經驗，我們提供從 0 到 1 的應用程式開發服務。',
			content:
				'<p>我們專注於 Web、APP 技術與雲端基礎架構，重視系統的安全與營運延續性，讓客戶更專注於商業決策。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '技術與服務',
			slug: 'technology-services',
			summary: '敏捷開發與高階雲端技術的實踐者。',
			content:
				'<h2>敏捷開發</h2><p>透過快速迭代降低開發風險，確保每個階段的交付價值。</p><h2>雲端架構</h2><p>運用 AWS/Azure 提供高可用性建構，彈性應付流量成長。</p>',
			imageUrl:
				'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '專案開發常見問題',
			slug: 'all',
			summary: '開發流程、報價與維護階段之常見問題。',
			items: [
				{
					question: '系統客製化開發通常需要多久？',
					answer: '依需求規模與複雜度而定，一般 MVP 專案約需 2 到 4 個月。',
				},
				{
					question: '是否提供系統後續維護？',
					answer: '有，我們提供 SLA (服務級別協議) 的年度維運選項。',
				},
				{
					question: '軟體的版權歸屬為何？',
					answer: '可依照合約選擇買斷專案原始碼，或是以授權方式使用。',
				},
				{
					question: '可以串接現有公司內部的 ERP 嗎？',
					answer: '可以，只要貴司系統有提供對外 API，我們就能協助整合串接。',
				},
				{
					question: '你們使用哪些開發技術？',
					answer: '前端主要為 React / Vue，後端則是 Node.js 或 Go、Python 等主流技術堆疊。',
				},
				{
					question: '報價是固定的嗎？',
					answer: '我們可採固定總價模式，或依據功能點(敏捷)評估時數報價。',
				},
			],
		},
		categories: [
			{
				name: '系統客製化開發',
				slug: 'custom-system',
				description: 'Web/App 與企業系統從零到一打造。',
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '雲端系統整合',
				slug: 'cloud-integration',
				description: '雲端搬遷、架構優化與第三方 API 服務串接。',
				imageUrl:
					'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: 'SaaS 解決方案',
				slug: 'saas-solution',
				description: '開箱即用的模組化企業軟體方案。',
				imageUrl:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '企業內部簽核系統',
				slug: 'e-approval-system',
				categorySlug: 'custom-system',
				description: '全面無紙化，支援動態流程引擎。',
				content: '<p>高度客製表單與簽核關卡，支援手持裝置隨時批核。</p>',
				keywords: 'BPM,簽核,表單',
				specs: { 平台支援: 'Web / App', 驗證: 'Active Directory / SSO', SLA: '99.9%' },
				imageUrl:
					'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '客製化電商平台',
				slug: 'custom-ecommerce',
				categorySlug: 'custom-system',
				description: '針對大量訂單與特殊規格訂製的購物站。',
				content: '<p>突破傳統平台限制，可串接客製化金物流與行銷模組。</p>',
				keywords: '電商,客製化,購物',
				specs: { 負載: 'Auto-Scaling', 系統架構: '微服務 / Serverless', 技術: 'React / Node.js' },
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '既有系統雲端搬遷 (Cloud Migration)',
				slug: 'cloud-migration',
				categorySlug: 'cloud-integration',
				description: '將地端老舊服務移轉至近代雲端平台。',
				content: '<p>確保資料不遺失，且停機時間降至最低的無縫轉換。</p>',
				keywords: 'AWS,Azure,搬遷',
				specs: {
					目標平台: 'AWS / GCP / Azure',
					方式: 'Lift-and-Shift / Refactor',
					安全: 'ISO 27001 遵循',
				},
				imageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '第三方 API 與金流整合服務',
				slug: 'api-integration',
				categorySlug: 'cloud-integration',
				description: '打通各種異質系統之間的資料流。',
				content: '<p>支援各大國內外金流、物流、電子發票服務 API 快速對接。</p>',
				keywords: 'API,金流,整合',
				specs: { 協議: 'RESTful / GraphQL', 中介層: 'API Gateway', 監控: '即時 Log' },
				imageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '客戶關係管理系統 (CRM SaaS)',
				slug: 'crm-saas',
				categorySlug: 'saas-solution',
				description: '快速建立客戶輪廓並增強互動追蹤。',
				content: '<p>模組化租用設計，可即刻開通使用，協助業務管理業績。</p>',
				keywords: 'CRM,業務,模組',
				specs: { 功能: '聯絡人/漏斗管理', 部署方式: 'SaaS 雲端', 版本更新: '自動升級' },
				imageUrl:
					'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '雲端排班與考勤系統',
				slug: 'cloud-attendance-saas',
				categorySlug: 'saas-solution',
				description: '處理複雜排班與即時打卡的靈活方案。',
				content: '<p>符合最新勞基法規，提供人事自動化結算工時功能。</p>',
				keywords: '考勤,排班,HR',
				specs: { 打卡方式: 'GPS / Wi-Fi', 整合: 'LINE 通知', 法規: '隨法規自動更新' },
				imageUrl:
					'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '企業該選擇現成 SaaS 還是客製化開發？',
				slug: 'saas-vs-custom-development',
				excerpt: '從長期成本與業務獨特性，分析兩者的優階與抉擇要點。',
				content:
					'<h2>短期成本 vs 長期價值</h2><p>針對短期驗證需求，SaaS 是首選；但具備核心機密的流程則傾向客製化。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/224924/pexels-photo-224924.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '什麼是微服務架構？為什麼需要它？',
				slug: 'what-is-microservices-architecture',
				excerpt: '了解微服務架構如何幫助成長中的應用程式降低系統耦合、提高擴充性。',
				content:
					'<h2>解耦以換取快速迭代</h2><p>當團隊規模擴大，服務各自獨立部署將大幅減少溝通阻力與衝突發生。</p>',
				category: '產品應用',
				coverImageUrl:
					'https://images.pexels.com/photos/1036371/pexels-photo-1036371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '軟體開發', slug: 'software-development' },
			{ name: '系統整合', slug: 'system-integration' },
			{ name: '雲端架構', slug: 'cloud-architecture' },
			{ name: '數位轉型', slug: 'digital-transformation' },
			{ name: '敏捷開發', slug: 'agile' },
			{ name: 'SaaS', slug: 'saas' },
		],
	},
	{
		id: 'green-energy-solar-equipment',
		moduleType: 'product_catalog',
		industry: '綠能環保',
		subcategory: '太陽能設備',
		label: '綠能環保 / 太陽能設備',
		description: '適合綠能廠商展示太陽能板、儲能設備與 EPC 工程服務。',
		siteName: '日耀綠能科技型錄',
		siteTitle: '日耀綠能｜太陽能光電與儲能整合方案',
		metaDescription: '提供高效能太陽能模組、儲能系統及完整的電廠建置與維運服務。',
		hero: {
			title: '穩定發電，啟動永續能源未來',
			summary: '全方位的太陽光電整合方案，協助企業與家庭提升能源使用效率並落實 ESG 減碳目標。',
			imageUrl:
				'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於日耀綠能科技',
			summary: '結合優質的一線綠電設備與在地化的工程技術團隊。',
			content:
				'<p>我們專注於分散式能源建置，提供廠辦屋頂、地面型電廠的評估、施工與後續維運保養服務，讓太陽能量最大化。</p>',
			imageUrl:
				'https://images.pexels.com/photos/208503/pexels-photo-208503.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '工程與售後保障',
			slug: 'engineering-services',
			summary: '堅持最高工安標準，打造能抵抗極端氣候的堅固案場。',
			content:
				'<h2>EPC統包工程</h2><p>提供設計、設備採購、施工建置與台電併網的一條龍服務。</p><h2>O&M維運服務</h2><p>雲端即時監控發電效率，並提供定期清洗、檢修防呆維護網。</p>',
			imageUrl:
				'https://images.pexels.com/photos/236331/pexels-photo-236331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '綠能建置常見問題',
			slug: 'all',
			summary: '太陽能版裝設、發電效益與維護的常見問題。',
			items: [
				{
					question: '我家/工廠屋頂適合安裝太陽能嗎？',
					answer: '只要屋頂結構良好且周遭無嚴重遮蔽，大部分面積超過 20 坪即可進行評估。',
				},
				{
					question: '太陽能系統壽命大約多長？',
					answer: '太陽能模組的壽命通常可達 20 至 25 年以上，期間我們將提供發電效率保固。',
				},
				{
					question: '投資太陽能的回本年限大約多久？',
					answer: '一般家庭或企業建置，依日照條件與台電躉購費率，平均約 6 到 8 年可回收成本。',
				},
				{
					question: '颱風天會有風險嗎？',
					answer: '我們的支架設計皆符合當地耐風規範，並由結構技師簽證，可抵禦強颱等級。',
				},
				{
					question: '太陽能板需要經常清洗嗎？',
					answer: '建議每年至少安排清洗 1 至 2 次，以維持最佳發電轉換效益。',
				},
				{
					question: '逆變器(Inverter)多需要更換？',
					answer:
						'平均壽命約在 8 到 12 年，我們提供至少 5 年原廠保固，後續亦有保固延長方案可選購。',
				},
			],
		},
		categories: [
			{
				name: '太陽能光電模組',
				slug: 'solar-pv-modules',
				description: '高效單晶矽、多晶矽以及雙面發電模組。',
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '太陽能逆變器',
				slug: 'solar-inverters',
				description: '智慧監控逆變器，轉換直流變交流與併網控制。',
				imageUrl:
					'https://images.pexels.com/photos/7412030/pexels-photo-7412030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '儲能系統與週邊',
				slug: 'energy-storage-system',
				description: '鋰電池儲能櫃與相關防雷配戴工程設備。',
				imageUrl:
					'https://images.pexels.com/photos/3802925/pexels-photo-3802925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '高效雙面單晶模組 550W',
				slug: 'bifacial-mono-module-550w',
				categorySlug: 'solar-pv-modules',
				description: '具備背面再反射發電能力，總產出多 10%。',
				content: '<p>抗 PID 設計，可有效降低極端環境下的衰減。</p>',
				keywords: '太陽能板,雙面,高效',
				specs: { 最大功率: '550W', 電池片技術: '單晶 PERC', 重量: '28kg' },
				imageUrl:
					'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '半切電池光電模組 400W',
				slug: 'half-cut-cell-module-400w',
				categorySlug: 'solar-pv-modules',
				description: '降低內部電阻損失，更耐受局部陰影遮蔽。',
				content: '<p>外觀全黑設計，適合安裝於具有美觀要求之高級住宅屋頂。</p>',
				keywords: '太陽能板,半切,美觀',
				specs: { 最大功率: '400W', 效率: '20.8%', 尺寸: '1722x1134mm' },
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '智慧型三相逆變器 50kW',
				slug: 'smart-inverter-3phase-50kw',
				categorySlug: 'solar-inverters',
				description: '多路 MPPT 追蹤，適合工業廠房大範圍鋪設。',
				content: '<p>內建即時電弧防護與快速關斷功能，確保廠區安全無虞。</p>',
				keywords: '逆變器,三相,商用',
				specs: { 輸出功率: '50kW', 最大效率: '98.5%', 通訊: 'Wi-Fi / 4G' },
				imageUrl:
					'https://images.pexels.com/photos/12052054/pexels-photo-12052054.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '微型逆變器系列',
				slug: 'microinverter-series',
				categorySlug: 'solar-inverters',
				description: '適合屋頂形狀複雜、具多個遮蔽環境之案場。',
				content: '<p>單片控制發電狀況，能發揮單點最大效能並輕易擴充系統。</p>',
				keywords: '逆變器,微型,家用',
				specs: { 輸出功率: '支援 1-4 片版', 防護等級: 'IP67', 保固: '最高 15 年' },
				imageUrl:
					'https://images.pexels.com/photos/3861448/pexels-photo-3861448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '商用一體化儲能櫃 100kWh',
				slug: 'commercial-bess-100kwh',
				categorySlug: 'energy-storage-system',
				description: '協助企業實現尖離峰電價套利與備用電源管理。',
				content: '<p>無縫切換功能將停電風險降至最低，結合 BMS 確保電池安全。</p>',
				keywords: '儲能,鋰電池,備用電源',
				specs: { 容量: '100kWh', 電芯型態: '磷酸鐵鋰', 壽命: '6000 次循環' },
				imageUrl:
					'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '鋁合金抗風支架系統',
				slug: 'aluminum-mounting-system',
				categorySlug: 'energy-storage-system',
				description: '經流體力學設計的輕量高鋼性支撐座。',
				content: '<p>抗腐蝕能力強且施工快速，適用於鹽害地區或長年日曬環境。</p>',
				keywords: '支架,防鏽,屋頂安裝',
				specs: { 材質: '陽極氧化鋁 AL6005', 抗風壓: '60 m/s', 應用: '平/斜屋頂' },
				imageUrl:
					'https://images.pexels.com/photos/209939/pexels-photo-209939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '企業建置太陽能自發自用，如何落實 ESG 目標',
				slug: 'solar-for-corporate-esg-goals',
				excerpt: '不僅能減少碳排，更可藉由綠電憑證協助企業達到永續評鑑高標。',
				content:
					'<h2>綠電憑證效益</h2><p>綠電不僅是自用省下電費，多餘的憑證亦能進入市場交易，創造企業聲譽與額外價值。</p>',
				category: '產業洞察',
				coverImageUrl:
					'https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '太陽能案場維運(O&M)的三大核心工作',
				slug: 'solar-om-three-core-tasks',
				excerpt: '良好的後續日常維運清洗，是決定 20 年內發電總收益的致勝關鍵。',
				content:
					'<h2>從清洗到熱顯像檢查</h2><p>定期清洗表面落塵與防範熱斑效應，是最高投報率的維護策略。</p>',
				category: '公司消息',
				coverImageUrl:
					'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...ARTICLE_CATEGORIES],
		tags: [
			{ name: '太陽能', slug: 'solar-energy' },
			{ name: '綠電儲能', slug: 'green-energy-storage' },
			{ name: '自發自用', slug: 'self-consumption' },
			{ name: 'ESG', slug: 'esg' },
			{ name: '電廠維運', slug: 'plant-om' },
			{ name: '減碳', slug: 'carbon-reduction' },
		],
	},
	// ===== 品牌官方形象網站模板 =====
	{
		id: 'brand-association-organization',
		moduleType: 'brand_image',
		industry: '公協會 / 社團',
		subcategory: '社團組織官網',
		label: '公協會 / 社團組織官網',
		description: '適合公會、協會、獅子會、扶輪社等社團組織，展示月例會、公益活動與組織資訊。',
		siteName: '台灣菁英商業交流協會',
		siteTitle: '台灣菁英商業交流協會｜凝聚力量 共創價值',
		metaDescription: '推動會員交流、產業串聯與公益參與，歡迎加入我們的行列。',
		hero: {
			title: '凝聚力量，共創價值',
			summary: '透過定期例會、產業參訪與公益行動，促進會員交流並回饋社會。',
			imageUrl:
				'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於本會',
			summary: '以「凝聚、成長、回饋」為宗旨，串聯跨領域專業人才共同發展。',
			content:
				'<p>本會自成立以來，致力推動會員間的交流合作，透過月例會、年度大會與公益活動，建立互信互助的共好平台。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '組織簡介',
			slug: 'organization-profile',
			summary: '匯聚各界菁英，透過組織化運作推動會務與社會公益。',
			content:
				'<h2>組織宗旨</h2><p>促進會員間專業交流、推動產業合作、參與公益回饋社會。</p><h2>組織架構</h2><p>設有理事長、副理事長、秘書長與各委員會，確保會務運作透明有效。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '常見問題',
			slug: 'all',
			summary: '入會、會費與活動參與常見問題。',
			items: [
				{
					question: '如何加入本會？',
					answer: '請填寫入會申請表並經理事會審議通過後即可成為會員。',
				},
				{
					question: '會費如何計算？',
					answer: '依入會類別分為個人會員與團體會員，年費請洽秘書處。',
				},
				{
					question: '月例會的舉辦頻率？',
					answer: '原則上每月第三週舉辦，如遇連假會另行通知。',
				},
				{
					question: '可以攜伴參加活動嗎？',
					answer: '部分活動開放攜伴參加，報名時請註明。',
				},
				{
					question: '是否有跨會交流？',
					answer: '本會定期與其他友會進行聯誼交流與互訪活動。',
				},
				{
					question: '公益活動如何參與？',
					answer: '會員可透過報名系統或聯繫秘書處報名志工服務。',
				},
			],
		},
		categories: [
			{
				name: '月例會',
				slug: 'monthly-meeting',
				description: '每月定期舉辦的會員交流聚會。',
				imageUrl:
					'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '公益活動',
				slug: 'charity-event',
				description: '回饋社會的志工服務與捐助行動。',
				imageUrl:
					'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '產業參訪',
				slug: 'industry-visit',
				description: '走訪企業與機構的學習交流。',
				imageUrl:
					'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '113 年度 12 月份月例會',
				slug: 'monthly-meeting-113-12',
				categorySlug: 'monthly-meeting',
				description: '特邀知名企業家分享數位轉型實務經驗。',
				content: '<p>本次例會邀請到數位轉型顧問進行專題分享，與會會員反響熱烈。</p>',
				keywords: '月例會,交流,演講',
				specs: { 日期: '2024/12/18', 地點: '台北國際會議中心', 人數: '120 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '113 年度 11 月份月例會',
				slug: 'monthly-meeting-113-11',
				categorySlug: 'monthly-meeting',
				description: '主題：ESG 永續經營與中小企業的機會。',
				content: '<p>探討中小企業如何在有限資源下落實永續發展策略。</p>',
				keywords: '月例會,ESG,永續',
				specs: { 日期: '2024/11/20', 地點: '台北遠東飯店', 人數: '95 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '偏鄉學童課輔計畫',
				slug: 'rural-tutoring-program',
				categorySlug: 'charity-event',
				description: '結合會員資源，為偏鄉學童提供課業輔導與關懷。',
				content: '<p>每學期安排 8 至 10 場課輔活動，已持續 3 年服務超過 500 位學童。</p>',
				keywords: '公益,偏鄉,教育',
				specs: { 服務對象: '偏鄉國中小學生', 頻率: '每月 2 次', 累計場次: '60+ 場' },
				imageUrl:
					'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '113 年度淨灘環保行動',
				slug: 'beach-cleanup-113',
				categorySlug: 'charity-event',
				description: '號召會員與眷屬一同參與海岸淨灘。',
				content: '<p>共清理超過 200 公斤垃圾，展現社團對環境永續的承諾。</p>',
				keywords: '淨灘,環保,公益',
				specs: { 日期: '2024/09/15', 地點: '新北市萬里海灘', 參與人數: '80 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '台中精密機械園區參訪',
				slug: 'taichung-precision-visit',
				categorySlug: 'industry-visit',
				description: '走訪台中精密機械園區，了解智慧製造最新趨勢。',
				content: '<p>參觀自動化產線與 AIoT 應用，並與園區企業進行交流座談。</p>',
				keywords: '參訪,精密機械,智慧製造',
				specs: { 日期: '2024/10/25', 地點: '台中精密機械園區', 參與人數: '35 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '日本商業考察團',
				slug: 'japan-business-tour',
				categorySlug: 'industry-visit',
				description: '赴日參訪企業與產業展覽，促進跨國商業合作。',
				content: '<p>為期 5 天的考察行程，涵蓋東京與大阪多家標竿企業。</p>',
				keywords: '日本,考察,國際交流',
				specs: { 日期: '2024/06/10-14', 地點: '日本 東京/大阪', 團員: '25 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
		],
		articles: [
			{
				title: '113 年度會員大會圓滿落幕',
				slug: 'annual-meeting-113-recap',
				excerpt: '本屆年度大會選出新任理監事，並公布下年度重點會務計畫。',
				content: '<h2>大會重點</h2><p>審議通過年度工作報告與財務報告，並選舉產生第五屆理監事。</p>',
				category: '最新消息',
				coverImageUrl:
					'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '12 月份月例會精彩回顧',
				slug: 'monthly-meeting-dec-review',
				excerpt: '數位轉型專題演講獲得熱烈迴響，超過 120 位會員出席。',
				content: '<h2>活動回顧</h2><p>講者深入淺出的分享讓與會者收穫滿滿。</p>',
				category: '活動報導',
				coverImageUrl:
					'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...BRAND_ARTICLE_CATEGORIES],
		tags: [
			{ name: '月例會', slug: 'monthly-meeting' },
			{ name: '公益活動', slug: 'charity' },
			{ name: '產業交流', slug: 'industry-exchange' },
			{ name: '年度大會', slug: 'annual-meeting' },
			{ name: '會員服務', slug: 'member-service' },
			{ name: '跨會聯誼', slug: 'inter-club' },
		],
	},
	{
		id: 'brand-corporate-image',
		moduleType: 'brand_image',
		industry: '品牌企業',
		subcategory: '企業形象官網',
		label: '品牌企業 / 企業形象官網',
		description: '適合企業品牌展示記者會、產品發表、CSR 活動與企業動態。',
		siteName: '恆昇國際集團',
		siteTitle: '恆昇國際集團｜創新驅動 永續經營',
		metaDescription: '以創新技術與永續經營為核心，持續為客戶與社會創造多元價值。',
		hero: {
			title: '創新驅動，永續經營',
			summary: '從產品發表到 CSR 實踐，展現品牌的核心價值與社會責任。',
			imageUrl:
				'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於恆昇國際',
			summary: '深耕產業超過 20 年，以技術創新與品牌經營為雙引擎驅動成長。',
			content:
				'<p>恆昇國際集團以多元化經營策略，涵蓋研發創新、品牌行銷與 CSR 實踐，持續為利害關係人創造價值。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '企業簡介',
			slug: 'corporate-profile',
			summary: '以誠信、創新、永續為核心價值，打造值得信賴的品牌。',
			content:
				'<h2>企業沿革</h2><p>創立於 2004 年，從區域品牌成長為跨國集團，業務橫跨亞太地區。</p><h2>願景使命</h2><p>成為產業中最具創新力與永續影響力的企業品牌。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '常見問題',
			slug: 'all',
			summary: '合作洽詢、CSR 參與與媒體聯繫常見問題。',
			items: [
				{
					question: '如何與恆昇國際進行商業合作？',
					answer: '請透過官網聯絡表單或業務信箱洽詢，我們將有專人回覆。',
				},
				{
					question: '如何參與 CSR 活動？',
					answer: '關注官網最新消息或訂閱電子報，即可獲取活動報名資訊。',
				},
				{
					question: '是否提供企業參觀？',
					answer: '企業團體可預約參觀，請提前 2 週透過官網申請。',
				},
				{
					question: '媒體採訪如何聯繫？',
					answer: '請洽公關部信箱 pr@example.com，我們會盡快安排。',
				},
				{
					question: '活動資訊多久更新一次？',
					answer: '官網活動資訊即時更新，建議定期關注或訂閱電子報。',
				},
				{
					question: '是否有實習計畫？',
					answer: '每年暑期開放實習計畫，詳情請關注最新消息公告。',
				},
			],
		},
		categories: [
			{
				name: '產品發表會',
				slug: 'product-launch',
				description: '新產品與新技術的正式發表活動。',
				imageUrl:
					'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: 'CSR 與 ESG',
				slug: 'csr-esg',
				description: '企業社會責任與永續經營實踐。',
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '企業論壇',
				slug: 'corporate-forum',
				description: '產業趨勢論壇與高峰會。',
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '2024 年度新品發表會',
				slug: 'product-launch-2024',
				categorySlug: 'product-launch',
				description: '發表全新一代智慧解決方案，展示品牌技術實力。',
				content: '<p>本次發表會匯集超過 300 位產業夥伴，現場展示 5 項核心新技術。</p>',
				keywords: '發表會,新品,科技',
				specs: { 日期: '2024/11/08', 地點: '台北南港展覽館', 出席人數: '320 人' },
				imageUrl:
					'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '品牌 20 週年記者會',
				slug: 'brand-20th-anniversary-press',
				categorySlug: 'product-launch',
				description: '回顧品牌 20 年歷程，發表未來五年策略藍圖。',
				content: '<p>邀請產業領袖與媒體夥伴共同見證品牌里程碑。</p>',
				keywords: '週年,記者會,品牌',
				specs: { 日期: '2024/04/15', 地點: '台北 W 飯店', 媒體出席: '45 家' },
				imageUrl:
					'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '偏鄉數位教育計畫',
				slug: 'rural-digital-education',
				categorySlug: 'csr-esg',
				description: '捐贈數位設備並培訓師資，縮短城鄉數位落差。',
				content: '<p>累計捐贈 500 台平板電腦，並完成 30 場師資培訓工作坊。</p>',
				keywords: 'CSR,教育,數位',
				specs: { 執行年份: '2022-2024', 服務學校: '25 所', 受惠人數: '3000+' },
				imageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '2024 年度 ESG 報告發布',
				slug: 'esg-report-2024',
				categorySlug: 'csr-esg',
				description: '公開年度永續報告，揭示碳排放、社會投資與治理成果。',
				content: '<p>碳排較去年減少 12%，社會投資金額成長 20%。</p>',
				keywords: 'ESG,永續報告,碳排',
				specs: { 報告年份: '2024', 碳減排: '-12%', GRI標準: '是' },
				imageUrl:
					'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '亞太產業創新高峰論壇',
				slug: 'apac-innovation-summit',
				categorySlug: 'corporate-forum',
				description: '匯聚亞太區產業領袖，探討創新轉型趨勢。',
				content: '<p>為期 2 天的論壇涵蓋 AI、綠色科技與供應鏈韌性等主題。</p>',
				keywords: '論壇,創新,亞太',
				specs: { 日期: '2024/09/20-21', 地點: '台北國際會議中心', 講者: '28 位' },
				imageUrl:
					'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '永續經營策略工作坊',
				slug: 'sustainability-workshop',
				categorySlug: 'corporate-forum',
				description: '邀請企業主管學習導入 ESG 策略的實務做法。',
				content: '<p>小班制工作坊，聚焦碳盤查、供應鏈管理與利害關係人溝通。</p>',
				keywords: '工作坊,永續,策略',
				specs: { 日期: '2024/07/12', 地點: '線上+實體', 人數上限: '40 人' },
				imageUrl:
					'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '恆昇國際榮獲亞太品牌大獎',
				slug: 'apac-brand-award-2024',
				excerpt: '以創新技術與永續實踐獲得評審一致肯定，連續三年入圍。',
				content: '<h2>獲獎亮點</h2><p>評審肯定品牌在 ESG 實踐與數位轉型的領先表現。</p>',
				category: '最新消息',
				coverImageUrl:
					'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '偏鄉數位教育計畫成果發表',
				slug: 'rural-education-results',
				excerpt: '三年來累計服務 25 所學校，受惠學生超過 3000 人。',
				content: '<h2>計畫成果</h2><p>受惠學生的數位素養測評成績提升顯著，獲地方政府高度肯定。</p>',
				category: '活動報導',
				coverImageUrl:
					'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...BRAND_ARTICLE_CATEGORIES],
		tags: [
			{ name: '品牌活動', slug: 'brand-event' },
			{ name: '產品發表', slug: 'product-launch' },
			{ name: 'CSR', slug: 'csr' },
			{ name: 'ESG', slug: 'esg' },
			{ name: '企業論壇', slug: 'corporate-forum' },
			{ name: '媒體報導', slug: 'media-coverage' },
		],
	},
	{
		id: 'brand-local-culture-organization',
		moduleType: 'brand_image',
		industry: '地方創生',
		subcategory: '文化組織官網',
		label: '地方創生 / 文化組織官網',
		description: '適合地方創生團隊、文化協會與社區組織，展示藝文活動、市集與在地特色。',
		siteName: '好日山城文化協會',
		siteTitle: '好日山城文化協會｜在地深耕 文化共好',
		metaDescription: '推動在地藝文活動、手作市集與社區營造，讓地方故事被更多人看見。',
		hero: {
			title: '在地深耕，文化共好',
			summary: '透過藝文活動、手作市集與社區營造，串聯在地資源、重新發現土地的美好。',
			imageUrl:
				'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		homeAbout: {
			title: '關於好日山城',
			summary: '從一群熱愛土地的年輕人出發，以文化與設計力量翻轉地方印象。',
			content:
				'<p>我們致力連結在地職人、藝術家與社區居民，透過活動企劃與品牌設計，讓地方文化走入日常。</p>',
			imageUrl:
				'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/about',
		},
		about: {
			title: '協會介紹',
			slug: 'about-association',
			summary: '以社區營造、文化保存與青年返鄉為三大核心行動方向。',
			content:
				'<h2>成立緣起</h2><p>2019 年由一群返鄉青年發起，從籌辦第一場在地市集開始，逐步擴展為常態性的文化推動組織。</p><h2>核心行動</h2><p>辦理藝文展覽、手作體驗、社區走讀與青年培力營隊。</p>',
			imageUrl:
				'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image2:
				'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			image3:
				'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			linkUrl: '/products',
		},
		faq: {
			title: '常見問題',
			slug: 'all',
			summary: '活動參與、市集攤位與合作洽詢常見問題。',
			items: [
				{
					question: '活動都在哪裡舉辦？',
					answer: '主要在苗栗山城地區，部分合作活動會在台中或北部舉辦。',
				},
				{
					question: '如何報名市集攤位？',
					answer: '市集攤位採線上報名審核制，請關注官網或粉絲頁公告。',
				},
				{
					question: '活動免費參加嗎？',
					answer: '大部分活動免費入場，部分體驗工作坊會酌收材料費。',
				},
				{
					question: '可以擔任志工嗎？',
					answer: '非常歡迎！請透過聯絡表單登記，我們會在活動前聯繫。',
				},
				{
					question: '如何支持地方創生？',
					answer: '除了參與活動，也可透過購買在地品牌商品或成為贊助夥伴。',
				},
				{
					question: '是否接受企業 CSR 合作？',
					answer: '歡迎企業以贊助、志工日或共創活動方式參與。',
				},
			],
		},
		categories: [
			{
				name: '藝文展覽',
				slug: 'art-exhibition',
				description: '在地藝術家作品展示與文化策展。',
				imageUrl:
					'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '手作市集',
				slug: 'handcraft-market',
				description: '集結在地職人的手作品牌市集。',
				imageUrl:
					'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '社區走讀',
				slug: 'community-walk',
				description: '帶路導覽與文史踏查體驗。',
				imageUrl:
					'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		products: [
			{
				name: '2024 秋日山城藝術祭',
				slug: 'autumn-art-festival-2024',
				categorySlug: 'art-exhibition',
				description: '結合裝置藝術、音樂演出與在地飲食的年度盛事。',
				content: '<p>為期 3 天的藝術祭，邀請 20 組藝術家與 15 組音樂人共同參與。</p>',
				keywords: '藝術祭,裝置藝術,音樂',
				specs: { 日期: '2024/10/18-20', 地點: '苗栗三義木雕街', 入場: '免費' },
				imageUrl:
					'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '在地陶藝創作展',
				slug: 'local-pottery-exhibition',
				categorySlug: 'art-exhibition',
				description: '展出在地陶藝師傅的經典與新作，呈現土地與火的美學。',
				content: '<p>展期一個月，結合陶藝體驗與職人座談。</p>',
				keywords: '陶藝,展覽,在地',
				specs: { 展期: '2024/08/01-31', 地點: '好日藝文空間', 作品數: '60 件' },
				imageUrl:
					'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '好日假日手作市集',
				slug: 'weekend-handcraft-market',
				categorySlug: 'handcraft-market',
				description: '每月第二週週末舉辦，集結在地品牌與手作職人。',
				content: '<p>超過 40 攤手作品牌與在地小農參與，是社區最受歡迎的週末活動。</p>',
				keywords: '市集,手作,假日',
				specs: { 頻率: '每月第二週', 地點: '山城文創園區', 攤位數: '40+' },
				imageUrl:
					'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '歲末感恩市集',
				slug: 'year-end-market',
				categorySlug: 'handcraft-market',
				description: '年末特別企劃，結合音樂演出與限定版手作商品。',
				content: '<p>邀請在地樂團演出，現場提供熱飲與暖心市集體驗。</p>',
				keywords: '歲末,市集,音樂',
				specs: { 日期: '2024/12/21-22', 地點: '山城文創園區', 攤位數: '50+' },
				imageUrl:
					'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				name: '老街文史走讀',
				slug: 'old-street-walk',
				categorySlug: 'community-walk',
				description: '由在地文史工作者帶路，深入認識老街百年歷史。',
				content: '<p>全程約 2 小時，沿途導覽歷史建築與在地故事。</p>',
				keywords: '走讀,文史,老街',
				specs: { 時長: '2 小時', 人數上限: '30 人', 費用: '免費' },
				imageUrl:
					'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
				isFeatured: true,
			},
			{
				name: '山城生態踏查',
				slug: 'mountain-ecology-walk',
				categorySlug: 'community-walk',
				description: '走入山林，認識在地生態與農業文化。',
				content: '<p>結合生態導覽與農事體驗，適合親子與團體參加。</p>',
				keywords: '生態,踏查,親子',
				specs: { 時長: '3 小時', 人數上限: '25 人', 費用: '材料費 200 元' },
				imageUrl:
					'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articles: [
			{
				title: '秋日藝術祭圓滿落幕，超過 3000 人參與',
				slug: 'autumn-festival-recap-2024',
				excerpt: '三天活動吸引超過 3000 位民眾到訪，創下歷屆最高紀錄。',
				content: '<h2>活動回顧</h2><p>裝置藝術區與音樂舞台是最受歡迎的亮點，明年將擴大規模。</p>',
				category: '活動報導',
				coverImageUrl:
					'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
			{
				title: '113 年度青年返鄉培力營招募中',
				slug: 'youth-empowerment-camp-2024',
				excerpt: '提供創業輔導、品牌設計與行銷實戰，歡迎有志返鄉的青年報名。',
				content: '<h2>營隊資訊</h2><p>為期 5 天的密集培訓，結業後提供半年的創業陪跑。</p>',
				category: '最新消息',
				coverImageUrl:
					'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
			},
		],
		articleCategories: [...BRAND_ARTICLE_CATEGORIES],
		tags: [
			{ name: '地方創生', slug: 'local-revitalization' },
			{ name: '藝文活動', slug: 'art-culture' },
			{ name: '手作市集', slug: 'handcraft-market' },
			{ name: '社區營造', slug: 'community-building' },
			{ name: '青年返鄉', slug: 'youth-return' },
			{ name: '文化保存', slug: 'cultural-preservation' },
		],
	},
];

export const SITE_TEMPLATE_DEFINITIONS: SiteTemplateDefinition[] = TEMPLATE_SEEDS.map((seed) => ({
	...seed,
	summary: buildSummary(seed),
}));

export function getSiteTemplateDefinition(templateId: string): SiteTemplateDefinition | null {
	return SITE_TEMPLATE_DEFINITIONS.find((item) => item.id === templateId) || null;
}

export function getSiteTemplateMetaList(): SiteTemplateMeta[] {
	return SITE_TEMPLATE_DEFINITIONS.map((item) => ({
		id: item.id,
		moduleType: item.moduleType,
		industry: item.industry,
		subcategory: item.subcategory,
		label: item.label,
		description: item.description,
		summary: item.summary,
	}));
}

export function getSiteTemplateIndex(templateId: string): number {
	return SITE_TEMPLATE_DEFINITIONS.findIndex((item) => item.id === templateId);
}
