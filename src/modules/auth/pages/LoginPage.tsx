import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextField, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/useAuthStore';
import { useI18n } from '../../../shared/i18n/useI18n';
import { RegistrationInfoDialog } from '../components/RegistrationInfoDialog';

interface LocationState {
  from?: Location;
}

interface LoginFormValues {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | undefined)?.from?.pathname || '/';

  const { login, loading, error } = useAuthStore();
  const { t } = useI18n();
  const [openRegistrationDialog, setOpenRegistrationDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login(values);
    const token = useAuthStore.getState().token;
    if (token) {
      navigate(from, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6" mt={1}>
            {t('login_title')}
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            margin="normal"
            fullWidth
            label={t('login_username_label')}
            autoFocus
            error={!!errors.username}
            helperText={errors.username?.message}
            {...register('username', { required: 'El usuario es requerido' })}
          />
          <TextField
            margin="normal"
            fullWidth
            label={t('login_password_label')}
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password', { required: 'La contraseña es requerida' })}
          />
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : t('login_button')}
          </Button>
          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {t('login_help')}
            </Typography>
          </Box>
          <Box mt={1} textAlign="center">
            <Typography variant="body2" color="text.secondary" mb={1}>
              ¿No tienes usuario?
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setOpenRegistrationDialog(true)}
            >
              Registrarme
            </Button>
          </Box>
        </Box>
      </Paper>
      <RegistrationInfoDialog
        open={openRegistrationDialog}
        onClose={() => setOpenRegistrationDialog(false)}
      />
    </Box>
  );
};

export default LoginPage;
