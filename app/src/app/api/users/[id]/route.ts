import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Role } from '@/data/types';

export const runtime = 'edge';
type UserUpdateRequest = {
	username?: string;
	password?: string;
	displayName?: string;
	role?: Role;
	notes?: string | null;
	photoUrl?: string | null;
	aboutAuthor?: string | null;
	socialLinks?: string | null;
};
const VALID_ROLES: Role[] = ['admin', 'editor', 'author', 'viewer'];
function isRole(value: unknown): value is Role {
	return typeof value === 'string' && VALID_ROLES.includes(value as Role);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
		}

		const user = await db.select().from(users).where(eq(users.id, userId)).get();

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// 不回傳密碼
		const { password, ...safeUser } = user;
		return NextResponse.json(safeUser);
	} catch (error: unknown) {
		console.error('Error fetching user:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { env } = getRequestContext();
		const db = getDb(env.DB);
		const data = (await request.json()) as UserUpdateRequest & { role?: unknown };
		const userId = parseInt(id, 10);

		if (isNaN(userId)) {
			return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
		}

		const updateData: UserUpdateRequest = {};
		if (data.username !== undefined) updateData.username = data.username;
		if (data.password) updateData.password = data.password; // Only update if provided
		if (data.displayName !== undefined) updateData.displayName = data.displayName;
		if (data.role !== undefined) {
			if (!isRole(data.role)) {
				return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
			}
			updateData.role = data.role;
		}
		if (data.notes !== undefined) updateData.notes = data.notes;
		if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
		if (data.aboutAuthor !== undefined) updateData.aboutAuthor = data.aboutAuthor;
		if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: 'No data to update' }, { status: 400 });
		}

		const updatedUser = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId))
			.returning();

		if (!updatedUser.length) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// 不回傳密碼
		const { password, ...safeUser } = updatedUser[0];
		return NextResponse.json(safeUser);
	} catch (error: unknown) {
		const errMsg = error instanceof Error ? error.message : '';
		if (errMsg.includes('UNIQUE constraint failed')) {
			return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
		}
		console.error('Error updating user:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
