import React from 'react';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText } from '@mui/material';
import { AppButton } from '../../../shared/components/ui/AppButton';

const stepsEmpleado = [
  'Registrar un nuevo prestatario desde el módulo Prestatarios.',
  'Crear una solicitud de préstamo asociada al prestatario.',
  'Revisar las cuotas generadas y registrar pagos cuando corresponda.',
  'Consultar los reportes de préstamos, morosos y refinanciaciones para analizar la cartera.'
];

const stepsPrestatario = [
  'Iniciar sesión con su usuario de prestatario.',
  'Consultar sus préstamos activos y su historial.',
  'Ver el detalle de las cuotas y sus estados.',
  'Registrar el pago de las cuotas pendientes desde la sección de cuotas.'
];

export const HelpPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Guía rápida del sistema
      </Typography>
      <Typography variant="body1" mb={3}>
        Este sistema permite gestionar prestatarios, préstamos, cuotas y reportes financieros sobre una base
        de datos Oracle. A continuación encontrarás una guía rápida según el tipo de usuario.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rol EMPLEADO
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usuarios administrativos que gestionan la cartera completa de préstamos y los datos de los
                clientes.
              </Typography>
              <List dense>
                {stepsEmpleado.map((s) => (
                  <ListItem key={s}>
                    <ListItemText primary={s} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rol PRESTATARIO
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Clientes que pueden consultar sus préstamos, cuotas y notificaciones, y registrar pagos.
              </Typography>
              <List dense>
                {stepsPrestatario.map((s) => (
                  <ListItem key={s}>
                    <ListItemText primary={s} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Flujo típico para una demostración
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="1. Como EMPLEADO: crear un prestatario de prueba." />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. Crear una solicitud de préstamo para ese prestatario." />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. Ver las cuotas generadas y mostrar cómo cambian los estados al registrar pagos." />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. Consultar el resumen de préstamos y el reporte de morosos." />
          </ListItem>
          <ListItem>
            <ListItemText primary="5. Como PRESTATARIO: iniciar sesión, ver mis préstamos y pagar una cuota pendiente." />
          </ListItem>
        </List>

        <Box mt={2}>
          <AppButton>
            Explorar módulos
          </AppButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpPage;

