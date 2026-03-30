# 從此模板建立新網站並重新部署到 Cloudflare

這份文件是給第一次接案、第一次把這個模板複製成新專案的人使用。

結論先講：

- 可以複製這個專案當成新案起點。
- 但不要「原封不動整包搬走」就直接部署。
- 你至少要換掉新的專案資料夾、Git 倉庫、Cloudflare Pages 專案、D1、R2，以及 `app/wrangler.toml` 內的設定。
- 根目錄的 `.env` 若含有舊專案或你自己的 Cloudflare 憑證，不應直接帶到新案，也不要提交到 Git。

---

## 建議做法

最安全的方式不是在原資料夾上直接改，而是建立一份新的專案副本。

建議流程：

1. 先從 GitHub clone 這個模板 repo 到本機。
2. 保留這份 clone 下來的專案當「母版模板」。
3. 複製一份到新的資料夾，例如 `client-a-catalog`。
4. 在新資料夾內重新初始化 Git。
5. 建立全新的 Cloudflare 資源並綁定到新專案。
6. 本機確認可跑後，再部署到新的 Cloudflare Pages 網站。

---

## 先備知識

這個模板目前的部署結構是：

- `app/`：真正的 Next.js 應用程式
- `app/wrangler.toml`：Cloudflare Pages、D1、R2 綁定設定
- `migrations/`：D1 資料庫 migration SQL
- `app/package.json`：部署與 migration 指令

目前這個模板的 migration 指令有寫死資料庫名稱：

```json
"db:migrate:local": "npx wrangler d1 migrations apply product-catalog-db --local",
"db:migrate:remote": "npx wrangler d1 migrations apply product-catalog-db --remote"
```

所以你建立新案後，如果 D1 名稱不是 `product-catalog-db`，這兩個 script 也要一起改。

---

## 步驟 1：先從 GitHub 取得模板 repo

如果你是第一次拿這個模板來開案，建議先從 GitHub clone：

模板 repo：

- `https://github.com/chengyunm1313/product-catalog-cloudflare`

```bash
git clone https://github.com/chengyunm1313/product-catalog-cloudflare.git
cd product-catalog-cloudflare
```

這一步的目的不是直接在這份 clone 下來的資料夾裡改客戶案，而是先把它保留成你的母版模板。

如果你未來還會持續用這個網站模板接案，這樣做比較穩，因為：

- 模板母版和客戶專案不會混在一起
- 之後要開第二個、第三個案子時，不必重新找模板
- 若模板未來有更新，你也比較容易回來比對差異

---

## 步驟 2：複製成新的專案資料夾

假設原模板叫做 `product-catalog-cloudflare`，新案叫做 `client-a-catalog`。

你可以在模板的上一層目錄執行：

```bash
rsync -av \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.wrangler' \
  --exclude '.env' \
  --exclude 'app/dev_server.log' \
  product-catalog-cloudflare/ client-a-catalog/
```

這樣比 Finder 直接複製更安全，因為它會排除：

- `.git`：避免把舊專案提交紀錄一起帶過去
- `.env`：避免把敏感憑證帶去新案
- `node_modules`、`.next`、`.wrangler`：避免帶入舊的快取與編譯產物

如果你真的要用 Finder 複製，也可以，但複製完請手動刪除上面這些檔案或資料夾。

---

## 步驟 3：重新初始化 Git

進入新資料夾後：

```bash
cd client-a-catalog
git init
git add .
git commit -m "初始化新客戶網站模板"
```

如果你有新的 GitHub repo，再把它接上去：

```bash
git remote add origin <你的新 repo URL>
git branch -M main
git push -u origin main
```

---

## 步驟 4：修改專案基本識別資料

至少先改下面這些地方。

### 1. `app/wrangler.toml`

你要改：

- `name`
- `APP_URL`
- `database_name`
- `database_id`
- `bucket_name`

範例：

```toml
name = "client-a-catalog"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
APP_URL = "https://client-a-catalog.pages.dev"

[[d1_databases]]
binding = "DB"
database_name = "client-a-catalog-db"
database_id = "請換成新 D1 的 database_id"
migrations_dir = "../migrations"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "client-a-catalog-media"
```

### 2. `app/package.json`

把 migration script 內的資料庫名稱一起改掉：

```json
"db:migrate:local": "npx wrangler d1 migrations apply client-a-catalog-db --local",
"db:migrate:remote": "npx wrangler d1 migrations apply client-a-catalog-db --remote"
```

### 3. 站台文案與品牌資料

部署成功後，建議先到後台修改：

- 網站名稱
- Logo / 圖片
- 關於我們
- FAQ
- 首頁文案
- 產品分類與產品內容
- 頂部導覽選單

如果你只是要快速換主題，也可以使用後台的主題模板功能。

---

## 步驟 5：建立新的 Cloudflare 資源

你至少要建立三樣東西：

1. 一個新的 Cloudflare Pages 專案
2. 一個新的 D1 Database
3. 一個新的 R2 Bucket

### 1. 建立新的 D1 Database

你可以在 Cloudflare Dashboard 建立，或用 CLI：

```bash
cd app
npx wrangler d1 create client-a-catalog-db
```

建立後，Cloudflare 會回傳新的 `database_id`，把它貼回 `app/wrangler.toml`。

### 2. 建立新的 R2 Bucket

```bash
cd app
npx wrangler r2 bucket create client-a-catalog-media
```

建立後，把 bucket 名稱貼回 `app/wrangler.toml`。

### 3. 建立新的 Pages 專案

到 Cloudflare Pages 建立新專案，建議設定如下：

- Framework preset：`Next.js`
- Build command：`npm run build`
- Build output directory：`.vercel/output/static`
- Root directory：`/app`

然後到該 Pages 專案的 `Bindings` 設定：

- 綁定 D1，變數名稱用 `DB`
- 綁定 R2，變數名稱用 `BUCKET`

---

## 步驟 6：設定本機 Cloudflare 登入

第一次在這台電腦操作時，先登入：

```bash
npx wrangler login
```

如果你平常使用 API Token，也可以改用環境變數，但注意：

- 不要把 token 寫進 Git
- 不要把 `.env` 提交到 repo
- 不要把舊客戶專案的 token 直接沿用到新客戶專案

---

## 步驟 7：安裝套件與啟動本機開發

```bash
cd app
npm install
npm run db:migrate:local
npm run dev
```

如果本機站台起來了，再另開一個 terminal 執行：

```bash
cd app
curl -X POST http://localhost:3000/api/seed
```

或直接用既有 script：

```bash
cd app
npm run db:seed
```

之後可以打開：

- 前台：`http://localhost:3000`
- 後台：`http://localhost:3000/admin`

預設帳密請以目前系統 seed 結果為準；若你打算正式交付客戶，部署後務必立刻修改管理員帳密。

---

## 步驟 8：部署到新的 Cloudflare Pages

本機確認可運作後，再執行：

```bash
cd app
npm run db:migrate:remote
npm run pages:deploy
npm run smoke:rsc
```

這三步的意義：

- `db:migrate:remote`：把資料表結構套用到雲端 D1
- `pages:deploy`：把 Next.js 站台部署到新的 Pages 專案
- `smoke:rsc`：做基礎檢查，避免 `_rsc` 類型問題沒發現

---

## 步驟 9：部署後的第一次初始化

新站上線後，建議你立刻做這些事：

1. 進後台確認首頁可正常開啟
2. 建立或修改管理員帳號密碼
3. 檢查媒體上傳是否正常
4. 檢查產品、文章、頁面是否可新增
5. 檢查導覽選單是否正確
6. 檢查前台首頁、產品頁、文章頁、FAQ、關於我們頁
7. 若有自訂網域，再把網域綁到新的 Pages 專案

---

## 如果你想把舊站內容複製到新站

這個模板本身已經支援「整站內容匯出 / 匯入」。

可用方式：

1. 在舊站後台匯出 JSON 快照
2. 在新站後台匯入該 JSON
3. 再針對客戶品牌、文案、圖片做調整

適合用在：

- 同產業但不同客戶
- 想沿用網站架構
- 想快速複製頁面與選單結構

不適合直接照搬的部分：

- 客戶 Logo
- 聯絡資訊
- 關於我們
- SEO 文案
- 法務頁面
- 帳號密碼

---

## 新手最常踩的雷

### 1. 只改了 `wrangler.toml`，沒改 `package.json`

結果 `npm run db:migrate:remote` 仍然打到舊的 D1 名稱。

### 2. 新專案還在用舊的 `APP_URL`

這會讓某些 API 或快取行為指到舊站網址。

### 3. 把舊 `.env` 一起複製過去

這很危險，因為裡面可能有 Cloudflare Token。

### 4. Pages 綁定沒設好

你在 `wrangler.toml` 寫了 `DB`、`BUCKET`，但 Cloudflare Pages 後台也要真的綁定相同名稱。

### 5. D1 migration 已跑，但沒有 seed 或沒有匯入內容

這樣網站可能能開，但資料是空的。

### 6. 還在舊專案資料夾直接改

這樣之後模板本身和客戶專案會混在一起，很難維護。

---

## 我建議你的實際操作順序

如果你現在就要開始接新案，照這個順序最穩：

1. 複製模板到新資料夾
2. 複製模板到新資料夾
3. 刪掉 `.git`、`.env`、`node_modules`、`.wrangler`
4. 建新的 Git repo
5. 建新的 D1、R2、Pages
6. 修改 `app/wrangler.toml`
7. 修改 `app/package.json` 的 migration script
8. `cd app && npm install`
9. `npm run db:migrate:local`
10. `npm run dev`
11. 確認本機正常
12. `npm run db:migrate:remote`
13. `npm run pages:deploy`
14. 上線後用後台修改內容

---

## 你目前這個問題的直接答案

是，可以複製整個專案去開新案，但要用「模板複製」的觀念，不是「把舊專案直接改名重上」。

你應該做的是：

- 複製專案結構
- 清掉舊 Git 與敏感檔
- 換成新的 Cloudflare 資源
- 改掉 `wrangler.toml` 與 migration script
- 再重新部署

如果你願意，我下一步可以直接幫你再補一份更精簡的「新案檢查清單版」文件，讓你每次開案只要照著打勾即可。
