import { create } from 'zustand';
import { Empleado } from '../domain/empleado.model';
import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  CreateEmpleadoDto,
  UpdateEmpleadoDto
} from '../api/empleadosApi';

interface EmpleadosState {
  items: Empleado[];
  loading: boolean;
  error?: string;
  fetchAll: () => Promise<void>;
  create: (payload: CreateEmpleadoDto) => Promise<void>;
  update: (id: number, payload: UpdateEmpleadoDto) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useEmpleadosStore = create<EmpleadosState>((set, get) => ({
  items: [],
  loading: false,
  error: undefined,
  async fetchAll() {
    set({ loading: true, error: undefined });
    try {
      const data = await getEmpleados();
      set({ items: data, loading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Error al cargar empleados', loading: false });
    }
  },
  async create(payload) {
    set({ loading: true, error: undefined });
    try {
      await createEmpleado(payload);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al crear empleado', loading: false });
    }
  },
  async update(id, payload) {
    set({ loading: true, error: undefined });
    try {
      await updateEmpleado(id, payload);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al actualizar empleado', loading: false });
    }
  },
  async remove(id) {
    set({ loading: true, error: undefined });
    try {
      await deleteEmpleado(id);
      await get().fetchAll();
    } catch (err: any) {
      set({ error: err.message ?? 'Error al eliminar empleado', loading: false });
    }
  }
}));
