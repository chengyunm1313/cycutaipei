export type SqlRecord = Record<string, unknown>;

export const SNAPSHOT_MODULES = [
	'site_settings',
	'categories',
	'products',
	'articles',
	'article_categories',
	'tags',
	'pages',
	'menus',
	'site_contents',
] as const;

export type SnapshotModuleKey = (typeof SNAPSHOT_MODULES)[number];

export interface SiteSnapshotData {
	site_settings?: unknown;
	categories?: unknown;
	products?: unknown;
	articles?: unknown;
	article_categories?: unknown;
	tags?: unknown;
	pages?: unknown;
	menus?: unknown;
	site_contents?: unknown;
}

export interface SiteSnapshotPayload {
	version?: unknown;
	exportedAt?: unknown;
	data?: SiteSnapshotData;
}

export interface SiteImportOptionsPayload {
	mode?: unknown;
	modules?: unknown;
}

export interface SiteImportedCounts {
	site_settings: number;
	categories: number;
	products: number;
	articles: number;
	article_categories: number;
	tags: number;
	pages: number;
	menus: number;
	site_contents: number;
}

export interface SiteImportResultPayload {
	success: boolean;
	mode: 'full' | 'partial';
	modules: SnapshotModuleKey[];
	imported: SiteImportedCounts;
	revalidate: {
		tags: string[];
		paths: string[];
		errors: string[];
	};
}
