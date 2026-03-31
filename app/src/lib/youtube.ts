/**
 * 將 YouTube 連結轉成可儲存與嵌入的統一格式。
 * 第一版僅接受標準 YouTube 網址，不接受任意 iframe HTML。
 */

const YOUTUBE_HOSTS = new Set([
	'youtube.com',
	'www.youtube.com',
	'm.youtube.com',
	'youtu.be',
	'www.youtu.be',
]);

function ensureUrl(raw: string): URL | null {
	const trimmed = raw.trim();
	if (!trimmed) return null;

	const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed);
	const candidate = hasScheme ? trimmed : `https://${trimmed}`;

	try {
		return new URL(candidate);
	} catch {
		return null;
	}
}

export function extractYouTubeVideoId(raw: string): string | null {
	const parsed = ensureUrl(raw);
	if (!parsed || !YOUTUBE_HOSTS.has(parsed.hostname)) return null;

	if (parsed.hostname.includes('youtu.be')) {
		const videoId = parsed.pathname.split('/').filter(Boolean)[0];
		return videoId || null;
	}

	if (parsed.pathname === '/watch') {
		return parsed.searchParams.get('v');
	}

	const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);
	return match?.[2] || null;
}

export function normalizeYouTubeUrl(raw: string): string | null {
	const videoId = extractYouTubeVideoId(raw);
	if (!videoId) return null;
	return `https://www.youtube.com/watch?v=${videoId}`;
}

export function toYouTubeEmbedUrl(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const videoId = extractYouTubeVideoId(raw);
	if (!videoId) return null;
	return `https://www.youtube.com/embed/${videoId}`;
}
