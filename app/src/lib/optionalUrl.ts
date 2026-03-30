/**
 * 將可選網址欄位正規化為可儲存值：
 * - 空字串 => null
 * - 站內相對路徑（/foo/bar）=> 原樣保留
 * - 無協定網域（example.com）=> 自動補 https://
 * - 僅允許 http/https
 */
export function normalizeOptionalHttpUrl(raw: string): string | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	// 允許站內相對路徑
	if (trimmed.startsWith('/')) return trimmed;

	const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
	const candidate = hasScheme ? trimmed : `https://${trimmed}`;

	try {
		const parsed = new URL(candidate);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return null;
		}
		return candidate;
	} catch {
		return null;
	}
}
