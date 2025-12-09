import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrestatariosListPage } from '../PrestatariosListPage';
import { createZustandSelectorMock, resetZustandMocks } from '../../../../tests/mocks/zustandMock';

const fetchAllMock = vi.fn();

const emptyState = {
  items: [],
  loading: false,
  error: undefined as string | undefined,
  fetchAll: fetchAllMock,
  remove: vi.fn(),
  create: vi.fn(),
  update: vi.fn()
};

vi.mock('../../store/usePrestatariosStore', () => {
  let state = { ...emptyState };
  const hook = (selector?: any) => (selector ? selector(state) : state);
  // Permite que los tests reconfiguren el estado de la store si es necesario.
  (hook as any).setState = (next: typeof state) => {
    state = next;
  };
  return {
    usePrestatariosStore: hook
  };
});

const getMockedStore = () =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (require('../../store/usePrestatariosStore') as any).usePrestatariosStore as any;

describe('PrestatariosListPage', () => {
  beforeEach(() => {
    resetZustandMocks();
    fetchAllMock.mockClear();
    const hook = getMockedStore();
    hook.setState({ ...emptyState });
  });

  it('muestra mensaje cuando no hay prestatarios', () => {
    render(
      <MemoryRouter>
        <PrestatariosListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/no hay prestatarios registrados/i)).toBeInTheDocument();
  });

  it('muestra filas cuando hay prestatarios', () => {
    const hook = getMockedStore();
    hook.setState({
      ...emptyState,
      items: [
        {
          id: 1,
          ci: 123,
          nombre: 'Juan',
          apellido: 'Pérez',
          direccion: '',
          email: 'juan@example.com',
          telefono: '123',
          fechaNacimiento: '1990-01-01',
          estadoCliente: 'ACTIVO',
          fechaRegistro: '2024-01-01',
          usuarioRegistro: 'admin'
        }
      ]
    });

    render(
      <MemoryRouter>
        <PrestatariosListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/juan/i)).toBeInTheDocument();
    expect(screen.getByText(/pérez/i)).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando error no es nulo', () => {
    const hook = getMockedStore();
    hook.setState({
      ...emptyState,
      error: 'Error al cargar prestatarios'
    });

    render(
      <MemoryRouter>
        <PrestatariosListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/error al cargar prestatarios/i)).toBeInTheDocument();
  });
});
