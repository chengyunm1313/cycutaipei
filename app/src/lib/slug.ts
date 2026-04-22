import { addTraditionalDict, pinyin } from 'pinyin-pro';
import TraditionalDict from '@pinyin-pro/data/traditional';

addTraditionalDict(TraditionalDict);

/**
 * 專案字典只放「這個站點真的會反覆出現在 slug」的專有詞。
 * 一般中文名詞不要硬塞進來，優先讓它走拼音 fallback，避免字典持續膨脹。
 */
const SLUG_PHRASE_OVERRIDES: Record<string, string> = {
	台北市中原大學校友會: 'taipei-cycu-alumni-association',
	中原大學校友會: 'cycu-alumni-association',
	中原大學: 'cycu',
	年度會員大會: 'annual-general-assembly',
	校友學院: 'alumni-academy',
	校友會: 'alumni-association',
	校友: 'alumni',
	最新消息: 'latest-news',
	活動資訊: 'event-info',
	活動: 'event',
	活動分類: 'event-categories',
	活動報名: 'event-registration',
	活動紀錄: 'event-recap',
	活動公告: 'event-announcement',
	活動簡章: 'event-brochure',
	活動行事曆: 'event-calendar',
	常見問題: 'faq',
	關於我們: 'about-us',
	聯絡我們: 'contact-us',
	首頁關於我們: 'home-about',
	網站管理: 'site-management',
	自訂義頁面: 'custom-page',
	組織章程: 'bylaws',
	理監事: 'board-members',
	會務人員: 'association-staff',
	理監事會: 'board-meeting',
	理事長: 'chairperson',
	副理事長: 'vice-chairperson',
	常務理事: 'executive-director',
	常務監事: 'executive-supervisor',
	總幹事: 'secretary-general',
	幹部: 'leadership-team',
	秘書處: 'secretariat',
	委員會: 'committee',
	會務公告: 'association-announcement',
	會務: 'association-affairs',
	入會: 'membership',
	會員服務: 'member-services',
	人員: 'staff',
	會員相關: 'membership',
	會員大會: 'general-assembly',
	會員活動: 'member-events',
	會員交流: 'member-networking',
	會員聯誼: 'member-mixer',
	會費: 'membership-fee',
	報名系統: 'registration-system',
	校友講座: 'alumni-talk',
	校友聯誼: 'alumni-mixer',
	校友交流: 'alumni-networking',
	校友服務: 'alumni-services',
	校友活動: 'alumni-events',
	校友返校: 'alumni-homecoming',
	年會: 'annual-meeting',
	年度: 'annual',
	例會: 'regular-meeting',
	講座: 'seminar',
	健行: 'hiking',
	母校: 'alma-mater',
	中原人: 'cycu-community',
	加入: 'join',
	圓滿落幕: 'successful-closing',
	第: '',
	屆: 'term',
	與: '',
	及: '',
	和: '',
	的: '',
	之: '',
	並: '',
	台北市: 'taipei-city',
	臺北市: 'taipei-city',
	台北: 'taipei',
	臺北: 'taipei',
	新北: 'new taipei',
	桃園: 'taoyuan',
	中壢: 'zhongli',
	新竹: 'hsinchu',
	台中: 'taichung',
	臺中: 'taichung',
	彰化: 'changhua',
	南投: 'nantou',
	雲林: 'yunlin',
	嘉義: 'chiayi',
	台南: 'tainan',
	臺南: 'tainan',
	高雄: 'kaohsiung',
	屏東: 'pingtung',
	宜蘭: 'yilan',
	花蓮: 'hualien',
	台東: 'taitung',
	臺東: 'taitung',
	澎湖: 'penghu',
	基隆: 'keelung',
	金門: 'kinmen',
	馬祖: 'matsu',
	士林: 'shilin',
};

/**
 * 將輸入內容轉成適合前台路由的 ASCII slug。
 * 校友學院目前部署在 Cloudflare Pages，中文 slug 會造成 detail route 不穩，
 * 因此這裡強制收斂為英數與連字號；若輸入包含中文，優先轉成拼音提升可讀性。
 */
function createSlugHash(input: string): string {
	let hash = 0;
	for (const char of input) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return hash.toString(36).slice(0, 6) || 'item';
}

function containsCjk(input: string): boolean {
	return /[\u3400-\u9fff\uf900-\ufaff]/.test(input);
}

function sanitizeAsciiSlug(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

function applySlugPhraseOverrides(input: string): string {
	const entries = Object.entries(SLUG_PHRASE_OVERRIDES).sort(([a], [b]) => b.length - a.length);
	let output = input;

	for (const [source, target] of entries) {
		output = output.replaceAll(source, ` ${target} `);
	}

	return output.replace(/\s+/g, ' ').trim();
}

function romanizeChinese(input: string): string {
	if (!containsCjk(input)) return input;

	const romanized = pinyin(applySlugPhraseOverrides(input), {
		toneType: 'none',
		type: 'string',
		separator: ' ',
		v: false,
		nonZh: 'consecutive',
		traditional: true,
	});

	return romanized.replace(/\s+/g, ' ').trim();
}

function cleanupRomanizedSlug(input: string): string {
	return input
		.replace(/\b(yi|er|san|si|wu|liu|qi|ba|jiu|shi)\b/g, (match, _token, offset, full) => {
			const before = full.slice(0, offset).trimEnd();
			return /\d$/.test(before) ? '' : match;
		})
		.replace(/\s+/g, ' ')
		.trim();
}

export function slugifyAscii(input: string, fallback = 'item'): string {
	const trimmed = input.trim();
	const normalized = sanitizeAsciiSlug(cleanupRomanizedSlug(romanizeChinese(trimmed)));

	if (normalized) return normalized;
	if (!trimmed) return fallback;
	return `${fallback}-${createSlugHash(trimmed)}`;
}
