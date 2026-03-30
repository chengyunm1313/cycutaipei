'use client';

import { useMemo, useState } from 'react';
import {
	exportSiteSnapshot,
	importSiteSnapshot,
	triggerOnDemandRevalidate,
	type SiteImportResult,
	type SiteSnapshotModuleKey,
	type SiteSnapshotFile,
} from '@/lib/api';

interface NoticeState {
	type: 'success' | 'error' | 'info';
	text: string;
}

interface SnapshotSummary {
	site_settings: number;
	categories: number;
	products: number;
	articles: number;
	article_categories: number;
	tags: number;
	pages: number;
	menus: number;
	site_contents: number;
}

const EMPTY_SUMMARY: SnapshotSummary = {
	site_settings: 0,
	categories: 0,
	products: 0,
	articles: 0,
	article_categories: 0,
	tags: 0,
	pages: 0,
	menus: 0,
	site_contents: 0,
};

const MODULE_OPTIONS: Array<{ key: SiteSnapshotModuleKey; label: string; description: string }> = [
	{ key: 'site_settings', label: '網站資訊', description: '站名、SEO、Logo 等設定' },
	{ key: 'categories', label: '活動分類', description: '活動分類與階層資料' },
	{ key: 'products', label: '活動資訊', description: '活動內容、欄位、圖片與排序' },
	{ key: 'articles', label: '最新消息', description: '最新消息內容' },
	{ key: 'article_categories', label: '消息分類', description: '最新消息分類管理清單' },
	{ key: 'tags', label: '標籤', description: '標籤清單資料' },
	{ key: 'pages', label: '自訂頁面', description: '頁面內容與 SEO 欄位' },
	{ key: 'menus', label: '導覽選單', description: '前台導覽選單結構' },
	{ key: 'site_contents', label: '網站區塊內容', description: '關於我們、FAQ、首頁輪播等內容' },
];

const MODULE_KEYS = MODULE_OPTIONS.map((item) => item.key);
const MODULE_LABEL_MAP = MODULE_OPTIONS.reduce(
	(acc, item) => ({ ...acc, [item.key]: item.label }),
	{} as Record<SiteSnapshotModuleKey, string>
);

function countRows(value: unknown): number {
	return Array.isArray(value) ? value.length : 0;
}

function summarizeSnapshot(payload: SiteSnapshotFile): SnapshotSummary {
	return {
		site_settings: payload.data?.site_settings ? 1 : 0,
		categories: countRows(payload.data?.categories),
		products: countRows(payload.data?.products),
		articles: countRows(payload.data?.articles),
		article_categories: countRows(payload.data?.article_categories),
		tags: countRows(payload.data?.tags),
		pages: countRows(payload.data?.pages),
		menus: countRows(payload.data?.menus),
		site_contents: countRows(payload.data?.site_contents),
	};
}

function normalizeImportedSummary(imported: Record<string, number>): SnapshotSummary {
	return {
		site_settings: imported.site_settings ?? 0,
		categories: imported.categories ?? 0,
		products: imported.products ?? 0,
		articles: imported.articles ?? 0,
		article_categories: imported.article_categories ?? 0,
		tags: imported.tags ?? 0,
		pages: imported.pages ?? 0,
		menus: imported.menus ?? 0,
		site_contents: imported.site_contents ?? 0,
	};
}

function normalizeModulesForImport(
	mode: 'full' | 'partial',
	selectedModules: SiteSnapshotModuleKey[]
): SiteSnapshotModuleKey[] {
	if (mode === 'full') return [...MODULE_KEYS];

	const moduleSet = new Set<SiteSnapshotModuleKey>(selectedModules);
	// 依賴保護：活動分類會影響活動資訊，頁面會影響導覽選單。
	if (moduleSet.has('categories')) moduleSet.add('products');
	if (moduleSet.has('pages')) moduleSet.add('menus');
	return MODULE_KEYS.filter((key) => moduleSet.has(key));
}

function formatTimestampForFile(date: Date): string {
	const iso = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
	return iso || String(Date.now());
}

function isValidSnapshot(value: unknown): value is SiteSnapshotFile {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	const data = (value as { data?: unknown }).data;
	return !!data && typeof data === 'object' && !Array.isArray(data);
}

function renderStatRows(summary: SnapshotSummary) {
	return (
		<div className='grid grid-cols-2 md:grid-cols-3 gap-3 text-sm'>
			<div className='bg-surface rounded-lg px-3 py-2'>網站資訊：{summary.site_settings}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>分類：{summary.categories}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>產品：{summary.products}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>文章：{summary.articles}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>消息分類：{summary.article_categories}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>標籤：{summary.tags}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>頁面：{summary.pages}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>導覽選單：{summary.menus}</div>
			<div className='bg-surface rounded-lg px-3 py-2'>網站內容：{summary.site_contents}</div>
		</div>
	);
}

export default function AdminSiteImportExportPage() {
	const [notice, setNotice] = useState<NoticeState | null>(null);
	const [exporting, setExporting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [revalidating, setRevalidating] = useState(false);
	const [importMode, setImportMode] = useState<'full' | 'partial'>('full');
	const [selectedModules, setSelectedModules] = useState<SiteSnapshotModuleKey[]>([...MODULE_KEYS]);
	const [selectedFileName, setSelectedFileName] = useState('');
	const [snapshotPayload, setSnapshotPayload] = useState<SiteSnapshotFile | null>(null);
	const [importResult, setImportResult] = useState<SiteImportResult | null>(null);

	const snapshotSummary = useMemo(
		() => (snapshotPayload ? summarizeSnapshot(snapshotPayload) : EMPTY_SUMMARY),
		[snapshotPayload]
	);
	const selectedModulesForImport = useMemo(
		() => normalizeModulesForImport(importMode, selectedModules),
		[importMode, selectedModules]
	);
	const hasSelectedModules = selectedModulesForImport.length > 0;

	const handleExport = async () => {
		try {
			setExporting(true);
			setNotice(null);
			const payload = await exportSiteSnapshot();
			const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
			const objectUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = objectUrl;
			a.download = `site-snapshot-${formatTimestampForFile(new Date())}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(objectUrl);
			setNotice({ type: 'success', text: '匯出完成，快照檔案已下載。' });
		} catch (error) {
			console.error('匯出網站資料失敗:', error);
			setNotice({ type: 'error', text: '匯出失敗，請稍後重試。' });
		} finally {
			setExporting(false);
		}
	};

	const handleSnapshotFileChange = async (file: File | null) => {
		setNotice(null);
		setImportResult(null);
		setSnapshotPayload(null);
		setSelectedFileName(file?.name || '');

		if (!file) return;

		try {
			const rawText = await file.text();
			const parsed = JSON.parse(rawText) as unknown;
			if (!isValidSnapshot(parsed)) {
				setNotice({
					type: 'error',
					text: '檔案格式不正確，請選擇由「網站匯出」產生的 JSON 檔。',
				});
				return;
			}
			setSnapshotPayload(parsed);
			setNotice({ type: 'info', text: '快照檔已載入，請確認內容後執行匯入。' });
		} catch (error) {
			console.error('讀取快照檔失敗:', error);
			setNotice({ type: 'error', text: '無法讀取此檔案，請確認 JSON 格式。' });
		}
	};

	const handleImport = async () => {
		if (!snapshotPayload) {
			setNotice({ type: 'error', text: '請先選擇匯入檔案。' });
			return;
		}
		if (importMode === 'partial' && !hasSelectedModules) {
			setNotice({ type: 'error', text: '部分匯入至少需要選擇一個模組。' });
			return;
		}

		const confirmed = window.confirm(
			importMode === 'full'
				? '完整匯入會先清空目前網站內容，再寫入快照資料。此動作無法復原，是否繼續？'
				: `部分匯入將覆蓋 ${selectedModulesForImport.length} 個模組資料。是否繼續？`
		);
		if (!confirmed) return;

		try {
			setImporting(true);
			setNotice(null);
			const result = await importSiteSnapshot(snapshotPayload, {
				mode: importMode,
				modules: selectedModulesForImport,
			});
			setImportResult(result);
			if (result.revalidate.errors.length > 0) {
				setNotice({
					type: 'info',
					text: '匯入完成，但快取重建出現部分警告，請使用「手動刷新前台快取」再執行一次。',
				});
			} else {
				setNotice({ type: 'success', text: '匯入完成，前台快取已觸發重新驗證。' });
			}
		} catch (error) {
			console.error('匯入網站資料失敗:', error);
			setNotice({ type: 'error', text: '匯入失敗，請檢查檔案內容後重試。' });
		} finally {
			setImporting(false);
		}
	};

	const toggleModule = (moduleKey: SiteSnapshotModuleKey) => {
		setSelectedModules((prev) => {
			const set = new Set<SiteSnapshotModuleKey>(prev);
			if (set.has(moduleKey)) {
				set.delete(moduleKey);
			} else {
				set.add(moduleKey);
			}
			return MODULE_KEYS.filter((key) => set.has(key));
		});
	};

	const handleManualRevalidate = async () => {
		try {
			setRevalidating(true);
			setNotice(null);
			const result = await triggerOnDemandRevalidate();
			if (result.errors.length > 0) {
				setNotice({
					type: 'info',
					text: '已觸發快取刷新，但有部分警告，請稍後檢查伺服器日誌。',
				});
				return;
			}
			setNotice({ type: 'success', text: '已手動觸發前台快取刷新。' });
		} catch (error) {
			console.error('手動刷新快取失敗:', error);
			setNotice({ type: 'error', text: '手動刷新快取失敗，請稍後再試。' });
		} finally {
			setRevalidating(false);
		}
	};

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
						網站管理 - 匯入匯出
					</h1>
					<p className='text-text-light mt-2'>
						快速匯出整站內容，並在新案子一鍵匯入，減少重工。
					</p>
				</div>
				<button
					type='button'
					onClick={handleManualRevalidate}
					disabled={revalidating}
					className='px-4 py-2 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-surface disabled:opacity-60'
				>
					{revalidating ? '刷新中...' : '手動刷新前台快取'}
				</button>
			</div>

			{notice && (
				<div
					className={`rounded-xl border px-4 py-3 text-sm ${
						notice.type === 'success'
							? 'bg-green-50 text-green-700 border-green-200'
							: notice.type === 'error'
								? 'bg-red-50 text-red-700 border-red-200'
								: 'bg-blue-50 text-blue-700 border-blue-200'
					}`}
				>
					{notice.text}
				</div>
			)}

			<div className='bg-white rounded-xl border border-border p-5 space-y-4'>
				<h2 className='text-lg font-semibold text-text'>1. 匯出網站快照</h2>
				<p className='text-sm text-text-muted'>
					匯出後會下載 JSON，內容包含網站資訊、分類、產品、文章、頁面、選單與網站管理區塊。
				</p>
				<button
					type='button'
					onClick={handleExport}
					disabled={exporting}
					className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-60'
				>
					{exporting ? '匯出中...' : '下載網站快照'}
				</button>
			</div>

			<div className='bg-white rounded-xl border border-border p-5 space-y-4'>
				<h2 className='text-lg font-semibold text-text'>2. 匯入網站快照</h2>
				<p className='text-sm text-text-muted'>
					匯入前會清空目前網站內容，再寫入快照資料。建議先匯出現有資料備份。
				</p>

				<div className='space-y-3 rounded-xl border border-border p-4 bg-surface/40'>
					<div className='text-sm font-medium text-text'>匯入模式</div>
					<div className='flex flex-wrap gap-3'>
						<label className='inline-flex items-center gap-2 text-sm'>
							<input
								type='radio'
								name='importMode'
								checked={importMode === 'full'}
								onChange={() => setImportMode('full')}
							/>
							完整覆蓋（全站）
						</label>
						<label className='inline-flex items-center gap-2 text-sm'>
							<input
								type='radio'
								name='importMode'
								checked={importMode === 'partial'}
								onChange={() => setImportMode('partial')}
							/>
							部分匯入（選擇模組）
						</label>
					</div>

					{importMode === 'partial' && (
						<div className='space-y-3'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								{MODULE_OPTIONS.map((moduleItem) => (
									<label
										key={moduleItem.key}
										className='flex items-start gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm'
									>
										<input
											type='checkbox'
											checked={selectedModules.includes(moduleItem.key)}
											onChange={() => toggleModule(moduleItem.key)}
										/>
										<span>
											<span className='block font-medium text-text'>{moduleItem.label}</span>
											<span className='block text-xs text-text-light'>
												{moduleItem.description}
											</span>
										</span>
									</label>
								))}
							</div>
							<div className='text-xs text-text-light'>
								已選 {selectedModulesForImport.length} 個模組。若選「活動分類」會自動含「活動資訊」；若選「自訂頁面」會自動含「導覽選單」。
							</div>
						</div>
					)}
				</div>

				<div className='space-y-2'>
					<label htmlFor='siteSnapshotFile' className='block text-sm font-medium text-text'>
						選擇快照檔案（.json）
					</label>
					<input
						id='siteSnapshotFile'
						type='file'
						accept='.json,application/json'
						onChange={(event) => {
							const file = event.target.files?.[0] || null;
							void handleSnapshotFileChange(file);
						}}
						className='block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm'
					/>
					{selectedFileName && <p className='text-xs text-text-light'>目前檔案：{selectedFileName}</p>}
				</div>

				{snapshotPayload && (
					<div className='space-y-3'>
						<div className='text-sm text-text'>
							快照版本：{snapshotPayload.version || 'unknown'}，匯出時間：
							{snapshotPayload.exportedAt || 'unknown'}
						</div>
						{renderStatRows(snapshotSummary)}
					</div>
				)}

				<button
					type='button'
					onClick={handleImport}
					disabled={importing || !snapshotPayload || (importMode === 'partial' && !hasSelectedModules)}
					className='px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60'
				>
					{importing
						? '匯入中...'
						: importMode === 'full'
							? '開始匯入（覆蓋全站內容）'
							: '開始部分匯入（覆蓋所選模組）'}
				</button>
			</div>

			{importResult && (
				<div className='bg-white rounded-xl border border-border p-5 space-y-3'>
					<h2 className='text-lg font-semibold text-text'>匯入結果</h2>
					<div className='text-sm text-text-muted'>
						模式：{importResult.mode === 'partial' ? '部分匯入' : '完整覆蓋'}
					</div>
					{Array.isArray(importResult.modules) && importResult.modules.length > 0 && (
						<div className='flex flex-wrap gap-2'>
							{importResult.modules.map((moduleKey) => (
								<span
									key={moduleKey}
									className='inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text'
								>
									{MODULE_LABEL_MAP[moduleKey] || moduleKey}
								</span>
							))}
						</div>
					)}
					{renderStatRows(normalizeImportedSummary(importResult.imported))}
					{importResult.revalidate.errors.length > 0 && (
						<div className='rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm px-3 py-2'>
							快取刷新警告：{importResult.revalidate.errors.join(' | ')}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
