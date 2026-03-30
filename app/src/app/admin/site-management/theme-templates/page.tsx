'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	applySiteTemplate,
	exportSiteSnapshot,
	fetchSiteTemplates,
	resetSiteToInitialState,
	type SiteTemplateApplyResult,
	type SiteTemplateMeta,
	type SiteTemplateModuleType,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface NoticeState {
	type: 'success' | 'error' | 'info';
	text: string;
}

const HARD_RELOAD_DELAY_MS = 150;

/** 模組類型設定 */
const MODULE_TYPES: {
	key: SiteTemplateModuleType;
	label: string;
	icon: string;
	description: string;
}[] = [
	{
		key: 'product_catalog',
		label: '產品型錄',
		icon: '📦',
		description: '適合製造業、貿易商、建材等需要展示產品與型錄的網站',
	},
	{
		key: 'brand_image',
		label: '品牌形象',
		icon: '🏢',
		description: '適合公協會、企業品牌、文化組織等著重活動與消息的網站',
	},
];

/** 品牌形象模組的摘要欄位對照表 */
const BRAND_IMAGE_LABEL_MAP: Record<string, string> = {
	產品: '活動資訊',
	文章: '最新消息',
	文章分類: '消息分類',
};

function formatTimestampForFile(date: Date): string {
	return date
		.toISOString()
		.replace(/[-:TZ.]/g, '')
		.slice(0, 14);
}

function downloadJsonFile(payload: unknown, fileName: string) {
	const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
	const objectUrl = URL.createObjectURL(blob);
	try {
		const a = document.createElement('a');
		a.href = objectUrl;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function notifySiteStructureUpdated() {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new Event('site-content-updated'));
	window.dispatchEvent(new Event('site-navigation-updated'));
}

function hardReloadThemeTemplatesPage() {
	if (typeof window === 'undefined') return;
	window.setTimeout(() => {
		window.location.assign('/admin/site-management/theme-templates');
	}, HARD_RELOAD_DELAY_MS);
}

/** 根據模組類型動態替換摘要標籤 */
function getSummaryLabel(baseLabel: string, moduleType: SiteTemplateModuleType): string {
	if (moduleType === 'brand_image') {
		return BRAND_IMAGE_LABEL_MAP[baseLabel] || baseLabel;
	}
	return baseLabel;
}

export default function AdminThemeTemplatesPage() {
	const { currentUser } = useAuth();
	const [loading, setLoading] = useState(true);
	const [applying, setApplying] = useState(false);
	const [notice, setNotice] = useState<NoticeState | null>(null);
	const [templates, setTemplates] = useState<SiteTemplateMeta[]>([]);
	const [selectedModuleType, setSelectedModuleType] =
		useState<SiteTemplateModuleType>('product_catalog');
	const [selectedTemplateId, setSelectedTemplateId] = useState('');
	const [result, setResult] = useState<SiteTemplateApplyResult | null>(null);

	useEffect(() => {
		const loadTemplates = async () => {
			try {
				setLoading(true);
				const data = await fetchSiteTemplates();
				setTemplates(data);
				// 預設選第一個符合當前模組類型的模板
				const firstMatch = data.find((item) => item.moduleType === 'product_catalog');
				if (firstMatch) {
					setSelectedTemplateId(firstMatch.id);
				}
			} catch (error) {
				console.error('載入主題模板失敗:', error);
				setNotice({ type: 'error', text: '載入模板失敗，請稍後再試。' });
			} finally {
				setLoading(false);
			}
		};

		void loadTemplates();
	}, []);

	// 篩選後的模板列表
	const filteredTemplates = useMemo(
		() => templates.filter((item) => item.moduleType === selectedModuleType),
		[templates, selectedModuleType]
	);

	const selectedTemplate = useMemo(
		() => templates.find((item) => item.id === selectedTemplateId) || null,
		[templates, selectedTemplateId]
	);

	// 切換模組類型時，自動選擇該類型的第一個模板
	const handleModuleTypeChange = (moduleType: SiteTemplateModuleType) => {
		setSelectedModuleType(moduleType);
		const firstMatch = templates.find((item) => item.moduleType === moduleType);
		setSelectedTemplateId(firstMatch?.id || '');
		setResult(null);
	};

	const handleApplyTemplate = async () => {
		if (!selectedTemplate) {
			setNotice({ type: 'error', text: '請先選擇模板。' });
			return;
		}

		const confirmed = window.confirm(
			`將套用「${selectedTemplate.label}」模板。\n\n系統會先下載目前網站備份，再執行全站覆蓋匯入。此動作無法直接復原，是否繼續？`
		);
		if (!confirmed) return;

		try {
			setApplying(true);
			setNotice({ type: 'info', text: '正在下載備份檔...' });
			setResult(null);

			const backupPayload = await exportSiteSnapshot();
			downloadJsonFile(
				backupPayload,
				`site-backup-before-template-${formatTimestampForFile(new Date())}.json`
			);

			setNotice({ type: 'info', text: '備份完成，開始套用模板...' });
			const applyResult = await applySiteTemplate(selectedTemplate.id);
			setResult(applyResult);
			notifySiteStructureUpdated();
			setNotice({
				type: 'info',
				text: '模板套用完成，正在重新整理頁面以同步最新網站結構...',
			});
			hardReloadThemeTemplatesPage();
		} catch (error) {
			console.error('套用主題模板失敗:', error);
			setNotice({
				type: 'error',
				text: '套用失敗。若備份已下載，可至「匯入匯出」頁面匯入備份檔回復。',
			});
		} finally {
			setApplying(false);
		}
	};

	const handleResetToInitialState = async () => {
		const confirmed = window.confirm(
			'將回到系統初始狀態。\n\n系統會先下載目前網站備份，再執行全站覆蓋重置。此動作無法直接復原，是否繼續？'
		);
		if (!confirmed) return;

		try {
			setApplying(true);
			setNotice({ type: 'info', text: '正在下載備份檔...' });
			setResult(null);

			const backupPayload = await exportSiteSnapshot();
			downloadJsonFile(
				backupPayload,
				`site-backup-before-reset-${formatTimestampForFile(new Date())}.json`
			);

			setNotice({ type: 'info', text: '備份完成，開始回到初始狀態...' });
			const resetResult = await resetSiteToInitialState();
			setResult(resetResult);
			notifySiteStructureUpdated();
			setNotice({
				type: 'info',
				text: '已回到初始狀態，正在重新整理頁面以同步最新網站結構...',
			});
			hardReloadThemeTemplatesPage();
		} catch (error) {
			console.error('回到初始狀態失敗:', error);
			setNotice({
				type: 'error',
				text: '重置失敗。若備份已下載，可至「匯入匯出」頁面匯入備份檔回復。',
			});
		} finally {
			setApplying(false);
		}
	};

	// 權限守衛：非 admin 無法存取
	if (currentUser && currentUser.role !== 'admin') {
		return (
			<div className='max-w-6xl mx-auto'>
				<div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
					<div className='text-6xl mb-4'>🔒</div>
					<h1 className='text-2xl font-bold text-text mb-2'>權限不足</h1>
					<p className='text-text-light'>主題模板管理功能僅限管理員使用，請聯繫管理員取得權限。</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<div className='w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin' />
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			{/* 標題與操作按鈕 */}
			<div className='flex items-center justify-between gap-3 flex-wrap'>
				<div>
					<h1 className='text-2xl lg:text-3xl font-extrabold text-text tracking-tight'>
						網站管理 - 主題模板
					</h1>
					<p className='text-text-light mt-2'>
						選擇網站類型與產業模板，一鍵建立完整網站內容，套用前會先自動下載備份。
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						onClick={handleResetToInitialState}
						disabled={applying}
						className='px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60'
					>
						{applying ? '處理中...' : '一鍵回到初始狀態（先備份）'}
					</button>
					<button
						onClick={handleApplyTemplate}
						disabled={applying || !selectedTemplate}
						className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60'
					>
						{applying ? '套用中...' : '一鍵套用模板（先備份）'}
					</button>
				</div>
			</div>

			{/* 模組類型切換 */}
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
				{MODULE_TYPES.map((moduleType) => {
					const isActive = selectedModuleType === moduleType.key;
					const count = templates.filter((t) => t.moduleType === moduleType.key).length;
					return (
						<button
							key={moduleType.key}
							type='button'
							onClick={() => handleModuleTypeChange(moduleType.key)}
							className={`text-left p-5 rounded-xl border-2 transition-all ${
								isActive
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border bg-white hover:border-primary/40 hover:shadow-sm'
							}`}
						>
							<div className='flex items-center gap-3'>
								<span className='text-3xl'>{moduleType.icon}</span>
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<h3 className='text-lg font-bold text-text'>{moduleType.label}</h3>
										<span className='text-xs bg-surface text-text-muted px-2 py-0.5 rounded-full'>
											{count} 個模板
										</span>
									</div>
									<p className='text-sm text-text-light mt-1'>{moduleType.description}</p>
								</div>
								{isActive && (
									<div className='w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0'>
										<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2.5}
												d='M5 13l4 4L19 7'
											/>
										</svg>
									</div>
								)}
							</div>
						</button>
					);
				})}
			</div>

			{/* 通知訊息 */}
			{notice && (
				<div
					className={`px-4 py-3 rounded-xl border text-sm ${
						notice.type === 'error'
							? 'bg-red-50 border-red-200 text-red-700'
							: notice.type === 'success'
								? 'bg-emerald-50 border-emerald-200 text-emerald-700'
								: 'bg-surface border-border text-text'
					}`}
				>
					{notice.text}
				</div>
			)}

			{/* 模板卡片列表 */}
			<div>
				<h2 className='text-lg font-bold text-text mb-3'>
					{MODULE_TYPES.find((m) => m.key === selectedModuleType)?.icon}{' '}
					{MODULE_TYPES.find((m) => m.key === selectedModuleType)?.label} 模板
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
					{filteredTemplates.map((template) => {
						const isSelected = template.id === selectedTemplateId;
						return (
							<button
								key={template.id}
								type='button'
								onClick={() => setSelectedTemplateId(template.id)}
								className={`text-left p-4 rounded-xl border transition-colors ${
									isSelected
										? 'border-primary bg-primary/5'
										: 'border-border bg-white hover:border-primary/40'
								}`}
							>
								<div className='flex items-start justify-between'>
									<div>
										<div className='text-xs font-semibold text-text-muted'>{template.industry}</div>
										<h3 className='text-lg font-bold text-text mt-1'>{template.subcategory}</h3>
									</div>
									{isSelected && (
										<div className='w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1'>
											<svg
												className='w-3 h-3'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={3}
													d='M5 13l4 4L19 7'
												/>
											</svg>
										</div>
									)}
								</div>
								<p className='text-sm text-text-light mt-2'>{template.description}</p>
							</button>
						);
					})}
				</div>
			</div>

			{/* 選中模板的摘要 */}
			{selectedTemplate && (
				<div className='bg-white rounded-xl border border-border p-5 space-y-4'>
					<div>
						<h2 className='text-xl font-bold text-text'>{selectedTemplate.label}</h2>
						<p className='text-sm text-text-light mt-1'>{selectedTemplate.description}</p>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm'>
						<div className='bg-surface rounded-lg px-3 py-2'>
							網站資訊：{selectedTemplate.summary.site_settings}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							分類：{selectedTemplate.summary.categories}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							{getSummaryLabel('產品', selectedModuleType)}：{selectedTemplate.summary.products}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							{getSummaryLabel('文章', selectedModuleType)}：{selectedTemplate.summary.articles}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							{getSummaryLabel('文章分類', selectedModuleType)}：
							{selectedTemplate.summary.article_categories}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							標籤：{selectedTemplate.summary.tags}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							頁面：{selectedTemplate.summary.pages}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							導覽選單：{selectedTemplate.summary.menus}
						</div>
						<div className='bg-surface rounded-lg px-3 py-2'>
							網站內容：{selectedTemplate.summary.site_contents}
						</div>
					</div>

					<div className='text-sm text-text-muted bg-surface-alt rounded-lg p-3'>
						首頁輪播：{selectedTemplate.summary.site_contents_breakdown.home_carousel}、
						首頁關於我們：{selectedTemplate.summary.site_contents_breakdown.home_about}、
						關於我們頁：{selectedTemplate.summary.site_contents_breakdown.about_page}、 FAQ 頁：
						{selectedTemplate.summary.site_contents_breakdown.faq_page}、 FAQ 題目：
						{selectedTemplate.summary.site_contents_breakdown.faq_item}
					</div>
				</div>
			)}

			{/* 套用結果 */}
			{result && (
				<div className='bg-white rounded-xl border border-border p-5 space-y-3'>
					<h3 className='text-lg font-semibold text-text'>套用結果</h3>
					<div className='text-sm text-text-muted'>
						動作：{result.action === 'reset' ? '回到初始狀態' : '套用主題模板'}
					</div>
					<div className='text-sm text-text-muted'>模板 ID：{result.templateId}</div>
					<div className='text-sm text-text-muted'>
						模式：{result.mode === 'partial' ? '部分匯入' : '完整覆蓋'}
					</div>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-3 text-sm'>
						{Object.entries(result.imported || {}).map(([key, value]) => (
							<div key={key} className='bg-surface rounded-lg px-3 py-2'>
								{key}：{value}
							</div>
						))}
					</div>
					<div className='text-xs text-text-light break-all'>
						Revalidate Tags：{(result.revalidate?.tags || []).join(', ') || '無'}
					</div>
					{(result.revalidate?.errors || []).length > 0 && (
						<div className='text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-wrap'>
							{result.revalidate.errors.join('\n')}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
