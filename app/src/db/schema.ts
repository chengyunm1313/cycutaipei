import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	image: text('image'),
	coverImage: text('cover_image'),
	carouselImages: text('carousel_images'), // JSON array
	sortOrder: integer('sort_order').notNull().default(0),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	parentId: integer('parent_id'), // null for root categories
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	content: text('content'),
	price: real('price'),
	categoryId: integer('category_id').references(() => categories.id),
	subcategoryId: integer('subcategory_id').references(() => categories.id),
	keywords: text('keywords'),
	purchaseLink: text('purchase_link'),
	introVideoUrl: text('intro_video_url'),
	listImage: text('list_image'),
	images: text('images'), // JSON array
	specs: text('specs'), // JSON object/array
	catalogLink: text('catalog_link'),
	isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
	sortOrder: integer('sort_order').notNull().default(0),
	status: text('status', { enum: ['published', 'draft'] }).default('published'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const articles = sqliteTable('articles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	excerpt: text('excerpt'),
	content: text('content'),
	coverImage: text('cover_image'),
	category: text('category'),
	author: text('author'),
	status: text('status', { enum: ['published', 'draft'] }).default('published'),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const articleCategories = sqliteTable('article_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	sortOrder: integer('sort_order').notNull().default(0),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	displayName: text('display_name'),
	role: text('role', { enum: ['admin', 'editor', 'author', 'viewer'] }).default('viewer'),
	notes: text('notes'),
	photoUrl: text('photo_url'),
	aboutAuthor: text('about_author'),
	socialLinks: text('social_links'), // JSON array/object string
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const pages = sqliteTable('pages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	contentBlocks: text('content_blocks'), // JSON string
	inMenu: integer('in_menu', { mode: 'boolean' }).default(false),
	status: text('status', { enum: ['published', 'draft'] }).default('published'),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const menus = sqliteTable('menus', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	url: text('url'),
	type: text('type', { enum: ['system', 'page', 'link', 'category_dropdown'] }).notNull(),
	pageId: integer('page_id').references(() => pages.id),
	position: text('position', { enum: ['top', 'bottom', 'child'] }).notNull().default('top'),
	parentMenuId: integer('parent_menu_id').references((): AnySQLiteColumn => menus.id),
	customLink: text('custom_link'),
	sortOrder: integer('sort_order').notNull().default(0),
	target: text('target').default('_self'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
