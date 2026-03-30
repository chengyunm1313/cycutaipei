import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';
import {
	type SiteCacheScope,
	SITE_REVALIDATE_PATH_TARGETS,
	scopesToTags,
	withPublicScope,
} from '@/lib/siteCache';

interface RevalidateOptions {
	scopes?: SiteCacheScope[];
	includePaths?: boolean;
}

export interface RevalidateResult {
	tags: string[];
	paths: string[];
	errors: string[];
}

/**
 * 觸發網站快取失效（Tag + Path）。
 * 寫入 API 可在完成資料變更後呼叫，達成 on-demand revalidate。
 */
export function triggerSiteRevalidation(options?: RevalidateOptions): RevalidateResult {
	const scopes = withPublicScope(options?.scopes || []);
	const tags = scopesToTags(scopes);
	const includePaths = options?.includePaths !== false;
	const paths = includePaths ? SITE_REVALIDATE_PATH_TARGETS.map((item) => item.path) : [];
	const errors: string[] = [];

	for (const tag of tags) {
		try {
			revalidateTag(tag, 'max');
		} catch (error) {
			errors.push(`revalidateTag(${tag}): ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	if (includePaths) {
		for (const item of SITE_REVALIDATE_PATH_TARGETS) {
			try {
				if (item.type) {
					revalidatePath(item.path, item.type);
				} else {
					revalidatePath(item.path);
				}
			} catch (error) {
				errors.push(
					`revalidatePath(${item.path}): ${error instanceof Error ? error.message : String(error)}`
				);
			}
		}
	}

	return { tags, paths, errors };
}
