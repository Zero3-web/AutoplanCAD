import { RoomType, RoomConfig } from './types';

export const GRID_SIZE = 20; // Pixels per meter (scale factor for viewing)

export const DEFAULT_BUILDING_WIDTH = 20;

// Architectural Hierarchy (Lower number = Placed first/closer to entrance)
export const ROOM_HIERARCHY: Record<RoomType, number> = {
  [RoomType.RECEPCION]: 0,    // Entrance
  [RoomType.DIRECTORIO]: 1,   // VIP / Front of House
  [RoomType.REUNION]: 2,      // Front of House
  [RoomType.MEETBOX]: 3,
  [RoomType.GERENCIA]: 4,     // Private Management
  [RoomType.JEFATURA]: 5,
  [RoomType.POOL]: 6,         // General Operations
  [RoomType.PHONEBOOTH]: 7,
  [RoomType.LOUNGE]: 8,       // Amenities
  [RoomType.COMEDOR]: 9,
  [RoomType.KITCHENETTE]: 10,
  [RoomType.LACTARIO]: 11,
  [RoomType.SSHH]: 12,        // Restrooms
  [RoomType.LOCKERS]: 13,
  [RoomType.ALMACEN]: 14,     // Back of House / Services
  [RoomType.DATACENTER]: 15,
  [RoomType.LIMPIEZA]: 16
};

export const ROOM_TEMPLATES: Record<RoomType, Omit<RoomConfig, 'id' | 'name'>> = {
  [RoomType.GERENCIA]: {
    type: RoomType.GERENCIA,
    width: 4.5,
    height: 3.5,
    color: '#eee'
  },
  [RoomType.JEFATURA]: {
    type: RoomType.JEFATURA,
    width: 3.5,
    height: 3,
    color: '#eee'
  },
  [RoomType.POOL]: {
    type: RoomType.POOL,
    width: 8,
    height: 5,
    color: '#eee'
  },
  [RoomType.REUNION]: {
    type: RoomType.REUNION,
    width: 4.5,
    height: 3.5,
    color: '#eee'
  },
  [RoomType.DIRECTORIO]: {
    type: RoomType.DIRECTORIO,
    width: 6,
    height: 4.5,
    color: '#eee'
  },
  [RoomType.MEETBOX]: {
    type: RoomType.MEETBOX,
    width: 2.5,
    height: 2,
    color: '#eee'
  },
  [RoomType.PHONEBOOTH]: {
    type: RoomType.PHONEBOOTH,
    width: 1.2,
    height: 1.2,
    color: '#eee'
  },
  [RoomType.KITCHENETTE]: {
    type: RoomType.KITCHENETTE,
    width: 3,
    height: 2.5,
    color: '#eee'
  },
  [RoomType.COMEDOR]: {
    type: RoomType.COMEDOR,
    width: 6,
    height: 5,
    color: '#eee'
  },
  [RoomType.LOUNGE]: {
    type: RoomType.LOUNGE,
    width: 4,
    height: 4,
    color: '#eee'
  },
  [RoomType.LACTARIO]: {
    type: RoomType.LACTARIO,
    width: 2.5,
    height: 2.5,
    color: '#eee'
  },
  [RoomType.RECEPCION]: {
    type: RoomType.RECEPCION,
    width: 5,
    height: 3.5,
    color: '#eee'
  },
  [RoomType.LIMPIEZA]: {
    type: RoomType.LIMPIEZA,
    width: 2.5,
    height: 2,
    color: '#eee'
  },
  [RoomType.ALMACEN]: {
    type: RoomType.ALMACEN,
    width: 3,
    height: 3,
    color: '#eee'
  },
  [RoomType.DATACENTER]: {
    type: RoomType.DATACENTER,
    width: 1.5,
    height: 1.2,
    color: '#eee'
  },
  [RoomType.LOCKERS]: {
    type: RoomType.LOCKERS,
    width: 3,
    height: 1.5,
    color: '#eee'
  },
  [RoomType.SSHH]: {
    type: RoomType.SSHH,
    width: 6,
    height: 3.5,
    color: '#eee'
  }
};