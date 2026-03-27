jest.mock('../config', () => ({
  API_BASE_URL: 'http://192.168.18.25:5000/api',
  APP_NAME: 'HidroGestión App',
}));

import { toApiImage, toRootUrl } from '../services/api';

describe('helpers de api', () => {
  test('toApiImage devuelve null cuando no hay ruta', () => {
    expect(toApiImage(null)).toBeNull();
    expect(toApiImage(undefined)).toBeNull();
  });

  test('toApiImage conserva una url absoluta', () => {
    expect(toApiImage('https://servidor.com/foto.jpg')).toBe('https://servidor.com/foto.jpg');
  });

  test('toApiImage convierte una ruta relativa a url completa', () => {
    expect(toApiImage('uploads/lecturas/foto.jpg')).toBe('http://192.168.18.25:5000/uploads/lecturas/foto.jpg');
  });

  test('toRootUrl concatena correctamente la ruta base', () => {
    expect(toRootUrl('/auth/login')).toBe('http://192.168.18.25:5000/auth/login');
    expect(toRootUrl('avisos')).toBe('http://192.168.18.25:5000/avisos');
  });
});
