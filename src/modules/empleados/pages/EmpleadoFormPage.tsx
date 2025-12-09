import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useForm } from 'react-hook-form';
import { useEmpleadosStore } from '../store/useEmpleadosStore';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { getEmpleado } from '../api/empleadosApi';

interface EmpleadoFormValues {
  nombre: string;
  apellido: string;
  cargo?: string;
  salario?: number;
  edad?: number;
}

export const EmpleadoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');
  const { create, update, loading } = useEmpleadosStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EmpleadoFormValues>({
    defaultValues: {
      nombre: '',
      apellido: '',
      cargo: '',
      salario: undefined,
      edad: undefined
    }
  });

  useEffect(() => {
    const id = editingId ? Number(editingId) : null;
    if (!id) return;
    getEmpleado(id)
      .then((emp) => {
        setValue('nombre', emp.nombre);
        setValue('apellido', emp.apellido);
        setValue('cargo', emp.cargo ?? '');
        if (emp.salario != null) setValue('salario', emp.salario);
        if (emp.edad != null) setValue('edad', emp.edad);
      })
      .catch(() => undefined);
  }, [editingId, setValue]);

  const onSubmit = async (values: EmpleadoFormValues) => {
    const payload = {
      nombre: values.nombre,
      apellido: values.apellido,
      cargo: values.cargo,
      salario: values.salario ? Number(values.salario) : undefined,
      edad: values.edad ? Number(values.edad) : undefined
    };

    if (editingId) {
      await update(Number(editingId), payload);
    } else {
      await create(payload);
    }
    navigate('/empleados');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {editingId ? 'Editar empleado' : 'Nuevo empleado'}
        </Typography>
        <AppButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/empleados')}
        >
          Volver
        </AppButton>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        maxWidth={480}
        display="flex"
        flexDirection="column"
        gap={2}
      >
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
          label="Cargo"
          fullWidth
          {...register('cargo')}
        />
        <TextField
          label="Salario"
          type="number"
          fullWidth
          {...register('salario', {
            valueAsNumber: true,
            min: { value: 0, message: 'El salario debe ser positivo' }
          })}
          error={!!errors.salario}
          helperText={errors.salario?.message}
        />
        <TextField
          label="Edad"
          type="number"
          fullWidth
          {...register('edad', {
            valueAsNumber: true,
            min: { value: 0, message: 'La edad debe ser positiva' }
          })}
          error={!!errors.edad}
          helperText={errors.edad?.message}
        />

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <AppButton startIcon={<SaveIcon />} type="submit" disabled={loading}>
            Guardar
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
};

export default EmpleadoFormPage;

