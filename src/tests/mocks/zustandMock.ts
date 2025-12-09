import { vi } from 'vitest';

// Helper genérico para mockear hooks de stores de Zustand (useStore)
// Permite definir un estado inicial y reutilizar el patrón selector => state/selector(state).
export function createZustandSelectorMock<TState extends object>(initialState: TState) {
  const state = { ...initialState };
  const hook = (selector?: (s: TState) => any) => (selector ? selector(state as TState) : (state as TState));
  return hook;
}

// Helper para resetear mocks de Vitest entre tests cuando se mockean stores
export function resetZustandMocks() {
  vi.clearAllMocks();
}

