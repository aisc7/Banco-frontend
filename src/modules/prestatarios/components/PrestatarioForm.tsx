import React from 'react';
import { Box, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from 'react-hook-form';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { CreatePrestatarioDto } from '../api/prestatariosApi';

export interface PrestatarioFormValues {
  ci: number;
  nombre: string;
  apellido: string;
  direccion: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  estado_cliente: string;
}

export interface PrestatarioFormProps {
  defaultValues?: Partial<PrestatarioFormValues>;
  onSubmit: (values: PrestatarioFormValues) => Promise<void>;
  submitting?: boolean;
}

export const toCreateDto = (values: PrestatarioFormValues, usuario: string): CreatePrestatarioDto => ({
  ...values,
  usuario_registro: usuario
});

export const PrestatarioForm: React.FC<PrestatarioFormProps> = ({ defaultValues, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PrestatarioFormValues>({
    defaultValues: {
      ci: defaultValues?.ci ?? ('' as any),
      nombre: defaultValues?.nombre ?? '',
      apellido: defaultValues?.apellido ?? '',
      direccion: defaultValues?.direccion ?? '',
      email: defaultValues?.email ?? '',
      telefono: defaultValues?.telefono ?? '',
      fecha_nacimiento: defaultValues?.fecha_nacimiento ?? '',
      estado_cliente: defaultValues?.estado_cliente ?? 'ACTIVO'
    }
  });

  const submit = async (values: PrestatarioFormValues) => {
    await onSubmit(values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(submit)}
      maxWidth={600}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <TextField
        label="Cédula"
        type="number"
        fullWidth
        error={!!errors.ci}
        helperText={errors.ci?.message}
        {...register('ci', {
          required: 'La cédula es requerida',
          valueAsNumber: true,
          min: { value: 1, message: 'La cédula debe ser positiva' }
        })}
      />
      <TextField
        label="Nombre"
        fullWidth
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
        {...register('nombre', { required: 'El nombre es requerido' })}
      />
      <TextField
        label="Apellido"
        fullWidth
        error={!!errors.apellido}
        helperText={errors.apellido?.message}
        {...register('apellido', { required: 'El apellido es requerido' })}
      />
      <TextField
        label="Dirección"
        fullWidth
        {...register('direccion')}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        error={!!errors.email}
        helperText={errors.email?.message}
        {...register('email', {
          required: 'El email es requerido'
        })}
      />
      <TextField
        label="Teléfono"
        fullWidth
        {...register('telefono')}
      />
      <TextField
        label="Fecha de nacimiento"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        error={!!errors.fecha_nacimiento}
        helperText={errors.fecha_nacimiento?.message}
        {...register('fecha_nacimiento', {
          required: 'La fecha de nacimiento es requerida'
        })}
      />
      <TextField
        label="Estado cliente"
        fullWidth
        {...register('estado_cliente', {
          required: 'El estado es requerido'
        })}
      />

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <AppButton startIcon={<SaveIcon />} type="submit" disabled={submitting}>
          Guardar
        </AppButton>
      </Box>
    </Box>
  );
};

