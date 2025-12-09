import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getResumenPrestamos } from '../api/reportesApi';
import { ReporteRow } from '../../../shared/types/domain';

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#0f172a'];

export const ResumenPrestamosPage: React.FC = () => {
  const [rows, setRows] = useState<ReporteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await getResumenPrestamos();
        setRows(data);
      } catch (err: any) {
        setError(err.message ?? 'Error al cargar resumen');
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => undefined);
  }, []);

  const totalPrestamos = rows.length;

  const porEstado = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      const estado = String(r.ESTADO ?? r.estado ?? 'DESCONOCIDO');
      counts[estado] = (counts[estado] || 0) + 1;
    });
    return Object.entries(counts).map(([estado, count]) => ({ name: estado, value: count }));
  }, [rows]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" mb={2}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Resumen de préstamos activos y cancelados
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Este reporte muestra cuántos préstamos hay en cada estado (PENDIENTE, ACTIVO, CANCELADO, etc.).
        Úsalo para monitorear la salud de la cartera y detectar concentraciones de riesgo o mora.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total de préstamos
              </Typography>
              <Typography variant="h4">{totalPrestamos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 280 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Préstamos por estado
              </Typography>
              {porEstado.length === 0 ? (
                <Typography variant="body2">No hay datos para mostrar.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={porEstado}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {porEstado.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResumenPrestamosPage;
