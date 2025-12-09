import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { PrestatarioForm, PrestatarioFormValues, toCreateDto } from '../../prestatarios/components/PrestatarioForm';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { CreateEmpleadoDto } from '../../empleados/api/empleadosApi';
import { registerPrestatario, registerEmpleado } from '../api/authApi';

export interface RegistrationInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

type RegistrationRole = 'PRESTATARIO' | 'EMPLEADO' | null;
type RegistrationStep = 'options' | 'secret' | 'form';

interface EmpleadoFormValues {
  nombre: string;
  apellido: string;
  correo: string;
  area: string;
}

export const RegistrationInfoDialog: React.FC<RegistrationInfoDialogProps> = ({ open, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(null);
  const [step, setStep] = useState<RegistrationStep>('options');
  const [secretWord, setSecretWord] = useState('');
  const [secretError, setSecretError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const enqueue = useNotificationStore((s) => s.enqueue);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EmpleadoFormValues>({
    defaultValues: {
      nombre: '',
      apellido: '',
      correo: '',
      area: ''
    }
  });

  const handleClose = () => {
    setSelectedRole(null);
    setStep('options');
    setSecretWord('');
    setSecretError(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setCredentialsError(null);
    onClose();
  };

  const handleSelectRole = (role: RegistrationRole) => {
    setSelectedRole(role);
    setSecretWord('');
    setSecretError(null);
    setStep('secret');
  };

  const handleValidateSecret = () => {
    if (secretWord === 'BasesDeDatos2') {
      setSecretError(null);
      setStep('form');
    } else {
      setSecretError('Palabra secreta incorrecta');
    }
  };

  const handleSubmitPrestatario = async (values: PrestatarioFormValues) => {
    if (!username || !password || !confirmPassword) {
      setCredentialsError('Debes completar usuario y contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      setCredentialsError('Las contraseñas no coinciden.');
      return;
    }
    setCredentialsError(null);

    const dto = toCreateDto(values, username);

    try {
      await registerPrestatario({
        username,
        password,
        prestatario: dto
      });
      enqueue('Prestatario y usuario registrados correctamente.', 'success');
      handleClose();
    } catch (err: any) {
      const msg: string = err?.message ?? 'Error al registrar el prestatario.';
      enqueue(msg, 'error');
    }
  };

  const onSubmitEmpleado = (values: EmpleadoFormValues) => {
    if (!username || !password || !confirmPassword) {
      setCredentialsError('Debes completar usuario y contraseña.');
      return;
    }
    if (password !== confirmPassword) {
      setCredentialsError('Las contraseñas no coinciden.');
      return;
    }
    setCredentialsError(null);

    const dto: CreateEmpleadoDto = {
      nombre: values.nombre,
      apellido: values.apellido,
      cargo: values.area || undefined,
      salario: undefined,
      edad: undefined
    };

    registerEmpleado({
      username,
      password,
      empleado: dto
    })
      .then((created) => {
        // eslint-disable-next-line no-console
        console.log('Empleado y usuario creados en backend:', created);
        enqueue('Empleado y usuario registrados correctamente.', 'success');
        handleClose();
      })
      .catch((err: any) => {
        const msg: string = err?.message ?? 'Error al registrar el empleado.';
        enqueue(msg, 'error');
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Opciones de registro</DialogTitle>
      <DialogContent>
        {step === 'options' && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Soy prestatario (cliente)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Para registrarte como cliente, un funcionario de la entidad debe crear tu usuario en el
                    sistema desde el módulo de prestatarios.
                  </Typography>
                  <AppButton size="small" onClick={() => handleSelectRole('PRESTATARIO')}>
                    Solicitar registro
                  </AppButton>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Soy empleado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Los usuarios de empleados se crean desde el módulo de Empleados por un administrador del
                    sistema.
                  </Typography>
                  <AppButton size="small" onClick={() => handleSelectRole('EMPLEADO')}>
                    Solicitar registro
                  </AppButton>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {step === 'secret' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Validación de registro
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ingresa la Clave dada por administrador para continuar con el
              registro.
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Clave"
                type="password"
                fullWidth
                value={secretWord}
                onChange={(e) => setSecretWord(e.target.value)}
              />
              {secretError && (
                <Typography variant="body2" color="error">
                  {secretError}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {step === 'form' && selectedRole === 'PRESTATARIO' && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Registro de prestatario
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Completa los datos del cliente. Se creará el prestatario en la base de datos y un usuario
              asociado para que pueda iniciar sesión.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Credenciales de acceso
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mb={3}>
              <TextField
                label="Nombre de usuario"
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {credentialsError && (
                <Typography variant="body2" color="error">
                  {credentialsError}
                </Typography>
              )}
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Datos del prestatario
            </Typography>
            <PrestatarioForm onSubmit={handleSubmitPrestatario} />
          </Box>
        )}

        {step === 'form' && selectedRole === 'EMPLEADO' && (
          <Box
            component="form"
            id="empleado-registro-form"
            onSubmit={handleSubmit(onSubmitEmpleado)}
          >
            <Typography variant="subtitle1" gutterBottom>
              Registro de empleado
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ingresa los datos básicos del empleado. Se creará el empleado en la base de datos y un usuario
              asociado con rol de empleado.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Credenciales de acceso
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mb={3}>
              <TextField
                label="Nombre de usuario"
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {credentialsError && (
                <Typography variant="body2" color="error">
                  {credentialsError}
                </Typography>
              )}
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Datos del empleado
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
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
                label="Correo institucional"
                type="email"
                fullWidth
                error={!!errors.correo}
                helperText={errors.correo?.message}
                {...register('correo', { required: 'El correo es requerido' })}
              />
              <TextField
                label="Área / dependencia"
                fullWidth
                {...register('area')}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step === 'options' && (
          <Button onClick={handleClose} variant="contained" color="primary">
            Cerrar
          </Button>
        )}
        {step === 'secret' && (
          <>
            <Button onClick={() => setStep('options')}>Volver</Button>
            <AppButton onClick={handleValidateSecret}>Validar</AppButton>
          </>
        )}
        {step === 'form' && selectedRole === 'EMPLEADO' && (
          <>
            <Button onClick={handleClose}>Cancelar</Button>
            <AppButton type="submit" form="empleado-registro-form">
              Enviar
            </AppButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
