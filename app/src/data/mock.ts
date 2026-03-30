/**
 * 模擬資料 — 產品、分類、標籤
 * 開發階段使用，後續將替換為 D1 資料庫
 */

export interface Product {
	id: number;
	name: string;
	slug: string;
	description: string;
	shortDescription: string;
	status: 'published' | 'draft';
	categoryIds: number[];
	tagIds: number[];
	images: string[];
	specs: { label: string; value: string }[];
	seoTitle: string;
	seoDescription: string;
	featured: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	sortOrder: number;
	productCount: number;
}

export interface Tag {
	id: number;
	name: string;
}

// ===== 分類 =====
export const categories: Category[] = [
	{
		id: 1,
		name: '電子零件',
		slug: 'electronic-parts',
		description: '高品質電子零件，適用於各類工業與消費性電子產品',
		imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
		sortOrder: 1,
		productCount: 4,
	},
	{
		id: 2,
		name: '機械設備',
		slug: 'machinery',
		description: '精密機械設備，滿足製造業各項需求',
		imageUrl: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=400&fit=crop',
		sortOrder: 2,
		productCount: 3,
	},
	{
		id: 3,
		name: '測量儀器',
		slug: 'measurement',
		description: '專業測量儀器，確保精確度與可靠性',
		imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop',
		sortOrder: 3,
		productCount: 3,
	},
	{
		id: 4,
		name: '包裝材料',
		slug: 'packaging',
		description: '環保包裝材料，兼顧保護性與永續發展',
		imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop',
		sortOrder: 4,
		productCount: 2,
	},
];

// ===== 標籤 =====
export const tags: Tag[] = [
	{ id: 1, name: '熱門' },
	{ id: 2, name: '新品' },
	{ id: 3, name: '促銷' },
	{ id: 4, name: '環保' },
	{ id: 5, name: '高精度' },
	{ id: 6, name: '工業級' },
	{ id: 7, name: '客製化' },
];

// ===== 產品 =====
export const products: Product[] = [
	{
		id: 1,
		name: '高效能微控制器 MCU-3200',
		slug: 'mcu-3200',
		description: `<p>MCU-3200 是一款高效能 32 位元微控制器，搭載 ARM Cortex-M4 核心，主頻高達 200MHz。</p>
<p>採用先進的低功耗設計，適用於工業控制、物聯網裝置、智慧家電等多種應用場景。內建豐富的周邊介面包括 SPI、I2C、UART、CAN 等，大幅降低外部元件需求。</p>
<ul>
  <li>32 位元 ARM Cortex-M4 核心</li>
  <li>512KB Flash + 128KB SRAM</li>
  <li>低功耗模式：待機電流 < 2μA</li>
  <li>工作溫度：-40°C ~ +85°C</li>
</ul>`,
		shortDescription: '32 位元 ARM Cortex-M4 微控制器，200MHz 主頻，適用於工業控制與物聯網裝置',
		status: 'published',
		categoryIds: [1],
		tagIds: [1, 2, 6],
		images: [
			'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
			'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=600&fit=crop',
			'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
		],
		specs: [
			{ label: '核心架構', value: 'ARM Cortex-M4' },
			{ label: '主頻', value: '200MHz' },
			{ label: 'Flash 容量', value: '512KB' },
			{ label: 'SRAM 容量', value: '128KB' },
			{ label: '工作電壓', value: '1.8V ~ 3.6V' },
			{ label: '封裝', value: 'LQFP-64' },
			{ label: '工作溫度', value: '-40°C ~ +85°C' },
		],
		seoTitle: 'MCU-3200 高效能微控制器 | 產品型錄',
		seoDescription:
			'MCU-3200 32 位元 ARM Cortex-M4 微控制器，200MHz 主頻，512KB Flash，適用於工業控制與物聯網裝置。',
		featured: true,
		createdAt: '2025-12-01T08:00:00Z',
		updatedAt: '2026-01-15T10:30:00Z',
	},
	{
		id: 2,
		name: '精密電阻陣列 RA-100',
		slug: 'ra-100',
		description: `<p>RA-100 精密電阻陣列採用薄膜製程技術，提供卓越的精確度與穩定性。</p>
<p>每組陣列包含 8 個獨立電阻，公差低至 ±0.1%，溫度係數 ±25ppm/°C，適用於高精度測量電路、醫療設備與航太電子系統。</p>`,
		shortDescription: '薄膜製程精密電阻陣列，公差 ±0.1%，8 通道獨立配置',
		status: 'published',
		categoryIds: [1],
		tagIds: [5, 6],
		images: [
			'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=600&fit=crop',
			'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
		],
		specs: [
			{ label: '通道數', value: '8' },
			{ label: '公差', value: '±0.1%' },
			{ label: '溫度係數', value: '±25ppm/°C' },
			{ label: '額定功率', value: '100mW/通道' },
			{ label: '封裝', value: 'SOP-16' },
		],
		seoTitle: 'RA-100 精密電阻陣列 | 產品型錄',
		seoDescription: 'RA-100 精密電阻陣列，薄膜製程，公差 ±0.1%，適用於高精度測量與醫療設備。',
		featured: true,
		createdAt: '2025-11-20T08:00:00Z',
		updatedAt: '2026-01-10T14:00:00Z',
	},
	{
		id: 3,
		name: '工業級電源模組 PM-500W',
		slug: 'pm-500w',
		description: `<p>PM-500W 工業級電源模組提供 500W 連續輸出功率，轉換效率高達 95%。</p>
<p>具備完善的保護機制，包括過壓、過流、過溫、短路保護。寬輸入電壓範圍 85-264VAC，滿足全球各地電力標準。</p>`,
		shortDescription: '500W 工業級電源模組，轉換效率 95%，寬輸入電壓範圍',
		status: 'published',
		categoryIds: [1],
		tagIds: [1, 6],
		images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop'],
		specs: [
			{ label: '輸出功率', value: '500W' },
			{ label: '輸入電壓', value: '85-264VAC' },
			{ label: '轉換效率', value: '95%' },
			{ label: '輸出電壓', value: '12V / 24V / 48V 可選' },
			{ label: '保護功能', value: 'OVP / OCP / OTP / SCP' },
		],
		seoTitle: 'PM-500W 工業級電源模組 | 產品型錄',
		seoDescription: 'PM-500W 工業級電源模組，500W 連續輸出，95% 轉換效率，全球電壓相容。',
		featured: false,
		createdAt: '2025-10-15T08:00:00Z',
		updatedAt: '2025-12-20T09:00:00Z',
	},
	{
		id: 4,
		name: '多軸伺服驅動器 SD-4000',
		slug: 'sd-4000',
		description: `<p>SD-4000 多軸伺服驅動器支援最多 4 軸同步控制，採用高速 EtherCAT 通訊協定。</p>
<p>內建自調諧功能，可自動優化 PID 參數，大幅縮短設備調機時間。適用於 CNC 加工機、半導體設備、自動化產線。</p>`,
		shortDescription: '4 軸同步伺服驅動器，EtherCAT 通訊，內建自調諧功能',
		status: 'published',
		categoryIds: [1, 2],
		tagIds: [2, 5, 7],
		images: [
			'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop',
			'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop',
		],
		specs: [
			{ label: '控制軸數', value: '4 軸' },
			{ label: '通訊協定', value: 'EtherCAT' },
			{ label: '最大輸出電流', value: '20A / 軸' },
			{ label: '解析度', value: '24 bit' },
			{ label: '回饋介面', value: '增量型 / 絕對型編碼器' },
		],
		seoTitle: 'SD-4000 多軸伺服驅動器 | 產品型錄',
		seoDescription:
			'SD-4000 多軸伺服驅動器，4 軸同步控制，EtherCAT 通訊，適用於 CNC 與自動化產線。',
		featured: true,
		createdAt: '2026-01-05T08:00:00Z',
		updatedAt: '2026-02-01T16:00:00Z',
	},
	{
		id: 5,
		name: 'CNC 立式加工中心 VMC-850',
		slug: 'vmc-850',
		description: `<p>VMC-850 立式加工中心採用高剛性鑄鐵機身，主軸轉速 12000rpm，適合各類金屬與非金屬材料加工。</p>
<p>配備高精度滾珠螺桿與線性滑軌，定位精度達 ±0.005mm，重複定位精度 ±0.003mm。</p>`,
		shortDescription: '立式加工中心，12000rpm 主軸，定位精度 ±0.005mm',
		status: 'published',
		categoryIds: [2],
		tagIds: [1, 5],
		images: ['https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop'],
		specs: [
			{ label: '加工行程 (XYZ)', value: '850 x 500 x 500mm' },
			{ label: '主軸轉速', value: '12000rpm' },
			{ label: '主軸功率', value: '11kW' },
			{ label: '定位精度', value: '±0.005mm' },
			{ label: '刀庫容量', value: '24 把' },
		],
		seoTitle: 'VMC-850 CNC 立式加工中心 | 產品型錄',
		seoDescription: 'VMC-850 CNC 立式加工中心，12000rpm 主軸，高精度加工，適用於各類金屬材料。',
		featured: false,
		createdAt: '2025-09-10T08:00:00Z',
		updatedAt: '2025-11-25T11:00:00Z',
	},
	{
		id: 6,
		name: '自動化輸送帶系統 CS-2000',
		slug: 'cs-2000',
		description: `<p>CS-2000 自動化輸送帶系統採用模組化設計，可根據產線需求彈性配置。</p>
<p>搭載智慧控制系統，支援速度調節、物件偵測、自動分流等功能。皮帶材質通過 FDA 認證，適用於食品業。</p>`,
		shortDescription: '模組化自動輸送帶，智慧控制，FDA 認證皮帶',
		status: 'published',
		categoryIds: [2],
		tagIds: [6, 7],
		images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'],
		specs: [
			{ label: '輸送速度', value: '0.5 ~ 30 m/min' },
			{ label: '最大載重', value: '50kg/m' },
			{ label: '皮帶寬度', value: '200 ~ 1200mm 可選' },
			{ label: '控制方式', value: 'PLC + HMI' },
		],
		seoTitle: 'CS-2000 自動化輸送帶系統 | 產品型錄',
		seoDescription: 'CS-2000 模組化自動輸送帶，智慧控制，FDA 認證，適用於食品業與製造業。',
		featured: false,
		createdAt: '2025-08-20T08:00:00Z',
		updatedAt: '2025-10-15T14:00:00Z',
	},
	{
		id: 7,
		name: '數位示波器 DSO-4204',
		slug: 'dso-4204',
		description: `<p>DSO-4204 數位示波器具備 4 通道、200MHz 頻寬、2GSa/s 取樣率，適用於電子研發與產線檢測。</p>
<p>7 吋觸控螢幕，支援多種觸發模式與自動量測功能，內建 WiFi 可遠端監控波形。</p>`,
		shortDescription: '4 通道數位示波器，200MHz 頻寬，2GSa/s 取樣率',
		status: 'published',
		categoryIds: [3],
		tagIds: [2, 5],
		images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop'],
		specs: [
			{ label: '通道數', value: '4' },
			{ label: '頻寬', value: '200MHz' },
			{ label: '取樣率', value: '2GSa/s' },
			{ label: '記錄長度', value: '28Mpts' },
			{ label: '顯示螢幕', value: '7吋 觸控' },
		],
		seoTitle: 'DSO-4204 數位示波器 | 產品型錄',
		seoDescription: 'DSO-4204 數位示波器，4 通道 200MHz，2GSa/s 取樣率，適用於電子研發。',
		featured: true,
		createdAt: '2026-01-20T08:00:00Z',
		updatedAt: '2026-02-10T09:00:00Z',
	},
	{
		id: 8,
		name: '雷射測距儀 LM-Pro 500',
		slug: 'lm-pro-500',
		description: `<p>LM-Pro 500 雷射測距儀量測範圍 0.05 ~ 500m，精度 ±1mm，是工程測量的理想工具。</p>
<p>IP65 防塵防水等級，可在惡劣環境下使用。內建藍牙傳輸，可將數據即時同步至手機 App。</p>`,
		shortDescription: '雷射測距儀，量測 500m，精度 ±1mm，IP65 防護',
		status: 'published',
		categoryIds: [3],
		tagIds: [1, 5],
		images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop'],
		specs: [
			{ label: '量測範圍', value: '0.05 ~ 500m' },
			{ label: '精度', value: '±1mm' },
			{ label: '防護等級', value: 'IP65' },
			{ label: '電池續航', value: '5000 次量測' },
			{ label: '傳輸介面', value: '藍牙 5.0' },
		],
		seoTitle: 'LM-Pro 500 雷射測距儀 | 產品型錄',
		seoDescription: 'LM-Pro 500 雷射測距儀，量測 500m 精度 ±1mm，IP65 防護等級。',
		featured: false,
		createdAt: '2025-11-01T08:00:00Z',
		updatedAt: '2026-01-05T10:00:00Z',
	},
	{
		id: 9,
		name: '三用電表 MM-5000',
		slug: 'mm-5000',
		description: `<p>MM-5000 專業三用電表，True RMS 量測，6000 counts 解析度，支援電壓、電流、電阻、電容、頻率等多種量測功能。</p>
<p>CAT IV 600V 安全等級，配備 NCV 非接觸電壓偵測功能。</p>`,
		shortDescription: '專業三用電表，True RMS，CAT IV 安全等級',
		status: 'published',
		categoryIds: [3],
		tagIds: [3, 6],
		images: ['https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=600&fit=crop'],
		specs: [
			{ label: '量測方式', value: 'True RMS' },
			{ label: '解析度', value: '6000 counts' },
			{ label: '安全等級', value: 'CAT IV 600V' },
			{ label: '量測功能', value: 'V/A/Ω/C/F/Hz/NCV' },
		],
		seoTitle: 'MM-5000 專業三用電表 | 產品型錄',
		seoDescription: 'MM-5000 專業三用電表，True RMS 量測，CAT IV 安全等級。',
		featured: false,
		createdAt: '2025-10-01T08:00:00Z',
		updatedAt: '2025-12-01T08:00:00Z',
	},
	{
		id: 10,
		name: '環保緩衝包裝材 EP-Guard',
		slug: 'ep-guard',
		description: `<p>EP-Guard 環保緩衝包裝材採用 100% 可回收紙漿製成，完全可生物分解。</p>
<p>優異的緩衝性能可替代傳統保麗龍，通過 ISTA 3A 運輸測試標準。提供多種規格與客製化裁切服務。</p>`,
		shortDescription: '100% 可回收環保緩衝包裝，替代傳統保麗龍',
		status: 'published',
		categoryIds: [4],
		tagIds: [4, 7],
		images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'],
		specs: [
			{ label: '材質', value: '100% 可回收紙漿' },
			{ label: '密度', value: '30 ~ 80 kg/m³ 可選' },
			{ label: '測試標準', value: 'ISTA 3A' },
			{ label: '環保認證', value: 'FSC / ISO 14001' },
		],
		seoTitle: 'EP-Guard 環保緩衝包裝材 | 產品型錄',
		seoDescription: 'EP-Guard 環保緩衝包裝，100% 可回收，通過 ISTA 3A 測試標準。',
		featured: false,
		createdAt: '2025-07-15T08:00:00Z',
		updatedAt: '2025-09-20T08:00:00Z',
	},
	{
		id: 11,
		name: '高效能運動感測器 MS-X1',
		slug: 'ms-x1',
		description: `<p>MS-X1 運動感測器整合 9 軸 IMU（加速度計 + 陀螺儀 + 磁力計），內建 AI 姿態融合演算法。</p>
<p>超小型封裝僅 3x3x1mm，功耗低至 0.5mA，適合穿戴裝置、無人機、機器人等應用。</p>`,
		shortDescription: '9 軸 IMU 運動感測器，AI 姿態融合，超小型封裝',
		status: 'published',
		categoryIds: [1],
		tagIds: [2, 5],
		images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'],
		specs: [
			{ label: '感測軸數', value: '9 軸 (3+3+3)' },
			{ label: '加速度範圍', value: '±2/4/8/16g' },
			{ label: '陀螺儀範圍', value: '±250/500/1000/2000 dps' },
			{ label: '封裝尺寸', value: '3 x 3 x 1mm' },
			{ label: '介面', value: 'SPI / I2C' },
		],
		seoTitle: 'MS-X1 運動感測器 | 產品型錄',
		seoDescription: 'MS-X1 9 軸 IMU 運動感測器，AI 姿態融合，超小型封裝，適用於穿戴裝置與無人機。',
		featured: false,
		createdAt: '2026-02-01T08:00:00Z',
		updatedAt: '2026-02-15T08:00:00Z',
	},
	{
		id: 12,
		name: '防靜電包裝袋 AS-Bag',
		slug: 'as-bag',
		description: `<p>AS-Bag 防靜電包裝袋採用多層複合材質，表面電阻 10⁸～10¹¹Ω，有效保護靜電敏感元件。</p>
<p>提供 PE 袋、鋁箔袋、遮蔽袋等多種類型，每種皆符合 IEC 61340 標準。可客製印刷與尺寸。</p>`,
		shortDescription: '多層複合防靜電包裝袋，符合 IEC 61340 標準',
		status: 'published',
		categoryIds: [4],
		tagIds: [6, 7],
		images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'],
		specs: [
			{ label: '表面電阻', value: '10⁸～10¹¹Ω' },
			{ label: '類型', value: 'PE / 鋁箔 / 遮蔽袋' },
			{ label: '標準', value: 'IEC 61340' },
			{ label: '客製服務', value: '印刷 / 裁切' },
		],
		seoTitle: 'AS-Bag 防靜電包裝袋 | 產品型錄',
		seoDescription: 'AS-Bag 防靜電包裝袋，多層複合材質，符合 IEC 61340 標準，可客製化。',
		featured: false,
		createdAt: '2025-06-01T08:00:00Z',
		updatedAt: '2025-08-10T08:00:00Z',
	},
];

// ===== 輔助函式 =====
export function getProductsByCategory(categoryId: number): Product[] {
	return products.filter((p) => p.status === 'published' && p.categoryIds.includes(categoryId));
}

export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug && p.status === 'published');
}

export function getCategoryBySlug(slug: string): Category | undefined {
	return categories.find((c) => c.slug === slug);
}

export function getFeaturedProducts(): Product[] {
	return products.filter((p) => p.status === 'published' && p.featured);
}

export function getLatestProducts(limit: number = 6): Product[] {
	return products
		.filter((p) => p.status === 'published')
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);
}

export function searchProducts(query: string): Product[] {
	const q = query.toLowerCase();
	return products.filter(
		(p) =>
			p.status === 'published' &&
			(p.name.toLowerCase().includes(q) ||
				p.shortDescription.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q))
	);
}

export function getTagById(id: number): Tag | undefined {
	return tags.find((t) => t.id === id);
}

export function getProductTags(product: Product): Tag[] {
	return product.tagIds.map((id) => getTagById(id)).filter(Boolean) as Tag[];
}

export function getProductCategories(product: Product): Category[] {
	return product.categoryIds
		.map((id) => categories.find((c) => c.id === id))
		.filter(Boolean) as Category[];
}

// ===== 文章 =====
export interface Article {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string; // HTML 內容
	coverImage: string;
	category: string;
	author: string;
	status: 'published' | 'draft';
	seoTitle: string;
	seoDescription: string;
	createdAt: string;
	updatedAt: string;
}

export const articleCategories = ['技術分享', '產業動態', '產品應用', '公司新聞'];

export const articles: Article[] = [
	{
		id: 1,
		title: '工業 4.0 時代的智慧感測技術趨勢',
		slug: 'industry-4-smart-sensor-trends',
		excerpt:
			'隨著工業 4.0 持續推進，智慧感測器成為製造業數位轉型的關鍵元件。本文探討最新的感測技術發展方向與應用案例。',
		content: `<h2>智慧感測器的演進</h2>
<p>工業 4.0 的核心概念之一是「網宇實體系統（CPS）」，而感測器正是連接物理世界與數位世界的橋樑。從傳統的類比訊號輸出，到現今整合 AI 運算能力的智慧感測器，這項技術已經歷了革命性的轉變。</p>
<h3>關鍵技術趨勢</h3>
<ul>
<li><strong>邊緣運算整合</strong>：感測器內建 AI 推論能力，可在現場即時分析數據</li>
<li><strong>無線通訊</strong>：支援 5G、LoRa、NB-IoT 等多種通訊協定</li>
<li><strong>能量採集</strong>：利用環境能量（振動、溫差、光線）供電，實現免電池設計</li>
<li><strong>自我校準</strong>：透過機器學習算法，自動補償漂移與老化效應</li>
</ul>
<h3>應用案例</h3>
<p>某半導體廠導入我們的 MS-X1 運動感測器，用於晶圓搬運機器人的姿態控制，成功將定位精度提升 40%，產線良率提高 2.3%。</p>
<p>智慧感測器的未來不僅止於資料收集，更將成為邊緣智慧的核心載體，推動製造業朝向全面智慧化邁進。</p>`,
		coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
		category: '技術分享',
		author: '張工程師',
		status: 'published',
		seoTitle: '工業 4.0 智慧感測技術趨勢 | 產品型錄',
		seoDescription: '探討工業 4.0 時代智慧感測器的技術發展趨勢與製造業應用案例。',
		createdAt: '2026-02-15T08:00:00Z',
		updatedAt: '2026-02-15T08:00:00Z',
	},
	{
		id: 2,
		title: '如何選擇適合的工業電源模組？完整指南',
		slug: 'how-to-choose-industrial-power-module',
		excerpt:
			'工業電源模組的選擇直接影響設備穩定性與壽命。本文提供完整的選購指南，從功率計算到保護機制一次了解。',
		content: `<h2>電源模組選型的核心考量</h2>
<p>在工業環境中，電源品質直接決定了整體系統的可靠度。選擇合適的電源模組需要考量多個面向。</p>
<h3>1. 功率需求計算</h3>
<p>首先需要詳細列出所有負載的功耗需求，並預留 20-30% 的裕度。注意區分連續負載與峰值負載的差異。</p>
<h3>2. 輸入電壓範圍</h3>
<p>全球各地的電壓標準不同，建議選擇寬輸入範圍（如 85-264VAC）的產品，如我們的 PM-500W 系列。</p>
<h3>3. 保護機制</h3>
<p>完善的保護機制是工業電源的基本要求：</p>
<ul>
<li>過壓保護（OVP）</li>
<li>過流保護（OCP）</li>
<li>過溫保護（OTP）</li>
<li>短路保護（SCP）</li>
</ul>
<h3>4. 散熱設計</h3>
<p>高效率的電源模組可以降低散熱需求。轉換效率 95% 以上的產品，在滿載時的發熱量僅為 90% 效率產品的一半。</p>`,
		coverImage: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=450&fit=crop',
		category: '產品應用',
		author: '李技術總監',
		status: 'published',
		seoTitle: '工業電源模組選購指南 | 產品型錄',
		seoDescription: '從功率計算、輸入電壓、保護機制到散熱設計，完整的工業電源模組選購指南。',
		createdAt: '2026-02-10T08:00:00Z',
		updatedAt: '2026-02-12T10:00:00Z',
	},
	{
		id: 3,
		title: '2026 年半導體產業展望與供應鏈趨勢',
		slug: '2026-semiconductor-industry-outlook',
		excerpt:
			'全球半導體市場在 AI 需求驅動下持續成長。本文分析 2026 年產業展望、供應鏈變化及對電子零件市場的影響。',
		content: `<h2>全球半導體市場概況</h2>
<p>2026 年全球半導體市場預計將達到 7,000 億美元規模，較 2025 年成長 15%。其中 AI 晶片需求佔比持續擴大，成為主要成長動能。</p>
<h3>供應鏈結構變化</h3>
<p>供應鏈區域化趨勢加速，各國積極建立本地製造能力：</p>
<ul>
<li>台灣持續領先先進製程，3nm 量產穩定</li>
<li>美國 CHIPS Act 推動本土晶圓廠建設</li>
<li>歐洲聚焦車用與工業用半導體</li>
</ul>
<h3>對零件市場的影響</h3>
<p>MCU、MOSFET、被動元件等工業用半導體供需趨於平衡，但高階 AI 相關元件仍維持較長交期。建議客戶提前規劃採購，確保供料穩定。</p>`,
		coverImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=450&fit=crop',
		category: '產業動態',
		author: '王分析師',
		status: 'published',
		seoTitle: '2026 半導體產業展望 | 產品型錄',
		seoDescription: '分析 2026 年全球半導體市場趨勢、供應鏈變化及對電子零件採購的影響。',
		createdAt: '2026-02-05T08:00:00Z',
		updatedAt: '2026-02-05T08:00:00Z',
	},
	{
		id: 4,
		title: '精密測量儀器的校準與維護最佳實踐',
		slug: 'precision-instrument-calibration-guide',
		excerpt: '定期校準與正確維護是確保測量儀器精度的關鍵。本文分享專業的校準流程與日常維護技巧。',
		content: `<h2>為什麼校準如此重要？</h2>
<p>測量儀器的精度會隨著使用時間、環境條件和操作方式而逐漸漂移。定期校準不僅是品質管理的要求，更是確保產品品質的基礎。</p>
<h3>校準週期建議</h3>
<p>不同類型的儀器有不同的建議校準週期：</p>
<ul>
<li>數位示波器：每 12 個月</li>
<li>三用電表：每 6-12 個月</li>
<li>雷射測距儀：每 12-24 個月</li>
</ul>
<h3>日常維護要點</h3>
<p>良好的日常維護習慣可以延長儀器壽命並維持精度：</p>
<ul>
<li>使用後清潔探頭與接點</li>
<li>避免極端溫度與濕度環境</li>
<li>定期檢查電池狀態</li>
<li>妥善存放於防塵防震的環境中</li>
</ul>`,
		coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=450&fit=crop',
		category: '技術分享',
		author: '陳品管經理',
		status: 'published',
		seoTitle: '測量儀器校準與維護指南 | 產品型錄',
		seoDescription: '專業的精密測量儀器校準流程與日常維護最佳實踐指南。',
		createdAt: '2026-01-28T08:00:00Z',
		updatedAt: '2026-01-30T14:00:00Z',
	},
	{
		id: 5,
		title: '本公司榮獲 ISO 9001:2015 品質管理認證',
		slug: 'iso-9001-certification-announcement',
		excerpt:
			'我們很高興宣布，本公司已正式取得 ISO 9001:2015 品質管理系統認證，展現對品質的持續承諾。',
		content: `<h2>品質管理的重要里程碑</h2>
<p>經過為期六個月的嚴格審查，本公司正式取得 ISO 9001:2015 品質管理系統認證。這項認證涵蓋我們的產品採購、品質檢驗、倉儲管理及客戶服務全流程。</p>
<h3>認證範圍</h3>
<ul>
<li>電子零件的採購與品質檢驗</li>
<li>機械設備的進出口與技術支援</li>
<li>測量儀器的銷售與校準服務</li>
<li>包裝材料的客製化設計與品管</li>
</ul>
<h3>對客戶的承諾</h3>
<p>取得 ISO 9001 認證代表我們在品質管理體系上達到國際標準。我們將持續精進，為客戶提供更可靠的產品與服務。</p>`,
		coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
		category: '公司新聞',
		author: '管理部',
		status: 'published',
		seoTitle: 'ISO 9001:2015 認證公告 | 產品型錄',
		seoDescription: '本公司正式取得 ISO 9001:2015 品質管理系統認證，涵蓋全流程品質管理。',
		createdAt: '2026-01-20T08:00:00Z',
		updatedAt: '2026-01-20T08:00:00Z',
	},
	{
		id: 6,
		title: '環保包裝趨勢：從減塑到全循環經濟',
		slug: 'eco-packaging-circular-economy',
		excerpt:
			'全球環保法規日趨嚴格，包裝產業正加速轉型。從減塑政策到循環經濟模式，了解包裝材料的綠色革命。',
		content: `<h2>包裝產業的綠色轉型</h2>
<p>隨著全球環保意識提升與法規收嚴，傳統塑膠包裝正面臨前所未有的挑戰。歐盟已宣布 2030 年前所有包裝必須可回收或可重複使用。</p>
<h3>主要趨勢</h3>
<ul>
<li><strong>生物可分解材料</strong>：以 PLA、PHA 等生物基材料取代傳統塑膠</li>
<li><strong>紙基包裝</strong>：紙漿模塑製品需求大幅成長，如我們的 EP-Guard 系列</li>
<li><strong>極簡設計</strong>：減少不必要的包裝層數與用量</li>
<li><strong>循環回收體系</strong>：建立完善的回收與再製流程</li>
</ul>
<h3>我們的綠色承諾</h3>
<p>本公司的所有包裝材料產品均通過 FSC 認證，並持續研發更環保的緩衝包裝解決方案。EP-Guard 系列已成功幫助超過 200 家企業實現包裝減塑目標。</p>`,
		coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
		category: '產業動態',
		author: '林永續長',
		status: 'published',
		seoTitle: '環保包裝與循環經濟趨勢 | 產品型錄',
		seoDescription: '從減塑政策到循環經濟，探討包裝產業的綠色轉型趨勢與解決方案。',
		createdAt: '2026-01-15T08:00:00Z',
		updatedAt: '2026-01-18T11:00:00Z',
	},
];

// ===== 文章輔助函式 =====
export function getArticleBySlug(slug: string): Article | undefined {
	return articles.find((a) => a.slug === slug && a.status === 'published');
}

export function getLatestArticles(limit: number = 6): Article[] {
	return articles
		.filter((a) => a.status === 'published')
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, limit);
}

export function getArticlesByCategory(category: string): Article[] {
	return articles.filter((a) => a.status === 'published' && a.category === category);
}

// ===== 使用者與權限 =====
export type Role = 'admin' | 'editor' | 'author' | 'viewer';

export const roleLabels: Record<Role, string> = {
	admin: '管理員',
	editor: '編輯者',
	author: '作者',
	viewer: '檢視者',
};

export type Permission =
	| 'dashboard'
	| 'products'
	| 'categories'
	| 'tags'
	| 'articles'
	| 'own_articles'
	| 'users';

/** 各角色的權限矩陣 */
export const rolePermissions: Record<Role, Permission[]> = {
	admin: ['dashboard', 'products', 'categories', 'tags', 'articles', 'own_articles', 'users'],
	editor: ['dashboard', 'products', 'categories', 'tags', 'articles', 'own_articles'],
	author: ['dashboard', 'own_articles'],
	viewer: ['dashboard'],
};

export interface User {
	id: number;
	username: string;
	password: string;
	displayName: string;
	role: Role;
	createdAt: string;
}

/** 使用者資料（模擬用，存於 localStorage） */
const defaultUsers: User[] = [
	{
		id: 1,
		username: 'admin',
		password: '123456',
		displayName: '系統管理員',
		role: 'admin',
		createdAt: '2025-01-01T00:00:00Z',
	},
];

/** 從 localStorage 讀取使用者清單 */
export function getUsers(): User[] {
	if (typeof window === 'undefined') return defaultUsers;
	const stored = localStorage.getItem('cms_users');
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return defaultUsers;
		}
	}
	return defaultUsers;
}

/** 儲存使用者清單至 localStorage */
function saveUsers(users: User[]) {
	if (typeof window !== 'undefined') {
		localStorage.setItem('cms_users', JSON.stringify(users));
	}
}

/** 驗證帳號密碼 */
export function authenticateUser(username: string, password: string): User | null {
	const users = getUsers();
	return users.find((u) => u.username === username && u.password === password) || null;
}

/** 新增使用者 */
export function addUser(user: Omit<User, 'id' | 'createdAt'>): User {
	const users = getUsers();
	const newUser: User = {
		...user,
		id: Math.max(0, ...users.map((u) => u.id)) + 1,
		createdAt: new Date().toISOString(),
	};
	users.push(newUser);
	saveUsers(users);
	return newUser;
}

/** 刪除使用者 */
export function deleteUser(id: number): boolean {
	const users = getUsers();
	const filtered = users.filter((u) => u.id !== id);
	if (filtered.length === users.length) return false;
	saveUsers(filtered);
	return true;
}

/** 更新使用者 */
export function updateUser(
	id: number,
	updates: Partial<Omit<User, 'id' | 'createdAt'>>
): User | null {
	const users = getUsers();
	const idx = users.findIndex((u) => u.id === id);
	if (idx === -1) return null;
	users[idx] = { ...users[idx], ...updates };
	saveUsers(users);
	return users[idx];
}

/** 檢查角色是否擁有特定權限 */
export function hasPermission(role: Role, permission: Permission): boolean {
	return rolePermissions[role]?.includes(permission) ?? false;
}
