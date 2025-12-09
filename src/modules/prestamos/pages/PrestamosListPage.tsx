import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  MenuItem
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { usePrestamosStore } from '../store/usePrestamosStore';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useConfirmationDialog } from '../../../shared/hooks/useConfirmationDialog';
import { formatCurrencyCOP, formatDate } from '../../../shared/utils/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { useAuthStore } from '../../auth/store/useAuthStore';

const ESTADOS = ['', 'PENDIENTE', 'ACTIVO', 'CANCELADO'];

export const PrestamosListPage: React.FC = () => {
  const { items, prestamosPorPrestatario, loading, error, fetchAll, fetchByPrestatario, remove } =
    usePrestamosStore();
  const [estadoFilter, setEstadoFilter] = useState('');
  const [cedulaFilter, setCedulaFilter] = useState('');
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const isEmpleadoOrAdmin = user?.role === 'EMPLEADO' || user?.role === 'ADMIN';
  const isPrestatario = user?.role === 'PRESTATARIO';

  useEffect(() => {
    if (isEmpleadoOrAdmin) {
      fetchAll().catch(() => undefined);
    }
  }, [fetchAll, isEmpleadoOrAdmin]);

  const filteredItems = useMemo(() => {
    if (isEmpleadoOrAdmin) {
      return items.filter((p) => {
        const matchesEstado = !estadoFilter || p.estado === estadoFilter;
        const matchesCedula = !cedulaFilter || String(p.idPrestatario).includes(cedulaFilter);
        return matchesEstado && matchesCedula;
      });
    }
    // Para prestatarios usamos directamente los préstamos cargados para su cédula.
    return prestamosPorPrestatario;
  }, [items, prestamosPorPrestatario, estadoFilter, cedulaFilter, isEmpleadoOrAdmin]);

  const { page, totalPages, paginatedItems, setPage } = usePagination(filteredItems, 10);
  const confirmDialog = useConfirmationDialog();

  const handleDelete = (id: number) => {
    confirmDialog.ask('¿Deseas cancelar este préstamo?', () => {
      remove(id).catch(() => undefined);
    });
  };

  const handleBuscarPorCedula = () => {
    if (!cedulaFilter) return;
    fetchByPrestatario(cedulaFilter).catch(() => undefined);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h5">
          {isPrestatario ? 'Mis préstamos' : t('prestamos_title')}
        </Typography>
        {isEmpleadoOrAdmin && (
          <Box display="flex" gap={1}>
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
            />
            <IconButton color="primary" onClick={() => fetchAll()}>
              <RefreshIcon />
            </IconButton>
            <AppButton startIcon={<AddIcon />} onClick={() => navigate('/prestamos/nuevo')}>
              {t('prestamos_new_button')}
            </AppButton>
          </Box>
        )}
        {isPrestatario && (
          <Box display="flex" gap={1} flexWrap="wrap">
            <TextField
              size="small"
              label="Cédula"
              value={cedulaFilter}
              onChange={(e) => setCedulaFilter(e.target.value)}
            />
            <AppButton onClick={handleBuscarPorCedula} startIcon={<RefreshIcon />}>
              Buscar
            </AppButton>
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
            { key: 'idPrestatario', header: 'ID Prestatario' },
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
            { key: 'estado', header: 'Estado' },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (row: any) => (
                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/prestamos/${row.id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {isEmpleadoOrAdmin && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
          <AppButton
            size="small"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </AppButton>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Página {page} de {totalPages}
          </Typography>
          <AppButton
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </AppButton>
        </Box>
      )}
    </Box>
  );
};

export default PrestamosListPage;
