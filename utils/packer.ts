import { RoomConfig, PlacedRoom, RoomType } from '../types';

// Placement preference for sorting - determines vertical position in the layout
// 'front' = close to entrance (bottom), 'center' = middle band, 'back' = far from entrance (top), 'service' = grouped with other small rooms
type PlacementPreference = 'front' | 'back' | 'center' | 'service' | 'flexible';

const ROOM_PLACEMENT: Record<RoomType, PlacementPreference> = {
  // Front rooms (close to entrance) - meeting/visitor spaces
  // Front rooms (close to entrance/reception) - visitor/lobby spaces
  [RoomType.REUNION]: 'back', // Actually 'back' is top of screen, 'front' is bottom (near entrance)
  [RoomType.DIRECTORIO]: 'back',
  [RoomType.COMEDOR]: 'back',
  [RoomType.LOUNGE]: 'back',

  // Center rooms - main workspaces
  [RoomType.POOL]: 'center',

  // Back rooms - private spaces
  [RoomType.GERENCIA]: 'front',
  [RoomType.JEFATURA]: 'front',

  // Service/utility rooms - grouped at the bottom
  [RoomType.SSHH]: 'service',
  [RoomType.KITCHENETTE]: 'service',
  [RoomType.LACTARIO]: 'service',
  [RoomType.LIMPIEZA]: 'service',

  [RoomType.ALMACEN]: 'flexible',
  [RoomType.DATACENTER]: 'flexible',
  [RoomType.LOCKERS]: 'flexible',
  [RoomType.MEETBOX]: 'flexible',
  [RoomType.PHONEBOOTH]: 'flexible',
  [RoomType.RECEPCION]: 'flexible', // Extra receptions fill gaps
};

/**
 * Sort rooms by zone preference and size
 * Order: back (top) → center (Pool) → front → service → flexible (bottom)
 */
export const smartSortRooms = (rooms: RoomConfig[]): RoomConfig[] => {
  return [...rooms].sort((a, b) => {
    const prefOrder = { back: 0, center: 1, front: 2, service: 3, flexible: 4 };
    const prefA = prefOrder[ROOM_PLACEMENT[a.type] || 'flexible'];
    const prefB = prefOrder[ROOM_PLACEMENT[b.type] || 'flexible'];

    if (prefA !== prefB) return prefA - prefB;

    // Larger rooms first within the same zone
    return (b.width * b.height) - (a.width * a.height);
  });
};

export const calculateOptimalWidth = (rooms: RoomConfig[], ratio: number = 1.2): number => {
  if (rooms.length === 0) return 20;
  const totalRoomArea = rooms.reduce((acc, room) => acc + (room.width * room.height), 0);
  // Tighter scaling for horizontal layouts to avoid voids
  const layoutOverhead = ratio > 2.0 ? 1.25 : 1.15;
  const totalEstimatedArea = totalRoomArea * layoutOverhead;
  const optimalWidth = Math.sqrt(totalEstimatedArea * ratio);
  return Math.ceil(optimalWidth * 2) / 2;
};

interface Shelf {
  y: number;
  height: number;
  usedWidth: number;
  rooms: PlacedRoom[];
}

/**
 * Optimized Packing Algorithm v6:
 * - Pool de Trabajo centered vertically and horizontally
 * - Minimal corridors (1.2m)
 * - Tight packing ratio 1.05
 */
export const packRooms = (
  rooms: RoomConfig[],
  containerWidth: number,
  isHorizontal: boolean = false,
  layoutVersion: number = 0
): { placedRooms: PlacedRoom[]; totalHeight: number; actualWidth: number } => {

  // 1. Separate Receptions and Lounges for the "Welcome Area" (Entrance at Y = Dynamic Bottom)
  const receptions = rooms.filter(r => r.type === RoomType.RECEPCION);
  const lounges = rooms.filter(r => r.type === RoomType.LOUNGE);

  // Entrance is at the BOTTOM of the building logic
  const bottomReception = receptions.length > 0 ? receptions[0] : null;
  const bottomLounge = lounges.length > 0 ? lounges[0] : null;
  const topReception = receptions.length > 1 ? receptions[1] : null;

  let reservedIds = new Set();
  if (bottomReception) reservedIds.add(bottomReception.id);
  if (bottomLounge) reservedIds.add(bottomLounge.id);
  if (topReception) reservedIds.add(topReception.id);

  let otherRooms = rooms.filter(r => !reservedIds.has(r.id));
  otherRooms = smartSortRooms(otherRooms);

  const HALLWAY_WIDTH = isHorizontal ? 0.2 : 1.2;
  const WALL_THICKNESS = 0.15;
  const STRETCH_THRESHOLD = 3.0; // Moderate stretch to fill gaps
  const CORRIDOR_WIDTH = isHorizontal ? 0.1 : 0.2; // Minimal but visible perimeter gap

  // Effective width for placing rooms
  const effectiveWidth = containerWidth - CORRIDOR_WIDTH;

  const placedRooms: PlacedRoom[] = [];
  let startY = 0;

  if (isHorizontal) {
    // === NEW PERIMETER AND CORE ALGORITHM ===
    const poolRooms = otherRooms.filter(r => r.type === RoomType.POOL);
    const serviceTypes = [RoomType.SSHH, RoomType.PHONEBOOTH, RoomType.MEETBOX, RoomType.LACTARIO, RoomType.LIMPIEZA, RoomType.ALMACEN, RoomType.DATACENTER];
    const serviceRooms = otherRooms.filter(r => serviceTypes.includes(r.type));
    const perimeterRooms = otherRooms.filter(r => r.type !== RoomType.POOL && !serviceTypes.includes(r.type));

    let topRooms: RoomConfig[] = [];
    let bottomRooms: RoomConfig[] = [];

    // Core Row: ONLY Pool
    let coreRowRooms: RoomConfig[] = [...poolRooms];

    let serviceRoomsInBottom: RoomConfig[] = [...serviceRooms];
    let topWidth = 0;
    let bottomWidth = 0;

    // Distribute fixed rooms
    if (topReception) { topRooms.push(topReception); topWidth += topReception.width; }

    // Ensure the welcome cluster (Reception + Lounge) is always at the start of the bottom row
    if (bottomReception && bottomLounge) {
      const mergedWidth = bottomReception.width + bottomLounge.width + 1.2;
      bottomRooms.push({
        ...bottomReception,
        id: 'lobby-merged',
        name: "LOBBY (RECEP + LOUNGE)",
        width: mergedWidth,
        height: Math.max(bottomReception.height, bottomLounge.height, 3.5),
        capacity: bottomReception.capacity || 1,
        lockerCount: bottomLounge.capacity || 4
      });
      bottomWidth += mergedWidth;
    } else {
      if (bottomReception) { bottomRooms.push(bottomReception); bottomWidth += bottomReception.width; }
      if (bottomLounge) { bottomRooms.push(bottomLounge); bottomWidth += bottomLounge.width; }
    }

    let coreWidth = poolRooms.reduce((sum, r) => sum + r.width, 0);

    perimeterRooms.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    perimeterRooms.forEach(r => {
      // Version 1 allows placing rooms in the core row to optimize space and fill gaps
      if (layoutVersion === 1) {
        const minWidth = Math.min(topWidth, bottomWidth, coreWidth);
        if (coreWidth === minWidth) {
          coreRowRooms.push(r);
          coreWidth += r.width;
        } else if (topWidth <= bottomWidth) {
          topRooms.push(r);
          topWidth += r.width;
        } else {
          bottomRooms.push(r);
          bottomWidth += r.width;
        }
      } else {
        if (topWidth <= bottomWidth) {
          topRooms.push(r);
          topWidth += r.width;
        } else {
          bottomRooms.push(r);
          bottomWidth += r.width;
        }
      }
    });

    // Add services to bottom row to anchor them to the perimeter
    bottomRooms = [...bottomRooms, ...serviceRoomsInBottom];

    let currentY = 0;
    const MAIN_CORRIDOR = isHorizontal ? 0.8 : 1.2;

    const scaleRow = (roomsInRow: RoomConfig[], yPos: number, isBottom: boolean = false): number => {
      if (roomsInRow.length === 0) return yPos;
      const totalRawWidth = roomsInRow.reduce((sum, r) => sum + r.width, 0);
      const targetWidth = effectiveWidth - ((roomsInRow.length - 1) * WALL_THICKNESS);
      const scaleFactor = targetWidth / totalRawWidth;

      let maxHeight = 0;
      roomsInRow.forEach(r => {
        maxHeight = Math.max(maxHeight, r.height);
      });

      // Special case: standardized depth for services to avoid "serrucho"
      const hasServicesOnly = roomsInRow.every(r => serviceTypes.includes(r.type));
      if (hasServicesOnly) maxHeight = Math.max(maxHeight, 2.8); // Standard service depth

      let currentX = CORRIDOR_WIDTH / 2;
      roomsInRow.forEach(r => {
        const isService = serviceTypes.includes(r.type);
        const minW = isService ? 1.0 : 2.0;
        let scaledWidth = r.width * scaleFactor;

        // Ensure minimum width to avoid "fideo" effect
        if (scaledWidth < minW) scaledWidth = minW;

        // Proportional height for small rooms (don't stretch too much in depth!)
        // If room template depth is small and row is tall, cap it and align to building perimeter
        let finalHeight = maxHeight;
        let finalY = yPos;

        const isSmallRoom = r.height <= 2.5;
        if ((isService || isSmallRoom) && maxHeight > 2.6 && r.height < maxHeight * 0.8) {
          finalHeight = Math.min(maxHeight, Math.max(r.height, 2.2));
          // If it's the bottom row, align to the bottom perimeter
          if (isBottom) {
            finalY = yPos + (maxHeight - finalHeight);
          }
        }

        placedRooms.push({
          ...r,
          x: currentX,
          y: finalY,
          width: scaledWidth,
          height: finalHeight
        });
        currentX += scaledWidth + WALL_THICKNESS;
      });

      // FORCE STRETCH LAST ROOM: Ensure last room hits the right boundary to avoid 'dead ends'
      if (placedRooms.length > 0) {
        const lastRoomIdxInPl = placedRooms.length - 1;
        const targetX = CORRIDOR_WIDTH / 2 + effectiveWidth;
        const currentEndX = placedRooms[lastRoomIdxInPl].x + placedRooms[lastRoomIdxInPl].width;
        if (currentEndX < targetX - 0.1) {
          placedRooms[lastRoomIdxInPl].width += (targetX - currentEndX);
        }
      }

      return yPos + maxHeight;
    };

    // 1. TOP ROW
    currentY = scaleRow(topRooms, currentY, false);

    // 2. CORE (MIDDLE ROW) - Only Pools
    if (coreRowRooms.length > 0) {
      currentY += MAIN_CORRIDOR;
      currentY = scaleRow(coreRowRooms, currentY, false);
    }

    // 3. BOTTOM ROW
    currentY += MAIN_CORRIDOR;
    const bottomHeight = scaleRow(bottomRooms, currentY, true);
    if (bottomRooms.length > 0) currentY = bottomHeight;

    const maxActualWidth = placedRooms.reduce((max, r) => Math.max(max, r.x + r.width), 0) + (CORRIDOR_WIDTH / 2);

    // After placing rooms with the main algo, we still need to add the welcome cluster if not combined
    // Wait, in isHorizontal mode we already DISTRIBUTED the reception.

    return {
      placedRooms,
      totalHeight: currentY + 0.1,
      actualWidth: maxActualWidth
    };
  }

  // 3. Handle Top Reception
  if (topReception) {
    placedRooms.push({
      ...topReception,
      x: Math.max(0, (containerWidth - topReception.width) / 2),
      y: 0
    });
    startY = topReception.height + HALLWAY_WIDTH;
  }

  // 4. Build shelves with gap-filling
  const shelves: Shelf[] = [];
  const placed = new Set<string>();

  // Helper to add room to shelf
  const addRoomToShelf = (room: RoomConfig, shelf: Shelf, width: number) => {
    const placedRoom: PlacedRoom = {
      ...room,
      x: shelf.usedWidth,
      y: shelf.y,
      width: width
    };
    shelf.rooms.push(placedRoom);
    shelf.usedWidth += width + WALL_THICKNESS;
    placed.add(room.id);
  };

  const standardRooms = otherRooms;

  standardRooms.forEach((room) => {
    if (placed.has(room.id)) return;

    // Find a shelf where this room fits
    let bestShelf: Shelf | null = null;
    for (const shelf of shelves) {
      const isLargePool = room.type === RoomType.POOL && (room.capacity || 0) > 15;
      if (room.type === RoomType.POOL && !isHorizontal) break;
      if (isLargePool && isHorizontal) break;

      const remainingWidth = effectiveWidth - shelf.usedWidth;
      const heightTolerance = containerWidth > 20 ? 4.5 : (containerWidth > 15 ? 2.5 : 1.5);
      if (room.width <= remainingWidth && Math.abs(room.height - shelf.height) < heightTolerance) {
        bestShelf = shelf;
        break;
      }
    }

    if (bestShelf) {
      const remainingWidth = effectiveWidth - bestShelf.usedWidth;
      let roomWidth = room.width;
      if (remainingWidth - room.width < STRETCH_THRESHOLD) roomWidth = remainingWidth;
      addRoomToShelf(room, bestShelf, roomWidth);
    } else {
      const shelfY = 0; // Temporary Y
      let roomWidth = room.width;
      const stretchForce = isHorizontal ? 2.0 : (containerWidth < 18 ? STRETCH_THRESHOLD : 0.5);

      const isStretchablePool = room.type === RoomType.POOL && (!isHorizontal || (room.capacity || 0) > 1);

      if (effectiveWidth - room.width < stretchForce || isStretchablePool) {
        roomWidth = effectiveWidth;
      }

      const newShelf: Shelf = {
        y: shelfY,
        height: room.height,
        usedWidth: 0,
        rooms: []
      };
      addRoomToShelf(room, newShelf, roomWidth);
      shelves.push(newShelf);
    }
  });

  const poolShelfIndex = shelves.findIndex(s => s.rooms.some(r => r.type === RoomType.POOL));
  if (poolShelfIndex !== -1 && shelves.length > 2) {
    const [poolShelf] = shelves.splice(poolShelfIndex, 1);
    const middleIndex = Math.floor(shelves.length / 2);
    shelves.splice(middleIndex, 0, poolShelf);
  }

  let currentY = startY;
  shelves.forEach((shelf) => {
    shelf.y = currentY;
    const shelfWidth = shelf.usedWidth - WALL_THICKNESS;
    const totalRemaining = effectiveWidth - shelfWidth;

    const offset = CORRIDOR_WIDTH / 2;
    let stretchAmount = totalRemaining / shelf.rooms.length;
    // SPACE OPTIMIZATION: Always stretch rooms to fill the building width.
    // Centering is removed to satisfy the "optimize spaces" requirement.
    let shelfX = offset;
    shelf.rooms.forEach((room, idx) => {
      room.y = currentY;
      room.x = shelfX;
      room.width += stretchAmount;
      room.height = shelf.height; // Uniform height!

      // FINAL STRETCH: Ensure the last room of the shelf hits the border exactly
      if (idx === shelf.rooms.length - 1) {
        const shelfEndX = offset + effectiveWidth;
        const currentEndX = room.x + room.width;
        if (currentEndX < shelfEndX) {
          room.width += (shelfEndX - currentEndX);
        }
      }

      shelfX += room.width + WALL_THICKNESS;
    });

    currentY += shelf.height + HALLWAY_WIDTH;
  });

  const allPlaced = [...shelves.flatMap(s => s.rooms)];

  // 6. Place Welcome Cluster (Reception/Lounge)
  if (bottomReception || bottomLounge) {
    currentY += HALLWAY_WIDTH;
    if (bottomReception && bottomLounge) {
      const GAP = 1.0;
      const combinedWidth = (isHorizontal && layoutVersion === 0) ? effectiveWidth : (bottomReception.width + bottomLounge.width + GAP);
      const mergedHeight = Math.max(bottomReception.height, bottomLounge.height);

      let xPos = 0;
      if (layoutVersion === 1) {
        xPos = containerWidth - combinedWidth - (CORRIDOR_WIDTH / 2) - 1.0;
      } else {
        xPos = isHorizontal ? CORRIDOR_WIDTH : Math.max(0, (containerWidth - combinedWidth) / 2);
      }

      const lobbyRoom: PlacedRoom = {
        ...bottomReception,
        id: `lobby-merged`,
        name: "LOBBY (RECEPCIÓN + LOUNGE)",
        width: combinedWidth,
        height: mergedHeight,
        x: xPos,
        y: currentY,
        capacity: bottomReception.capacity || 1,
        lockerCount: bottomLounge.capacity || 4
      };
      allPlaced.push(lobbyRoom);
      currentY += mergedHeight;
    } else {
      const r = bottomReception || bottomLounge;
      const combinedWidth = (isHorizontal && layoutVersion === 0) ? effectiveWidth : r!.width;

      let xPos = 0;
      if (layoutVersion === 1) {
        xPos = containerWidth - combinedWidth - (CORRIDOR_WIDTH / 2) - 1.0;
      } else {
        xPos = isHorizontal ? CORRIDOR_WIDTH : Math.max(0, (containerWidth - r!.width) / 2);
      }

      const welcomeRoom: PlacedRoom = {
        ...r!,
        width: combinedWidth,
        x: xPos,
        y: currentY
      };
      allPlaced.push(welcomeRoom);
      currentY += r!.height;
    }
  }

  const maxActualWidth = allPlaced.reduce((max, r) => Math.max(max, r.x + r.width), 0);

  return {
    placedRooms: allPlaced,
    totalHeight: currentY,
    actualWidth: maxActualWidth
  };
};
