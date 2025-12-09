import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { getRefinanciaciones } from '../api/reportesApi';
import { ReporteRow } from '../../../shared/types/domain';

export const RefinanciacionesPage: React.FC = () => {
  const [rows, setRows] = useState<ReporteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await getRefinanciaciones();
        setRows(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar refinanciaciones');
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => undefined);
  }, []);

  const columns = rows[0] ? Object.keys(rows[0]).map((key) => ({ key, header: key })) : [];

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Refinanciaciones activas
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && rows.length === 0 && !error && (
        <Typography variant="body2">No hay refinanciaciones activas.</Typography>
      )}

      {!loading && rows.length > 0 && (
        <AppTable
          columns={columns as any}
          data={rows as any}
          getRowId={(_, index) => index}
        />
      )}
    </Box>
  );
};

export default RefinanciacionesPage;
