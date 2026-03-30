'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { checkPermission, type Role, type Permission } from '@/data/types';
import { loginApi } from '@/lib/api';
import { authenticateUser } from '@/data/mock';

/** 安全使用者資料（不含密碼） */
interface SafeUser {
	id: number;
	username: string;
	displayName: string;
	role: Role;
	createdAt: string;
}

interface AuthContextType {
	isAuthenticated: boolean;
	currentUser: SafeUser | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadStoredUser(): SafeUser | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('admin_user');
	if (!stored) return null;

	try {
		return JSON.parse(stored) as SafeUser;
	} catch {
		localStorage.removeItem('admin_user');
		return null;
	}
}

/**
 * 後台權限管理 Context
 * 優先使用 D1 API 驗證，失敗時 fallback 至 mock
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const [currentUser, setCurrentUser] = useState<SafeUser | null>(() => loadStoredUser());

	const login = async (username: string, password: string): Promise<boolean> => {
		try {
			// 優先嘗試 D1 API 登入
			const apiUser = await loginApi(username, password);
			const safeUser: SafeUser = {
				id: apiUser.id,
				username: apiUser.username,
				displayName: apiUser.displayName,
				role: apiUser.role as Role,
				createdAt: apiUser.createdAt,
			};
			localStorage.setItem('admin_user', JSON.stringify(safeUser));
			setCurrentUser(safeUser);
			return true;
		} catch {
			// Fallback：若 API 不可用，改用 mock 驗證
			const user = authenticateUser(username, password);
			if (user) {
				const safeUser: SafeUser = {
					id: user.id,
					username: user.username,
					displayName: user.displayName,
					role: user.role,
					createdAt: user.createdAt,
				};
				localStorage.setItem('admin_user', JSON.stringify(safeUser));
				setCurrentUser(safeUser);
				return true;
			}
			return false;
		}
	};

	const logout = () => {
		localStorage.removeItem('admin_user');
		setCurrentUser(null);
	};

	const hasPermission = (permission: Permission): boolean => {
		if (!currentUser) return false;
		return checkPermission(currentUser.role, permission);
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!currentUser,
				currentUser,
				login,
				logout,
				hasPermission,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth 必須在 AuthProvider 內使用');
	return ctx;
}
