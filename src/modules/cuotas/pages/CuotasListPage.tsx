import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { useCuotasStore } from '../store/useCuotasStore';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { useConfirmationDialog } from '../../../shared/hooks/useConfirmationDialog';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';

export const CuotasListPage: React.FC = () => {
  const { idPrestamo } = useParams();
  const { items, loading, error, fetchByPrestamo, pagarCuota } = useCuotasStore();
  const confirmDialog = useConfirmationDialog();

  useEffect(() => {
    if (idPrestamo) {
      fetchByPrestamo(Number(idPrestamo)).catch(() => undefined);
    }
  }, [idPrestamo, fetchByPrestamo]);

  const handlePagar = (idCuota: number) => {
    confirmDialog.ask('¿Confirmas el pago de esta cuota?', () => {
      const hoy = new Date().toISOString().slice(0, 10);
      pagarCuota(idCuota, { fecha_pago: hoy }).catch(() => undefined);
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Cuotas del préstamo #{idPrestamo}</Typography>
        <IconButton color="primary" onClick={() => idPrestamo && fetchByPrestamo(Number(idPrestamo))}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Aquí puedes ver las cuotas del préstamo seleccionado. Las cuotas vencidas se marcan como{' '}
        <strong>MOROSAS</strong>. Solo puedes registrar pagos sobre cuotas en estado{' '}
        <strong>PENDIENTE</strong>.
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && items.length === 0 && !error && (
        <Typography variant="body2">No hay cuotas pendientes o morosas para este préstamo.</Typography>
      )}

      {!loading && items.length > 0 && (
        <AppTable
          columns={[
            { key: 'nroCuota', header: 'N°' },
            {
              key: 'monto',
              header: 'Monto',
              render: (row: any) => formatCurrencyCOP(row.monto)
            },
            {
              key: 'fechaVencimiento',
              header: 'Vencimiento',
              render: (row: any) => formatDate(row.fechaVencimiento)
            },
            { key: 'estado', header: 'Estado' },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (row: any) => {
                const isPendiente = row.estado === 'PENDIENTE';
                const tooltipText = isPendiente
                  ? 'Registrar el pago de una cuota pendiente.'
                  : 'Solo puedes pagar cuotas pendientes.';
                return (
                  <Tooltip title={tooltipText}>
                    <span>
                      <AppButton
                        size="small"
                        startIcon={<PaymentIcon fontSize="small" />}
                        onClick={() => isPendiente && handlePagar(row.id)}
                        disabled={!isPendiente}
                      >
                        Pagar
                      </AppButton>
                    </span>
                  </Tooltip>
                );
              }
            }
          ]}
          data={items as any}
        />
      )}

      <Dialog open={confirmDialog.open} onClose={confirmDialog.cancel}>
        <DialogTitle>Confirmar pago de cuota</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            {confirmDialog.message}
          </Typography>
          {/* Regla de negocio: solo se pueden pagar cuotas válidas según el backend.
              Si hay un error de negocio (por ejemplo, cuota ya pagada), lo mostramos aquí también. */}
          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <AppButton variant="text" onClick={confirmDialog.cancel}>
            Cancelar
          </AppButton>
          <AppButton onClick={confirmDialog.confirm}>
            Confirmar
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CuotasListPage;
