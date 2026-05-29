export enum RoomType {
  GERENCIA = 'Oficina Gerencia',
  JEFATURA = 'Oficina Jefatura',
  POOL = 'Pool de Trabajo',
  REUNION = 'Sala Reunión',
  DIRECTORIO = 'Directorio',
  MEETBOX = 'Cabina Reunión',
  PHONEBOOTH = 'Cabina Telefónica',
  KITCHENETTE = 'Kitchenette',
  COMEDOR = 'Comedor',
  LOUNGE = 'Sala Lounge',
  LACTARIO = 'Lactario',
  RECEPCION = 'Recepción',
  LIMPIEZA = 'Cuarto Limpieza',
  ALMACEN = 'Almacén',
  DATACENTER = 'Centro de Datos',
  LOCKERS = 'Casilleros',
  SSHH = 'SS.HH'
}

export interface RoomConfig {
  id: string;
  type: RoomType;
  name: string;
  width: number;
  height: number;
  capacity?: number;
  quantity?: number;
  calculationMode?: 'space' | 'person';
  hasLockers?: boolean;
  lockerCount?: number;
  hasKitchenette?: boolean;
  sshhType?: 'unitary' | 'multiple';
  poolOrientation?: 'horizontal' | 'vertical';
  color: string;
}

export interface PlacedRoom extends RoomConfig {
  x: number;
  y: number;
}

export interface BuildingConfig {
  width: number; // Total width in meters
  padding: number; // External wall padding
}