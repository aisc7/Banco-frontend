import { create } from 'zustand';
import {
  Prestatario
} from '../domain/prestatario.model';
import {
  getPrestatarios,
  createPrestatario,
  updatePrestatario,
  deletePrestatario
} from '../api/prestatariosApi';

interface PrestatariosState {
  items: Prestatario[];
  loading: boolean;
  error?: string;
  fetchAll: () => Promise<void>;
  create: (payload: Parameters<typeof createPrestatario>[0]) => Promise<void>;
  update: (ci: number | string, payload: Parameters<typeof updatePrestatario>[1]) => Promise<void>;
  remove: (ci: number | string) => Promise<void>;
}

export const usePrestatariosStore = create<PrestatariosState>((set, get) => ({
  items: [],
  loading: false,
  error: undefined,
  async fetchAll() {
    set({ loading: true, error: undefined });
    try {
      const data = await getPrestatarios();
      set({ items: data, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar prestatarios', loading: false });
    }
  },
  async create(payload) {
    set({ loading: true, error: undefined });
    try {
      await createPrestatario(payload);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al crear prestatario', loading: false });
    }
  },
  async update(ci, payload) {
    set({ loading: true, error: undefined });
    try {
      await updatePrestatario(ci, payload);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al actualizar prestatario', loading: false });
    }
  },
  async remove(ci) {
    set({ loading: true, error: undefined });
    try {
      await deletePrestatario(ci);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al eliminar prestatario', loading: false });
    }
  }
}));
