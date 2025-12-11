// Banco-frontend/src/modules/solicitudes/pages/EmployeeSolicitudesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

import { AppTable } from '../../../shared/components/ui/AppTable';
import { AppButton } from '../../../shared/components/ui/AppButton';

import { useSolicitudesStore } from '../store/useSolicitudesStore';
import { Solicitud, SolicitudEstado } from '../domain/solicitud.model';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';
import { useNotificationStore } from '../../../app/store/useNotificationStore';

// 🔹 APIs de refinanciación
import {
  getSolicitudesRefinanciacion,
  aprobarSolicitudRefinanciacion,
  rechazarSolicitudRefinanciacion,
  SolicitudRefinanciacion
} from '../../prestamos/api/prestamosApi';

export const EmployeeSolicitudesPage: React.FC = () => {
  const { items, loading, error, fetchAll, aprobar, rechazar } = useSolicitudesStore();
  const { enqueue } = useNotificationStore();

  // Diálogo de rechazo (para solicitudes de PRÉSTAMO)
  const [rechazoDialogOpen, setRechazoDialogOpen] = useState(false);
  const [rechazoMotivo, setRechazoMotivo] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  // =========================
  // 1) Solicitudes de PRÉSTAMO (solo PENDIENTES, sin filtros)
  // =========================

  useEffect(() => {
    // Siempre traemos solo PENDIENTE desde el backend
    fetchAll({ estado: 'PENDIENTE' }).catch(() => undefined);
  }, [fetchAll]);

  const loanRequests = useMemo(
    () =>
      (items || []).filter(
        (s) => (s.estado || '').toUpperCase() === 'PENDIENTE'
      ),
    [items]
  );

  const handleRefreshPrestamos = () => {
    fetchAll({ estado: 'PENDIENTE' }).catch(() => undefined);
  };

  const handleAprobar = async (sol: Solicitud) => {
    const res = await aprobar(sol.id);
    if (res && res.prestamo) {
      const idPrestamo = res.prestamo.id_prestamo;
      enqueue(
        `Solicitud de préstamo aprobada. Se generó el préstamo #${idPrestamo} y sus cuotas asociadas.`,
        'success'
      );
      // recargar lista de pendientes
      handleRefreshPrestamos();
    }
  };

  const openRechazoDialog = (sol: Solicitud) => {
    setSelectedSolicitud(sol);
    setRechazoMotivo('');
    setRechazoDialogOpen(true);
  };

  const handleConfirmarRechazo = async () => {
    if (!selectedSolicitud) return;
    const res = await rechazar(selectedSolicitud.id, rechazoMotivo || undefined);
    if (res) {
      enqueue('Solicitud de préstamo rechazada.', 'success');
      handleRefreshPrestamos();
    }
    setRechazoDialogOpen(false);
  };

  const canAccionar = (estado: SolicitudEstado) =>
    (estado || '').toUpperCase() === 'PENDIENTE';

  const renderEstadoText = (estado: string) => {
    const e = (estado || '').toUpperCase();
    if (e === 'PENDIENTE') return 'Pendiente';
    if (e === 'ACEPTADA') return 'Aceptada';
    if (e === 'RECHAZADA') return 'Rechazada';
    return estado || 'Desconocido';
  };

  // =========================
  // 2) Solicitudes de REFINANCIACIÓN (solo PENDIENTES, sin filtros)
  // =========================

  const [refiItems, setRefiItems] = useState<SolicitudRefinanciacion[]>([]);
  const [refiLoading, setRefiLoading] = useState(false);
  const [refiError, setRefiError] = useState<string | null>(null);

  const loadRefinanciacionesPendientes = async () => {
    setRefiLoading(true);
    setRefiError(null);
    try {
      // solo solicitudes de refinanciación en estado PENDIENTE
      const result = await getSolicitudesRefinanciacion('PENDIENTE');
      setRefiItems(result || []);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[REFINANCIACIONES] Error al obtener solicitudes:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al obtener las solicitudes de refinanciación.';
      setRefiError(msg);
    } finally {
      setRefiLoading(false);
    }
  };

  useEffect(() => {
    loadRefinanciacionesPendientes().catch(() => undefined);
  }, []);

  const handleRefreshRefi = () => {
    loadRefinanciacionesPendientes().catch(() => undefined);
  };

  const handleAprobarRefi = async (sol: SolicitudRefinanciacion) => {
    try {
      await aprobarSolicitudRefinanciacion(sol.id_solicitud_refinanciacion);
      enqueue(
        `Solicitud de refinanciación aprobada. El préstamo #${sol.id_prestamo} ha sido refinanciado.`,
        'success'
      );
      handleRefreshRefi();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[REFINANCIACIONES] Error al aprobar solicitud:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al aprobar la solicitud de refinanciación.';
      enqueue(msg, 'error');
    }
  };

  const handleRechazarRefi = async (sol: SolicitudRefinanciacion) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas rechazar la solicitud de refinanciación #${sol.id_solicitud_refinanciacion}?`
    );
    if (!confirmar) return;

    try {
      await rechazarSolicitudRefinanciacion(sol.id_solicitud_refinanciacion);
      enqueue('Solicitud de refinanciación rechazada.', 'success');
      handleRefreshRefi();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[REFINANCIACIONES] Error al rechazar solicitud:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al rechazar la solicitud de refinanciación.';
      enqueue(msg, 'error');
    }
  };

  const canAccionarRefi = (estado: string) =>
    (estado || '').toUpperCase() === 'PENDIENTE';

  // =========================
  // RENDER
  // =========================

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* =======================================================
          SECCIÓN 1: Solicitudes de PRÉSTAMO (solo PENDIENTES)
          ======================================================= */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h5">Solicitudes de préstamo pendientes</Typography>
          <IconButton color="primary" onClick={handleRefreshPrestamos}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Aquí se listan únicamente las solicitudes de préstamo que están en estado{' '}
          <strong>PENDIENTE</strong> para que el personal empleado pueda aprobarlas o rechazarlas.
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {!loading && loanRequests.length === 0 && !error && (
          <Typography variant="body2">
            No hay solicitudes de préstamo pendientes en este momento.
          </Typography>
        )}

        {!loading && loanRequests.length > 0 && (
          <AppTable
            columns={[
              { key: 'id', header: 'ID solicitud' },
              { key: 'idPrestatario', header: 'ID prestatario' },
              { key: 'idEmpleado', header: 'ID empleado' },
              {
                key: 'monto',
                header: 'Monto',
                render: (row: any) => formatCurrencyCOP(row.monto)
              },
              { key: 'nroCuotas', header: 'Cuotas' },
              {
                key: 'fechaEnvio',
                header: 'Fecha envío',
                render: (row: any) => formatDate(row.fechaEnvio)
              },
              {
                key: 'fechaRespuesta',
                header: 'Fecha respuesta',
                render: (row: any) =>
                  row.fechaRespuesta ? formatDate(row.fechaRespuesta) : '—'
              },
              {
                key: 'estado',
                header: 'Estado',
                render: (row: any) => renderEstadoText(row.estado)
              },
              {
                key: 'acciones',
                header: 'Acciones',
                render: (row: any) => {
                  const s = row as Solicitud;
                  const habilitado = canAccionar(s.estado);
                  return (
                    <Box display="flex" gap={1}>
                      <Tooltip
                        title={habilitado ? 'Aprobar solicitud' : 'Solo solicitudes pendientes'}
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            disabled={!habilitado}
                            onClick={() => habilitado && handleAprobar(s)}
                          >
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={habilitado ? 'Rechazar solicitud' : 'Solo solicitudes pendientes'}
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!habilitado}
                            onClick={() => habilitado && openRechazoDialog(s)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                }
              }
            ]}
            data={loanRequests as any}
          />
        )}
      </Box>

      {/* =======================================================
          SECCIÓN 2: Solicitudes de REFINANCIACIÓN (solo PENDIENTES)
          ======================================================= */}
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h5">Solicitudes de refinanciación pendientes</Typography>
          <IconButton color="primary" onClick={handleRefreshRefi}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Aquí se muestran únicamente las solicitudes de refinanciación en estado{' '}
          <strong>PENDIENTE</strong>. Desde esta vista el empleado puede aprobar o rechazar cada
          solicitud.
        </Typography>

        {refiLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {refiError && (
          <Typography color="error" mb={2}>
            {refiError}
          </Typography>
        )}

        {!refiLoading && refiItems.length === 0 && !refiError && (
          <Typography variant="body2">
            No hay solicitudes de refinanciación pendientes en este momento.
          </Typography>
        )}

        {!refiLoading && refiItems.length > 0 && (
          <AppTable
            columns={[
              { key: 'id_solicitud_refinanciacion', header: 'ID solicitud' },
              { key: 'id_prestamo', header: 'ID préstamo' },
              { key: 'id_prestatario', header: 'ID prestatario' },
              {
                key: 'nro_cuotas',
                header: 'Nuevo número de cuotas'
              },
              {
                key: 'fecha_realizacion',
                header: 'Fecha solicitud',
                render: (row: any) => formatDate(row.fecha_realizacion)
              },
              {
                key: 'acciones',
                header: 'Acciones',
                render: (row: any) => {
                  const s = row as SolicitudRefinanciacion;
                  const habilitado = canAccionarRefi(s.estado);
                  return (
                    <Box display="flex" gap={1}>
                      <Tooltip
                        title={
                          habilitado
                            ? 'Aprobar refinanciación'
                            : 'Solo solicitudes pendientes'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            disabled={!habilitado}
                            onClick={() => habilitado && handleAprobarRefi(s)}
                          >
                            <CheckCircleOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          habilitado
                            ? 'Rechazar refinanciación'
                            : 'Solo solicitudes pendientes'
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={!habilitado}
                            onClick={() => habilitado && handleRechazarRefi(s)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  );
                }
              }
            ]}
            data={refiItems as any}
          />
        )}
      </Box>

      {/* Diálogo de rechazo (PRÉSTAMOS) */}
      <Dialog
        open={rechazoDialogOpen}
        onClose={() => setRechazoDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Rechazar solicitud de préstamo</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Opcionalmente puedes indicar un motivo de rechazo que quedará registrado para consulta
            posterior.
          </DialogContentText>
          <TextField
            label="Motivo de rechazo (opcional)"
            fullWidth
            multiline
            minRows={3}
            value={rechazoMotivo}
            onChange={(e) => setRechazoMotivo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <AppButton variant="outlined" onClick={() => setRechazoDialogOpen(false)}>
            Cancelar
          </AppButton>
          <AppButton color="error" onClick={handleConfirmarRechazo}>
            Rechazar
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeSolicitudesPage;
