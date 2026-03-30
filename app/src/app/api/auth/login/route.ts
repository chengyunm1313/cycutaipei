import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

/** 登入驗證 API */
export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const { username, password } = (await request.json()) as {
			username: string;
			password: string;
		};

		if (!username || !password) {
			return NextResponse.json({ error: '請輸入帳號和密碼' }, { status: 400 });
		}

		const found = await db.select().from(users).where(eq(users.username, username)).all();

		if (found.length === 0 || found[0].password !== password) {
			return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
		}

		const { password: _, ...safeUser } = found[0];
		return NextResponse.json(safeUser);
	} catch (error) {
		console.error('Auth error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
