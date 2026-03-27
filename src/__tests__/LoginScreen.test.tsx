import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../components/LoginScreen';

describe('LoginScreen', () => {
  test('envía las credenciales al pulsar el botón', async () => {
    const onLogin = jest.fn().mockResolvedValue(undefined);

    const screen = render(<LoginScreen onLogin={onLogin} />);

    fireEvent.press(screen.getByText('Entrar al sistema'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('admin', 'Admin123*');
    });
  });
});
