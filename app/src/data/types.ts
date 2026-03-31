/**
 * 共用型別定義
 * 從 mock.ts 抽取，供前後端共用
 */

// ===== 產品 =====
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

export interface ApiProduct {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	content: string | null;
	price: number | null;
	categoryId: number | null;
	subcategoryId: number | null;
	keywords: string | null;
	purchaseLink: string | null;
	catalogLink: string | null;
	introVideoUrl: string | null;
	listImage: string | null;
	images: string | null;
	specs: string | null;
	isFeatured: number | boolean;
	sortOrder: number;
	status: string;
	postDate: string | null;
	createdAt: string;
}

export interface ApiAcademyCategory {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	image: string | null;
	sortOrder: number;
	isActive: number | boolean;
	createdAt: string;
}

export interface ApiAcademyCourse {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string | null;
	categoryId: number | null;
	youtubeUrl: string | null;
	coverImage: string | null;
	speaker: string | null;
	resourceLink: string | null;
	isFeatured: number | boolean;
	sortOrder: number;
	status: string;
	postDate: string | null;
	createdAt: string;
	updatedAt: string;
}

// ===== 分類 =====
export interface Category {
	id: number;
	name: string;
	slug: string;
	description: string;
	imageUrl: string;
	sortOrder: number;
	productCount: number;
}

export interface ApiCategory {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	image: string | null;
	coverImage: string | null;
	carouselImages: string | null;
	sortOrder: number;
	isActive: number | boolean;
	parentId: number | null;
	createdAt: string;
}

// ===== 標籤 =====
export interface Tag {
	id: number;
	name: string;
}

/** D1 標籤 */
export interface ApiTag {
	id: number;
	name: string;
	slug: string;
	createdAt: string;
}

// ===== 文章 =====
export interface Article {
	id: number;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	coverImage: string;
	category: string;
	author: string;
	status: 'published' | 'draft';
	seoTitle: string;
	seoDescription: string;
	createdAt: string;
	updatedAt: string;
}

/** D1 文章 */
export interface ApiArticle {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string | null;
	coverImage: string | null;
	category: string | null;
	author: string | null;
	status: string;
	seoTitle: string | null;
	seoDescription: string | null;
	postDate: string | null;
	createdAt: string;
	updatedAt: string;
}

/** D1 文章分類 */
export interface ApiArticleCategory {
	id: number;
	name: string;
	slug: string;
	sortOrder: number;
	isActive: number | boolean;
	createdAt: string;
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
	| 'academy'
	| 'academy_categories'
	// 預留權限：目前標籤模組尚未啟用於前後台內容流程
	| 'tags'
	| 'articles'
	| 'own_articles'
	| 'media'
	| 'users'
	| 'pages'
	| 'menus'
	| 'site_templates';

/** 各角色的權限矩陣 */
export const rolePermissions: Record<Role, Permission[]> = {
	admin: [
		'dashboard',
		'products',
		'categories',
		'academy',
		'academy_categories',
		'tags',
		'articles',
		'own_articles',
		'media',
		'users',
		'pages',
		'menus',
		'site_templates',
	],
	editor: [
		'dashboard',
		'products',
		'categories',
		'academy',
		'academy_categories',
		'tags',
		'articles',
		'own_articles',
		'media',
		'pages',
		'menus',
	],
	author: ['dashboard', 'own_articles'],
	viewer: ['dashboard'],
};

export interface User {
	id: number;
	username: string;
	password: string;
	displayName: string;
	role: Role;
	notes?: string | null;
	photoUrl?: string | null;
	aboutAuthor?: string | null;
	socialLinks?: string | null;
	createdAt: string;
}

/** API 回傳的使用者（不含密碼） */
export interface ApiUser {
	id: number;
	username: string;
	displayName: string;
	role: string;
	notes?: string | null;
	photoUrl?: string | null;
	aboutAuthor?: string | null;
	socialLinks?: string | null;
	createdAt: string;
}

/** 檢查角色是否擁有特定權限 */
export function checkPermission(role: Role, permission: Permission): boolean {
	return rolePermissions[role]?.includes(permission) ?? false;
}

// ===== 區塊與頁面 =====

export type BlockType = 'hero' | 'text' | 'image' | 'carousel'; // 可以擴充更多類型

export interface PageBlock {
	id: string; // 區塊唯一識別碼，例如 UUID 或隨機字串，前端排序/編輯需要
	type: BlockType;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any; // 不同區塊型態有不同的資料結構，實務上可改為 Union Type 限定
}

export interface HeroBlockData {
	title: string;
	subtitle?: string;
	imageUrl?: string;
	ctaText?: string;
	ctaLink?: string;
}

export interface TextBlockData {
	content: string; // HTML 或 Markdown，實作上為了簡單先用字串或簡易 HTML
	align?: 'left' | 'center' | 'right';
}

export interface CarouselBlockData {
	images: string[];
}

export interface Page {
	id: number;
	title: string;
	slug: string;
	contentBlocks: PageBlock[]; // JSON array 轉換而來
	inMenu: boolean;
	status: 'published' | 'draft';
	seoTitle: string;
	seoDescription: string;
	createdAt: string;
	updatedAt: string;
}

/** D1 頁面 (API 回傳格式，對應 DB 欄位) */
export interface ApiPage {
	id: number;
	title: string;
	slug: string;
	content_blocks: string | null; // 原生 D1 的 JSON 字串
	in_menu: number; // SQLite 存布林用 0 / 1
	status: string;
	seoTitle: string | null;
	seoDescription: string | null;
	createdAt: string;
	updatedAt: string;
}

// ===== 選單系統 =====

export type MenuType = 'system' | 'page' | 'link' | 'category_dropdown';

export interface Menu {
	id: number;
	title: string;
	url: string | null;
	type: MenuType;
	pageId: number | null;
	position: 'top' | 'bottom' | 'child';
	parentMenuId: number | null;
	customLink: string | null;
	sortOrder: number;
	target: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

/** D1 選單 (API 回傳格式，對應 DB 欄位) */
export interface ApiMenu {
	id: number;
	title: string;
	url: string | null;
	type: string;
	pageId: number | null;
	position: 'top' | 'bottom' | 'child' | string;
	parentMenuId: number | null;
	customLink: string | null;
	sortOrder: number;
	target: string | null;
	isActive: number | boolean; // SQLite/Drizzle 可能為 0/1 或 boolean
	createdAt: string;
	updatedAt: string;
}

// ===== 網站管理 =====

/** D1 網站資訊設定 */
export interface ApiSiteSettings {
	id: number;
	siteName: string;
	siteTitle: string | null;
	logoUrl: string | null;
	footerLogoUrl: string | null;
	faviconUrl: string | null;
	socialShareImageUrl: string | null;
	metaDescription: string | null;
	metaKeywords: string | null;
	contactLink: string | null;
	taxId: string | null;
	phone: string | null;
	fax: string | null;
	address: string | null;
	email: string | null;
	facebookUrl: string | null;
	instagramUrl: string | null;
	youtubeUrl: string | null;
	lineUrl: string | null;
	copyright: string | null;
	enquirySubjects: string | null; // JSON string
	updatedAt: string;
}

export type SiteContentType =
	| 'about_page'
	| 'faq_page'
	| 'faq_item'
	| 'home_carousel'
	| 'home_about'
	| 'home_carousel_config';

export interface CarouselSettings {
	autoPlay: boolean;
	delay: number;
	effect: 'fade' | 'slide';
}

/** D1 網站內容模組資料 */
export interface ApiSiteContent {
	id: string;
	type: SiteContentType | string;
	parentId: string | null;
	title: string | null;
	slug: string | null;
	summary: string | null;
	content: string | null;
	imageUrl: string | null;
	linkUrl: string | null;
	extraJson: string | null;
	sortOrder: number;
	isActive: number;
	createdAt: string;
	updatedAt: string;
}
