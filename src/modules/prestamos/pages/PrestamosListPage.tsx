// Banco-frontend/src/modules/prestamos/pages/PrestamosListPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

import { AppButton } from '../../../shared/components/ui/AppButton';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { usePrestamosStore } from '../store/usePrestamosStore';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useConfirmationDialog } from '../../../shared/hooks/useConfirmationDialog';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Prestamo } from '../domain/prestamo.model';
import { getPrestamoById, createSolicitudRefinanciacion } from '../api/prestamosApi';
import { useNotificationStore } from '../../../app/store/useNotificationStore';

const ESTADOS = ['', 'PENDIENTE', 'ACTIVO', 'CANCELADO', 'REFINANCIADO'];

export const PrestamosListPage: React.FC = () => {
  const {
    items,
    prestamosPorPrestatario,
    loading,
    error,
    fetchAll,
    fetchByPrestatario,
    fetchMine,
    remove
  } = usePrestamosStore();

  const [estadoFilter, setEstadoFilter] = useState('');
  const [cedulaFilter, setCedulaFilter] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isPrestatario = role === 'PRESTATARIO';
  const isEmpleadoOrAdmin = role === 'EMPLEADO' || role === 'ADMIN';

  // Sistema de notificaciones global
  const { enqueue } = useNotificationStore();

  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [loanDetail, setLoanDetail] = useState<Prestamo | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Estado para la solicitud de refinanciación desde el modal (string para evitar NaN raros)
  const [refiCuotas, setRefiCuotas] = useState<string>('');

  useEffect(() => {
    if (isEmpleadoOrAdmin) {
      fetchAll().catch(() => undefined);
    } else if (isPrestatario) {
      // Para prestatarios usamos /api/prestamos/mis-prestamos
      fetchMine().catch(() => undefined);
    }
  }, [fetchAll, fetchMine, isEmpleadoOrAdmin, isPrestatario]);

  const filteredItems = useMemo(() => {
    if (isEmpleadoOrAdmin) {
      return items.filter((p) => {
        const matchesEstado = !estadoFilter || p.estado === estadoFilter;
        const matchesCedula = !cedulaFilter || String(p.idPrestatario).includes(cedulaFilter);
        return matchesEstado && matchesCedula;
      });
    }
    // Para prestatarios usamos directamente los préstamos propios, excluyendo cancelados por claridad.
    return prestamosPorPrestatario.filter((p) => p.estado !== 'CANCELADO');
  }, [items, prestamosPorPrestatario, estadoFilter, cedulaFilter, isEmpleadoOrAdmin]);

  const { page, totalPages, paginatedItems, setPage } = usePagination(filteredItems, 10);
  const confirmDialog = useConfirmationDialog();

  const handleCancelar = (id: number) => {
    confirmDialog.ask('¿Deseas cancelar este préstamo?', () => {
      remove(id).catch(() => undefined);
    });
  };

  const handleBuscarPorCedula = () => {
    if (!cedulaFilter) return;
    fetchByPrestatario(cedulaFilter).catch(() => undefined);
  };

  const handleOpenDetail = async (idPrestamo: number) => {
    setSelectedLoanId(idPrestamo);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setLoanDetail(null);
    setRefiCuotas('');

    try {
      const detalle = await getPrestamoById(idPrestamo);
      setLoanDetail(detalle);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[PRESTAMOS] Error cargando detalle:', err);
      setDetailError(
        err?.message || 'Ocurrió un error al obtener el detalle del préstamo. Intenta de nuevo.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedLoanId(null);
    setLoanDetail(null);
    setDetailError(null);
    setRefiCuotas('');
  };

  const handleSubmitRefiSolicitud = async () => {
    if (!selectedLoanId) return;

    const cuotasNum = Number(refiCuotas);

    if (!Number.isInteger(cuotasNum) || cuotasNum <= 0) {
      enqueue('Debes ingresar un número de cuotas válido (entero positivo).', 'warning');
      return;
    }

    try {
      // ✅ Aquí pasamos el número, como está definido en prestamosApi.ts
      await createSolicitudRefinanciacion(selectedLoanId, cuotasNum);

      enqueue(
        'Solicitud de refinanciación enviada correctamente. Un empleado la revisará.',
        'success'
      );
      setRefiCuotas('');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[PRESTAMOS] Error al registrar solicitud de refinanciación', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al registrar la solicitud de refinanciación.';
      enqueue(msg, 'error');
    }
  };

  const renderEstadoChip = (estado: string) => {
    const normalized = (estado || '').toUpperCase();

    if (normalized === 'ACTIVO') {
      return <Chip label="Activo" color="success" size="small" />;
    }
    if (normalized === 'CANCELADO') {
      return <Chip label="Cancelado" color="error" size="small" />;
    }
    if (normalized === 'COMPLETADO') {
      return <Chip label="Completado" color="primary" size="small" />;
    }
    if (normalized === 'PENDIENTE') {
      return <Chip label="Pendiente" color="warning" size="small" />;
    }
    if (normalized === 'REFINANCIADO') {
      return <Chip label="Refinanciado" color="info" size="small" />;
    }
    return <Chip label={estado || 'Desconocido'} size="small" />;
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5">
          {isPrestatario ? 'Mis préstamos' : t('prestamos_title')}
        </Typography>

        {isEmpleadoOrAdmin && (
          <Box display="flex" gap={1} flexWrap="wrap">
            <TextField
              select
              size="small"
              label="Estado"
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
            >
              {ESTADOS.map((estado) => (
                <MenuItem key={estado || 'todos'} value={estado}>
                  {estado || 'Todos'}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              label="ID Prestatario"
              value={cedulaFilter}
              onChange={(e) => setCedulaFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBuscarPorCedula();
              }}
            />

            <IconButton color="primary" onClick={handleBuscarPorCedula}>
              <RefreshIcon />
            </IconButton>
          </Box>
        )}

        {isPrestatario && (
          <Box display="flex" gap={1} flexWrap="wrap">
            <AppButton startIcon={<AddIcon />} onClick={() => navigate('/prestamos/nuevo')}>
              Solicitar nuevo préstamo
            </AppButton>
          </Box>
        )}
      </Box>

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

      {!loading && paginatedItems.length === 0 && !error && (
        <Typography variant="body2">No hay préstamos para los filtros seleccionados.</Typography>
      )}

      {!loading && paginatedItems.length > 0 && (
        <AppTable
          columns={[
            { key: 'id', header: 'ID' },
            {
              key: 'prestatario',
              header: 'Prestatario',
              render: (row: any) => {
                const nombre = row.nombrePrestatario || row.nombre_prestatario || '';
                const ci = row.ci;
                if (nombre && ci) {
                  return `${nombre} (CC ${ci})`;
                }
                if (nombre) {
                  return nombre;
                }
                return row.idPrestatario ? `ID ${row.idPrestatario}` : '—';
              }
            },
            {
              key: 'totalPrestado',
              header: 'Monto',
              render: (row: any) => formatCurrencyCOP(row.totalPrestado)
            },
            { key: 'nroCuotas', header: 'Cuotas' },
            { key: 'interes', header: 'Interés' },
            {
              key: 'fechaEmision',
              header: 'Emisión',
              render: (row: any) => formatDate(row.fechaEmision)
            },
            {
              key: 'fechaVencimiento',
              header: 'Vencimiento',
              render: (row: any) => formatDate(row.fechaVencimiento)
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (row: any) => renderEstadoChip(row.estado)
            },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (row: any) => (
                <Box display="flex" gap={1}>
                  <Tooltip title="Ver detalle del préstamo">
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="Ver detalle del préstamo"
                      onClick={() => handleOpenDetail(row.id)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {isEmpleadoOrAdmin && (
                    <Tooltip title="Cancelar préstamo">
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="Cancelar préstamo"
                        onClick={() => handleCancelar(row.id)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )
            }
          ]}
          data={paginatedItems as any}
        />
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2} gap={1}>
          <AppButton size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </AppButton>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Página {page} de {totalPages}
          </Typography>
          <AppButton size="small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Siguiente
          </AppButton>
        </Box>
      )}

      {/* Dialog de detalle de préstamo + refinanciación */}
      <Dialog open={detailOpen} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedLoanId ? `Detalle del préstamo #${selectedLoanId}` : 'Detalle del préstamo'}
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!detailLoading && detailError && (
            <Typography color="error" variant="body2">
              {detailError}
            </Typography>
          )}

          {!detailLoading && !detailError && loanDetail && (
            <Box display="grid" gap={1}>
              <Typography variant="subtitle2">Datos del prestatario</Typography>
              <Typography variant="body2">
                Nombre: {loanDetail.nombrePrestatario || 'No disponible'}
              </Typography>
              <Typography variant="body2">
                Cédula: {loanDetail.ci ?? 'No disponible'}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Datos del préstamo
              </Typography>
              <Typography variant="body2">
                Monto: {formatCurrencyCOP(loanDetail.totalPrestado)}
              </Typography>
              <Typography variant="body2">
                Número de cuotas: {loanDetail.nroCuotas}
              </Typography>
              <Typography variant="body2">
                Interés: {loanDetail.interes}
              </Typography>
              <Typography variant="body2">
                Fecha de emisión: {formatDate(loanDetail.fechaEmision)}
              </Typography>
              <Typography variant="body2">
                Fecha de vencimiento:{' '}
                {loanDetail.fechaVencimiento ? formatDate(loanDetail.fechaVencimiento) : 'No definida'}
              </Typography>
              <Typography variant="body2">Estado: {loanDetail.estado}</Typography>

              {isPrestatario &&
                (loanDetail.estado === 'ACTIVO' || loanDetail.estado === 'REFINANCIADO') && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 3 }}>
                      Solicitud de refinanciación
                    </Typography>
                    <Typography variant="body2">
                      Ingresa el <strong>nuevo número de cuotas</strong> que deseas para este préstamo.
                      Un empleado revisará y aprobará o rechazará tu solicitud. En ambos casos se te
                      notificará por correo.
                    </Typography>

                    <Box display="flex" gap={2} alignItems="center" mt={1} flexWrap="wrap">
                      <TextField
                        label="Nuevo número de cuotas"
                        type="number"
                        size="small"
                        value={refiCuotas}
                        onChange={(e) => setRefiCuotas(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                      <Button variant="contained" onClick={handleSubmitRefiSolicitud}>
                        Enviar solicitud
                      </Button>
                    </Box>
                  </>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrestamosListPage;
