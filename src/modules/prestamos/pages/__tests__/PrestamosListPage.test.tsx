import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrestamosListPage } from '../PrestamosListPage';
import { resetZustandMocks } from '../../../../tests/mocks/zustandMock';

const fetchAllMock = vi.fn();

const baseState = {
  items: [
    {
      id: 1,
      idSolicitudPrestamo: 1,
      idPrestatario: 123,
      totalPrestado: 1000000,
      nroCuotas: 12,
      interes: 10,
      fechaEmision: '2024-01-01',
      fechaVencimiento: '2024-12-31',
      estado: 'ACTIVO'
    }
  ],
  loading: false,
  error: undefined as string | undefined,
  fetchAll: fetchAllMock,
  remove: vi.fn()
};

vi.mock('../../store/usePrestamosStore', () => {
  let state = { ...baseState };
  const hook = (selector?: any) => (selector ? selector(state) : state);
  (hook as any).setState = (next: typeof state) => {
    state = next;
  };
  return {
    usePrestamosStore: hook
  };
});

const getPrestamosStore = () =>
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (require('../../store/usePrestamosStore') as any).usePrestamosStore;

describe('PrestamosListPage', () => {
  beforeEach(() => {
    resetZustandMocks();
    fetchAllMock.mockClear();
    const hook = getPrestamosStore();
    hook.setState({ ...baseState });
  });

  it('muestra columnas y datos de préstamos', () => {
    render(
      <MemoryRouter>
        <PrestamosListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/id prestatario/i)).toBeInTheDocument();
    expect(screen.getByText(/monto/i)).toBeInTheDocument();
    expect(screen.getByText(/activo/i)).toBeInTheDocument();
  });
});
