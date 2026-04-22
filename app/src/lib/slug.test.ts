import test from 'node:test';
import assert from 'node:assert/strict';
import { slugifyAscii } from './slug';

test('保留既有 ASCII slug 正規化行為', () => {
	assert.equal(slugifyAscii('  Latest News  ', 'page'), 'latest-news');
	assert.equal(slugifyAscii('R&D / Events', 'page'), 'r-and-d-events');
});

test('中文站點核心詞優先套用專案字典', () => {
	assert.equal(slugifyAscii('台北市中原大學校友會', 'page'), 'taipei-cycu-alumni-association');
	assert.equal(slugifyAscii('校友學院', 'page'), 'alumni-academy');
	assert.equal(slugifyAscii('最新消息', 'page'), 'latest-news');
	assert.equal(slugifyAscii('常見問題', 'page'), 'faq');
});

test('會務與活動標題會先清理虛詞再產出 slug', () => {
	assert.equal(
		slugifyAscii('113 年度會員大會圓滿落幕', 'article'),
		'113-annual-general-assembly-successful-closing'
	);
	assert.equal(
		slugifyAscii('第24屆理監事與會務人員', 'article'),
		'24-term-board-members-association-staff'
	);
	assert.equal(
		slugifyAscii('校友講座與會員聯誼活動', 'article'),
		'alumni-talk-member-mixer-event'
	);
	assert.equal(
		slugifyAscii('加入校友會與活動報名', 'article'),
		'join-alumni-association-event-registration'
	);
});

test('未命中字典的中文仍可回退為拼音或混合 slug', () => {
	assert.equal(slugifyAscii('士林電機', 'page'), 'shilin-dian-ji');
	assert.equal(slugifyAscii('桃園校友服務', 'page'), 'taoyuan-alumni-services');
});

test('空白或無法轉出的內容仍保留 fallback 機制', () => {
	assert.equal(slugifyAscii('', 'page'), 'page');
	assert.match(slugifyAscii('！！！', 'page'), /^page-[a-z0-9]+$/);
});
