import { create } from 'zustand';
import { Cuota } from '../domain/cuota.model';
import { getCuotasPendientes, getCuotasMorosas, registrarPagoCuota, RegistrarPagoCuotaDto } from '../api/cuotasApi';

interface CuotasState {
  items: Cuota[];
  loading: boolean;
  error?: string;
  fetchByPrestamo: (idPrestamo: number) => Promise<void>;
  pagarCuota: (idCuota: number, payload: RegistrarPagoCuotaDto) => Promise<void>;
}

export const useCuotasStore = create<CuotasState>((set, get) => ({
  items: [],
  loading: false,
  error: undefined,
  async fetchByPrestamo(idPrestamo) {
    set({ loading: true, error: undefined });
    try {
      const [pendientes, morosas] = await Promise.all([getCuotasPendientes(), getCuotasMorosas()]);
      const todas = [...pendientes, ...morosas].filter((c) => c.idPrestamo === idPrestamo);
      set({ items: todas, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar cuotas', loading: false });
    }
  },
  async pagarCuota(idCuota, payload) {
    set({ loading: true, error: undefined });
    try {
      await registrarPagoCuota(idCuota, payload);
      const current = get().items[0];
      if (current) {
        await get().fetchByPrestamo(current.idPrestamo);
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({ error: err.message ?? 'Error al pagar cuota', loading: false });
    }
  }
}));
