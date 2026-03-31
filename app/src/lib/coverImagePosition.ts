import type { CSSProperties } from 'react';

const DEFAULT_COVER_IMAGE_POSITION_Y = 50;

export function clampCoverImagePositionY(value: unknown): number {
	const numericValue =
		typeof value === 'number'
			? value
			: typeof value === 'string' && value.trim() !== ''
				? Number(value)
				: DEFAULT_COVER_IMAGE_POSITION_Y;

	if (!Number.isFinite(numericValue)) {
		return DEFAULT_COVER_IMAGE_POSITION_Y;
	}

	return Math.min(100, Math.max(0, Math.round(numericValue)));
}

export function getCoverImageObjectPosition(positionY?: number | null): string {
	return `center ${clampCoverImagePositionY(positionY)}%`;
}

export function getCoverImageObjectPositionStyle(
	positionY?: number | null
): CSSProperties {
	return {
		objectPosition: getCoverImageObjectPosition(positionY),
	};
}

export { DEFAULT_COVER_IMAGE_POSITION_Y };
