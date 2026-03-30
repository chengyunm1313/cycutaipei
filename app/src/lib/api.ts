/**
 * 前端 API Client
 * 封裝所有與後端 API 的通訊，供後台 Client Components 使用
 */

import type {
	ApiProduct,
	ApiCategory,
	ApiArticle,
	ApiArticleCategory,
	ApiUser,
	ApiTag,
	ApiPage,
	ApiMenu,
	ApiSiteSettings,
	ApiSiteContent,
	SiteContentType,
} from '@/data/types';
import { isSupportedImageFile, isSvgImageFile } from '@/lib/imageFile';
import {
	DEFAULT_ISR_REVALIDATE_SECONDS,
	inferSiteCacheScopesFromUrl,
	scopesToTags,
	withPublicScope,
} from '@/lib/siteCache';

interface NextFetchOptions extends RequestInit {
	next?: {
		revalidate?: number | false;
		tags?: string[];
	};
}

function normalizeBaseUrl(rawUrl: string): string {
	if (!rawUrl) return rawUrl;
	const withProtocol =
		rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
	return withProtocol.replace(/\/+$/, '');
}

function resolveServerBaseUrl(): string {
	// 在 Cloudflare Pages 中，CF_PAGES_URL 通常會存在，或者是手動設定的 APP_URL
	const explicitUrl =
		process.env.APP_URL ||
		process.env.NEXT_PUBLIC_APP_URL ||
		process.env.CF_PAGES_URL ||
		process.env.VERCEL_URL;

	if (explicitUrl) {
		return normalizeBaseUrl(explicitUrl);
	}

	// 容錯處：如果都沒有，使用 localhost
	return 'http://localhost:3000';
}

const BASE_URL = typeof window !== 'undefined' ? '' : resolveServerBaseUrl();
const IS_PRODUCTION_BUILD =
	typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

function normalizeRequestInit(options?: RequestInit): NextFetchOptions | undefined {
	if (!options) return options;

	const normalized = {
		...options,
	} as NextFetchOptions;

	// Cloudflare Workers 不支援 RequestInit.cache，需在 server-side fetch 移除
	if (typeof window === 'undefined' && normalized.cache !== undefined) {
		const cacheValue = normalized.cache;
		delete normalized.cache;

		// 保留 no-store 的語意：改用 Next.js 的 revalidate=0
		if (cacheValue === 'no-store') {
			normalized.next = {
				...(normalized.next || {}),
				revalidate: 0,
			};
		}
	}

	return normalized;
}

function applyServerCacheDefaults(
	url: string,
	options?: NextFetchOptions
): NextFetchOptions | undefined {
	if (typeof window !== 'undefined') return options;

	const method = (options?.method || 'GET').toUpperCase();
	if (method !== 'GET' && method !== 'HEAD') return options;

	if (options?.next?.revalidate === 0 || options?.next?.revalidate === false) {
		return options;
	}

	const inferredScopes = inferSiteCacheScopesFromUrl(url);
	if (inferredScopes.length === 0) return options;

	const inferredTags = scopesToTags(withPublicScope(inferredScopes));
	const mergedTags = new Set<string>([...(options?.next?.tags || []), ...inferredTags]);

	return {
		...(options || {}),
		next: {
			...(options?.next || {}),
			revalidate: options?.next?.revalidate ?? DEFAULT_ISR_REVALIDATE_SECONDS,
			tags: Array.from(mergedTags),
		},
	};
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
	// 只在 production build 階段允許短路，避免 build 時 localhost 尚未啟動導致失敗
	// runtime 階段不可短路，否則前台會永久拿到空資料
	if (IS_PRODUCTION_BUILD && BASE_URL.includes('localhost')) {
		console.warn(`[Build] Skipping fetch for ${url} to avoid ECONNREFUSED during prerender.`);
		// 根據 URL 回傳適合的空值，避免解構失敗
		if (
			url.includes('products') ||
			url.includes('categories') ||
			url.includes('articles') ||
			url.includes('site-content')
		) {
			return [] as unknown as T;
		}
		return {} as unknown as T;
	}

	const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
	const normalizedOptions = normalizeRequestInit(options);
	const cachedOptions = applyServerCacheDefaults(fullUrl, normalizedOptions);
	const res = await fetch(fullUrl, {
		...(cachedOptions || {}),
		headers: {
			'Content-Type': 'application/json',
			...cachedOptions?.headers,
		},
	});
	if (!res.ok) {
		const err = (await res.json().catch(() => ({ error: res.statusText }))) as { error?: string };
		throw new Error(err.error || `HTTP ${res.status}`);
	}
	return res.json();
}

// ===== Articles =====

export async function fetchArticles(status?: string): Promise<ApiArticle[]> {
	const params = status ? `?status=${status}` : '';
	return fetchJson<ApiArticle[]>(`/api/articles${params}`);
}

export async function createArticle(data: Partial<ApiArticle>): Promise<ApiArticle> {
	return fetchJson<ApiArticle>('/api/articles', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function fetchArticle(id: number): Promise<ApiArticle> {
	return fetchJson<ApiArticle>(`/api/articles/${id}`);
}

export async function updateArticle(id: number, data: Partial<ApiArticle>): Promise<ApiArticle> {
	return fetchJson<ApiArticle>(`/api/articles/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteArticleApi(id: number): Promise<void> {
	await fetchJson(`/api/articles/${id}`, {
		method: 'DELETE',
	});
}

export async function fetchArticleBySlug(slug: string): Promise<ApiArticle> {
	return fetchJson<ApiArticle>(`/api/articles?slug=${encodeURIComponent(slug)}`);
}

// ===== Article Categories =====

export async function fetchArticleCategories(activeOnly?: boolean): Promise<ApiArticleCategory[]> {
	const params = activeOnly ? '?active=1' : '';
	return fetchJson<ApiArticleCategory[]>(`/api/article-categories${params}`);
}

export async function createArticleCategory(
	data: Partial<ApiArticleCategory>
): Promise<ApiArticleCategory> {
	return fetchJson<ApiArticleCategory>('/api/article-categories', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function updateArticleCategory(
	id: number,
	data: Partial<ApiArticleCategory>
): Promise<ApiArticleCategory> {
	return fetchJson<ApiArticleCategory>(`/api/article-categories/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteArticleCategoryApi(id: number): Promise<void> {
	await fetchJson(`/api/article-categories/${id}`, {
		method: 'DELETE',
	});
}

export async function updateArticleCategoryOrderApi(updates: { id: number; order: number }[]) {
	return fetchJson('/api/article-categories/order', {
		method: 'PUT',
		body: JSON.stringify({ updates }),
	});
}

// ===== Products =====

export async function fetchProducts(params?: {
	status?: string;
	categoryId?: number;
	q?: string;
	limit?: number;
	slug?: string;
}): Promise<ApiProduct[]> {
	const searchParams = new URLSearchParams();
	if (params?.status) searchParams.set('status', params.status);
	if (params?.categoryId) searchParams.set('categoryId', String(params.categoryId));
	if (params?.q) searchParams.set('q', params.q);
	if (params?.limit) searchParams.set('limit', String(params.limit));
	if (params?.slug) searchParams.set('slug', params.slug);
	const qs = searchParams.toString();
	return fetchJson<ApiProduct[]>(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProductBySlug(slug: string): Promise<ApiProduct> {
	return fetchJson<ApiProduct>(`/api/products?slug=${encodeURIComponent(slug)}`);
}

export async function createProduct(data: Partial<ApiProduct>): Promise<ApiProduct> {
	return fetchJson<ApiProduct>('/api/products', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function fetchProduct(id: number): Promise<ApiProduct> {
	return fetchJson<ApiProduct>(`/api/products/${id}`);
}

export async function updateProduct(id: number, data: Partial<ApiProduct>): Promise<ApiProduct> {
	return fetchJson<ApiProduct>(`/api/products/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteProductApi(id: number): Promise<void> {
	await fetchJson(`/api/products/${id}`, {
		method: 'DELETE',
	});
}

// ===== Categories =====

export async function fetchCategories(): Promise<ApiCategory[]> {
	return fetchJson<ApiCategory[]>('/api/categories');
}

export async function updateCategoryOrderApi(updates: { id: number; order: number }[]) {
	return fetchJson('/api/categories/order', {
		method: 'PUT',
		body: JSON.stringify({ updates }),
	});
}

export async function fetchCategoryBySlug(slug: string): Promise<ApiCategory> {
	return fetchJson<ApiCategory>(`/api/categories?slug=${encodeURIComponent(slug)}`);
}

export async function createCategory(data: Partial<ApiCategory>): Promise<ApiCategory> {
	return fetchJson<ApiCategory>('/api/categories', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function fetchCategory(id: number): Promise<ApiCategory> {
	return fetchJson<ApiCategory>(`/api/categories/${id}`);
}

export async function updateCategory(id: number, data: Partial<ApiCategory>): Promise<ApiCategory> {
	return fetchJson<ApiCategory>(`/api/categories/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteCategoryApi(id: number): Promise<void> {
	await fetchJson(`/api/categories/${id}`, {
		method: 'DELETE',
	});
}

// ===== Tags =====

export async function fetchTags(): Promise<ApiTag[]> {
	return fetchJson<ApiTag[]>('/api/tags');
}

export async function createTag(data: { name: string; slug: string }): Promise<ApiTag> {
	return fetchJson<ApiTag>('/api/tags', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function deleteTagApi(id: number): Promise<void> {
	await fetchJson(`/api/tags/${id}`, {
		method: 'DELETE',
	});
}

// ===== Users =====

export async function fetchUsers(): Promise<ApiUser[]> {
	return fetchJson<ApiUser[]>('/api/users');
}

export async function createUser(data: {
	username: string;
	password: string;
	displayName?: string;
	role?: string;
	notes?: string;
	photoUrl?: string;
	aboutAuthor?: string;
	socialLinks?: string;
}): Promise<ApiUser> {
	return fetchJson<ApiUser>('/api/users', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function deleteUserApi(id: number): Promise<void> {
	await fetchJson('/api/users', {
		method: 'DELETE',
		body: JSON.stringify({ id }),
	});
}

export async function fetchUser(id: number): Promise<ApiUser> {
	return fetchJson<ApiUser>(`/api/users/${id}`);
}

export async function updateUserApi(
	id: number,
	data: Partial<ApiUser & { password?: string }>
): Promise<ApiUser> {
	return fetchJson<ApiUser>(`/api/users/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

// ===== Auth =====

export async function loginApi(username: string, password: string): Promise<ApiUser> {
	return fetchJson<ApiUser>('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify({ username, password }),
	});
}

// ===== Upload =====

export async function uploadFile(file: File): Promise<{ key: string; url: string }> {
	try {
		if (!isSupportedImageFile(file)) {
			throw new Error('僅支援 JPG、PNG、GIF、WebP、SVG 圖片格式');
		}

		// 在上傳前對圖片進行 WebP 壓縮
		let fileToUpload = file;
		if (!isSvgImageFile(file)) {
			const { compressImageToWebp } = await import('@/lib/imageUtils');
			fileToUpload = await compressImageToWebp(file, 0.8);
		}

		const formData = new FormData();
		formData.append('file', fileToUpload);

		const res = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		});
		if (!res.ok) {
			throw new Error('Upload failed');
		}
		return res.json();
	} catch (error) {
		console.error('Client-side error during file upload: ', error);
		throw error;
	}
}

// ===== Media =====

export interface MediaObject {
	key: string;
	size: number;
	uploaded: string;
	url: string;
}

export async function fetchMediaList(): Promise<MediaObject[]> {
	const data = await fetchJson<{ objects: MediaObject[] }>('/api/media');
	return data.objects;
}

export async function deleteMedia(key: string): Promise<void> {
	await fetchJson(`/api/media/${encodeURIComponent(key)}`, {
		method: 'DELETE',
	});
}

// ===== Pages =====

export async function fetchPages(inMenu?: boolean): Promise<ApiPage[]> {
	const params = inMenu ? `?inMenu=true` : '';
	return fetchJson<ApiPage[]>(`/api/pages${params}`);
}

export async function createPage(data: Partial<ApiPage>): Promise<ApiPage> {
	return fetchJson<ApiPage>('/api/pages', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function fetchPage(id: number): Promise<ApiPage> {
	return fetchJson<ApiPage>(`/api/pages/${id}`);
}

export async function updatePage(id: number, data: Partial<ApiPage>): Promise<ApiPage> {
	return fetchJson<ApiPage>(`/api/pages/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deletePageApi(id: number): Promise<void> {
	await fetchJson(`/api/pages/${id}`, {
		method: 'DELETE',
	});
}

export async function fetchPageBySlug(slug: string): Promise<ApiPage> {
	return fetchJson<ApiPage>(`/api/pages?slug=${encodeURIComponent(slug)}`);
}

// ===== Menus =====

interface FetchMenusOptions {
	activeOnly?: boolean;
	type?: string;
	position?: string;
	parentId?: number;
	requestInit?: RequestInit;
}

export async function fetchMenus(options?: boolean | FetchMenusOptions): Promise<ApiMenu[]> {
	const normalizedOptions: FetchMenusOptions =
		typeof options === 'boolean' ? { activeOnly: options } : options || {};
	const { requestInit, ...queryOptions } = normalizedOptions;
	const searchParams = new URLSearchParams();
	if (queryOptions.activeOnly) searchParams.set('active', '1');
	if (queryOptions.type) searchParams.set('type', queryOptions.type);
	if (queryOptions.position) searchParams.set('position', queryOptions.position);
	if (queryOptions.parentId !== undefined) {
		searchParams.set('parentId', String(queryOptions.parentId));
	}
	const qs = searchParams.toString();
	return fetchJson<ApiMenu[]>(`/api/menus${qs ? `?${qs}` : ''}`, requestInit);
}

export async function createMenu(data: Partial<ApiMenu>): Promise<ApiMenu> {
	return fetchJson<ApiMenu>('/api/menus', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function fetchMenu(id: number): Promise<ApiMenu> {
	return fetchJson<ApiMenu>(`/api/menus/${id}`);
}

export async function updateMenu(id: number, data: Partial<ApiMenu>): Promise<ApiMenu> {
	return fetchJson<ApiMenu>(`/api/menus/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteMenuApi(id: number): Promise<void> {
	await fetchJson(`/api/menus/${id}`, {
		method: 'DELETE',
	});
}

export async function updateMenuOrderApi(updates: { id: number; order: number }[]) {
	return fetchJson('/api/menus/order', {
		method: 'PUT',
		body: JSON.stringify({ updates }),
	});
}

// ===== Site Settings =====

export async function fetchSiteSettings(options?: RequestInit): Promise<ApiSiteSettings> {
	return fetchJson<ApiSiteSettings>('/api/site-settings', options);
}

export async function updateSiteSettings(
	data: Partial<Omit<ApiSiteSettings, 'id' | 'updatedAt'>>
): Promise<ApiSiteSettings> {
	return fetchJson<ApiSiteSettings>('/api/site-settings', {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

// ===== Site Content =====

export async function fetchSiteContents(
	params?: {
		type?: SiteContentType | string;
		parentId?: string;
		activeOnly?: boolean;
		slug?: string;
	},
	options?: RequestInit
): Promise<ApiSiteContent[]> {
	const searchParams = new URLSearchParams();
	if (params?.type) searchParams.set('type', params.type);
	if (params?.parentId) searchParams.set('parentId', params.parentId);
	if (params?.activeOnly) searchParams.set('active', '1');
	if (params?.slug) searchParams.set('slug', params.slug);
	const qs = searchParams.toString();
	return fetchJson<ApiSiteContent[]>(`/api/site-content${qs ? `?${qs}` : ''}`, options);
}

export async function fetchSiteContent(id: string, options?: RequestInit): Promise<ApiSiteContent> {
	return fetchJson<ApiSiteContent>(`/api/site-content/${id}`, options);
}

export async function createSiteContent(data: Partial<ApiSiteContent>): Promise<ApiSiteContent> {
	return fetchJson<ApiSiteContent>('/api/site-content', {
		method: 'POST',
		body: JSON.stringify(data),
	});
}

export async function updateSiteContent(
	id: string,
	data: Partial<ApiSiteContent>
): Promise<ApiSiteContent> {
	return fetchJson<ApiSiteContent>(`/api/site-content/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
}

export async function deleteSiteContent(id: string): Promise<void> {
	await fetchJson(`/api/site-content/${id}`, {
		method: 'DELETE',
	});
}

export async function updateSiteContentOrderApi(updates: { id: string; order: number }[]) {
	return fetchJson('/api/site-content/order', {
		method: 'PUT',
		body: JSON.stringify({ updates }),
	});
}

// ===== Site Import/Export =====

export interface SiteSnapshotData {
	site_settings: Record<string, unknown> | null;
	categories: Record<string, unknown>[];
	products: Record<string, unknown>[];
	articles: Record<string, unknown>[];
	article_categories: Record<string, unknown>[];
	tags: Record<string, unknown>[];
	pages: Record<string, unknown>[];
	menus: Record<string, unknown>[];
	site_contents: Record<string, unknown>[];
}

export type SiteSnapshotModuleKey =
	| 'site_settings'
	| 'categories'
	| 'products'
	| 'articles'
	| 'article_categories'
	| 'tags'
	| 'pages'
	| 'menus'
	| 'site_contents';

export interface SiteImportOptions {
	mode?: 'full' | 'partial';
	modules?: SiteSnapshotModuleKey[];
}

export interface SiteSnapshotFile {
	version: string;
	exportedAt: string;
	data: SiteSnapshotData;
}

export interface SiteImportResult {
	success: boolean;
	mode?: 'full' | 'partial';
	modules?: SiteSnapshotModuleKey[];
	imported: Record<string, number>;
	revalidate: {
		tags: string[];
		paths: string[];
		errors: string[];
	};
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

export interface SiteTemplateApplyResult extends SiteImportResult {
	templateId: string;
	action?: 'reset' | 'apply';
}

export async function exportSiteSnapshot(): Promise<SiteSnapshotFile> {
	return fetchJson<SiteSnapshotFile>('/api/site-transfer/export');
}

export async function importSiteSnapshot(
	payload: SiteSnapshotFile,
	options?: SiteImportOptions
): Promise<SiteImportResult> {
	return fetchJson<SiteImportResult>('/api/site-transfer/import', {
		method: 'POST',
		body: JSON.stringify({ payload, options }),
	});
}

export async function triggerOnDemandRevalidate(scopes?: string[]) {
	return fetchJson<{
		success: boolean;
		tags: string[];
		paths: string[];
		errors: string[];
	}>('/api/revalidate', {
		method: 'POST',
		body: JSON.stringify({ scopes }),
	});
}

export async function fetchSiteTemplates(): Promise<SiteTemplateMeta[]> {
	const result = await fetchJson<{ templates: SiteTemplateMeta[] }>('/api/site-template');
	return result.templates || [];
}

export async function applySiteTemplate(templateId: string): Promise<SiteTemplateApplyResult> {
	return fetchJson<SiteTemplateApplyResult>('/api/site-template', {
		method: 'POST',
		body: JSON.stringify({ templateId }),
	});
}

export async function resetSiteToInitialState(): Promise<SiteTemplateApplyResult> {
	return fetchJson<SiteTemplateApplyResult>('/api/site-template/reset', {
		method: 'POST',
	});
}
