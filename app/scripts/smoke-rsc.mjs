const DEFAULT_BASE_URL = 'https://product-catalog-a2z.pages.dev';
const SMOKE_TIMEOUT_MS = 15000;

const RAW_BASE_URL =
	process.env.SMOKE_BASE_URL ||
	process.env.NEXT_PUBLIC_APP_URL ||
	process.env.APP_URL ||
	DEFAULT_BASE_URL;

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const ROUTE_CHECKS = [
	{ path: '/', kind: 'page' },
	{ path: '/about', kind: 'page' },
	{ path: '/faq', kind: 'page' },
	{ path: '/admin', kind: 'page' },
	{ path: '/admin/products/1', kind: 'page' },
	{ path: '/admin/articles/1', kind: 'page' },
	{ path: '/admin/site-management/about/smoke-route-id', kind: 'page' },
	{ path: '/admin/site-management/faq/smoke-route-id', kind: 'page' },
	{ path: '/api/site-template', kind: 'api' },
];

function withRscQuery(url) {
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}_rsc=${Date.now().toString(36)}`;
}

function isStatusAllowed(mode, kind, status) {
	if (mode === 'rsc') return status === 200;
	if (kind === 'api') return status === 200;
	return status === 200 || status === 307;
}

function isContentTypeAllowed(mode, kind, contentType) {
	const normalized = (contentType || '').toLowerCase();
	if (kind === 'api') {
		return normalized.includes('application/json');
	}
	if (mode === 'rsc') {
		return normalized.includes('text/x-component');
	}
	return normalized.includes('text/html');
}

async function fetchWithTimeout(url, init) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), SMOKE_TIMEOUT_MS);
	try {
		return await fetch(url, {
			...init,
			signal: controller.signal,
			redirect: 'manual',
		});
	} finally {
		clearTimeout(timer);
	}
}

async function runCheck({ path, kind }, mode) {
	const baseTarget = `${BASE_URL}${path}`;
	const target = mode === 'rsc' ? withRscQuery(baseTarget) : baseTarget;
	const headers = mode === 'rsc' ? { RSC: '1' } : undefined;

	try {
		const response = await fetchWithTimeout(target, { headers });
		const status = response.status;
		const contentType = response.headers.get('content-type') || '';
		const meta = {
			xEdgeRuntime: response.headers.get('x-edge-runtime') || '',
			xMatchedPath: response.headers.get('x-matched-path') || '',
			cfRay: response.headers.get('cf-ray') || '',
		};

		const okStatus = isStatusAllowed(mode, kind, status);
		const okContentType = isContentTypeAllowed(mode, kind, contentType);
		const ok = okStatus && okContentType;

		return {
			ok,
			path,
			kind,
			mode,
			target,
			status,
			contentType,
			...meta,
			error: null,
		};
	} catch (error) {
		return {
			ok: false,
			path,
			kind,
			mode,
			target,
			status: 0,
			contentType: '',
			xEdgeRuntime: '',
			xMatchedPath: '',
			cfRay: '',
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

function printResult(result) {
	if (result.ok) {
		console.log(
			`[OK] [${result.mode.toUpperCase()}] ${result.path} -> ${result.status} ${result.contentType}`
		);
		return;
	}

	console.error(`[FAIL] [${result.mode.toUpperCase()}] ${result.path}`);
	console.error(`  url: ${result.target}`);
	console.error(`  status: ${result.status}`);
	console.error(`  content-type: ${result.contentType || '(empty)'}`);
	console.error(`  x-edge-runtime: ${result.xEdgeRuntime || '(empty)'}`);
	console.error(`  x-matched-path: ${result.xMatchedPath || '(empty)'}`);
	console.error(`  cf-ray: ${result.cfRay || '(empty)'}`);
	if (result.error) {
		console.error(`  error: ${result.error}`);
	}
}

async function main() {
	console.log(`Running RSC smoke test against: ${BASE_URL}`);
	const checks = [];
	for (const route of ROUTE_CHECKS) {
		checks.push(runCheck(route, 'html'));
		checks.push(runCheck(route, 'rsc'));
	}

	const results = await Promise.all(checks);
	results.forEach(printResult);

	const failures = results.filter((result) => !result.ok);
	if (failures.length > 0) {
		console.error(`RSC smoke test failed: ${failures.length} check(s) failed.`);
		process.exit(1);
	}

	console.log(`RSC smoke test passed: ${results.length} checks.`);
}

main().catch((error) => {
	console.error('Unexpected smoke test error:', error);
	process.exit(1);
});
