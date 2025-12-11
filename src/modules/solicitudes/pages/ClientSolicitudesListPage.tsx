import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { useSolicitudesStore } from '../store/useSolicitudesStore';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import { useForm } from 'react-hook-form';
import { SolicitudEstado } from '../domain/solicitud.model';

interface NuevaSolicitudFormValues {
  monto: number;
  nro_cuotas: number;
}

const CUOTAS_OPTIONS = [6, 12, 18, 24, 36, 48];

interface NuevaSolicitudDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialogo modal para crear una nueva solicitud de préstamo desde la vista de cliente.
 * Usa el store de solicitudes y el snackbar global para mostrar mensajes de resultado.
 */
const NuevaSolicitudDialog: React.FC<NuevaSolicitudDialogProps> = ({ open, onClose }) => {
  const { create, loading } = useSolicitudesStore();
  const { enqueue } = useNotificationStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NuevaSolicitudFormValues>({
    defaultValues: {
      monto: 0,
      nro_cuotas: 12
    }
  });

  const onSubmit = async (values: NuevaSolicitudFormValues) => {
    const monto = Number(values.monto);
    const nroCuotas = Number(values.nro_cuotas);

    if (!Number.isFinite(monto) || monto <= 0) {
      enqueue('El monto debe ser un número positivo.', 'error');
      return;
    }
    if (!Number.isInteger(nroCuotas) || nroCuotas <= 0) {
      enqueue('El número de cuotas debe ser un entero positivo.', 'error');
      return;
    }

    const res = await create({ monto, nro_cuotas: nroCuotas });
    if (res) {
      enqueue('Solicitud creada y enviada para aprobación.', 'success');
      reset();
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Box
          component="form"
          mt={1}
          display="flex"
          flexDirection="column"
          gap={2}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            label="Monto"
            type="number"
            fullWidth
            error={!!errors.monto}
            helperText={errors.monto?.message}
            {...register('monto', {
              required: 'El monto es requerido',
              valueAsNumber: true,
              min: { value: 1, message: 'El monto debe ser mayor que 0' }
            })}
          />

          <TextField
            select
            label="Número de cuotas"
            fullWidth
            error={!!errors.nro_cuotas}
            helperText={errors.nro_cuotas?.message}
            {...register('nro_cuotas', {
              required: 'El número de cuotas es requerido',
              valueAsNumber: true,
              min: { value: 1, message: 'Debe ser un entero positivo' }
            })}
          >
            {CUOTAS_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton variant="outlined" onClick={handleClose} disabled={loading}>
          Cancelar
        </AppButton>
        <AppButton type="submit" onClick={handleSubmit(onSubmit)} disabled={loading}>
          Crear solicitud
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

export const ClientSolicitudesListPage: React.FC = () => {
  const { misSolicitudes, loading, error, fetchMisSolicitudes } = useSolicitudesStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  // Filtro por defecto: PENDIENTE (aunque la vista cliente no filtra, se deja preparado)
  const [estadoFilter] = useState<'PENDIENTE' | ''>('PENDIENTE');

  useEffect(() => {
    fetchMisSolicitudes().catch(() => undefined);
  }, [fetchMisSolicitudes]);

  const renderEstado = (estado: SolicitudEstado) => {
    let icon = null;
    let color: 'success' | 'error' | 'warning' | 'inherit' = 'inherit';

    if (estado === 'PENDIENTE') {
      icon = <HourglassEmptyIcon fontSize="small" color="warning" />;
      color = 'warning';
    } else if (estado === 'ACEPTADA') {
      icon = <CheckCircleIcon fontSize="small" color="success" />;
      color = 'success';
    } else if (estado === 'RECHAZADA') {
      icon = <CancelIcon fontSize="small" color="error" />;
      color = 'error';
    }

    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {icon}
        <Typography
          variant="body2"
          color={
            color === 'success'
              ? 'success.main'
              : color === 'error'
              ? 'error.main'
              : color === 'warning'
              ? 'warning.main'
              : undefined
          }
        >
          {estado}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h5">Mis solicitudes de préstamo</Typography>
      
      </Box>

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

      {!loading && misSolicitudes.length === 0 && !error && (
        <Card variant="outlined" sx={{ maxWidth: 480 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <HourglassEmptyIcon color="action" />
              <Box>
                <Typography variant="subtitle1">
                  Aún no tienes solicitudes de préstamo. Crea una nueva para que un empleado la revise.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {!loading && misSolicitudes.length > 0 && (
        <AppTable
          columns={[
            { key: 'id', header: 'ID solicitud' },
            {
              key: 'prestatario',
              header: 'Prestatario',
              render: (row: any) => {
                const s = row;
                const baseNombre =
                  s.nombrePrestatario ||
                  `${s.prest_nombre ?? ''} ${s.prest_apellido ?? ''}`.trim();
                if (baseNombre) {
                  return s.prest_ci ? `${baseNombre} (CC ${s.prest_ci})` : baseNombre;
                }
                return s.id_prestatario || s.idPrestatario
                  ? `ID ${s.id_prestatario || s.idPrestatario}`
                  : '—';
              }
            },
            {
              key: 'monto',
              header: 'Monto',
              render: (row: any) => formatCurrencyCOP(row.monto)
            },
            {
              key: 'nroCuotas',
              header: 'Número de cuotas'
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (row: any) => renderEstado(row.estado)
            },
            {
              key: 'fechaEnvio',
              header: 'Fecha de solicitud',
              render: (row: any) => formatDate(row.fechaEnvio)
            },
            {
              key: 'motivoRechazo',
              header: 'Motivo de rechazo',
              render: (row: any) =>
                row.motivoRechazo ? (
                  <Tooltip title={row.motivoRechazo}>
                    <span>{row.motivoRechazo}</span>
                  </Tooltip>
                ) : (
                  <InfoOutlinedIcon fontSize="small" color="disabled" />
                )
            }
          ]}
          data={misSolicitudes as any}
        />
      )}

      <NuevaSolicitudDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};

export default ClientSolicitudesListPage;
