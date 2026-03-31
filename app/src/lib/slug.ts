/**
 * 將輸入內容轉成適合前台路由的 ASCII slug。
 * 校友學院目前部署在 Cloudflare Pages，中文 slug 會造成 detail route 不穩，
 * 因此這裡強制收斂為英數與連字號。
 */
export function slugifyAscii(input: string, fallback = 'item'): string {
	const normalized = input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');

	return normalized || fallback;
}
