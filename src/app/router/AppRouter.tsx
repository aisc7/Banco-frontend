import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../../shared/components/Layout/MainLayout';
import { FullPageLoader } from '../../shared/components/FullPageLoader';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';
import { AccessDeniedPage } from './AccessDeniedPage';
import { useAuthStore } from '../../modules/auth/store/useAuthStore';
const HelpPage = lazy(() => import('../../modules/help/pages/HelpPage'));

const LoginPage = lazy(() => import('../../modules/auth/pages/LoginPage'));
const PrestatariosListPage = lazy(() => import('../../modules/prestatarios/pages/PrestatariosListPage'));
const PrestatarioFormPage = lazy(() => import('../../modules/prestatarios/pages/PrestatarioFormPage'));
const PrestamosListPage = lazy(() => import('../../modules/prestamos/pages/PrestamosListPage'));
const PrestamoFormPage = lazy(() => import('../../modules/prestamos/pages/PrestamoFormPage'));
const PrestamoDetailPage = lazy(() => import('../../modules/prestamos/pages/PrestamoDetailPage'));
const CuotasListPage = lazy(() => import('../../modules/cuotas/pages/CuotasListPage'));
const ResumenPrestamosPage = lazy(() => import('../../modules/reportes/pages/ResumenPrestamosPage'));
const MorososPage = lazy(() => import('../../modules/reportes/pages/MorososPage'));
const RefinanciacionesPage = lazy(() => import('../../modules/reportes/pages/RefinanciacionesPage'));
const NotificacionesPage = lazy(() => import('../../modules/notificaciones/pages/NotificacionesPage'));
const AuditoriaPage = lazy(() => import('../../modules/auditoria/pages/AuditoriaPage'));
const EmpleadosListPage = lazy(() => import('../../modules/empleados/pages/EmpleadosListPage'));
const EmpleadoFormPage = lazy(() => import('../../modules/empleados/pages/EmpleadoFormPage'));
const ClientHomePage = lazy(() => import('../../modules/client/pages/ClientHomePage'));
const ClientSolicitudesListPage = lazy(() => import('../../modules/solicitudes/pages/ClientSolicitudesListPage'));
const ClientSolicitudFormPage = lazy(() => import('../../modules/solicitudes/pages/ClientSolicitudFormPage'));
const EmployeeSolicitudesPage = lazy(() => import('../../modules/solicitudes/pages/EmployeeSolicitudesPage'));
const ClientePerfilPage = lazy(() => import('../../modules/profile/pages/ClientePerfilPage'));

export const AppRouter: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const getHomePathByRole = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'PRESTATARIO':
        return '/cliente/inicio';
      case 'EMPLEADO':
      case 'ADMIN':
        return '/prestatarios';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Suspense fallback={<FullPageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={getHomePathByRole()} replace />} />
        <Route
          path="prestatarios"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <PrestatariosListPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="prestatarios/nuevo"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <PrestatarioFormPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="prestamos"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN', 'PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <PrestamosListPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="prestamos/nuevo"
          element={
            <RequireRole allowedRoles={['PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <PrestamoFormPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="prestamos/:id"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN', 'PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <PrestamoDetailPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="cuotas/:idPrestamo"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN', 'PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <CuotasListPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="reportes/resumen-prestamos"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <ResumenPrestamosPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="reportes/morosos"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <MorososPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="reportes/refinanciaciones"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <RefinanciacionesPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="notificaciones"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN', 'PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <NotificacionesPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="auditoria"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <AuditoriaPage />
              </Suspense>
            </RequireRole>
          }
        />

        <Route
          path="empleados"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <EmpleadosListPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="empleados/nuevo"
          element={
          <RequireRole allowedRoles={['ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <EmpleadoFormPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="cliente/inicio"
          element={
            <RequireRole allowedRoles={['PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <ClientHomePage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="cliente/perfil"
          element={
            <RequireRole allowedRoles={['PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <ClientePerfilPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="perfil"
          element={
            <RequireRole allowedRoles={['PRESTATARIO', 'EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <ClientePerfilPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="solicitudes"
          element={
            <RequireRole allowedRoles={['PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <ClientSolicitudesListPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="solicitudes/nueva"
          element={
            <RequireRole allowedRoles={['PRESTATARIO']}>
              <Suspense fallback={<FullPageLoader />}>
                <ClientSolicitudFormPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="solicitudes/admin"
          element={
            <RequireRole allowedRoles={['EMPLEADO', 'ADMIN']}>
              <Suspense fallback={<FullPageLoader />}>
                <EmployeeSolicitudesPage />
              </Suspense>
            </RequireRole>
          }
        />
      </Route>
      <Route
        path="/ayuda"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<FullPageLoader />}>
              <HelpPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
