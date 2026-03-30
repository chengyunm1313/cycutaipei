import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { categories, products, articles, users } from '@/db/schema';

export const runtime = 'edge';

/**
 * 種子資料 API — 將初始資料匯入 D1
 * POST /api/seed
 * 警告：此 API 會清空並重建所有資料，僅供開發/初始化使用
 */
export async function POST() {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);

		// 先清空所有資料表
		await db.delete(products).all();
		await db.delete(articles).all();
		await db.delete(categories).all();
		// 保留現有使用者，不清空 users 表

		// === 匯入分類 ===
		const seedCategories = [
			{
				id: 1,
				name: '電子零件',
				slug: 'electronic-parts',
				description: '高品質電子零件，適用於各類工業與消費性電子產品',
				image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
			},
			{
				id: 2,
				name: '機械設備',
				slug: 'machinery',
				description: '精密機械與自動化設備，提升生產效率',
				image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&h=300&fit=crop',
			},
			{
				id: 3,
				name: '測量儀器',
				slug: 'measurement',
				description: '專業測量與檢測儀器，確保品質精度',
				image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
			},
			{
				id: 4,
				name: '包裝材料',
				slug: 'packaging',
				description: '環保包裝解決方案，保護您的產品',
				image: 'https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4?w=400&h=300&fit=crop',
			},
		];

		for (const cat of seedCategories) {
			await db.insert(categories).values(cat).onConflictDoNothing();
		}

		// === 匯入產品 (簡化版) ===
		const seedProducts = [
			{
				name: '高效能微控制器 MCU-3200',
				slug: 'mcu-3200',
				description: 'MCU-3200 是一款高效能 32 位元微控制器',
				price: 0,
				categoryId: 1,
				status: 'published' as const,
			},
			{
				name: '精密電阻陣列 RA-100',
				slug: 'ra-100',
				description: 'RA-100 精密電阻陣列採用薄膜製程技術',
				price: 0,
				categoryId: 1,
				status: 'published' as const,
			},
			{
				name: '工業級電源模組 PM-500W',
				slug: 'pm-500w',
				description: 'PM-500W 工業級電源模組提供 500W 連續輸出功率',
				price: 0,
				categoryId: 1,
				status: 'published' as const,
			},
			{
				name: '多軸伺服驅動器 SD-4000',
				slug: 'sd-4000',
				description: 'SD-4000 多軸伺服驅動器支援最多 4 軸同步控制',
				price: 0,
				categoryId: 2,
				status: 'published' as const,
			},
			{
				name: 'CNC 立式加工中心 VMC-850',
				slug: 'vmc-850',
				description: 'VMC-850 立式加工中心採用高剛性鑄鐵機身',
				price: 0,
				categoryId: 2,
				status: 'published' as const,
			},
			{
				name: '自動化輸送帶系統 CS-2000',
				slug: 'cs-2000',
				description: 'CS-2000 自動化輸送帶系統採用模組化設計',
				price: 0,
				categoryId: 2,
				status: 'published' as const,
			},
			{
				name: '數位示波器 DSO-4204',
				slug: 'dso-4204',
				description: 'DSO-4204 數位示波器具備 4 通道',
				price: 0,
				categoryId: 3,
				status: 'published' as const,
			},
			{
				name: '雷射測距儀 LM-Pro 500',
				slug: 'lm-pro-500',
				description: 'LM-Pro 500 雷射測距儀量測範圍 0.05 ~ 500m',
				price: 0,
				categoryId: 3,
				status: 'published' as const,
			},
			{
				name: '三用電表 MM-5000',
				slug: 'mm-5000',
				description: 'MM-5000 專業三用電表，True RMS 量測',
				price: 0,
				categoryId: 3,
				status: 'published' as const,
			},
			{
				name: '環保緩衝包裝材 EP-Guard',
				slug: 'ep-guard',
				description: 'EP-Guard 環保緩衝包裝材採用 100% 可回收紙漿製成',
				price: 0,
				categoryId: 4,
				status: 'published' as const,
			},
			{
				name: '高效能運動感測器 MS-X1',
				slug: 'ms-x1',
				description: 'MS-X1 運動感測器整合 9 軸 IMU',
				price: 0,
				categoryId: 1,
				status: 'published' as const,
			},
			{
				name: '防靜電包裝袋 AS-Bag',
				slug: 'as-bag',
				description: 'AS-Bag 防靜電包裝袋採用多層複合材質',
				price: 0,
				categoryId: 4,
				status: 'published' as const,
			},
		];

		for (const prod of seedProducts) {
			await db.insert(products).values(prod).onConflictDoNothing();
		}

		// === 匯入文章 ===
		const seedArticles = [
			{
				title: '工業 4.0 時代的智慧感測技術趨勢',
				slug: 'industry-4-smart-sensor-trends',
				excerpt: '隨著工業 4.0 的推進，智慧感測器正在改變製造業的面貌。',
				category: '技術分享',
				author: '王大明',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop',
			},
			{
				title: '如何選擇適合的工業電源模組',
				slug: 'how-to-choose-industrial-power-module',
				excerpt: '選擇工業電源模組時，需要考慮多項關鍵因素。',
				category: '產品應用',
				author: '李小華',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=450&fit=crop',
			},
			{
				title: '2026 半導體產業展望',
				slug: '2026-semiconductor-industry-outlook',
				excerpt: '2026 年半導體產業持續受惠於 AI、電動車等新興需求。',
				category: '產業動態',
				author: '張建國',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=450&fit=crop',
			},
			{
				title: '精密量測儀器的校準與維護指南',
				slug: 'precision-instruments-calibration-guide',
				excerpt: '定期校準是確保量測精度的關鍵步驟。',
				category: '技術分享',
				author: '陳美玲',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=450&fit=crop',
			},
			{
				title: '本公司通過 ISO 9001:2015 品質管理認證',
				slug: 'iso-9001-certification',
				excerpt: '我們正式通過 ISO 9001:2015 品質管理系統認證。',
				category: '公司新聞',
				author: '公關部',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
			},
			{
				title: '綠色包裝趨勢：從減塑到循環經濟',
				slug: 'green-packaging-trends',
				excerpt: '隨著環保法規日趨嚴格與消費者意識抬頭。',
				category: '產業動態',
				author: '環保專案組',
				status: 'published' as const,
				coverImage:
					'https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4?w=800&h=450&fit=crop',
			},
		];

		for (const art of seedArticles) {
			await db.insert(articles).values(art).onConflictDoNothing();
		}

		// === 匯入使用者 ===
		const seedUsers = [
			{
				username: 'admin',
				password: '123456',
				displayName: '管理員',
				role: 'admin' as const,
			},
			{
				username: 'editor',
				password: '123456',
				displayName: '編輯者',
				role: 'editor' as const,
			},
			{
				username: 'author',
				password: '123456',
				displayName: '作者',
				role: 'author' as const,
			},
		];

		for (const user of seedUsers) {
			await db.insert(users).values(user).onConflictDoNothing();
		}

		return NextResponse.json({
			success: true,
			counts: {
				categories: seedCategories.length,
				products: seedProducts.length,
				articles: seedArticles.length,
				users: seedUsers.length,
			},
		});
	} catch (error) {
		console.error('Seed error:', error);
		return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
	}
}
