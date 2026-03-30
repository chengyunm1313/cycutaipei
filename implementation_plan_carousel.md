# 實作計畫 - 首頁輪播圖進階設定功能

為首頁輪播圖增加多張圖片支援、切換效果、自動播放時間、手動/自動切換等設定。

## 目標

1. **後台管理**：增加輪播圖的全局設定（如自動播放時間、動畫效果等）。
2. **前台顯示**：實作真正的輪播切換效果（Carousel），支援多張圖片循環播放。

## 範圍

- `app/src/data/types.ts`: 定義輪播圖設定型別。
- `app/src/app/admin/site-management/home-carousel/page.tsx`: 修改後台介面，加入全域設定。
- `app/src/app/page.tsx`: 修改首頁渲染邏輯，實作輪播切換效果。
- `app/src/app/api/site-settings/route.ts`: 修改 `site_settings` 以儲存輪播圖全域設定（由 `home_carousel_settings` 欄位或存放在 `extra_json`）。
- **方案選擇**：目前 `site_contents` 已經支援多張 `home_carousel` 圖片。我們需要一個地方存「全域設定」。由於 `site_settings` 表目前沒有 `carousel_settings` 欄位，建議在 `home_carousel` 類型中，建立一個特殊 ID 的內容來存設定，或者擴充 `site_settings`。考量到簡單性，我們可以用 `home_carousel` 類型的第一個項目的 `extra_json` 或者在 `site_settings` 中增加欄位。
- **最佳方案**：在 `AdminHomeCarouselPage` 中直接使用 `site_settings` 的 `extra_json` (如果有的話) 或者在 `home-carousel` 頁面維護一個帶有特定 `id` (例如 `home-carousel-config`) 的 `site_content` 紀錄來存設定。

## 任務拆解

### Phase 1: 後台設定介面

1. **擴充 API 與 型別**：
   - 在 `types.ts` 定義 `CarouselSettings`：`{ autoPlay: boolean, delay: number, effect: 'fade' | 'slide' }`。
2. **修改後台頁面** (`AdminHomeCarouselPage`)：
   - 增加一個「輪播全域設定」區塊。
   - 使用一個特殊 ID (`home_carousel_config`) 的 `site_content` 來儲存這些 JSON 設定。
   - 提供開關（自動播放）、輸入框（秒數）、下拉選單（效果）。

### Phase 2: 前台輪播實作

1. **建立 Swiper 或實作簡單輪播元件**：
   - 考量到專案既有依賴，若無現成輪播庫，可使用簡單的 React state 實作或引入 `embla-carousel` / `swiper`。
   - 為首頁 Hero 區塊增加動畫效果（Fade/Slide）。
2. **串接設定**：
   - 首頁 `fetchSiteContents` 時提取 `home_carousel_config`。
   - 根據設定套用 `setInterval` 與 CSS 動畫。

## 驗收標準

- [ ] 後台可設定自動播放開關、秒數、切換效果。
- [ ] 前台首頁會根據設定自動更換圖片。
- [ ] 前台支援點擊 Indicator 或左右箭頭切換（如有設計）。
- [ ] 圖片切換過程平滑。

## 風險與回滾策略

- **風險**：引入新庫可能會增大 Bundle Size。若手寫輪播需注意行動端 Touch 事件。
- **回滾**：還原 `page.tsx` 改動即可。
