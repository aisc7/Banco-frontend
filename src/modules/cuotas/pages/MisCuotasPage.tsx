import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { getMisPrestamos, getPrestamosPorPrestatario } from '../../prestamos/api/prestamosApi';
import { getCuotasByPrestamo, getResumenCuotas, pagarCuota } from '../api/cuotasApi';
import { mapCuotasFromApi } from '../domain/cuota.model';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, TextField, Divider, List, ListItem, ListItemText
} from '@mui/material';

const MisCuotasPage: React.FC = () => {
  const { user, token, isEmpleado } = useAuthStore();
  const [ci, setCi] = useState('');
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<any | null>(null);
  const [cuotas, setCuotas] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch prestamos (empleado: por cédula, prestatario: propios)
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    const fetchPrestamos = async () => {
      try {
        let prestamosData: any[] = [];
        if (isEmpleado()) {
          if (ci) {
            const data = await getPrestamosPorPrestatario(ci);
            prestamosData = data.prestamos || [];
          } else {
            prestamosData = [];
          }
        } else {
          const data = await getMisPrestamos();
          prestamosData = data.prestamos || [];
        }
        setPrestamos(prestamosData);
        setSelectedPrestamo(null);
        setCuotas([]);
      } catch (e) {
        setError('Error al obtener préstamos');
      } finally {
        setLoading(false);
      }
    };
    fetchPrestamos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isEmpleado, ci]);

  // Fetch cuotas when prestamo selected
  // Fetch cuotas del préstamo seleccionado
  useEffect(() => {
    if (!selectedPrestamo || !token) {
      setCuotas([]);
      return;
    }
    setLoading(true);
    setError('');
    const fetchCuotas = async () => {
      try {
        const data = await getCuotasByPrestamo(selectedPrestamo.id, token || '');
        // El backend responde en data.result (array de cuotas)
        // Mapear cuotas para asegurar consistencia de campos
        const cuotasMapeadas = Array.isArray(data?.result) ? mapCuotasFromApi(data.result) : [];
        setCuotas(cuotasMapeadas);
      } catch (e) {
        setError('Error al obtener cuotas');
        setCuotas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCuotas();
  }, [selectedPrestamo, token]);

  // Fetch resumen
  useEffect(() => {
    if (!token || (!user && !ci)) return;
    setLoading(true);
    setError('');
    const fetchResumen = async () => {
      try {
        let id;
        if (isEmpleado()) {
          id = ci;
        } else {
          id = user?.id_prestatario || user?.id;
        }
        if (!id) return;
        let safeResumen;
        const data = await getResumenCuotas(id, token ?? '');
        safeResumen = data?.result;
        if (!Array.isArray(safeResumen)) {
          if (safeResumen && typeof safeResumen === 'object') {
            safeResumen = Object.values(safeResumen);
          } else {
            safeResumen = [];
          }
        }
        setResumen(safeResumen);
      } catch (e) {
        setError('Error al obtener resumen de cuotas');
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [token, user, ci, isEmpleado]);

  // Función para pagar cuota
  const handlePagarCuota = async (id: number) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      // El backend espera un payload con al menos la fecha de pago
      const hoy = new Date().toISOString().slice(0, 10);
      await pagarCuota(id, { fecha_pago: hoy });
      // Refresh cuotas and resumen
      if (selectedPrestamo) {
        const data = await getCuotasByPrestamo(selectedPrestamo.id, token);
        const cuotasMapeadas = Array.isArray(data?.result) ? mapCuotasFromApi(data.result) : [];
        setCuotas(cuotasMapeadas);
      }
      let idUser;
      if (isEmpleado()) {
        idUser = ci;
      } else {
        idUser = user?.id_prestatario || user?.id;
      }
      if (idUser) {
        const resumenData = await getResumenCuotas(idUser, token ?? '');
        let safeResumen = resumenData?.result;
        if (!Array.isArray(safeResumen)) {
          if (safeResumen && typeof safeResumen === 'object') {
            safeResumen = Object.values(safeResumen);
          } else {
            safeResumen = [];
          }
        }
        setResumen(safeResumen);
      }
    } catch (e) {
      setError('Error al pagar cuota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        {user?.role === 'EMPLEADO' ? 'Cuotas' : 'Mis Cuotas'}
      </Typography>

      {isEmpleado() && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Buscar por cédula de prestatario
          </Typography>
          <TextField
            label="Cédula"
            value={ci}
            onChange={e => setCi(e.target.value)}
            size="small"
            sx={{ width: 200 }}
          />
        </Paper>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography color="error" mb={2}>{error}</Typography>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="prestamo-select-label">Préstamo</InputLabel>
          <Select
            labelId="prestamo-select-label"
            value={selectedPrestamo?.id || ''}
            label="Préstamo"
            onChange={e => {
              const p = prestamos.find(pr => pr.id === Number(e.target.value));
              setSelectedPrestamo(p || null);
            }}
          >
            <MenuItem value="">
              <em>Seleccione un préstamo</em>
            </MenuItem>
            {prestamos.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.id} - {p.monto} ({p.estado})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          Cuotas del Préstamo
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Método de Pago</TableCell>
                <TableCell>Pagado</TableCell>
                {user?.role === 'PRESTATARIO' && <TableCell>Acción</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {cuotas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={user?.role === 'PRESTATARIO' ? 7 : 6} align="center">No hay cuotas para mostrar.</TableCell>
                </TableRow>
              )}
              {cuotas.map((cuota, idx) => (
                <TableRow key={cuota.id_cuota || cuota.id || idx}>
                  <TableCell>{cuota.nro_cuota ?? cuota.nroCuota ?? '-'}</TableCell>
                  <TableCell>{cuota.fecha_vencimiento ?? cuota.fechaVencimiento ?? '-'}</TableCell>
                  <TableCell>{cuota.monto ?? '-'}</TableCell>
                  <TableCell>{cuota.estado ?? '-'}</TableCell>
                  <TableCell>{cuota.metodo_pago ?? cuota.metodo ?? '-'}</TableCell>
                  <TableCell>{cuota.pagado ? 'Sí' : 'No'}</TableCell>
                  {user?.role === 'PRESTATARIO' && (
                    <TableCell>
                      {cuota.estado === 'PENDIENTE' && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handlePagarCuota(cuota.id_cuota || cuota.id)}
                        >
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Resumen de Cuotas
        </Typography>
        <List>
          {(Array.isArray(resumen) ? resumen : []).length === 0 && (
            <ListItem>
              <ListItemText primary="No hay datos de resumen disponibles." />
            </ListItem>
          )}
          {(Array.isArray(resumen) ? resumen : []).map((r, idx) => (
            <React.Fragment key={r.id_cuota || r.id || idx}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        #{(r.nro_cuota || r.nroCuota) ?? '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.estado || '-'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.fecha_vencimiento || r.fechaVencimiento || '-'}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    r.detalle ? (
                      <Typography variant="body2" color="text.secondary">{r.detalle}</Typography>
                    ) : null
                  }
                />
              </ListItem>
              {idx < (resumen.length - 1) && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </>
  );
};

export default MisCuotasPage;
