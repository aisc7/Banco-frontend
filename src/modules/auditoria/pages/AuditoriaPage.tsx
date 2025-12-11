import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { getAuditoriaLogs, AuditoriaLog } from '../api/auditoriaApi';

interface FiltroAuditoria {
  usuario: string;
  operacion: string;
  tabla: string;
}

export const AuditoriaPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltroAuditoria>({ usuario: '', operacion: '', tabla: '' });
  const [limit] = useState<number>(100);
  const [offset] = useState<number>(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAuditoriaLogs({
        usuario: filtros.usuario || undefined,
        operacion: filtros.operacion || undefined,
        tabla: filtros.tabla || undefined,
        limit,
        offset,
      });
      setLogs(result);
    } catch (err: any) {
      setError(err.message || 'Error al obtener los registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = () => {
    fetchLogs();
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Auditoría
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Usuario"
          name="usuario"
          value={filtros.usuario}
          onChange={handleFiltroChange}
        />
        <TextField
          label="Operación"
          name="operacion"
          value={filtros.operacion}
          onChange={handleFiltroChange}
        />
        <TextField
          label="Tabla"
          name="tabla"
          value={filtros.tabla}
          onChange={handleFiltroChange}
        />
        <Button variant="contained" onClick={handleBuscar} disabled={loading}>
          Buscar
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Dominio</TableCell>
                <TableCell>Fecha Entrada</TableCell>
                <TableCell>Fecha Salida</TableCell>
                <TableCell>Tabla</TableCell>
                <TableCell>Operación</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Descripción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.ID_AUDIT_PK}>
                  <TableCell>{log.ID_AUDIT_PK}</TableCell>
                  <TableCell>{log.USUARIO}</TableCell>
                  <TableCell>{log.IP}</TableCell>
                  <TableCell>{log.DOMINIO}</TableCell>
                  <TableCell>{log.FECHA_ENTRADA}</TableCell>
                  <TableCell>{log.FECHA_SALIDA || '-'}</TableCell>
                  <TableCell>{log.TABLA_AFECTADA}</TableCell>
                  <TableCell>{log.OPERACION}</TableCell>
                  <TableCell>{log.DURACION_SESION || '-'}</TableCell>
                  <TableCell>{log.DESCRIPCION}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditoriaPage;