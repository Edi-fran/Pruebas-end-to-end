import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RoleApp from '../screens/RoleApp';

jest.mock('../screens/shared/HomeScreen', () => () => null);
jest.mock('../screens/admin/AdminUsersScreen', () => () => null);
jest.mock('../screens/common/AvisosScreen', () => () => null);
jest.mock('../screens/common/IncidenciasScreen', () => () => null);
jest.mock('../screens/common/LecturasScreen', () => () => null);
jest.mock('../screens/common/MedidoresScreen', () => () => null);
jest.mock('../screens/common/MessagesScreen', () => () => null);
jest.mock('../screens/common/MiViviendaScreen', () => () => null);
jest.mock('../screens/common/NotificationsScreen', () => () => null);
jest.mock('../screens/common/OrdersScreen', () => () => null);
jest.mock('../screens/common/PlanillasScreen', () => () => null);
jest.mock('../screens/common/RecaudacionScreen', () => () => null);
jest.mock('../screens/common/StatsScreen', () => () => null);
jest.mock('../screens/common/PagosScreen', () => () => null);
jest.mock('../screens/common/MovimientosScreen', () => () => null);
jest.mock('../screens/common/ReunionesScreen', () => () => null);
jest.mock('../screens/common/RecordatoriosScreen', () => () => null);
jest.mock('../screens/common/TarifasScreen', () => () => null);
jest.mock('../screens/common/MapaIncidenciasScreen', () => () => null);

describe('RoleApp', () => {
  test('muestra módulos del rol ADMIN', () => {
    const user = {
      id: 1,
      nombre: 'Administrador',
      username: 'admin',
      rol: 'ADMIN',
      estado: 'ACTIVO',
    } as any;

    const screen = render(<RoleApp user={user} onLogout={jest.fn()} />);

    expect(screen.getByText('Inicio')).toBeTruthy();
    expect(screen.getByText('Usuarios')).toBeTruthy();
    expect(screen.getByText('Lecturas')).toBeTruthy();
  });

  test('muestra módulos del rol TECNICO', () => {
    const user = {
      id: 2,
      nombre: 'Técnico',
      username: 'tecnico',
      rol: 'TECNICO',
      estado: 'ACTIVO',
    } as any;

    const screen = render(<RoleApp user={user} onLogout={jest.fn()} />);

    expect(screen.getByText('Lecturaciones')).toBeTruthy();
    expect(screen.getByText('Medidores')).toBeTruthy();
    expect(screen.queryByText('Usuarios')).toBeNull();
  });

  test('permite cambiar de pestaña visible', () => {
    const user = {
      id: 3,
      nombre: 'Socio',
      username: 'socio',
      rol: 'SOCIO',
      estado: 'ACTIVO',
    } as any;

    const screen = render(<RoleApp user={user} onLogout={jest.fn()} />);

    fireEvent.press(screen.getByText('Planillas'));
    expect(screen.getByText('Planillas')).toBeTruthy();
  });
});
