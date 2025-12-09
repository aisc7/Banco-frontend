import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { PrestatarioForm, PrestatarioFormValues, toCreateDto } from '../components/PrestatarioForm';
import { usePrestatariosStore } from '../store/usePrestatariosStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { AppButton } from '../../../shared/components/ui/AppButton';

export const PrestatarioFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { create, loading } = usePrestatariosStore();
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (values: PrestatarioFormValues) => {
    const dto = toCreateDto(values, user?.username ?? 'frontend');
    await create(dto);
    navigate('/prestatarios');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Nuevo prestatario</Typography>
        <AppButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/prestatarios')}
        >
          Volver
        </AppButton>
      </Box>

      <PrestatarioForm onSubmit={handleSubmit} submitting={loading} />
    </Box>
  );
};

export default PrestatarioFormPage;

