import type { ApiCategory } from '@/data/types';

export interface CategoryNodes extends ApiCategory {
	children: CategoryNodes[];
}

/**
 * 將扁平的 ApiCategory 陣列轉換為樹狀結構
 */
export function buildCategoryTree(categories: ApiCategory[]): CategoryNodes[] {
	const map: Record<number, CategoryNodes> = {};
	const roots: CategoryNodes[] = [];

	// 先建立所有節點的 map
	categories.forEach((cat) => {
		map[cat.id] = { ...cat, children: [] };
	});

	// 根據 parentId 建立層級關係
	categories.forEach((cat) => {
		const node = map[cat.id];
		if (cat.parentId && map[cat.parentId]) {
			map[cat.parentId].children.push(node);
			// 排序子節點
			map[cat.parentId].children.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
		} else {
			roots.push(node);
		}
	});

	// 排序根節點
	roots.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

	return roots;
}

/**
 * 遞歸獲取當前分類及其所有子分類的 ID 列表
 */
export function getAllCategoryIds(categoryId: number, categories: ApiCategory[]): number[] {
	const result: number[] = [categoryId];
	const children = categories.filter((c) => c.parentId === categoryId);

	children.forEach((child) => {
		result.push(...getAllCategoryIds(child.id, categories));
	});

	return result;
}

/**
 * 獲取分類的完整路徑（從頂層到自己）
 */
export function getCategoryPath(categoryId: number, categories: ApiCategory[]): ApiCategory[] {
	const path: ApiCategory[] = [];
	let current = categories.find((c) => c.id === categoryId);

	while (current) {
		path.unshift(current);
		if (!current.parentId) break;
		current = categories.find((c) => c.id === current?.parentId);
	}

	return path;
}
