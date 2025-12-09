import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { getMorosos } from '../api/reportesApi';
import { ReporteRow } from '../../../shared/types/domain';

export const MorososPage: React.FC = () => {
  const [rows, setRows] = useState<ReporteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await getMorosos();
        setRows(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar morosos');
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
        Morosos
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
        <Typography variant="body2">No hay registros de morosos.</Typography>
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

export default MorososPage;
