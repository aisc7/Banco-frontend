import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PrestatarioForm, PrestatarioFormValues, toCreateDto } from '../components/PrestatarioForm';
import { usePrestatariosStore } from '../store/usePrestatariosStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { getPrestatarioByCi } from '../api/prestatariosApi';

export const PrestatarioFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { create, update, loading } = usePrestatariosStore();
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const [defaultValues, setDefaultValues] = useState<Partial<PrestatarioFormValues> | undefined>();

  const ciParam = searchParams.get('ci');
  const isEditMode = !!ciParam;

  useEffect(() => {
    const load = async () => {
      if (!ciParam) return;
      const prestatario = await getPrestatarioByCi(ciParam);
      setDefaultValues({
        ci: prestatario.ci,
        nombre: prestatario.nombre,
        apellido: prestatario.apellido,
        direccion: prestatario.direccion,
        email: prestatario.email,
        telefono: prestatario.telefono,
        fecha_nacimiento: prestatario.fechaNacimiento,
        estado_cliente: prestatario.estadoCliente
      });
    };
    load().catch(() => undefined);
  }, [ciParam]);

  const handleSubmit = async (values: PrestatarioFormValues) => {
    if (isEditMode && ciParam) {
      await update(ciParam, {
        nombre: values.nombre,
        apellido: values.apellido,
        direccion: values.direccion,
        email: values.email,
        telefono: values.telefono,
        fecha_nacimiento: values.fecha_nacimiento,
        estado_cliente: values.estado_cliente
      });
    } else {
      const dto = toCreateDto(values, user?.username ?? 'frontend');
      await create(dto);
    }
    navigate('/prestatarios');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {isEditMode ? 'Editar prestatario' : 'Nuevo prestatario'}
        </Typography>
        <AppButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/prestatarios')}
        >
          Volver
        </AppButton>
      </Box>

      <PrestatarioForm
        onSubmit={handleSubmit}
        submitting={loading}
        defaultValues={defaultValues}
      />
    </Box>
  );
};

export default PrestatarioFormPage;
