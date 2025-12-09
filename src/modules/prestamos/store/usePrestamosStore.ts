import { create } from 'zustand';
import {
  Prestamo,
  CuotaResumen
} from '../domain/prestamo.model';
import {
  getPrestamos,
  getPrestamosPorPrestatario,
  createPrestamo,
  updatePrestamo,
  deletePrestamo,
  CreatePrestamoDto,
  UpdatePrestamoDto
} from '../api/prestamosApi';

interface PrestamosState {
  items: Prestamo[];
  prestamosPorPrestatario: Prestamo[];
  cuotasPorPrestatario: CuotaResumen[];
  loading: boolean;
  error?: string;
  fetchAll: () => Promise<void>;
  fetchByPrestatario: (ci: number | string) => Promise<void>;
  create: (payload: CreatePrestamoDto) => Promise<Prestamo | null>;
  update: (id: number, payload: UpdatePrestamoDto) => Promise<Prestamo | null>;
  remove: (id: number) => Promise<void>;
}

export const usePrestamosStore = create<PrestamosState>((set, get) => ({
  items: [],
  prestamosPorPrestatario: [],
  cuotasPorPrestatario: [],
  loading: false,
  error: undefined,
  async fetchAll() {
    set({ loading: true, error: undefined });
    try {
      const data = await getPrestamos();
      set({ items: data, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar préstamos', loading: false });
    }
  },
  async fetchByPrestatario(ci) {
    set({ loading: true, error: undefined });
    try {
      const result = await getPrestamosPorPrestatario(ci);
      set({
        prestamosPorPrestatario: result.prestamos,
        cuotasPorPrestatario: result.cuotas,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar préstamos del prestatario', loading: false });
    }
  },
  async create(payload) {
    set({ loading: true, error: undefined });
    try {
      const res = await createPrestamo(payload);
      await get().fetchAll();
      const created = get().items.find((p) => p.id === res.id_prestamo) ?? null;
      set({ loading: false });
      return created ?? null;
    } catch (err: any) {
      set({ error: err.message ?? 'Error al crear préstamo', loading: false });
      return null;
    }
  },
  async update(id, payload) {
    set({ loading: true, error: undefined });
    try {
      const updated = await updatePrestamo(id, payload);
      await get().fetchAll();
      set({ loading: false });
      return updated;
    } catch (err: any) {
      set({ error: err.message ?? 'Error al actualizar préstamo', loading: false });
      return null;
    }
  },
  async remove(id) {
    set({ loading: true, error: undefined });
    try {
      await deletePrestamo(id);
      await get().fetchAll();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cancelar préstamo', loading: false });
    }
  }
}));
