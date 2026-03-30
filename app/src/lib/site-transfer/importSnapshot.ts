import type { SiteCacheScope } from '@/lib/siteCache';
import { triggerSiteRevalidation } from '@/lib/revalidateSiteCache';
import { ensureTagsTable } from '@/db/ensureTagsTable';
import {
	type SiteImportOptionsPayload,
	type SiteImportResultPayload,
	type SiteSnapshotPayload,
	type SnapshotModuleKey,
	type SqlRecord,
	SNAPSHOT_MODULES,
} from '@/lib/site-transfer/types';

const MODULE_CLEAR_SQL: Partial<Record<SnapshotModuleKey, string>> = {
	products: 'DELETE FROM products',
	categories: 'DELETE FROM categories',
	articles: 'DELETE FROM articles',
	article_categories: 'DELETE FROM article_categories',
	tags: 'DELETE FROM tags',
	menus: 'DELETE FROM menus',
	pages: 'DELETE FROM pages',
	site_contents: 'DELETE FROM site_contents',
};

const MODULE_CLEAR_ORDER: SnapshotModuleKey[] = [
	'site_contents',
	'menus',
	'products',
	'pages',
	'categories',
	'articles',
	'article_categories',
	'tags',
	'site_settings',
];

const CACHE_SCOPES_BY_MODULE: Partial<Record<SnapshotModuleKey, SiteCacheScope[]>> = {
	site_settings: ['siteSettings'],
	categories: ['categories'],
	products: ['products'],
	articles: ['articles'],
	pages: ['pages'],
	menus: ['menus'],
	site_contents: ['siteContent'],
};

interface NormalizedImportOptions {
	mode: 'full' | 'partial';
	modules: Set<SnapshotModuleKey>;
	orderedModules: SnapshotModuleKey[];
}

interface ImportSnapshotParams {
	db: D1Database;
	payload: SiteSnapshotPayload;
	options?: SiteImportOptionsPayload;
}

export class SnapshotImportError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = 'SnapshotImportError';
		this.status = status;
	}
}

function asObject(value: unknown): SqlRecord | null {
	return value && typeof value === 'object' && !Array.isArray(value) ? (value as SqlRecord) : null;
}

function asArray(value: unknown): SqlRecord[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is SqlRecord => !!asObject(item));
}

function toStringOrNull(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	const str = String(value).trim();
	return str.length > 0 ? str : null;
}

function toStringValue(value: unknown): string {
	return String(value ?? '').trim();
}

function toNumberOrNull(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;
	const num = Number(value);
	return Number.isFinite(num) ? num : null;
}

function toParentNumberOrNull(value: unknown): number | null {
	const num = toNumberOrNull(value);
	if (num === null) return null;
	return num > 0 ? num : null;
}

function toRowId(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	const normalized = String(value).trim();
	return normalized.length > 0 ? normalized : null;
}

function toBooleanInt(value: unknown, fallback = 1): number {
	if (typeof value === 'number') return value ? 1 : 0;
	if (typeof value === 'boolean') return value ? 1 : 0;
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === '1' || normalized === 'true') return 1;
		if (normalized === '0' || normalized === 'false') return 0;
	}
	return fallback;
}

function normalizeImportOptions(options?: SiteImportOptionsPayload): NormalizedImportOptions | null {
	const requestedMode = options?.mode === 'partial' ? 'partial' : 'full';
	if (requestedMode === 'full') {
		return {
			mode: 'full',
			modules: new Set<SnapshotModuleKey>(SNAPSHOT_MODULES),
			orderedModules: [...SNAPSHOT_MODULES],
		};
	}

	if (!Array.isArray(options?.modules)) return null;

	const moduleSet = new Set<SnapshotModuleKey>();
	for (const value of options.modules) {
		if (typeof value !== 'string') continue;
		if ((SNAPSHOT_MODULES as readonly string[]).includes(value)) {
			moduleSet.add(value as SnapshotModuleKey);
		}
	}

	// 依賴保護：分類會影響產品，頁面會影響導覽選單。
	if (moduleSet.has('categories')) moduleSet.add('products');
	if (moduleSet.has('pages')) moduleSet.add('menus');

	if (moduleSet.size === 0) return null;

	const orderedModules = SNAPSHOT_MODULES.filter((module) => moduleSet.has(module));
	return {
		mode: 'partial',
		modules: moduleSet,
		orderedModules,
	};
}

function buildRevalidateScopes(modules: Set<SnapshotModuleKey>): SiteCacheScope[] {
	const scopes = new Set<SiteCacheScope>();
	for (const moduleKey of modules) {
		const mapped = CACHE_SCOPES_BY_MODULE[moduleKey] || [];
		for (const scope of mapped) scopes.add(scope);
	}
	return Array.from(scopes);
}

async function clearSiteData(db: D1Database, modules: Set<SnapshotModuleKey>) {
	const statements: D1PreparedStatement[] = [];
	for (const moduleKey of MODULE_CLEAR_ORDER) {
		if (!modules.has(moduleKey)) continue;
		const sql = MODULE_CLEAR_SQL[moduleKey];
		if (!sql) continue;
		statements.push(db.prepare(sql));
	}

	if (statements.length === 0) return;

	await db.batch(statements);
}

async function insertRowsWithParentDependency(
	rows: SqlRecord[],
	getId: (row: SqlRecord) => string | null,
	getParentId: (row: SqlRecord) => string | null,
	insertRow: (row: SqlRecord) => Promise<void>,
	contextLabel: string
) {
	const pending = [...rows];
	const pendingIdSet = new Set(pending.map((row) => getId(row)).filter((value): value is string => !!value));
	const insertedIdSet = new Set<string>();

	let progressed = true;
	while (pending.length > 0 && progressed) {
		progressed = false;

		for (let index = 0; index < pending.length; index += 1) {
			const row = pending[index];
			const rowId = getId(row);
			const parentId = getParentId(row);

			if (parentId && pendingIdSet.has(parentId) && !insertedIdSet.has(parentId)) {
				continue;
			}

			await insertRow(row);
			if (rowId) insertedIdSet.add(rowId);
			pending.splice(index, 1);
			progressed = true;
			index -= 1;
		}
	}

	if (pending.length > 0) {
		const unresolved = pending
			.slice(0, 5)
			.map((row) => `${getId(row) || '(unknown)'} -> ${getParentId(row) || '(none)'}`)
			.join(', ');
		throw new SnapshotImportError(
			`Failed to import ${contextLabel}: unresolved parent references (${unresolved})`,
			400
		);
	}
}

export async function importSnapshotToDb({
	db,
	payload,
	options,
}: ImportSnapshotParams): Promise<SiteImportResultPayload> {
	const normalizedOptions = normalizeImportOptions(options);
	if (!normalizedOptions) {
		throw new SnapshotImportError(
			'Invalid import options. partial mode requires at least one valid module.',
			400
		);
	}

	const { mode, modules: selectedModules, orderedModules } = normalizedOptions;
	const data = payload.data;
	if (!data || typeof data !== 'object') {
		throw new SnapshotImportError('Invalid payload.data format', 400);
	}

	const siteSettings = asObject(data.site_settings);
	const categories = asArray(data.categories);
	const products = asArray(data.products);
	const articles = asArray(data.articles);
	const articleCategories = asArray(data.article_categories);
	const tags = asArray(data.tags);
	const pages = asArray(data.pages);
	const menus = asArray(data.menus);
	const siteContents = asArray(data.site_contents);

	// 舊環境可能缺少 tags 表，先補齊可避免 full import 在清空/寫入時失敗。
	await ensureTagsTable(db);

	await clearSiteData(db, selectedModules);

	const imported = {
		site_settings: 0,
		categories: 0,
		products: 0,
		articles: 0,
		article_categories: 0,
		tags: 0,
		pages: 0,
		menus: 0,
		site_contents: 0,
	};

	if (selectedModules.has('site_settings') && siteSettings) {
		await db
			.prepare(
				`INSERT INTO site_settings (
					id, site_name, site_title, logo_url, footer_logo_url, favicon_url,
					social_share_image_url, meta_description, meta_keywords, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT(id) DO UPDATE SET
					site_name = excluded.site_name,
					site_title = excluded.site_title,
					logo_url = excluded.logo_url,
					footer_logo_url = excluded.footer_logo_url,
					favicon_url = excluded.favicon_url,
					social_share_image_url = excluded.social_share_image_url,
					meta_description = excluded.meta_description,
					meta_keywords = excluded.meta_keywords,
					updated_at = excluded.updated_at`
			)
			.bind(
				toNumberOrNull(siteSettings.id) || 1,
				toStringValue(siteSettings.site_name) || '產品型錄平台',
				toStringOrNull(siteSettings.site_title),
				toStringOrNull(siteSettings.logo_url),
				toStringOrNull(siteSettings.footer_logo_url),
				toStringOrNull(siteSettings.favicon_url),
				toStringOrNull(siteSettings.social_share_image_url),
				toStringOrNull(siteSettings.meta_description),
				toStringOrNull(siteSettings.meta_keywords),
				toStringOrNull(siteSettings.updated_at) || new Date().toISOString()
			)
			.run();
		imported.site_settings = 1;
	}

	if (selectedModules.has('categories')) {
		await insertRowsWithParentDependency(
			categories,
			(row) => toRowId(toNumberOrNull(row.id)),
			(row) => toRowId(toParentNumberOrNull(row.parent_id)),
			async (row) => {
			const id = toNumberOrNull(row.id);
			const name = toStringValue(row.name);
			const slug = toStringValue(row.slug);
			if (id === null || !name || !slug) return;

			await db
				.prepare(
					`INSERT INTO categories (
						id, name, slug, description, image, cover_image, carousel_images,
						sort_order, is_active, parent_id, created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					name,
					slug,
					toStringOrNull(row.description),
					toStringOrNull(row.image),
					toStringOrNull(row.cover_image),
					toStringOrNull(row.carousel_images),
					toNumberOrNull(row.sort_order) ?? 0,
					toBooleanInt(row.is_active, 1),
					toParentNumberOrNull(row.parent_id),
					toStringOrNull(row.created_at) || new Date().toISOString()
				)
				.run();
			imported.categories += 1;
			},
			'categories'
		);
	}

	if (selectedModules.has('pages')) {
		for (const row of pages) {
			const id = toNumberOrNull(row.id);
			const title = toStringValue(row.title);
			const slug = toStringValue(row.slug);
			if (id === null || !title || !slug) continue;

			await db
				.prepare(
					`INSERT INTO pages (
						id, title, slug, content_blocks, in_menu, status, seo_title,
						seo_description, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					title,
					slug,
					toStringOrNull(row.content_blocks),
					toBooleanInt(row.in_menu, 0),
					toStringOrNull(row.status) || 'published',
					toStringOrNull(row.seo_title),
					toStringOrNull(row.seo_description),
					toStringOrNull(row.created_at) || new Date().toISOString(),
					toStringOrNull(row.updated_at) || new Date().toISOString()
				)
				.run();
			imported.pages += 1;
		}
	}

	if (selectedModules.has('menus')) {
		await insertRowsWithParentDependency(
			menus,
			(row) => toRowId(toNumberOrNull(row.id)),
			(row) => toRowId(toParentNumberOrNull(row.parent_menu_id)),
			async (row) => {
			const id = toNumberOrNull(row.id);
			const title = toStringValue(row.title);
			const type = toStringValue(row.type);
			if (id === null || !title || !type) return;

			await db
				.prepare(
					`INSERT INTO menus (
						id, title, url, type, page_id, position, parent_menu_id, custom_link,
						sort_order, target, is_active, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					title,
					toStringOrNull(row.url),
					type,
					toNumberOrNull(row.page_id),
					toStringOrNull(row.position) || 'top',
					toParentNumberOrNull(row.parent_menu_id),
					toStringOrNull(row.custom_link),
					toNumberOrNull(row.sort_order) ?? 0,
					toStringOrNull(row.target) || '_self',
					toBooleanInt(row.is_active, 1),
					toStringOrNull(row.created_at) || new Date().toISOString(),
					toStringOrNull(row.updated_at) || new Date().toISOString()
				)
				.run();
			imported.menus += 1;
			},
			'menus'
		);
	}

	if (selectedModules.has('products')) {
		for (const row of products) {
			const id = toNumberOrNull(row.id);
			const name = toStringValue(row.name);
			const slug = toStringValue(row.slug);
			if (id === null || !name || !slug) continue;

			await db
				.prepare(
					`INSERT INTO products (
						id, name, slug, description, content, price, category_id, subcategory_id,
						keywords, purchase_link, catalog_link, intro_video_url, list_image, images,
						specs, is_featured, sort_order, status, created_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					name,
					slug,
					toStringOrNull(row.description),
					toStringOrNull(row.content),
					toNumberOrNull(row.price),
					toNumberOrNull(row.category_id),
					toNumberOrNull(row.subcategory_id),
					toStringOrNull(row.keywords),
					toStringOrNull(row.purchase_link),
					toStringOrNull(row.catalog_link),
					toStringOrNull(row.intro_video_url),
					toStringOrNull(row.list_image),
					toStringOrNull(row.images),
					toStringOrNull(row.specs),
					toBooleanInt(row.is_featured, 0),
					toNumberOrNull(row.sort_order) ?? 0,
					toStringOrNull(row.status) || 'published',
					toStringOrNull(row.created_at) || new Date().toISOString()
				)
				.run();
			imported.products += 1;
		}
	}

	if (selectedModules.has('articles')) {
		for (const row of articles) {
			const id = toNumberOrNull(row.id);
			const title = toStringValue(row.title);
			const slug = toStringValue(row.slug);
			if (id === null || !title || !slug) continue;

			await db
				.prepare(
					`INSERT INTO articles (
						id, title, slug, excerpt, content, cover_image, category, author,
						status, seo_title, seo_description, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					title,
					slug,
					toStringOrNull(row.excerpt),
					toStringOrNull(row.content),
					toStringOrNull(row.cover_image),
					toStringOrNull(row.category),
					toStringOrNull(row.author),
					toStringOrNull(row.status) || 'draft',
					toStringOrNull(row.seo_title),
					toStringOrNull(row.seo_description),
					toStringOrNull(row.created_at) || new Date().toISOString(),
					toStringOrNull(row.updated_at) || new Date().toISOString()
				)
				.run();
			imported.articles += 1;
		}
	}

	if (selectedModules.has('article_categories')) {
		for (const row of articleCategories) {
			const id = toNumberOrNull(row.id);
			const name = toStringValue(row.name);
			const slug = toStringValue(row.slug);
			if (id === null || !name || !slug) continue;

			await db
				.prepare(
					`INSERT INTO article_categories (
						id, name, slug, sort_order, is_active, created_at
					) VALUES (?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					name,
					slug,
					toNumberOrNull(row.sort_order) ?? 0,
					toBooleanInt(row.is_active, 1),
					toStringOrNull(row.created_at) || new Date().toISOString()
				)
				.run();
			imported.article_categories += 1;
		}
	}

	if (selectedModules.has('tags')) {
		for (const row of tags) {
			const id = toNumberOrNull(row.id);
			const name = toStringValue(row.name);
			const slug = toStringValue(row.slug);
			if (id === null || !name || !slug) continue;

			await db
				.prepare('INSERT INTO tags (id, name, slug, created_at) VALUES (?, ?, ?, ?)')
				.bind(id, name, slug, toStringOrNull(row.created_at) || new Date().toISOString())
				.run();
			imported.tags += 1;
		}
	}

	if (selectedModules.has('site_contents')) {
		await insertRowsWithParentDependency(
			siteContents,
			(row) => toRowId(row.id),
			(row) => toRowId(row.parent_id),
			async (row) => {
			const id = toStringValue(row.id);
			const type = toStringValue(row.type);
			if (!id || !type) return;

			await db
				.prepare(
					`INSERT INTO site_contents (
						id, type, parent_id, title, slug, summary, content, image_url,
						link_url, extra_json, sort_order, is_active, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					id,
					type,
					toStringOrNull(row.parent_id),
					toStringOrNull(row.title),
					toStringOrNull(row.slug),
					toStringOrNull(row.summary),
					toStringOrNull(row.content),
					toStringOrNull(row.image_url),
					toStringOrNull(row.link_url),
					toStringOrNull(row.extra_json),
					toNumberOrNull(row.sort_order) ?? 0,
					toBooleanInt(row.is_active, 1),
					toStringOrNull(row.created_at) || new Date().toISOString(),
					toStringOrNull(row.updated_at) || new Date().toISOString()
				)
				.run();
			imported.site_contents += 1;
			},
			'site_contents'
		);
	}

	const revalidateResult = triggerSiteRevalidation({
		scopes: buildRevalidateScopes(selectedModules),
	});

	return {
		success: true,
		mode,
		modules: orderedModules,
		imported,
		revalidate: revalidateResult,
	};
}
