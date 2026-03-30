/**
 * 取得內容實際應顯示與排序的日期。
 * 優先採用原始發文日期，若未設定則退回建立時間。
 */
export function resolveContentDate(item: { postDate?: string | null; createdAt?: string | null }) {
	return item.postDate || item.createdAt || '';
}
