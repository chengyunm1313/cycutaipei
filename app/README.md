# cycutaipei app

台北市中原大學校友會前後台站點，使用 Next.js 建置，並搭配 Cloudflare Pages / Edge runtime。

## 常用指令

```bash
npm run dev
npm run lint
npm run build
npm run test:slug
```

## Slug 規則

本專案的 slug 生成集中在 [src/lib/slug.ts](./src/lib/slug.ts)。

- 前台路由一律收斂為 ASCII slug，避免中文 slug 在 Cloudflare Pages detail route 上不穩。
- 站點高頻專有詞先走專案字典，例如 `台北市中原大學校友會 -> taipei-cycu-alumni-association`。
- 其餘中文再走 `pinyin-pro` 轉拼音。
- 若內容仍無法產出可用 slug，最後回退到 `fallback-hash`。

### 什麼情況要加進專案字典

- 站名、校名、校友會名稱
- 反覆出現在 URL 的固定入口，例如 `校友學院`、`最新消息`、`常見問題`
- 會務或活動中的固定專有詞，且已確認用拼音會明顯不自然

### 什麼情況不要加進專案字典

- 一般中文名詞
- 偶發文章標題用語
- 只是為了避免拼音而想全部硬翻成英文的詞

這類內容優先保持拼音 fallback，避免字典失控膨脹。

## Slug 測試

`npm run test:slug` 會驗證目前的代表案例，包含：

- ASCII slug 正規化
- 專案字典命中結果
- 會務 / 活動標題的虛詞清理
- 未命中字典時的拼音 fallback
- 空值與 fallback hash

若你調整了 `src/lib/slug.ts` 的字典或清理規則，請至少重新跑一次：

```bash
npm run test:slug
npm run build
```
