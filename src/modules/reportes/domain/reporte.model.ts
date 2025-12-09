// Modelo de dominio para filas de reportes en el frontend y funciones de mapeo desde la API.
export type ReporteRow = Record<string, unknown>;

export function mapReportesFromApi(rawList: any[] | null | undefined): ReporteRow[] {
  return (rawList || []) as ReporteRow[];
}

