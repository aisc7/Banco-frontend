import React, { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RuleIcon from '@mui/icons-material/Rule';
import BadgeIcon from '@mui/icons-material/Badge';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import { useUiStore } from '../../../app/store/useUiStore';
import { useAuthStore } from '../../../modules/auth/store/useAuthStore';

const drawerWidth = 220;

export const MainLayout: React.FC = () => {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const themeMode = useUiStore((s) => s.themeMode);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const role = user?.role;
  const isPrestatario = role === 'PRESTATARIO';
  const isEmpleado = role === 'EMPLEADO';
  const isAdmin = role === 'ADMIN';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = useMemo(() => {
    if (!user) return [];

    // Cliente (PRESTATARIO)
    if (isPrestatario) {
      return [
        { to: '/cliente/inicio', label: 'Inicio', icon: <HomeIcon /> },
        { to: '/prestamos', label: 'Mis préstamos', icon: <AccountBalanceIcon /> },
        { to: '/solicitudes', label: 'Solicitudes', icon: <RuleIcon /> },
        { to: '/notificaciones', label: 'Mis notificaciones', icon: <NotificationsIcon /> },
        { to: '/cliente/perfil', label: 'Mi perfil', icon: <AccountCircleIcon /> },
        { to: '/ayuda', label: 'Ayuda', icon: <HelpOutlineIcon /> }
      ];
    }

    // Empleado / Admin
    const items = [
      { to: '/prestatarios', label: 'Prestatarios', icon: <PeopleIcon /> },
      { to: '/prestamos', label: 'Préstamos', icon: <AccountBalanceIcon /> },
      { to: '/solicitudes/admin', label: 'Solicitudes', icon: <RuleIcon /> },
      { to: '/reportes/resumen-prestamos', label: 'Reportes', icon: <BarChartIcon /> },
      { to: '/notificaciones', label: 'Notificaciones', icon: <NotificationsIcon /> },
      { to: '/auditoria', label: 'Auditoría', icon: <HistoryIcon /> },
      { to: '/perfil', label: 'Mi perfil', icon: <AccountCircleIcon /> },
      { to: '/ayuda', label: 'Ayuda', icon: <HelpOutlineIcon /> }
    ];

    if (isAdmin) {
      items.splice(5, 0, { to: '/empleados', label: 'Empleados', icon: <BadgeIcon /> });
    }

    return items;
  }, [user, isPrestatario, isAdmin]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Banco - Panel
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: sidebarOpen ? drawerWidth : 60,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : 60,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.to}
                selected={location.pathname.startsWith(item.to)}
                onClick={() => navigate(item.to)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.label} />}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
