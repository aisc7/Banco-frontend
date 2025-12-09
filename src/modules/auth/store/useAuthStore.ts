import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { login, LoginPayload } from '../api/authApi';

export type UserRole = 'EMPLEADO' | 'PRESTATARIO' | 'ADMIN' | null;

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  id_prestatario: number | null;
}

interface JwtPayload {
  id?: number;
  username?: string;
  role?: UserRole;
  id_prestatario?: number | null;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error?: string;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hydrateFromStorage: () => void;
  isEmpleado: () => boolean;
  isPrestatario: () => boolean;
  isAdmin: () => boolean;
}

const TOKEN_KEY = 'banco_token';

const decodeUserFromToken = (token: string | null): AuthUser | null => {
  if (!token) return null;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.id ?? 0,
      username: decoded.username ?? '',
      role: decoded.role ?? null,
      id_prestatario: decoded.id_prestatario ?? null
    };
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const initialToken = getInitialToken();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: decodeUserFromToken(initialToken),
  loading: false,
  error: undefined,
  async login(payload) {
    set({ loading: true, error: undefined });
    try {
      const data = await login(payload);
      const token = data.token;
      const user = decodeUserFromToken(token);
      set({ token, user, loading: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (err: any) {
      set({ error: err.message ?? 'Error de autenticación', loading: false });
    }
  },
  logout() {
    set({ token: null, user: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  hydrateFromStorage() {
    const token = getInitialToken();
    set({
      token,
      user: decodeUserFromToken(token)
    });
  },
  isEmpleado() {
    const role = get().user?.role;
    return role === 'EMPLEADO' || role === 'ADMIN';
  },
  isPrestatario() {
    return get().user?.role === 'PRESTATARIO';
  },
  isAdmin() {
    return get().user?.role === 'ADMIN';
  }
}));
