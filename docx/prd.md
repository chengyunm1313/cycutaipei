產品型錄網站 PRD

⸻

1. 產品概述

1.1 產品名稱

Product Catalog Platform

1.2 產品目標

建立一個可由企業自行管理的產品型錄網站，具備：
• 高效能靜態渲染
• SEO 友善
• 可管理產品與分類
• 支援多圖片
• 可擴充 AI 文案與搜尋能力
• 成本低、延展性高

⸻

2. 產品定位

2.1 目標使用者 1. 企業行銷人員（管理產品）2. 業務（查詢產品）3. 一般訪客（瀏覽型錄）

2.2 使用情境
• 訪客瀏覽產品與分類
• 訪客搜尋產品
• 管理者新增 / 修改 / 下架產品
• 管理者上傳圖片

⸻

3. 功能需求

⸻

3.1 前台功能（Public Site）

3.1.1 首頁
• 精選產品
• 最新產品
• 產品分類入口
• SEO Meta 設定

⸻

3.1.2 分類頁
• URL：/category/[slug]
• 顯示：
• 分類名稱
• 分類描述
• 產品列表
• 支援：
• 分頁
• 排序（最新 / 名稱）
• 篩選（標籤）
• 註：標籤篩選為規劃功能，現行版本尚未啟用。

⸻

3.1.3 產品列表頁
• URL：/products
• 支援：
• 分頁
• 搜尋
• 分類篩選
• 標籤篩選
• 註：標籤篩選為規劃功能，現行版本尚未啟用。

⸻

3.1.4 產品詳細頁
• URL：/product/[slug]
• 顯示：
• 產品名稱
• 主圖
• 圖片輪播
• 描述（支援 HTML）
• 規格表
• 標籤
• SEO metadata
• 結構化資料（Schema.org）
• 註：產品標籤顯示為規劃功能，現行版本尚未啟用。

⸻

3.1.5 搜尋功能
• 支援關鍵字搜尋
• 預設使用 SQL LIKE
• 可選升級為：
• Full-text search
• AI embedding 語意搜尋

⸻

3.2 後台 CMS 功能（Admin）

⸻

3.2.1 登入系統
• Email + Password
• JWT 存 cookie
• 權限角色：
• Admin
• Editor

⸻

3.2.2 產品管理
• 建立產品
• 編輯產品
• 上下架
• 排序
• 上傳多圖片（儲存至 R2）
• 設定 SEO 欄位

⸻

3.2.3 分類管理
• 建立分類
• 設定 slug
• 分類排序
• 上下架

⸻

3.2.4 標籤管理
• 建立標籤
• 指派至產品
• 註：本章節為功能規劃，現行版本尚未啟用標籤與內容關聯。

⸻

3.2.5 SEO 管理
• 每頁：
• title
• description
• og:image
• 自動 sitemap.xml
• robots.txt

⸻

3.2.6 AI 文案（選配）
• 一鍵產生產品描述
• 一鍵改寫
• 多語翻譯

（呼叫 Gemini API）

⸻

4. 非功能需求

⸻

4.1 效能
• 首頁 LCP < 2.5s
• 分類頁採 SSG
• API 回應 < 300ms

⸻

4.2 SEO
• 每頁 meta
• 結構化資料
• 靜態渲染
• sitemap

⸻

4.3 延展性
• 支援 10萬筆產品資料
• 使用 D1 + 索引
• 支援未來接第三方搜尋引擎

⸻

4.4 安全性
• API 權限驗證
• Admin 路由保護
• SQL injection 防護

⸻

5. 技術架構

⸻

5.1 系統架構圖（文字版）

User
↓
Cloudflare CDN
↓
Cloudflare Pages（Next.js）
↓
Pages Functions / Workers
↓
D1 Database
↓
R2（圖片儲存）

⸻

5.2 技術選型

層級 技術
Frontend Next.js (App Router)
Hosting Cloudflare Pages
API Pages Functions
DB D1
Storage R2
Auth JWT
AI Gemini API

⸻

6. 資料庫設計（D1 Schema）

⸻

6.1 products

CREATE TABLE products (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
description TEXT,
status TEXT DEFAULT 'draft',
seo_title TEXT,
seo_description TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME
);

⸻

6.2 categories

CREATE TABLE categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
description TEXT,
sort_order INTEGER DEFAULT 0
);

⸻

6.3 product_categories

CREATE TABLE product_categories (
product_id INTEGER,
category_id INTEGER
);

⸻

6.4 tags

CREATE TABLE tags (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT UNIQUE NOT NULL
);
（註：資料表可存在，但現行版本尚未啟用標籤關聯流程）

⸻

6.5 product_tags

CREATE TABLE product_tags (
product_id INTEGER,
tag_id INTEGER
);
（註：關聯表為規劃設計，現行版本尚未導入）

⸻

6.6 product_images

CREATE TABLE product_images (
id INTEGER PRIMARY KEY AUTOINCREMENT,
product_id INTEGER,
image_url TEXT,
sort_order INTEGER DEFAULT 0
);

⸻

7. API 設計

⸻

Public API
• GET /api/products
• GET /api/product/:slug
• GET /api/categories
• GET /api/search?q=

⸻

Admin API
• POST /api/admin/login
• POST /api/admin/products
• PUT /api/admin/products/:id
• DELETE /api/admin/products/:id
• POST /api/admin/upload

⸻

8. 版本規劃

⸻

V1
• 基本型錄
• CMS
• 分類
• SEO
• 圖片管理

⸻

V2
• AI 文案
• AI 搜尋
• 多語系
• 快取優化

⸻

V3
• 會員系統
• 收藏
• 詢價單
• 分析 dashboard

⸻

9. KPI 指標
   • 每月流量
   • 搜尋曝光數
   • 平均載入時間
   • 管理效率（產品建立時間）

⸻

10. 風險評估

風險 解法
D1 效能瓶頸 加索引 / 快取
搜尋效能不足 外接 Meilisearch
大量圖片流量 R2 + CDN
API 負載高 加 Cache 層
