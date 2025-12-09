import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Tooltip,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useForm } from 'react-hook-form';
import { usePrestamosStore } from '../store/usePrestamosStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { AppButton } from '../../../shared/components/ui/AppButton';

interface PrestamoFormValues {
  id_prestatario?: number;
  monto: number;
  nro_cuotas: number;
  tipo_interes: 'BAJA' | 'MEDIA' | 'ALTA';
}

export const PrestamoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading, error: serverError } = usePrestamosStore();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isPrestatario = role === 'PRESTATARIO';
  const isEmpleado = role === 'EMPLEADO' || role === 'ADMIN';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PrestamoFormValues>({
    defaultValues: {
      id_prestatario: user?.role === 'EMPLEADO' || user?.role === 'ADMIN' ? undefined : user?.id_prestatario ?? undefined,
      monto: 0,
      nro_cuotas: 12,
      tipo_interes: 'MEDIA'
    }
  });

  const onSubmit = async (values: PrestamoFormValues) => {
    const basePayload: any = {
      monto: Number(values.monto),
      nro_cuotas: Number(values.nro_cuotas)
    };

    if (!isPrestatario) {
      basePayload.tipo_interes = values.tipo_interes;
      basePayload.id_prestatario = values.id_prestatario;
    }

    const created = await create(basePayload);
    if (created) {
      navigate(`/prestamos/${created.id}`);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Solicitar nuevo préstamo</Typography>
        <AppButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/prestamos')}
        >
          Volver
        </AppButton>
      </Box>

      {/* Regla de negocio: máximo 2 préstamos activos por prestatario */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Recuerda: cada prestatario puede tener como máximo 2 préstamos activos. Si ya tiene 2,
        el sistema rechazará automáticamente la nueva solicitud.
      </Alert>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        maxWidth={480}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        {isEmpleado && (
          <TextField
            label="ID prestatario"
            type="number"
            fullWidth
            error={!!errors.id_prestatario}
            helperText={errors.id_prestatario?.message}
            {...register('id_prestatario', {
              required: 'El ID del prestatario es requerido para empleados',
              valueAsNumber: true
            })}
          />
        )}
        <TextField
          label="Monto"
          type="number"
          fullWidth
          error={!!errors.monto}
          helperText={errors.monto?.message ?? 'El monto debe ser mayor a 0.'}
          {...register('monto', {
            required: 'El monto es requerido',
            valueAsNumber: true,
            min: { value: 1, message: 'El monto debe ser positivo' }
          })}
        />
        <TextField
          label="Número de cuotas"
          type="number"
          fullWidth
          error={!!errors.nro_cuotas}
          helperText={
            errors.nro_cuotas?.message ??
            'Las cuotas se generan automáticamente en el backend según el número indicado.'
          }
          {...register('nro_cuotas', {
            required: 'El número de cuotas es requerido',
            valueAsNumber: true,
            min: { value: 1, message: 'Debe haber al menos 1 cuota' }
          })}
        />
        {!isPrestatario && (
          <TextField
            select
            label="Tipo de interés"
            fullWidth
            error={!!errors.tipo_interes}
            helperText={
              errors.tipo_interes?.message ??
              'Selecciona el tipo de interés según el nivel de riesgo y el plazo deseado.'
            }
            InputProps={{
              endAdornment: (
                <Tooltip
                  title={
                    <>
                      <Typography variant="body2">
                        <strong>BAJA</strong>: menor tasa, cuotas más bajas y plazos más largos.
                      </Typography>
                      <Typography variant="body2">
                        <strong>MEDIA</strong>: equilibrio entre monto total y plazo.
                      </Typography>
                      <Typography variant="body2">
                        <strong>ALTA</strong>: mayor tasa, cuotas más altas y plazos más cortos.
                      </Typography>
                    </>
                  }
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ cursor: 'help' }} />
                </Tooltip>
              )
            }}
            {...register('tipo_interes', {
              required: !isPrestatario ? 'El tipo de interés es requerido' : false
            })}
          >
            <MenuItem value="BAJA">BAJA</MenuItem>
            <MenuItem value="MEDIA">MEDIA</MenuItem>
            <MenuItem value="ALTA">ALTA</MenuItem>
          </TextField>
        )}

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <AppButton
            startIcon={<SaveIcon />}
            type="submit"
            disabled={loading}
          >
            Enviar solicitud
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PrestamoFormPage;
