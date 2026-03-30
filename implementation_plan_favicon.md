# 實作計畫 - 網站管理 Favicon 圖片上傳功能

網站管理中的「網站資訊」頁面，目前 Favicon URL 僅支援手動輸入外部連結，需修改為支援從媒體庫選擇或上傳圖片。

## 目標

1. 將 `AdminSiteSettingsPage` 中的 Favicon URL 欄位從純文字輸入框改為 `ImageSelectInput` 元件。

## 範圍

- `app/src/app/admin/site-settings/page.tsx`: 修改 Favicon URL 的渲染邏輯。

## 任務拆解

1. **修改 AdminSiteSettingsPage 元件**：
   - 尋找 `faviconUrl` 欄位的渲染區域。
   - 將 `<input>` 替換為 `<ImageSelectInput>`。
   - 調整 Layout 以符合視覺比例（Favicon 通常較小，元件比例可維持預設或略作微調）。

## 驗收標準

- [ ] 頁面中 Favicon URL 區域顯示為圖片選擇器。
- [ ] 點擊後能開啟媒體庫選擇圖片。
- [ ] 選擇圖片後能正確顯示預覽。
- [ ] 儲存後設定能正確生效。

## 風險與回滾策略

- **風險**：`ImageSelectInput` 的 `aspect-video` 比例可能對 Favicon (1:1) 來說不夠完美，但功能上是可用的。
- **回滾**：若有問題，還原 `page.tsx` 的變更即可。
