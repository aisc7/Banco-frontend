import React, { useEffect, useState } from 'react';
import { getPrestamosPorPrestatario } from '../../prestamos/api/prestamosApi';
import { getCuotasByPrestamo } from '../api/cuotasApi';
import { mapCuotasFromApi } from '../domain/cuota.model';
import { getPrestatarios } from '../../prestatarios/api/prestatariosApi';
import {
  Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';

const CuotasEmpleadoPage: React.FC = () => {
  const [prestatarios, setPrestatarios] = useState<any[]>([]);
  const [selectedPrestatario, setSelectedPrestatario] = useState<any | null>(null);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [selectedPrestamo, setSelectedPrestamo] = useState<any | null>(null);
  const [cuotas, setCuotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar prestatarios con préstamos activos o refinanciados
  useEffect(() => {
    setLoading(true);
    setError('');
    const fetchPrestatarios = async () => {
      try {
        const all = await getPrestatarios();
        // Filtrar prestatarios con al menos un préstamo ACTIVO o REFINANCIADO
        const filtered: any[] = [];
        for (const p of all) {
          try {
            const data = await getPrestamosPorPrestatario(p.ci);
            const tienePrestamo = (data.prestamos || []).some((pr: any) => pr.estado === 'ACTIVO' || pr.estado === 'REFINANCIADO');
            if (tienePrestamo) filtered.push({ ...p });
          } catch {}
        }
        setPrestatarios(filtered);
      } catch (e) {
        setError('Error al cargar prestatarios');
      } finally {
        setLoading(false);
      }
    };
    fetchPrestatarios();
  }, []);

  // Buscar préstamos del prestatario seleccionado
  useEffect(() => {
    if (!selectedPrestatario) {
      setPrestamos([]);
      setSelectedPrestamo(null);
      setCuotas([]);
      return;
    }
    setLoading(true);
    setError('');
    const fetchPrestamos = async () => {
      try {
        const data = await getPrestamosPorPrestatario(selectedPrestatario.ci);
        // Solo préstamos activos o refinanciados
        setPrestamos((data.prestamos || []).filter((pr: any) => pr.estado === 'ACTIVO' || pr.estado === 'REFINANCIADO'));
        setSelectedPrestamo(null);
        setCuotas([]);
      } catch (e) {
        setError('Error al obtener préstamos');
      } finally {
        setLoading(false);
      }
    };
    fetchPrestamos();
  }, [selectedPrestatario]);

  // Buscar cuotas del préstamo seleccionado
  useEffect(() => {
    if (!selectedPrestamo) {
      setCuotas([]);
      return;
    }
    setLoading(true);
    setError('');
    const fetchCuotas = async () => {
      try {
        const data = await getCuotasByPrestamo(selectedPrestamo.id, '');
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
  }, [selectedPrestamo]);

  return (
    <>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Cuotas
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="prestatario-select-label">Prestatario</InputLabel>
          <Select
            labelId="prestatario-select-label"
            value={selectedPrestatario?.ci || ''}
            label="Prestatario"
            onChange={e => {
              const p = prestatarios.find(pr => pr.ci === Number(e.target.value));
              setSelectedPrestatario(p || null);
            }}
          >
            <MenuItem value="">
              <em>Seleccione un prestatario</em>
            </MenuItem>
            {prestatarios.map(p => (
              <MenuItem key={p.ci} value={p.ci}>
                {p.nombre} {p.apellido} (CI: {p.ci})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

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
              </TableRow>
            </TableHead>
            <TableBody>
              {cuotas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay cuotas para mostrar.</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default CuotasEmpleadoPage;