import React, { useState } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import { cargaMasivaPrestatarios, obtenerLogsCargaPrestatarios } from '../api/prestatariosApi';

export const PrestatariosBulkUploadSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setSummary(null);
    try {
      const content = await file.text();
      const result = await cargaMasivaPrestatarios({
        content,
        nombre_archivo: file.name,
        usuario: 'frontend'
      });
      setSummary(
        `Total: ${result.total}, aceptados: ${result.aceptados}, rechazados: ${result.rechazados}`
      );
      const l = await obtenerLogsCargaPrestatarios();
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshLogs = async () => {
    setLoading(true);
    try {
      const l = await obtenerLogsCargaPrestatarios();
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" mb={1}>
        Carga masiva de prestatarios
      </Typography>
      <Typography variant="body2" mb={2}>
        Sube un archivo CSV/TXT con los campos requeridos por el backend para registrar múltiples clientes.
      </Typography>

      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        disabled={loading}
      >
        Seleccionar archivo
        <input type="file" hidden accept=".csv,.txt" onChange={handleFileChange} />
      </Button>

      {loading && <LinearProgress sx={{ mt: 2 }} />}

      {summary && (
        <Typography variant="body2" mt={2}>
          {summary}
        </Typography>
      )}

      <Box mt={3}>
        <Box display="flex" alignItems="center" mb={1} gap={1}>
          <ArticleIcon fontSize="small" />
          <Typography variant="subtitle2">Logs de carga recientes</Typography>
          <Button size="small" onClick={handleRefreshLogs}>
            Actualizar
          </Button>
        </Box>
        {logs.length === 0 ? (
          <Typography variant="body2">No hay logs de carga.</Typography>
        ) : (
          <ul>
            {logs.map((log) => (
              <li key={log.ID_LOG_PK ?? log.id_log_pk}>
                {log.NOMBRE_ARCHIVO ?? log.nombre_archivo} —{' '}
                {log.FECHA_CARGA ?? log.fecha_carga} — usuario:{' '}
                {log.USUARIO ?? log.usuario} — ok:{' '}
                {log.REGISTROS_VALIDOS ?? log.registros_validos} / errores:{' '}
                {log.REGISTROS_RECHAZADOS ?? log.registros_rechazados}
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Box>
  );
};

