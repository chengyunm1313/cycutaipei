[
{
"goal": "新增網站資訊欄位及聯絡我們詢問主題管理功能",
"scope": {
"included": [
"更新資料庫 schema 與初始化腳本",
"更新後端 API 以支援新欄位",
"更新前端型別定義",
"更新後台『網站資訊』頁面 UI，包含『其他資訊』區塊",
"實作『聯絡我們 - 詢問主題』管理功能"
],
"excluded": [
"前台 UI 顯示（僅先處理資料傳輸與後台管理）"
]
},
"tasks": [
{
"id": "db-schema-update",
"task": "更新資料庫初始化腳本與 API 欄位映射",
"details": "1. 修改 `ensureSiteSettingsTable.ts` 新增其他資訊欄位\n2. 修改 `api/site-settings/route.ts` 處理資料存取"
},
{
"id": "frontend-types-update",
"task": "更新前端資料型別",
"details": "修改 `src/data/types.ts` 中的 `ApiSiteSettings` 介面"
},
{
"id": "admin-ui-update",
"task": "更新後台管理介面",
"details": "1. 在 `admin/site-settings/page.tsx` 新增『其他資訊』區塊（統一編號、電話、傳真、地址、電子郵件、社群連結、版權資訊）\n2. 實作詢問主題動態列表管理"
},
{
"id": "validation",
"task": "功能驗證",
"details": "確認新欄位可正常儲存與讀取，並能動態增刪詢問主題"
}
],
"acceptance_criteria": [
"後台網站資訊頁面包含所有截圖中的新欄位",
"所有欄位（包含詢問主題動態列表）皆能正確儲存至資料庫並重新載入顯示",
"詢問主題列表支援新增與刪除操作"
],
"risk_mitigation": {
"risks": [
"資料庫欄位缺失導致 API 異常"
],
"rollback_strategy": "若發生嚴重錯誤，還原至 git 修改前狀態，並手動檢查 SQLite table 結構"
}
}
]
