import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { AppTable } from '../../../shared/components/ui/AppTable';
import { AppButton } from '../../../shared/components/ui/AppButton';
import { useEmpleadosStore } from '../store/useEmpleadosStore';
import { useConfirmationDialog } from '../../../shared/hooks/useConfirmationDialog';

export const EmpleadosListPage: React.FC = () => {
  const { items, loading, error, fetchAll, remove } = useEmpleadosStore();
  const navigate = useNavigate();
  const confirmDialog = useConfirmationDialog();

  useEffect(() => {
    fetchAll().catch(() => undefined);
  }, [fetchAll]);

  const handleDelete = (id: number) => {
    confirmDialog.ask('¿Eliminar este empleado?', () => {
      remove(id).catch(() => undefined);
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Empleados</Typography>
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => fetchAll()}>
            <RefreshIcon />
          </IconButton>
          <AppButton startIcon={<AddIcon />} onClick={() => navigate('/empleados/nuevo')}>
            Nuevo empleado
          </AppButton>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Aquí se gestionan los usuarios internos de la entidad (empleados) y sus datos básicos.
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

      {!loading && items.length === 0 && !error && (
        <Typography variant="body2">No hay empleados registrados.</Typography>
      )}

      {!loading && items.length > 0 && (
        <AppTable
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'nombre', header: 'Nombre' },
            { key: 'apellido', header: 'Apellido' },
            { key: 'cargo', header: 'Cargo' },
            { key: 'salario', header: 'Salario' },
            { key: 'edad', header: 'Edad' },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (row: any) => (
                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/empleados/nuevo?id=${row.id}`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(row.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )
            }
          ]}
          data={items as any}
        />
      )}
    </Box>
  );
};

export default EmpleadosListPage;
