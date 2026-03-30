# 🛍️ 產品型錄平台 (Product Catalog CMS)

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20|%20D1%20|%20R2-F38020?style=flat&logo=cloudflare)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript)

這是一個基於 **Next.js 16 (App Router)** 與 **Cloudflare (Pages, D1, R2)** 打造的現代化企業級產品目錄與內容管理系統 (CMS)。系統提供了極致效能的前台展示，並配備視覺化、強大且友善的客製化後台管理介面。

---

## ✨ 核心特色與功能 (Features)

### 🎨 前台展示 (Frontend)

- **🚀 極速效能**：全面使用 **Tailwind CSS v4** 打造，結合 Cloudflare Edge Runtime，提供毫秒級的響應速度。
- **📱 全響應式設計**：完美配適桌面、平板與行動裝置，確保一致的品牌體驗。
- **🔗 動態導覽列 (Navbar Builder)**：選單路由完全由後台導覽選單管理器控制，支援：
  - 一般內部連結 (如：首頁、部落格)
  - 外部連結
  - 自動生成的產品分類下拉選單
- **📄 動態客製化頁面**：管理者可自由建立如「關於我們」、「聯絡我們」等頁面，並搭配預設的 UI 區塊。
- **📦 進階產品目錄**：支援產品分類篩選、多圖展示、詳細規格說明，以及新增的 **產品外部型錄連結** 功能。
- **📰 專業部落格**：完整的文章列表與內容閱讀，支援精選封面圖 (Feature Image) 展示。
- **♻️ ISR + On-demand Revalidate**：前台讀取 API 使用可重用快取與標籤化刷新，後台更新後可立即觸發快取失效。

### ⚙️ 後台管理介面 (Admin CMS)

- **📊 數據分析儀表板 (Dashboard)**：提供系統統計數據摘要、最近更新內容，優化的資料表分頁與排序體驗。
- **📁 智慧型媒體庫 (Media Library)**：
  - 深度整合 **Cloudflare R2** 儲存服務。
  - **支援資料夾 (Folders) 概念**：可將媒體檔案分類存放於不同的目錄。
  - 直覺的網格佈局，支援拖放上傳 (Drag & Drop)、大圖預覽與快速複製網址。
  - 支援直接貼上外部圖片連結（例如 Unsplash / Pexels / Pixabay），不必先上傳也可使用。
- **🧭 導覽選單管理器**：提供視覺化的拖放排序介面，即時調整前台選單結構。
- **📦 網站快照匯入匯出**：可將整站內容匯出為 JSON，支援完整覆蓋或模組化部分匯入，快速複製既有成果。
- **🧩 主題模板一鍵生成**：後台可選擇「產業＋子類別」模板，系統會先自動下載備份，再一鍵建立首頁、文章、產品、關於我們與 FAQ 的預設內容。
- **🔁 一鍵回到初始狀態**：可將網站重置回系統初始內容（同樣先自動下載備份），方便重新開始新專案。
- **✍️ 優質內容編輯體驗**：
  - 集成 **BlockNote** 富文本編輯器，提供類似 Notion 的寫作方式。
  - **原地非同步儲存**：編輯過程中自動保存，降低內容遺失風險。
  - 支援「草稿 (Draft) / 已發布 (Published)」狀態管理。
- **👥 多層級權限控制 (RBAC)**：內建管理員 (Admin)、編輯者 (Editor)、作者 (Author) 及檢視者 (Viewer) 的權限模型。
- **🔔 即時回饋系統**：整合 Mantine Notifications 提供優雅的 Toast 通知提示。

---

## 🛠️ 技術疊代 (Tech Stack)

- **核心框架**：Next.js 16 (App Router)
- **前端核心**：React 19 + TypeScript
- **樣式與 UI**：Tailwind CSS v4 + Mantine 8
- **互動效果**：`@hello-pangea/dnd` (拖放排序)
- **內容編輯**：BlockNote Editor
- **資料庫**：Cloudflare D1 (Serverless SQLite) + Drizzle ORM
- **物件儲存**：Cloudflare R2 Bucket
- **部署環境**：Cloudflare Pages (Global Edge Network)

---

## 📂 專案結構 (Project Structure)

```text
product-catalog-cloudflare/
├── app/                  # Next.js 應用程式主體
│   ├── src/
│   │   ├── app/          # 路由目錄 (前台、/admin 後台、/api 端點)
│   │   ├── components/   # UI 共用元件與 Layout
│   │   ├── db/           # Drizzle Schema 與 D1 資料庫設定
│   │   ├── lib/          # API Client 與 工具函式
│   │   └── contexts/     # Auth 與全域狀態管理
│   ├── public/           # 靜態資源
│   ├── wrangler.toml     # Cloudflare 開發與綁定設定
│   └── package.json      # 專案依賴與腳本
├── migrations/           # D1 資料庫遷移檔 (SQL)
├── docs/                 # 系統設計文件與 PRD
├── implementation_plan.md   # 特色功能實作計畫
└── README.md
```

---

## 🚀 本地開發與運行 (Getting Started)

### 1. 前置準備

- 安裝 [Node.js](https://nodejs.org/) (建議 v18+)
- 擁有 [Cloudflare](https://dash.cloudflare.com/) 帳號並準備 D1 與 R2 服務

### 2. 安裝套件

```bash
cd app
npm install
```

### 3. 資料庫初始化 (Local)

執行資料庫遷移並啟動種子資料匯入：

```bash
cd app
npm run db:migrate:local
npm run db:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

成功啟動後，瀏覽：

- **前台**：`http://localhost:3000`
- **後台**：`http://localhost:3000/admin` (預設帳密：`admin@example.com` / `admin123`)

---

## ☁️ Cloudflare Pages 部署 (Deployment)

### 步驟 1：基礎設定

1. 在 Cloudflare Pages 儀表板建立（或使用既有）專案。
2. 若此 Pages 專案先前已連接 GitHub 自動部署，請改為停用自動部署，改由你手動發版。
3. **Build settings**:
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/app`

### 步驟 2：綁定雲端資源

在 Pages 專案設定中的 **Bindings** 區塊：

1. 綁定 **D1 Database**，變數名稱設為 `DB`。
2. 綁定 **R2 Bucket**，變數名稱設為 `BUCKET`。

### 步驟 3：手動部署到 Cloudflare

```bash
cd app
npm run db:migrate:remote
npm run pages:deploy
npm run smoke:rsc
```

> 第一次在本機部署前，請先完成 `wrangler login` 或設定對應的 Cloudflare API Token。

### 步驟 4：啟用 GitHub Actions 自動檢查（不部署）

本專案已內建 workflow：`.github/workflows/deploy-cloudflare-pages.yml`。  
當 `main` 分支有新 commit 時，會自動：

1. 安裝依賴
2. 執行 Lint 檢查
3. 建置 Next.js
4. 建置 Cloudflare Pages 產物（`next-on-pages`）

此 workflow 不會部署到 Cloudflare，也不需要 Cloudflare Secrets。

### `_rsc` 導頁止血開關

- 系統預設關閉 `Link` 預抓，降低 `_rsc` 預抓噪音。
- 若要重新開啟全域預抓，可設定環境變數：

```bash
NEXT_PUBLIC_LINK_PREFETCH_ENABLED=true
```

> 不設定或設為 `false` 時，預設為關閉。

### 部署後與故障排除（`_rsc` 404）

若線上仍偶發 `_rsc` 404，建議按以下順序處理：

1. 瀏覽器硬刷新（含清快取）後重測。
2. 呼叫 `/api/revalidate` 觸發全站快取重建。
3. 於本機重新手動部署（`cd app && npm run pages:deploy`），再執行 `npm run smoke:rsc` 驗證。

範例（若有設定 `REVALIDATE_TOKEN`，請帶上 token）：

```bash
curl -X POST "https://product-catalog-a2z.pages.dev/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"scopes":["public","products","categories","articles","pages","menus","siteSettings","siteContent"],"includePaths":true}'
```

### 新案複製與重新部署

如果你要把這個模板複製成新的客戶網站，請先看新手指引：

- [`docs/new-project-cloudflare.md`](/Users/hsuhsiang/Desktop/project/code/product-catalog-cloudflare/docs/new-project-cloudflare.md)

---

## 🧩 主題模板快速建站

1. 進入後台：`/admin/site-management/theme-templates`
2. 選擇產業模板（固定六組產業＋子類別）
3. 點擊「一鍵套用模板（先備份）」
4. 系統會先下載當前網站 JSON 備份，再執行全站覆蓋匯入
5. 若要回復，可到 `/admin/site-management/import-export` 匯入剛下載的備份檔

若要直接清回系統初始內容，可在同頁點擊「一鍵回到初始狀態（先備份）」。

---

## 📄 授權條款 (License)

Private — All rights reserved. 版權所有，翻印必究。
