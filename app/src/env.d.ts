/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
	DB: D1Database;
	BUCKET: R2Bucket;
}

declare module '@cloudflare/next-on-pages' {
	export function getRequestContext(): {
		env: CloudflareEnv;
		cf: IncomingRequestCfProperties;
		ctx: ExecutionContext;
	};
}
