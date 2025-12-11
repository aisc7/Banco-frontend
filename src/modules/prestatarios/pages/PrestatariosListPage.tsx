import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress, Chip, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { usePrestatariosStore } from '../store/usePrestatariosStore';
import { usePagination } from '../../../shared/hooks/usePagination';
import { useConfirmationDialog } from '../../../shared/hooks/useConfirmationDialog';
import { PrestatariosBulkUploadSection } from '../components/PrestatariosBulkUploadSection';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../shared/utils/format';
import { useI18n } from '../../../shared/i18n/useI18n';
import { getEstadoMorosoPrestatario } from '../../cuotas/api/cuotasApi';
import { useNotificationStore } from '../../../app/store/useNotificationStore';

export const PrestatariosListPage: React.FC = () => {
  const { items, loading, error, fetchAll, remove } = usePrestatariosStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { page, totalPages, paginatedItems, setPage } = usePagination(items, 10);
  const confirmDialog = useConfirmationDialog();
  const { enqueue } = useNotificationStore();
  const [morosidad, setMorosidad] = useState<Record<number, 'MOROSO' | 'ACTIVO'>>({});

  useEffect(() => {
    fetchAll().catch(() => undefined);
  }, [fetchAll]);

  useEffect(() => {
    const loadMorosidad = async () => {
      const map: Record<number, 'MOROSO' | 'ACTIVO'> = {};
      for (const p of paginatedItems) {
        if (!p.id) continue;
        try {
          const estado = await getEstadoMorosoPrestatario(p.id);
          map[p.id] = estado.estado;
        } catch {
          // Ignorar errores individuales para no romper la tabla completa.
        }
      }
      setMorosidad(map);
    };
    if (paginatedItems.length > 0) {
      loadMorosidad().catch(() => undefined);
    } else {
      setMorosidad({});
    }
  }, [paginatedItems]);

  const handleDelete = (ci: number) => {
    confirmDialog.ask('¿Deseas eliminar este prestatario?', () => {
      remove(ci).catch(() => undefined);
    });
  };

  const handleSubirFoto = async (ci: number, file: File | null | undefined) => {
    if (!file) return;
    try {
      const { subirFotoPrestatario } = await import('../api/prestatariosApi');
      await subirFotoPrestatario(ci, file);
      enqueue('Foto del prestatario actualizada correctamente.', 'success');
    } catch (err: any) {
      enqueue(err.message ?? 'Error al subir la foto del prestatario', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t('prestatarios_title')}</Typography>
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => fetchAll()}>
            <RefreshIcon />
          </IconButton>
          <AppButton startIcon={<AddIcon />} onClick={() => navigate('/prestatarios/nuevo')}>
            Nuevo prestatario
          </AppButton>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Desde esta pantalla el personal autorizado registra y gestiona los clientes (prestatarios) de la
        entidad financiera.
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

      {!loading && items.length > 0 && (
        <AppTable
          columns={[
            { key: 'ci', header: 'Cédula' },
            { key: 'nombre', header: 'Nombre' },
            { key: 'apellido', header: 'Apellido' },
            { key: 'email', header: 'Email' },
            { key: 'telefono', header: 'Teléfono' },
            { key: 'estadoCliente', header: 'Estado' },
            {
              key: 'morosidad',
              header: 'Morosidad',
              render: (row: any) => {
                const estado = morosidad[row.id];
                if (!estado) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  );
                }
                return estado === 'MOROSO' ? (
                  <Chip label="Moroso" color="error" size="small" />
                ) : (
                  <Chip label="Activo" color="success" size="small" />
                );
              }
            },
            {
              key: 'fechaRegistro',
              header: 'Fecha registro',
              render: (row: any) => formatDate(row.fechaRegistro)
            },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (row: any) => (
                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/prestatarios/nuevo?ci=${row.ci}`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    component="label"
                    color="primary"
                  >
                    <Tooltip title="Subir foto del prestatario">
                      <CloudUploadIcon fontSize="small" />
                    </Tooltip>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleSubirFoto(row.ci, e.target.files?.[0])}
                    />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(row.ci)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            }
          ]}
          data={paginatedItems as any}
        />
      )}

      {!loading && items.length === 0 && !error && (
        <Typography variant="body2" mt={2}>
          {t('prestatarios_empty')}
        </Typography>
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

      <PrestatariosBulkUploadSection />
    </Box>
  );
};

export default PrestatariosListPage;
