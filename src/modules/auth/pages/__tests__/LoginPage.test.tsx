import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { createZustandSelectorMock, resetZustandMocks } from '../../../../tests/mocks/zustandMock';

const loginMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../store/useAuthStore', () => {
  const state = {
    login: loginMock,
    loading: false,
    error: undefined
  };
  return {
    useAuthStore: createZustandSelectorMock(state)
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    resetZustandMocks();
    loginMock.mockClear();
  });

  it('renderiza campos de usuario y contraseña y botón', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('muestra errores cuando se envía el formulario vacío', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText(/el usuario es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/la contraseña es requerida/i)).toBeInTheDocument();
  });

  it('llama a login con credenciales correctas', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'empleado1' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret' } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(loginMock).toHaveBeenCalledWith({ username: 'empleado1', password: 'secret' });
  });
});
