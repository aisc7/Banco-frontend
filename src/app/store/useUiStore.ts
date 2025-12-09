import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface UiState {
  sidebarOpen: boolean;
  themeMode: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

const THEME_KEY = 'banco_theme';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
  return stored === 'dark' ? 'dark' : 'light';
};

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: true,
  themeMode: getInitialTheme(),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTheme: () => {
    const next = get().themeMode === 'light' ? 'dark' : 'light';
    set({ themeMode: next });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, next);
    }
  }
}));

