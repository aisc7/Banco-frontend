import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationProvider } from '../../../app/providers/NotificationProvider';
import { httpClient } from '../httpClient';

const TestComponent: React.FC = () => {
  useEffect(() => {
    // Simula un error de negocio 400 desde el backend para disparar el interceptor
    httpClient.defaults.adapter = async () => {
      const error: any = new Error('Backend error');
      error.response = {
        status: 400,
        data: { error: 'Mensaje de error de prueba' }
      };
      throw error;
    };

    httpClient.get('/test').catch(() => {
      // El error es manejado por el interceptor; aquí no hacemos nada.
    });
  }, []);

  return null;
};

describe('httpClient + NotificationProvider', () => {
  it('muestra una notificación cuando ocurre un error HTTP', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/mensaje de error de prueba/i)).toBeInTheDocument();
    });
  });
});

