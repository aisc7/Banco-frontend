import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { useSolicitudesStore } from '../store/useSolicitudesStore';
import { useNotificationStore } from '../../../app/store/useNotificationStore';

interface SolicitudFormValues {
  monto: number;
  nro_cuotas: number;
  id_empleado?: number | '';
}

const CUOTAS_OPTIONS = [6, 12, 18, 24, 36, 48];

export const ClientSolicitudFormPage: React.FC = () => {
  const { create, loading } = useSolicitudesStore();
  const { enqueue } = useNotificationStore();
  const navigate = useNavigate();
  const [empleadoCampoHabilitado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SolicitudFormValues>({
    defaultValues: {
      monto: 0,
      nro_cuotas: 12,
      id_empleado: ''
    }
  });

  const onSubmit = async (values: SolicitudFormValues) => {
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

    const payload: { monto: number; nro_cuotas: number; id_empleado?: number | null } = {
      monto,
      nro_cuotas: nroCuotas
    };
    if (empleadoCampoHabilitado && values.id_empleado) {
      payload.id_empleado = Number(values.id_empleado);
    }

    const res = await create(payload);
    if (res) {
      enqueue('Solicitud creada y enviada para aprobación.', 'success');
      navigate('/solicitudes');
    }
  };

  return (
    <Box maxWidth={480}>
      <Typography variant="h5" mb={2}>
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Completa los datos básicos para solicitar un nuevo préstamo. Un empleado revisará tu solicitud y
        podrás ver el estado desde la sección &quot;Mis solicitudes&quot;.
      </Typography>

      <Box
        component="form"
        display="flex"
        flexDirection="column"
        gap={2}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          label="Monto solicitado"
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

        <TextField
          label="Empleado que lo atendió (opcional)"
          type="number"
          fullWidth
          disabled={!empleadoCampoHabilitado}
          helperText={
            empleadoCampoHabilitado
              ? 'Ingresa el ID del empleado que te atiende.'
              : 'Para efectos académicos, este campo se deja como numérico simple.'
          }
          {...register('id_empleado')}
        />

        <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
          <AppButton
            variant="outlined"
            onClick={() => navigate('/solicitudes')}
            disabled={loading}
          >
            Cancelar
          </AppButton>
          <AppButton
            type="submit"
            startIcon={
              loading ? <CircularProgress size={18} color="inherit" /> : <AddCircleOutlineIcon />
            }
            disabled={loading}
          >
            Enviar solicitud
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientSolicitudFormPage;

