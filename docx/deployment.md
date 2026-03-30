# Cloudflare Pages 部署指南 (Next.js + D1 + R2)

本專案採用 Next.js App Router 架構，整合 Cloudflare D1 (SQLite) 資料庫與 R2 物件儲存服務。

## 前置準備

1. 安裝 Node.js v18+
2. 安裝 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
3. 登入 Cloudflare:
   ```bash
   wrangler login
   ```

## 一鍵部署流程

### 1. 初始化資源

在專案根目錄 (`app/`) 執行：

```bash
# 建立 Pages 專案
npx wrangler pages project create product-catalog --production-branch main

# 建立 D1 資料庫
npx wrangler d1 create product-catalog-db

# 建立 R2 儲存桶
npx wrangler r2 bucket create product-catalog-media
```

### 2. 設定資料庫

應用資料表結構 (Schema)：

```bash
npx wrangler d1 execute product-catalog-db --remote --file=schema.sql
```

### 3. 編譯與部署

執行以下指令進行 Edge Runtime 編譯並上傳：

```bash
npm run pages:deploy
```

## GitHub Actions 自動部署

本專案已提供 `.github/workflows/deploy-cloudflare-pages.yml`，支援：

- `push` 到 `main`：自動正式部署（Production）
- 對 `main` 開 PR：自動預覽部署（Preview）
- `workflow_dispatch`：可手動觸發

### 1. 設定 GitHub Secrets

進入 GitHub 專案：**Settings** → **Secrets and variables** → **Actions**，新增：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 2. 自動部署內容

Workflow 會自動執行：

1. `npm ci`
2. `npm run pages:build`
3. `npx wrangler pages deploy .vercel/output/static --project-name product-catalog --branch <branch>`

僅 `main` 正式部署時，另外會執行：

1. `npx wrangler d1 execute product-catalog-db --remote --file=schema.sql`
2. `npx wrangler d1 migrations apply product-catalog-db --remote`

> 注意：PR 預覽部署不會套用遠端 D1 schema/migrations，避免影響正式資料庫。
> 若 PR 來自 fork，由於 GitHub 不會提供 secrets，workflow 會自動略過。

## Cloudflare Dashboard 設定

部署完成後，必須手動綁定資源才能讓應用程式正常運作：

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 **Workers & Pages** > **product-catalog**
3. 點選 **Settings** > **Functions**
4. 設定 **D1 Database Bindings**:
   - Variable name: `DB`
   - D1 Database: `product-catalog-db`
5. 設定 **R2 Bucket Bindings**:
   - Variable name: `BUCKET`
   - R2 Bucket: `product-catalog-media`
6. 重新部署 (Redeploy) 以套用設定。

## ISR / 快取刷新設定（建議）

可在 Pages 專案環境變數新增：

- `NEXT_PUBLIC_ISR_REVALIDATE_SECONDS`：ISR 週期秒數（預設 300）。
- `REVALIDATE_TOKEN`：`/api/revalidate` 的保護 token（建議正式環境必填）。

## 主題模板快速導入（後台）

部署完成後，可透過後台一鍵建立預設網站內容：

1. 進入 `/admin/site-management/theme-templates`
2. 選擇產業模板（固定六組）
3. 點擊「一鍵套用模板（先備份）」

流程會先下載目前網站快照備份，再執行全站覆蓋匯入，並觸發 ISR + On-demand revalidate。

若要回復到套用前狀態，可至 `/admin/site-management/import-export` 匯入剛下載的備份 JSON。

若要一鍵重置為系統初始內容，可在同頁使用「一鍵回到初始狀態（先備份）」。

## 本地開發 (Local Preview)

若要在本地測試 D1與 R2 功能，請使用以下指令：

```bash
npm run pages:preview
```

這會模擬 Cloudflare Pages 環境。

**注意**：`npm run dev` 僅能預覽前端與 Mock Data，無法連接 D1/R2。
