import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LecturasScreen from '../LecturasScreen';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../../services/hidroService', () => ({
  hidroService: {
    listLecturas: jest.fn(),
    listMedidores: jest.fn(),
    createLectura: jest.fn(),
    updateLectura: jest.fn(),
    deleteLectura: jest.fn(),
    anularRecalcularLectura: jest.fn(),
    reclamarLectura: jest.fn(),
    exportLecturasCsvUrl: jest.fn(() => 'http://192.168.18.25:5000/api/lecturas/reporte.csv'),
  },
  getCurrentLocation: jest.fn(),
  pickEvidence: jest.fn(),
}));

jest.mock('../../../components/Ui', () => {
  const React = require('react');
  const { View, Text, TextInput, TouchableOpacity } = require('react-native');
  return {
    Badge:          ({ text }: any) => <Text>{text}</Text>,
    Card:           ({ children }: any) => <View>{children}</View>,
    EmptyState:     ({ text }: any) => <Text>{text}</Text>,
    Input:          ({ label, value, onChangeText, placeholder }: any) => (
      <View>
        {label ? <Text>{label}</Text> : null}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} />
      </View>
    ),
    LinkButton:     ({ label, onPress, url }: any) => (
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
        {url ? <Text>{url}</Text> : null}
      </TouchableOpacity>
    ),
    LoadingBlock:       () => <Text>Cargando...</Text>,
    PhotoPreviewModal:  () => null,
    PhotoThumb:         () => <Text>Sin foto</Text>,
    PrimaryButton:  ({ label, onPress }: any) => (
      <TouchableOpacity onPress={onPress}><Text>{label}</Text></TouchableOpacity>
    ),
    Screen:         ({ children, title, subtitle, actions }: any) => (
      <View>
        {title    ? <Text>{title}</Text>    : null}
        {subtitle ? <Text>{subtitle}</Text> : null}
        {actions  ? <View>{actions}</View>  : null}
        {children}
      </View>
    ),
    SecondaryButton: ({ label, onPress }: any) => (
      <TouchableOpacity onPress={onPress}><Text>{label}</Text></TouchableOpacity>
    ),
    SectionTitle:   ({ title, meta }: any) => (
      <View>
        {title ? <Text>{title}</Text> : null}
        {meta  ? <Text>{meta}</Text>  : null}
      </View>
    ),
    colors: {
      primary: '#2563EB', background: '#F8FAFC', text: '#0F172A',
      muted: '#64748B',   white: '#FFFFFF',      border: '#E2E8F0',
      danger: '#DC2626',  success: '#16A34A',    warning: '#D97706',
    },
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Import mocked module so we can configure return values per test
import { hidroService, getCurrentLocation, pickEvidence } from '../../../services/hidroService';

const mockHidroService   = hidroService as jest.Mocked<typeof hidroService>;
const mockGetLocation    = getCurrentLocation as jest.MockedFunction<typeof getCurrentLocation>;
const mockPickEvidence   = pickEvidence as jest.MockedFunction<typeof pickEvidence>;

const LECTURAS_MOCK = [
  { id: 1, medidor_id: 10, lectura_anterior: 100, lectura_actual: 120,
    consumo: 20, fecha: '2025-01-15', estado: 'ACTIVA' },
  { id: 2, medidor_id: 11, lectura_anterior: 200, lectura_actual: 230,
    consumo: 30, fecha: '2025-01-16', estado: 'ANULADA' },
];

const MEDIDORES_MOCK = [
  { id: 10, codigo: 'MED-001', socio_nombre: 'Juan Pérez' },
  { id: 11, codigo: 'MED-002', socio_nombre: 'María López' },
];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  // Defaults: service resolves with data
  mockHidroService.listLecturas.mockResolvedValue(LECTURAS_MOCK);
  mockHidroService.listMedidores.mockResolvedValue(MEDIDORES_MOCK);
  mockHidroService.createLectura.mockResolvedValue({ id: 3 });
  mockHidroService.updateLectura.mockResolvedValue({});
  mockHidroService.deleteLectura.mockResolvedValue({});
  mockHidroService.anularRecalcularLectura.mockResolvedValue({});
  mockHidroService.reclamarLectura.mockResolvedValue({});
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LecturasScreen', () => {

  // ── Carga inicial ──────────────────────────────────────────────────────────

  it('muestra indicador de carga y luego las lecturas', async () => {
    const { getByText, queryByText } = render(<LecturasScreen />);

    // Mientras carga debe mostrar el spinner
    expect(getByText('Cargando...')).toBeTruthy();

    // Tras resolver, las lecturas aparecen
    await waitFor(() => expect(getByText('Lectura #1')).toBeTruthy());
    expect(getByText('Lectura #2')).toBeTruthy();
    expect(queryByText('Cargando...')).toBeNull();
  });

  it('llama a listLecturas y listMedidores al montar', async () => {
    render(<LecturasScreen />);
    await waitFor(() => {
      expect(mockHidroService.listLecturas).toHaveBeenCalledTimes(1);
      expect(mockHidroService.listMedidores).toHaveBeenCalledTimes(1);
    });
  });

  it('muestra EmptyState cuando no hay lecturas', async () => {
    mockHidroService.listLecturas.mockResolvedValue([]);
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() =>
      expect(getByText('No hay lecturas registradas')).toBeTruthy()
    );
  });

  it('muestra alerta si falla la carga de datos', async () => {
    mockHidroService.listLecturas.mockRejectedValue(new Error('Network error'));
    render(<LecturasScreen />);
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudieron cargar las lecturas')
    );
  });

  // ── Encabezado y CSV ───────────────────────────────────────────────────────

  it('muestra título y subtítulo de la pantalla', async () => {
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getByText('Lecturas')).toBeTruthy());
    expect(getByText('Gestión de lecturas de medidores')).toBeTruthy();
  });

  it('muestra el botón y URL de exportar CSV', async () => {
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getByText('Exportar CSV')).toBeTruthy());
    expect(getByText('http://192.168.18.25:5000/api/lecturas/reporte.csv')).toBeTruthy();
  });

  // ── Estados de lecturas ────────────────────────────────────────────────────

  it('muestra los badges de estado de cada lectura', async () => {
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getByText('ACTIVA')).toBeTruthy());
    expect(getByText('ANULADA')).toBeTruthy();
  });

  // ── Formulario: apertura y cierre ─────────────────────────────────────────

  it('abre el formulario al presionar "Nueva Lectura"', async () => {
    const { getByText, queryByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getByText('Nueva Lectura')).toBeTruthy());

    expect(queryByText('Guardar')).toBeNull();
    fireEvent.press(getByText('Nueva Lectura'));
    expect(getByText('Guardar')).toBeTruthy();
  });

  it('cierra el formulario al presionar "Cancelar"', async () => {
    const { getByText, queryByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));
    expect(getByText('Guardar')).toBeTruthy();

    fireEvent.press(getByText('Cancelar'));
    expect(queryByText('Guardar')).toBeNull();
  });

  // ── Validación del formulario ──────────────────────────────────────────────

  it('muestra alerta si se intenta guardar con campos vacíos', async () => {
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Guardar'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Complete todos los campos')
    );
    expect(mockHidroService.createLectura).not.toHaveBeenCalled();
  });

  // ── Crear lectura ──────────────────────────────────────────────────────────

  it('crea una lectura con datos válidos y recarga la lista', async () => {
    const { getByText, getByPlaceholderText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.changeText(getByPlaceholderText('ID del medidor'), '10');
    fireEvent.changeText(getByPlaceholderText('Valor de lectura'), '150');
    fireEvent.press(getByText('Guardar'));

    await waitFor(() =>
      expect(mockHidroService.createLectura).toHaveBeenCalledWith(
        expect.objectContaining({ medidor_id: 10, lectura_actual: 150 })
      )
    );
    // Recarga datos
    expect(mockHidroService.listLecturas).toHaveBeenCalledTimes(2);
  });

  it('muestra alerta si createLectura falla', async () => {
    mockHidroService.createLectura.mockRejectedValue(new Error('Server error'));
    const { getByText, getByPlaceholderText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.changeText(getByPlaceholderText('ID del medidor'), '10');
    fireEvent.changeText(getByPlaceholderText('Valor de lectura'), '150');
    fireEvent.press(getByText('Guardar'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo guardar la lectura')
    );
  });

  // ── Eliminar lectura ───────────────────────────────────────────────────────

  it('elimina una lectura y recarga la lista', async () => {
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getAllByText('Eliminar').length).toBeGreaterThan(0));

    fireEvent.press(getAllByText('Eliminar')[0]);

    await waitFor(() =>
      expect(mockHidroService.deleteLectura).toHaveBeenCalledWith(LECTURAS_MOCK[0].id)
    );
    expect(mockHidroService.listLecturas).toHaveBeenCalledTimes(2);
  });

  it('muestra alerta si deleteLectura falla', async () => {
    mockHidroService.deleteLectura.mockRejectedValue(new Error('fail'));
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getAllByText('Eliminar')[0]));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo eliminar la lectura')
    );
  });

  // ── Anular lectura ─────────────────────────────────────────────────────────

  it('anula una lectura y recarga la lista', async () => {
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getAllByText('Anular').length).toBeGreaterThan(0));

    fireEvent.press(getAllByText('Anular')[0]);

    await waitFor(() =>
      expect(mockHidroService.anularRecalcularLectura).toHaveBeenCalledWith(
        LECTURAS_MOCK[0].id, 'anular'
      )
    );
  });

  it('muestra alerta si anularRecalcularLectura falla', async () => {
    mockHidroService.anularRecalcularLectura.mockRejectedValue(new Error('fail'));
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getAllByText('Anular')[0]));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo anular la lectura')
    );
  });

  // ── Reclamar lectura ───────────────────────────────────────────────────────

  it('reclama una lectura y recarga la lista', async () => {
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => expect(getAllByText('Reclamar').length).toBeGreaterThan(0));

    fireEvent.press(getAllByText('Reclamar')[0]);

    await waitFor(() =>
      expect(mockHidroService.reclamarLectura).toHaveBeenCalledWith(
        LECTURAS_MOCK[0].id, expect.any(String)
      )
    );
  });

  it('muestra alerta si reclamarLectura falla', async () => {
    mockHidroService.reclamarLectura.mockRejectedValue(new Error('fail'));
    const { getAllByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getAllByText('Reclamar')[0]));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo reclamar la lectura')
    );
  });

  // ── Captura de foto ────────────────────────────────────────────────────────

  it('llama a pickEvidence al presionar "Capturar Foto"', async () => {
    mockPickEvidence.mockResolvedValue(null);
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Capturar Foto'));

    await waitFor(() => expect(mockPickEvidence).toHaveBeenCalledTimes(1));
  });

  it('guarda la URI de la foto si pickEvidence devuelve una', async () => {
    mockPickEvidence.mockResolvedValue('file:///foto.jpg');
    mockHidroService.createLectura.mockResolvedValue({ id: 99 });

    const { getByText, getByPlaceholderText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Capturar Foto'));
    await waitFor(() => expect(mockPickEvidence).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('ID del medidor'), '10');
    fireEvent.changeText(getByPlaceholderText('Valor de lectura'), '130');
    fireEvent.press(getByText('Guardar'));

    await waitFor(() =>
      expect(mockHidroService.createLectura).toHaveBeenCalledWith(
        expect.objectContaining({ foto_uri: 'file:///foto.jpg' })
      )
    );
  });

  // ── Captura de ubicación ───────────────────────────────────────────────────

  it('llama a getCurrentLocation al presionar "Capturar Ubicación"', async () => {
    mockGetLocation.mockResolvedValue({ latitude: -0.22, longitude: -78.51 });
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Capturar Ubicación'));

    await waitFor(() => expect(mockGetLocation).toHaveBeenCalledTimes(1));
  });

  it('muestra alerta si getCurrentLocation devuelve null', async () => {
    mockGetLocation.mockResolvedValue(null);
    const { getByText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Capturar Ubicación'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo obtener la ubicación')
    );
  });

  it('incluye coordenadas en createLectura si se capturó ubicación', async () => {
    mockGetLocation.mockResolvedValue({ latitude: -0.22, longitude: -78.51 });
    mockHidroService.createLectura.mockResolvedValue({ id: 55 });

    const { getByText, getByPlaceholderText } = render(<LecturasScreen />);
    await waitFor(() => fireEvent.press(getByText('Nueva Lectura')));

    fireEvent.press(getByText('Capturar Ubicación'));
    await waitFor(() => expect(mockGetLocation).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('ID del medidor'), '10');
    fireEvent.changeText(getByPlaceholderText('Valor de lectura'), '140');
    fireEvent.press(getByText('Guardar'));

    await waitFor(() =>
      expect(mockHidroService.createLectura).toHaveBeenCalledWith(
        expect.objectContaining({ latitud: -0.22, longitud: -78.51 })
      )
    );
  });

});