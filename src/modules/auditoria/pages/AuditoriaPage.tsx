import React, { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from 'react-hook-form';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { registrarAuditoria } from '../api/auditoriaApi';

interface AuditoriaFormValues {
  usuario: string;
  ip?: string;
  dominio?: string;
  tabla?: string;
  operacion?: string;
  descripcion?: string;
}

export const AuditoriaPage: React.FC = () => {
  const [lastId, setLastId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AuditoriaFormValues>({
    defaultValues: {
      usuario: '',
      ip: '',
      dominio: '',
      tabla: '',
      operacion: '',
      descripcion: ''
    }
  });

  const onSubmit = async (values: AuditoriaFormValues) => {
    const result = await registrarAuditoria(values);
    setLastId(result.id_audit);
    reset({ ...values, descripcion: '' });
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Auditoría manual
      </Typography>
      <Typography variant="body2" mb={2}>
        El backend no expone un endpoint para consultar el log completo de auditoría. Esta sección
        permite registrar manualmente eventos usando los procedimientos existentes.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        maxWidth={600}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          label="Usuario"
          fullWidth
          error={!!errors.usuario}
          helperText={errors.usuario?.message}
          {...register('usuario', { required: 'El usuario es requerido' })}
        />
        <TextField label="IP" fullWidth {...register('ip')} />
        <TextField label="Dominio" fullWidth {...register('dominio')} />
        <TextField label="Tabla afectada" fullWidth {...register('tabla')} />
        <TextField label="Operación" fullWidth {...register('operacion')} />
        <TextField
          label="Descripción"
          fullWidth
          multiline
          minRows={2}
          {...register('descripcion')}
        />

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <AppButton startIcon={<SaveIcon />} type="submit">
            Registrar evento
          </AppButton>
        </Box>
      </Box>

      {lastId !== null && (
        <Typography variant="body2" mt={2}>
          Último id_audit registrado: {lastId}
        </Typography>
      )}
    </Box>
  );
};

export default AuditoriaPage;

