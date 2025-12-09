// Modelo de dominio de Cuota para el frontend y funciones de mapeo desde la API.
export interface Cuota {
  id: number;
  idPrestamo: number;
  idPrestatario: number;
  monto: number;
  nroCuota: number;
  fechaPago: string | null;
  fechaVencimiento: string;
  estado: string;
}

export function mapCuotaFromApi(raw: any): Cuota {
  return {
    id: raw.ID_CUOTA ?? raw.id_cuota,
    idPrestamo: raw.ID_PRESTAMO ?? raw.id_prestamo,
    idPrestatario: raw.ID_PRESTATARIO ?? raw.id_prestatario,
    monto: raw.MONTO ?? raw.monto,
    nroCuota: raw.NRO_CUOTA ?? raw.nro_cuota,
    fechaPago: raw.FECHA_PAGO ?? raw.fecha_pago ?? null,
    fechaVencimiento: raw.FECHA_VENCIMIENTO ?? raw.fecha_vencimiento,
    estado: raw.ESTADO ?? raw.estado
  };
}

export function mapCuotasFromApi(rawList: any[] | null | undefined): Cuota[] {
  return (rawList || []).map(mapCuotaFromApi);
}

