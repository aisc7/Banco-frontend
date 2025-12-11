import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { AppCard } from '../../../shared/components/ui/AppCard';

const ClientHomePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5">
        Hola {user?.username}, este es tu panel de cliente
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Desde aquí puedes consultar tus préstamos, revisar tus cuotas y ver las notificaciones
        importantes relacionadas con tu crédito.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <AppCard>
            <Typography variant="subtitle2" gutterBottom>
              Préstamos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulta tus préstamos activos, revisa el detalle de cada uno y solicita nuevos
              préstamos según las políticas de la entidad.
            </Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard>
            <Typography variant="subtitle2" gutterBottom>
              Cuotas y pagos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualiza las cuotas próximas a vencer, identifica cuotas en mora y realiza pagos
              cuando corresponda.
            </Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard>
            <Typography variant="subtitle2" gutterBottom>
              Notificaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revisa los recordatorios de pago, avisos de mora y otras notificaciones emitidas por
              la entidad financiera.
            </Typography>
          </AppCard>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Accesos rápidos
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Button
              variant="contained"
              onClick={() => navigate('/prestamos')}
            >
              Ver mis préstamos
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/solicitudes')}
            >
              Solicitar nuevo préstamo
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/notificaciones')}
            >
              Ver mis notificaciones
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientHomePage;
