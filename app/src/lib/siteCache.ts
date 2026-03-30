const rawRevalidateSeconds = Number(
	process.env.NEXT_PUBLIC_ISR_REVALIDATE_SECONDS || process.env.ISR_REVALIDATE_SECONDS || '300'
);

/**
 * ISR 預設秒數，提供前台讀取 API 的快取更新頻率。
 */
export const DEFAULT_ISR_REVALIDATE_SECONDS =
	Number.isFinite(rawRevalidateSeconds) && rawRevalidateSeconds >= 10
		? Math.floor(rawRevalidateSeconds)
		: 300;

/**
 * 前台資料快取標籤，供 fetch(next.tags) 與 on-demand revalidate 共用。
 */
export const SITE_CACHE_TAGS = {
	public: 'site:public',
	products: 'site:products',
	categories: 'site:categories',
	articles: 'site:articles',
	pages: 'site:pages',
	menus: 'site:menus',
	siteSettings: 'site:settings',
	siteContent: 'site:content',
} as const;

export type SiteCacheScope = keyof typeof SITE_CACHE_TAGS;

export interface RevalidatePathTarget {
	path: string;
	type?: 'page' | 'layout';
}

/**
 * 路徑快取失效清單，寫入後可讓前台頁面在下一次請求時重新產生。
 */
export const SITE_REVALIDATE_PATH_TARGETS: RevalidatePathTarget[] = [
	{ path: '/', type: 'layout' },
	{ path: '/', type: 'page' },
	{ path: '/about', type: 'page' },
	{ path: '/about/[slug]', type: 'page' },
	{ path: '/faq', type: 'page' },
	{ path: '/faq/[slug]', type: 'page' },
	{ path: '/category/[slug]', type: 'page' },
	{ path: '/product/[slug]', type: 'page' },
	{ path: '/blog/[slug]', type: 'page' },
	{ path: '/[slug]', type: 'page' },
	{ path: '/admin', type: 'page' },
	{ path: '/admin/products', type: 'page' },
	{ path: '/admin/products/[id]', type: 'page' },
	{ path: '/admin/categories', type: 'page' },
	{ path: '/admin/categories/[id]', type: 'page' },
	{ path: '/admin/articles/content', type: 'page' },
	{ path: '/admin/articles/[id]', type: 'page' },
	{ path: '/admin/site-management/about', type: 'page' },
	{ path: '/admin/site-management/about/[id]', type: 'page' },
	{ path: '/admin/site-management/faq', type: 'page' },
	{ path: '/admin/site-management/faq/[id]', type: 'page' },
	{ path: '/admin/site-management/theme-templates', type: 'page' },
];

const URL_SCOPE_RULES: Array<{ pattern: RegExp; scopes: SiteCacheScope[] }> = [
	{ pattern: /\/api\/products(?:\/|$)/, scopes: ['products'] },
	{ pattern: /\/api\/categories(?:\/|$)/, scopes: ['categories'] },
	{ pattern: /\/api\/articles(?:\/|$)/, scopes: ['articles'] },
	{ pattern: /\/api\/pages(?:\/|$)/, scopes: ['pages'] },
	{ pattern: /\/api\/menus(?:\/|$)/, scopes: ['menus'] },
	{ pattern: /\/api\/site-settings(?:\/|$)/, scopes: ['siteSettings'] },
	{ pattern: /\/api\/site-content(?:\/|$)/, scopes: ['siteContent'] },
];

const VALID_SCOPES = new Set<SiteCacheScope>(Object.keys(SITE_CACHE_TAGS) as SiteCacheScope[]);

function extractPathname(rawUrl: string): string {
	try {
		return new URL(rawUrl, 'http://localhost').pathname;
	} catch {
		return rawUrl.split('?')[0] || rawUrl;
	}
}

export function normalizeSiteCacheScopes(input?: unknown): SiteCacheScope[] {
	if (!Array.isArray(input)) return [];
	const normalized = new Set<SiteCacheScope>();
	for (const scope of input) {
		if (typeof scope === 'string' && VALID_SCOPES.has(scope as SiteCacheScope)) {
			normalized.add(scope as SiteCacheScope);
		}
	}
	return Array.from(normalized);
}

export function withPublicScope(scopes: SiteCacheScope[]): SiteCacheScope[] {
	const merged = new Set<SiteCacheScope>(['public', ...scopes]);
	return Array.from(merged);
}

export function scopesToTags(scopes: SiteCacheScope[]): string[] {
	const tags = scopes.map((scope) => SITE_CACHE_TAGS[scope]);
	return Array.from(new Set(tags));
}

export function inferSiteCacheScopesFromUrl(rawUrl: string): SiteCacheScope[] {
	const pathname = extractPathname(rawUrl);
	const scopes = new Set<SiteCacheScope>();
	for (const rule of URL_SCOPE_RULES) {
		if (!rule.pattern.test(pathname)) continue;
		for (const scope of rule.scopes) {
			scopes.add(scope);
		}
	}
	return Array.from(scopes);
}
