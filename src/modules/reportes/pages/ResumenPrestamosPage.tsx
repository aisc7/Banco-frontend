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
        // eslint-disable-next-line no-console
        console.error('[REPORTES FRONT] Error resumen préstamos:', err);
        setError(err.message ?? 'Error al cargar resumen');
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => undefined);
  }, []);

  const totalPrestamos = rows.length;

  // Totales agregados desde la vista VW_CONSOLIDADO_PRESTAMOS
  const { totalPrestado, saldoRestante } = useMemo(() => {
    let monto = 0;
    let saldo = 0;
    rows.forEach((r) => {
      const total_prestado = Number((r as any).TOTAL_PRESTADO ?? (r as any).total_prestado ?? 0);
      const saldo_restante = Number((r as any).SALDO_RESTANTE ?? (r as any).saldo_restante ?? 0);
      monto += Number.isFinite(total_prestado) ? total_prestado : 0;
      saldo += Number.isFinite(saldo_restante) ? saldo_restante : 0;
    });
    return { totalPrestado: monto, saldoRestante: saldo };
  }, [rows]);

  // Clasificación simple: préstamos con saldo > 0 se consideran "ACTIVOS", el resto "COMPLETADOS"
  const porEstadoFinanciero = useMemo(() => {
    const counts: Record<string, number> = { ACTIVO: 0, COMPLETADO: 0 };
    rows.forEach((r) => {
      const saldo_restante = Number((r as any).SALDO_RESTANTE ?? (r as any).saldo_restante ?? 0);
      if (saldo_restante > 0) {
        counts.ACTIVO += 1;
      } else {
        counts.COMPLETADO += 1;
      }
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([estado, value]) => ({ name: estado, value }));
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
        Resumen consolidado de préstamos
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Este reporte resume la cartera de préstamos: cantidad de préstamos registrados, montos totales
        desembolsados y saldo pendiente. Las gráficas ilustran cuántos préstamos siguen activos frente
        a los que ya se han completado.
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Monto total desembolsado
              </Typography>
              <Typography variant="h6">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(totalPrestado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Saldo pendiente aproximado
              </Typography>
              <Typography variant="h6">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(saldoRestante)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 280 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Préstamos por estado financiero
              </Typography>
              {porEstadoFinanciero.length === 0 ? (
                <Typography variant="body2">No hay datos para mostrar.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={porEstadoFinanciero}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {porEstadoFinanciero.map((entry, index) => (
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
