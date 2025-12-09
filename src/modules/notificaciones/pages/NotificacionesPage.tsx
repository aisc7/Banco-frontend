import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EmailIcon from '@mui/icons-material/Email';
import { AppTable } from '../../../shared/components/ui/AppTable';
import {
  getNotificacionesPendientes,
  getNotificacionesHistorico,
  enviarNotificacionesMasivas
} from '../api/notificacionesApi';
import { Notificacion } from '../../../shared/types/domain';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { AppButton } from '../../../shared/components/ui/AppButton';

export const NotificacionesPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [pendientes, setPendientes] = useState<Notificacion[]>([]);
  const [historico, setHistorico] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const user = useAuthStore((s) => s.user);

  const role = user?.role;
  const isPrestatario = role === 'PRESTATARIO';
  const isEmpleado = role === 'EMPLEADO' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';

  const idPrestatario = user?.id_prestatario ?? null;

  const loadData = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [p, h] = await Promise.all([
        getNotificacionesPendientes(),
        getNotificacionesHistorico()
      ]);
      setPendientes(p);
      setHistorico(h);
    } catch (err: any) {
      setError(err.message ?? 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => undefined);
  }, []);

  const pendientesFiltradas = useMemo(
    () =>
      idPrestatario
        ? pendientes.filter((n) => n.idPrestatario === idPrestatario)
        : pendientes,
    [pendientes, idPrestatario]
  );

  const historicoFiltrado = useMemo(
    () =>
      idPrestatario
        ? historico.filter((n) => n.idPrestatario === idPrestatario)
        : historico,
    [historico, idPrestatario]
  );

  const marcarEnviadasLocal = () => {
    setPendientes([]);
  };

  const handleEnviarMasivo = async (tipo: string) => {
    await enviarNotificacionesMasivas(tipo);
    await loadData();
  };

  const columnas = [
    { key: 'idNotificacion', header: 'ID' },
    { key: 'idPrestatario', header: 'ID Prestatario' },
    { key: 'idCuota', header: 'ID Cuota' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'mensaje', header: 'Mensaje' },
    {
      key: 'estado',
      header: 'Estado',
      render: (row: any) =>
        row.enviado === 'S' ? (
          <MarkEmailReadIcon fontSize="small" color="success" />
        ) : (
          <EmailIcon fontSize="small" color="warning" />
        )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">
          {isPrestatario ? 'Mis notificaciones' : 'Notificaciones'}
        </Typography>
        <IconButton color="primary" onClick={() => loadData()}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Pendientes" />
        <Tab label="Histórico" />
      </Tabs>

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

      {!loading && tab === 0 && (
        <>
          {pendientesFiltradas.length === 0 && !error ? (
            <Typography variant="body2">No hay notificaciones pendientes.</Typography>
          ) : (
            <AppTable columns={columnas as any} data={pendientesFiltradas as any} />
          )}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {(isAdmin || isEmpleado) && (
              <>
                <AppButton size="small" onClick={() => handleEnviarMasivo('PAGO')}>
                  Enviar recordatorios de pago
                </AppButton>
                <AppButton size="small" onClick={() => handleEnviarMasivo('MORA')}>
                  Enviar por mora
                </AppButton>
                <AppButton size="small" onClick={() => handleEnviarMasivo('CANCELACION')}>
                  Enviar por cancelación
                </AppButton>
              </>
            )}
            <AppButton
              size="small"
              variant="outlined"
              onClick={marcarEnviadasLocal}
            >
              Marcar como leídas (solo UI)
            </AppButton>
          </Box>
        </>
      )}

      {!loading && tab === 1 && (
        <>
          {historicoFiltrado.length === 0 && !error ? (
            <Typography variant="body2">No hay notificaciones en el histórico.</Typography>
          ) : (
            <AppTable columns={columnas as any} data={historicoFiltrado as any} />
          )}
        </>
      )}
    </Box>
  );
};

export default NotificacionesPage;
