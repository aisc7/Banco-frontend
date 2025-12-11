// Modelo de dominio de Prestatario para el frontend y funciones de mapeo desde la API.
export interface Prestatario {
  id: number;
  ci: number;
  nombre: string;
  apellido: string;
  direccion: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  estadoCliente: string;
  fechaRegistro: string;
  usuarioRegistro: string;
  // Foto del prestatario en base64 (opcional, usada en el perfil)
  fotoBase64?: string | null;
}

export interface PrestatariosLoadLog {
  idLog: number;
  nombreArchivo: string;
  fechaCarga: string;
  usuario: string;
  registrosValidos: number;
  registrosRechazados: number;
  detalles: any[];
}

export function mapPrestatarioFromApi(raw: any): Prestatario {
  return {
    id: raw.ID_PRESTATARIO ?? raw.id_prestatario,
    ci: raw.CI ?? raw.ci,
    nombre: raw.NOMBRE ?? raw.nombre,
    apellido: raw.APELLIDO ?? raw.apellido,
    direccion: raw.DIRECCION ?? raw.direccion,
    email: raw.EMAIL ?? raw.email,
    telefono: raw.TELEFONO ?? raw.telefono,
    fechaNacimiento: raw.FECHA_NACIMIENTO ?? raw.fecha_nacimiento,
    estadoCliente: raw.ESTADO_CLIENTE ?? raw.estado_cliente,
    fechaRegistro: raw.FECHA_REGISTRO ?? raw.fecha_registro,
    usuarioRegistro: raw.USUARIO_REGISTRO ?? raw.usuario_registro,
    fotoBase64: raw.FOTO_BASE64 ?? raw.foto_base64 ?? raw.fotoBase64 ?? null
  };
}

export function mapPrestatariosFromApi(rawList: any[] | null | undefined): Prestatario[] {
  return (rawList || []).map(mapPrestatarioFromApi);
}

export function mapPrestatariosLoadLogsFromApi(rawList: any[] | null | undefined): PrestatariosLoadLog[] {
  return (rawList || []).map((raw) => ({
    idLog: raw.ID_LOG_PK ?? raw.id_log_pk,
    nombreArchivo: raw.NOMBRE_ARCHIVO ?? raw.nombre_archivo,
    fechaCarga: raw.FECHA_CARGA ?? raw.fecha_carga,
    usuario: raw.USUARIO ?? raw.usuario,
    registrosValidos: raw.REGISTROS_VALIDOS ?? raw.registros_validos,
    registrosRechazados: raw.REGISTROS_RECHAZADOS ?? raw.registros_rechazados,
    detalles: raw.detalles ?? raw.DETALLES ?? []
  }));
}
