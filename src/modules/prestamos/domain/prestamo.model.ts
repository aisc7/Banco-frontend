// Modelo de dominio de Prestamo y CuotaResumen para el frontend y funciones de mapeo desde la API.
export interface Prestamo {
  id: number;
  idSolicitudPrestamo: number;
  idPrestatario: number;
  totalPrestado: number;
  nroCuotas: number;
  interes: number;
  fechaEmision: string;
  fechaVencimiento: string | null;
  estado: string;
}

export interface CuotaResumen {
  idPrestamo: number;
  nroCuota: number;
  valorCuota: number;
  saldo: number;
  estado: string;
  fechaVencimiento: string;
}

export function mapPrestamoFromApi(raw: any): Prestamo {
  return {
    id: raw.ID_PRESTAMO ?? raw.id_prestamo,
    idSolicitudPrestamo: raw.ID_SOLICITUD_PRESTAMO ?? raw.id_solicitud_prestamo,
    idPrestatario: raw.ID_PRESTATARIO ?? raw.id_prestatario,
    totalPrestado: raw.TOTAL_PRESTADO ?? raw.total_prestado,
    nroCuotas: raw.NRO_CUOTAS ?? raw.nro_cuotas,
    interes: raw.INTERES ?? raw.interes,
    fechaEmision: raw.FECHA_EMISION ?? raw.fecha_emision,
    fechaVencimiento: raw.FECHA_VENCIMIENTO ?? raw.fecha_vencimiento ?? null,
    estado: raw.ESTADO ?? raw.estado
  };
}

export function mapPrestamosFromApi(rawList: any[] | null | undefined): Prestamo[] {
  return (rawList || []).map(mapPrestamoFromApi);
}

export function mapCuotaResumenFromApi(raw: any): CuotaResumen {
  return {
    idPrestamo: raw.ID_PRESTAMO ?? raw.id_prestamo,
    nroCuota: raw.NRO_CUOTA ?? raw.nro_cuota,
    valorCuota: raw.VALOR_CUOTA ?? raw.valor_cuota,
    saldo: raw.SALDO ?? raw.saldo,
    estado: raw.ESTADO ?? raw.estado,
    fechaVencimiento: raw.FECHA_VENCIMIENTO ?? raw.fecha_vencimiento
  };
}

export function mapCuotasResumenFromApi(rawList: any[] | null | undefined): CuotaResumen[] {
  return (rawList || []).map(mapCuotaResumenFromApi);
}

