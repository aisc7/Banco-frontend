import { create } from 'zustand';
import { Solicitud, SolicitudEstado } from '../domain/solicitud.model';
import {
  getMisSolicitudes,
  getSolicitudes,
  createSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  CreateSolicitudDto,
  SolicitudesQueryParams
} from '../api/solicitudesApi';

interface SolicitudesState {
  misSolicitudes: Solicitud[];
  items: Solicitud[];
  loading: boolean;
  error?: string;
  filters: SolicitudesQueryParams;
  fetchMisSolicitudes: () => Promise<void>;
  fetchAll: (filters?: SolicitudesQueryParams) => Promise<void>;
  create: (payload: CreateSolicitudDto) => Promise<{ id_solicitud_prestamo: number; estado: SolicitudEstado } | null>;
  aprobar: (id: number) => Promise<{ solicitud: { id_solicitud: number; estado: SolicitudEstado }; prestamo: { id_prestamo: number } } | null>;
  rechazar: (id: number, motivo?: string) => Promise<{ solicitud: { id_solicitud: number; estado: 'RECHAZADA'; motivo?: string | null } } | null>;
}

export const useSolicitudesStore = create<SolicitudesState>((set, get) => ({
  misSolicitudes: [],
  items: [],
  loading: false,
  error: undefined,
  filters: {},
  async fetchMisSolicitudes() {
    set({ loading: true, error: undefined });
    try {
      const data = await getMisSolicitudes();
      set({ misSolicitudes: data, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar solicitudes del prestatario', loading: false });
    }
  },
  async fetchAll(filters) {
    set({ loading: true, error: undefined, filters: filters ?? get().filters });
    try {
      const data = await getSolicitudes(filters ?? get().filters);
      set({ items: data, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar solicitudes', loading: false });
    }
  },
  async create(payload) {
    set({ loading: true, error: undefined });
    try {
      const res = await createSolicitud(payload);
      await get().fetchMisSolicitudes();
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message ?? 'Error al crear solicitud', loading: false });
      return null;
    }
  },
  async aprobar(id) {
    set({ loading: true, error: undefined });
    try {
      const res = await aprobarSolicitud(id);
      await get().fetchAll();
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message ?? 'Error al aprobar solicitud', loading: false });
      return null;
    }
  },
  async rechazar(id, motivo) {
    set({ loading: true, error: undefined });
    try {
      const res = await rechazarSolicitud(id, motivo);
      await get().fetchAll();
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message ?? 'Error al rechazar solicitud', loading: false });
      return null;
    }
  }
}));

