/**
 * 解析圖片欄位：支援 JSON 陣列字串、單一 URL、舊版逗號分隔字串
 */
export function parseImageValue(rawValue: string | null | undefined): string[] {
	if (!rawValue) return [];
	const trimmed = rawValue.trim();
	if (!trimmed) return [];

	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (Array.isArray(parsed)) {
			return parsed
				.filter((item): item is string => typeof item === 'string')
				.map((item) => item.trim())
				.filter((item) => item !== '');
		}
		if (typeof parsed === 'string') {
			const normalized = parsed.trim();
			return normalized ? [normalized] : [];
		}
	} catch {
		// 不是 JSON 時走後續 fallback
	}

	// 兼容舊資料：多張圖片以逗號分隔
	if (!trimmed.startsWith('data:') && trimmed.includes(',')) {
		return trimmed
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item !== '');
	}

	return [trimmed];
}

export function getPrimaryImageUrl(rawValue: string | null | undefined): string | null {
	return parseImageValue(rawValue)[0] || null;
}
