/**
 * 媒體庫允許上傳的圖片格式
 */
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
]);

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	svg: 'image/svg+xml',
};

function getFileExtension(name: string): string {
	const parts = name.toLowerCase().split('.');
	return parts.length > 1 ? parts.pop() || '' : '';
}

export function isSvgImageFile(file: Pick<File, 'type' | 'name'>): boolean {
	return file.type === 'image/svg+xml' || getFileExtension(file.name) === 'svg';
}

export function isSupportedImageFile(file: Pick<File, 'type' | 'name'>): boolean {
	if (SUPPORTED_IMAGE_MIME_TYPES.has(file.type)) {
		return true;
	}

	if (!file.type) {
		return SUPPORTED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
	}

	return false;
}

export function isRasterImageFile(file: Pick<File, 'type' | 'name'>): boolean {
	return isSupportedImageFile(file) && !isSvgImageFile(file);
}

export function inferImageMimeType(file: Pick<File, 'type' | 'name'>): string | null {
	if (SUPPORTED_IMAGE_MIME_TYPES.has(file.type)) {
		return file.type;
	}

	const extension = getFileExtension(file.name);
	return EXTENSION_TO_MIME_TYPE[extension] || null;
}
