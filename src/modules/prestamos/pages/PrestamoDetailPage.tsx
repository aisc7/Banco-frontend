import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Stack,
  Link,
  Tooltip
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { Prestamo, CuotaResumen } from '../domain/prestamo.model';
import { getPrestamoById, getPrestamosPorPrestatario, createRefinanciacion } from '../api/prestamosApi';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export const PrestamoDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [cuotas, setCuotas] = useState<CuotaResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [prestamosDelPrestatario, setPrestamosDelPrestatario] = useState<Prestamo[]>([]);
  const user = useAuthStore((s) => s.user);
  const { enqueue } = useNotificationStore();
  const [refDialogOpen, setRefDialogOpen] = useState(false);
  const [refNroCuotas, setRefNroCuotas] = useState<string>('');
  const [refLoading, setRefLoading] = useState(false);

  const isEmpleado = user?.role === 'EMPLEADO' || user?.role === 'ADMIN';

  const loadPrestamo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(undefined);
    try {
      const p = await getPrestamoById(Number(id));
      setPrestamo(p);
      // Cargar cuotas vía resumen por prestatario y filtrar por préstamo
      const result = await getPrestamosPorPrestatario(p.idPrestatario);
      setCuotas(result.cuotas.filter((c) => c.idPrestamo === p.id));
      setPrestamosDelPrestatario(result.prestamos);
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar préstamo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPrestamo().catch(() => undefined);
  }, [loadPrestamo]);

  const handleRefinanciar = () => {
    setRefNroCuotas('');
    setRefDialogOpen(true);
  };

  const handleConfirmRefinanciacion = async () => {
    if (!prestamo) return;
    const n = Number(refNroCuotas);
    if (!Number.isInteger(n) || n <= 0) {
      enqueue('El nuevo número de cuotas debe ser un entero positivo.', 'error');
      return;
    }
    setRefLoading(true);
    try {
      await createRefinanciacion(prestamo.id, { nro_cuotas: n });
      enqueue('Refinanciación registrada correctamente. Se recalcularon las cuotas del préstamo.', 'success');
      setRefDialogOpen(false);
      await loadPrestamo();
    } catch {
      // El interceptor ya muestra el error de negocio.
    } finally {
      setRefLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error" mb={2}>
          {error}
        </Typography>
        <AppButton startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </AppButton>
      </Box>
    );
  }

  if (!prestamo) {
    return (
      <Box>
        <Typography>No se encontró el préstamo.</Typography>
        <AppButton startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </AppButton>
      </Box>
    );
  }

  // Regla de negocio: máximo 2 préstamos ACTIVO por prestatario.
  const prestamosActivosDelPrestatario = useMemo(
    () => prestamosDelPrestatario.filter((p) => p.estado === 'ACTIVO').length,
    [prestamosDelPrestatario]
  );

  const descripcionEstado =
    prestamo.estado === 'ACTIVO'
      ? 'El préstamo está vigente y debe seguir pagándose según el cronograma de cuotas.'
      : prestamo.estado === 'PENDIENTE'
      ? 'Solicitud registrada pendiente de aprobación o desembolso.'
      : prestamo.estado === 'CANCELADO'
      ? 'El préstamo fue cancelado o finalizado.'
      : prestamo.estado === 'RECHAZADO'
      ? 'La solicitud de préstamo fue rechazada.'
      : '';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Préstamo #{prestamo.id}</Typography>
        <Box display="flex" gap={1}>
          {isEmpleado && (
            <AppButton
              startIcon={<AutorenewIcon />}
              onClick={handleRefinanciar}
            >
              Refinanciar
            </AppButton>
          )}
          <AppButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/prestamos')}
          >
            Volver al listado
          </AppButton>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <Chip label={`ID Prestatario: ${prestamo.idPrestatario}`} />
        <Chip label={`Monto: ${formatCurrencyCOP(prestamo.totalPrestado)}`} />
        <Chip label={`Cuotas: ${prestamo.nroCuotas}`} />
        <Tooltip
          title="El tipo de interés afecta el total a pagar y el valor de cada cuota (BAJA/MEDIA/ALTA)."
        >
          <Chip
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <span>Interés: {prestamo.interes}</span>
                <InfoOutlinedIcon fontSize="small" />
              </Box>
            }
          />
        </Tooltip>
        <Chip label={`Emisión: ${formatDate(prestamo.fechaEmision)}`} />
        {prestamo.fechaVencimiento && (
          <Chip label={`Vencimiento: ${formatDate(prestamo.fechaVencimiento)}`} />
        )}
        <Chip
          label={`Estado: ${prestamo.estado}`}
          color={prestamo.estado === 'ACTIVO' ? 'success' : prestamo.estado === 'PENDIENTE' ? 'warning' : 'default'}
        />
      </Stack>

      {descripcionEstado && (
        <Typography variant="body2" color="text.secondary" mb={1}>
          {descripcionEstado}
        </Typography>
      )}

      {prestamo.estado === 'ACTIVO' && prestamosActivosDelPrestatario >= 1 && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <WarningAmberIcon color="warning" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Este prestatario tiene actualmente {prestamosActivosDelPrestatario} préstamo(s) activo(s).
            El sistema solo permite tener hasta 2 préstamos activos al mismo tiempo.
          </Typography>
        </Box>
      )}

      <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Cuotas</Typography>
        <Link component={RouterLink} to={`/cuotas/${prestamo.id}`}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <PaymentsIcon fontSize="small" />
            <Typography variant="body2">Ver detalle de cuotas</Typography>
          </Box>
        </Link>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Las cuotas vencidas pasan a estado <strong>MOROSA</strong> y pueden generar penalizaciones
        adicionales según la política de la entidad financiera.
      </Typography>

      {cuotas.length === 0 ? (
        <Typography variant="body2">No hay cuotas para este préstamo.</Typography>
      ) : (
        <AppTable
          columns={[
            { key: 'nroCuota', header: 'N°' },
            { key: 'valorCuota', header: 'Valor' },
            { key: 'saldo', header: 'Saldo' },
            { key: 'fechaVencimiento', header: 'Vencimiento' },
            {
              key: 'estado',
              header: 'Estado',
              render: (row: any) => (
                <Box display="flex" alignItems="center" gap={0.5}>
                  {row.estado === 'MOROSA' && (
                    <WarningAmberIcon fontSize="small" color="warning" />
                  )}
                  <Typography
                    variant="body2"
                    color={row.estado === 'MOROSA' ? 'error.main' : undefined}
                  >
                    {row.estado}
                  </Typography>
                </Box>
              )
            }
          ]}
          data={cuotas as any}
        />
      )}

      <Dialog open={refDialogOpen} onClose={() => !refLoading && setRefDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Refinanciar préstamo</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ingresa el nuevo número de cuotas para refinanciar este préstamo. El backend recalculará el
            cronograma y generará una solicitud de refinanciación registrada en la auditoría.
          </DialogContentText>
          <TextField
            label="Nuevo número de cuotas"
            type="number"
            fullWidth
            value={refNroCuotas}
            onChange={(e) => setRefNroCuotas(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <AppButton
            variant="outlined"
            onClick={() => setRefDialogOpen(false)}
            disabled={refLoading}
          >
            Cancelar
          </AppButton>
          <AppButton
            onClick={handleConfirmRefinanciacion}
            disabled={refLoading}
          >
            Confirmar
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrestamoDetailPage;
