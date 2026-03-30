import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

interface UserInput {
	username: string;
	password: string;
	displayName?: string;
	role?: 'admin' | 'editor' | 'author' | 'viewer';
	notes?: string;
	photoUrl?: string;
	aboutAuthor?: string;
	socialLinks?: string;
}

export async function GET() {
	try {
		const { env } = getRequestContext();
		if (!env?.DB) {
			return NextResponse.json({ error: 'Database not available' }, { status: 500 });
		}

		const db = getDb(env.DB);
		const allUsers = await db.select().from(users).all();

		// 不回傳密碼
		const safeUsers = allUsers.map(({ password, ...rest }) => rest);
		return NextResponse.json(safeUsers);
	} catch (error) {
		console.error('Error fetching users:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as UserInput;

		if (!data.username || !data.password) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newUser = await db
			.insert(users)
			.values({
				username: data.username,
				password: data.password,
				displayName: data.displayName || data.username,
				role: data.role || 'viewer',
				notes: data.notes || null,
				photoUrl: data.photoUrl || null,
				aboutAuthor: data.aboutAuthor || null,
				socialLinks: data.socialLinks || null,
			})
			.returning();

		// 不回傳密碼
		const { password, ...safeUser } = newUser[0];
		return NextResponse.json(safeUser, { status: 201 });
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
		}
		console.error('Error creating user:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const { id } = (await request.json()) as { id: number };

		if (!id) {
			return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
		}

		await db.delete(users).where(eq(users.id, id));
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting user:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
