import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { getPrestatarioMe, subirFotoPrestatario } from '../../prestatarios/api/prestatariosApi';
import { Prestatario } from '../../prestatarios/domain/prestatario.model';
import { useNotificationStore } from '../../../app/store/useNotificationStore';
import { getEmpleadoMe } from '../../empleados/api/empleadosApi';
import { Empleado } from '../../empleados/domain/empleado.model';
import { Solicitud } from '../../solicitudes/domain/solicitud.model';
import { getMisSolicitudes, createSolicitud } from '../../solicitudes/api/solicitudesApi';
import { Prestamo } from '../../prestamos/domain/prestamo.model';
import { getMisPrestamos } from '../../prestamos/api/prestamosApi';

const ClientePerfilPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { enqueue } = useNotificationStore();
  const [perfilPrestatario, setPerfilPrestatario] = useState<Prestatario | null>(null);
  const [perfilEmpleado, setPerfilEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [prestamosCliente, setPrestamosCliente] = useState<Prestamo[]>([]);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [loanMonto, setLoanMonto] = useState<string>('');
  const [loanNroCuotas, setLoanNroCuotas] = useState<string>('');
  const [loanSubmitting, setLoanSubmitting] = useState(false);
  const [refDialogOpen, setRefDialogOpen] = useState(false);
  const [refNroCuotas, setRefNroCuotas] = useState<string>('');
  const [refSubmitting, setRefSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (user.role === 'PRESTATARIO') {
          const [perfil, solicitudes, misPrestamos] = await Promise.all([
            getPrestatarioMe(),
            getMisSolicitudes(),
            getMisPrestamos()
          ]);
          setPerfilPrestatario(perfil);
          setMisSolicitudes(solicitudes);
          setPrestamosCliente(misPrestamos.prestamos);
        } else if (user.role === 'EMPLEADO' || user.role === 'ADMIN') {
          const data = await getEmpleadoMe();
          setPerfilEmpleado(data as Empleado);
        }
      } catch (err: any) {
        enqueue(err.message ?? 'Error al cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => undefined);
  }, [user, enqueue]);

  const handleFotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !perfilPrestatario) return;
    setUploading(true);
    try {
      await subirFotoPrestatario(perfilPrestatario.ci, file);
      enqueue('Foto actualizada correctamente.', 'success');
      // Recargar perfil para obtener la nueva foto desde el backend
      const data = await getPrestatarioMe();
      setPerfilPrestatario(data);
    } catch (err: any) {
      enqueue(err.message ?? 'Error al subir la foto', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const fotoSrcPrestatario = useMemo(() => {
    if (!perfilPrestatario || !perfilPrestatario.fotoBase64) return undefined;
    const raw = String(perfilPrestatario.fotoBase64);
    if (raw.startsWith('data:')) {
      return raw;
    }
    return `data:image/jpeg;base64,${raw}`;
  }, [perfilPrestatario]);

  const ultimaSolicitud = useMemo(
    () => (misSolicitudes && misSolicitudes.length ? misSolicitudes[0] : null),
    [misSolicitudes]
  );

  const prestamoActivo = useMemo(
    () => prestamosCliente.find((p) => p.estado === 'ACTIVO') || null,
    [prestamosCliente]
  );

  const handleOpenLoanDialog = () => {
    if (ultimaSolicitud) {
      setLoanMonto(String(ultimaSolicitud.monto));
      setLoanNroCuotas(String(ultimaSolicitud.nroCuotas));
    } else {
      setLoanMonto('');
      setLoanNroCuotas('');
    }
    setLoanDialogOpen(true);
  };

  const handleSubmitLoan = async () => {
    const monto = Number(loanMonto);
    const nroCuotas = Number(loanNroCuotas);
    if (!Number.isFinite(monto) || monto <= 0) {
      enqueue('El monto debe ser un número positivo.', 'error');
      return;
    }
    if (!Number.isInteger(nroCuotas) || nroCuotas <= 0) {
      enqueue('El número de cuotas debe ser un entero positivo.', 'error');
      return;
    }
    setLoanSubmitting(true);
    try {
      await createSolicitud({ monto, nro_cuotas: nroCuotas });
      enqueue(
        'Tu solicitud fue registrada. Un empleado la revisará y te notificaremos cuando sea aprobada.',
        'success'
      );
      const solicitudesActualizadas = await getMisSolicitudes();
      setMisSolicitudes(solicitudesActualizadas);
      setLoanDialogOpen(false);
    } catch (err: any) {
      // El httpClient ya muestra mensajes amigables; solo registramos en consola si hace falta.
      // eslint-disable-next-line no-console
      console.error('[PERFIL] Error creando solicitud de préstamo desde perfil:', err);
    } finally {
      setLoanSubmitting(false);
    }
  };

  const handleOpenRefDialog = () => {
    if (!prestamoActivo) return;
    setRefNroCuotas('');
    setRefDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    if (!loanSubmitting) setLoanDialogOpen(false);
    if (!refSubmitting) setRefDialogOpen(false);
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h6">Perfil de usuario</Typography>
        <Typography variant="body2" color="text.secondary">
          Inicia sesión para ver los datos de tu perfil.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Mi perfil
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {perfilPrestatario && user.role === 'PRESTATARIO' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar src={fotoSrcPrestatario} sx={{ width: 96, height: 96 }}>
                    {perfilPrestatario.nombre?.charAt(0)}
                    {perfilPrestatario.apellido?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1">
                    {perfilPrestatario.nombre} {perfilPrestatario.apellido}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cédula: {perfilPrestatario.ci}
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    disabled={uploading}
                  >
                    Cambiar foto
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFotoChange}
                    />
                  </Button>
                  {uploading && <LinearProgress sx={{ width: '100%' }} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Datos personales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Nombre completo
                    </Typography>
                    <Typography variant="body1">
                      {perfilPrestatario.nombre} {perfilPrestatario.apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Estado del cliente
                    </Typography>
                    <Typography variant="body1">{perfilPrestatario.estadoCliente}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{perfilPrestatario.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1">{perfilPrestatario.telefono}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Dirección
                    </Typography>
                    <Typography variant="body1">{perfilPrestatario.direccion}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Fecha de nacimiento
                    </Typography>
                    <Typography variant="body1">{perfilPrestatario.fechaNacimiento}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">
                    Solicitudes de préstamo
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenLoanDialog}
                  >
                    Editar solicitud
                  </Button>
                </Box>
                {ultimaSolicitud ? (
                  <Box>
                    <Typography variant="body2">
                      Última solicitud: #{ultimaSolicitud.id}
                    </Typography>
                    <Typography variant="body2">
                      Monto: {ultimaSolicitud.monto}
                    </Typography>
                    <Typography variant="body2">
                      Cuotas: {ultimaSolicitud.nroCuotas}
                    </Typography>
                    <Typography variant="body2">
                      Estado: {ultimaSolicitud.estado}
                    </Typography>
                    {ultimaSolicitud.motivoRechazo && (
                      <Typography variant="body2" color="text.secondary">
                        Motivo rechazo: {ultimaSolicitud.motivoRechazo}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tienes solicitudes de préstamo registradas.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">
                    Solicitudes de refinanciación
                  </Typography>
                  {prestamoActivo && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleOpenRefDialog}
                    >
                      Editar solicitud
                    </Button>
                  )}
                </Box>
                {prestamoActivo ? (
                  <Box>
                    <Typography variant="body2">
                      Préstamo activo #{prestamoActivo.id}
                    </Typography>
                    <Typography variant="body2">
                      Monto: {prestamoActivo.totalPrestado}
                    </Typography>
                    <Typography variant="body2">
                      Cuotas: {prestamoActivo.nroCuotas}
                    </Typography>
                    <Typography variant="body2">
                      Estado: {prestamoActivo.estado}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tienes préstamos activos para refinanciar.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {perfilEmpleado && (user.role === 'EMPLEADO' || user.role === 'ADMIN') && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 96, height: 96 }}>
                    {perfilEmpleado.nombre?.charAt(0)}
                    {perfilEmpleado.apellido?.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1">
                    {perfilEmpleado.nombre} {perfilEmpleado.apellido}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cargo: {perfilEmpleado.cargo || 'No especificado'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Datos del empleado
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Nombre completo
                    </Typography>
                    <Typography variant="body1">
                      {perfilEmpleado.nombre} {perfilEmpleado.apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Cargo
                    </Typography>
                    <Typography variant="body1">
                      {perfilEmpleado.cargo || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Edad
                    </Typography>
                    <Typography variant="body1">
                      {perfilEmpleado.edad != null ? perfilEmpleado.edad : 'No especificada'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Salario
                    </Typography>
                    <Typography variant="body1">
                      {perfilEmpleado.salario != null ? perfilEmpleado.salario : 'No especificado'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Diálogo para solicitud de préstamo */}
      <Dialog
        open={loanDialogOpen}
        onClose={handleCloseDialogs}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar solicitud de préstamo</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Monto solicitado"
              type="number"
              value={loanMonto}
              onChange={(e) => setLoanMonto(e.target.value)}
              fullWidth
            />
            <TextField
              label="Número de cuotas"
              type="number"
              value={loanNroCuotas}
              onChange={(e) => setLoanNroCuotas(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={loanSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitLoan} disabled={loanSubmitting}>
            Guardar solicitud
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para solicitud de refinanciación (placeholder: solo captura nuevo número de cuotas) */}
      <Dialog
        open={refDialogOpen}
        onClose={handleCloseDialogs}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar solicitud de refinanciación</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nuevo número de cuotas"
              type="number"
              value={refNroCuotas}
              onChange={(e) => setRefNroCuotas(e.target.value)}
              fullWidth
            />
            <Typography variant="body2" color="text.secondary">
              Esta solicitud será enviada al área de crédito para su revisión antes de aplicar la
              refinanciación sobre tu préstamo activo.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={refSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // En este proyecto académico, la integración con el endpoint específico
              // de solicitudes de refinanciación se realiza en una tarea posterior.
              // Por ahora solo validamos el campo y mostramos un mensaje.
              const n = Number(refNroCuotas);
              if (!Number.isInteger(n) || n <= 0) {
                enqueue('El nuevo número de cuotas debe ser un entero positivo.', 'error');
                return;
              }
              enqueue(
                'Solicitud de refinanciación preparada. Integra el endpoint específico de refinanciación en el backend para completar el flujo.',
                'info'
              );
              setRefDialogOpen(false);
            }}
            disabled={refSubmitting}
          >
            Guardar solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientePerfilPage;
