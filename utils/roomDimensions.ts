import { RoomConfig, RoomType } from '../types';
import { ROOM_TEMPLATES } from '../constants';

export const calculatePoolDimensions = (peopleCapacity: number, hasLockers: boolean, lockerCount: number) => {
    const peoplePerBench = 10;
    const benchesCount = Math.ceil(peopleCapacity / peoplePerBench);
    const maxCols = 5;
    const currentCols = benchesCount > 1 ? maxCols : Math.max(1, Math.ceil(peopleCapacity / 2));

    let width = currentCols * 1.2 + 0.5;

    if (hasLockers && lockerCount > 0) {
        const LOCKERS_PER_UNIT = 4;
        const physicalLockerUnits = Math.ceil(lockerCount / LOCKERS_PER_UNIT);
        const unitsPerRowLimit = 10;
        const inOneRow = Math.min(physicalLockerUnits, unitsPerRowLimit);
        const gapM = inOneRow > 5 ? 0.9 : 0;
        const lockersWidth = (inOneRow * 0.6) + gapM + 0.6;
        width = Math.max(width, lockersWidth);
    }

    let baseHeight = benchesCount * 3.5 + 1.0;
    let extraHeight = 0;
    if (hasLockers && lockerCount > 0) {
        const LOCKERS_PER_UNIT = 4;
        const physicalLockerUnits = Math.ceil(lockerCount / LOCKERS_PER_UNIT);
        const unitPerRow = Math.max(1, Math.floor((width - 0.5) / 0.6));
        const lockerRows = Math.ceil(physicalLockerUnits / unitPerRow);
        extraHeight = lockerRows * 1.6;
    }

    return {
        width: parseFloat(width.toFixed(2)),
        height: parseFloat((baseHeight + extraHeight).toFixed(2))
    };
};

export const calculateSSHHDimensions = (peopleCapacity: number, type: 'unitary' | 'multiple') => {
    if (type === 'unitary') {
        const numBaths = Math.ceil(peopleCapacity / 10);
        const width = numBaths * 1.8 + 0.2;
        const height = 2.4;
        return { width: parseFloat(width.toFixed(2)), height };
    } else {
        const totalStalls = Math.max(2, Math.ceil(peopleCapacity / 20));
        const stallsPerGender = Math.ceil(totalStalls / 2);
        const width = Math.max(10, (stallsPerGender * 1.0) + 2.0);
        const height = 4.5;
        return { width: parseFloat(width.toFixed(2)), height };
    }
};

export const calculateReceptionDimensions = (pax: number) => {
    const width = pax <= 1 ? 5.5 : 6.5;
    return { width, height: 5.5 };
};

export const calculateLoungeDimensions = (pax: number) => {
    let width = 4.5;
    let height = 4.5;
    if (pax > 4) { width = 5.5; height = 5.0; }
    if (pax > 8) { width = 7.0; height = 6.0; }
    return { width, height };
};

export const calculateDiningDimensions = (pax: number, hasKitchenette: boolean) => {
    const physicalPax = Math.ceil(pax * 0.4);
    const paxPerTable = 6;
    const numTables = Math.max(1, Math.ceil(physicalPax / paxPerTable));
    const cols = numTables > 1 ? 2 : 1;
    const rows = Math.ceil(numTables / cols);
    const width = cols * 2.8 + 1.0;
    const counterH = hasKitchenette ? 1.0 : 0;
    const height = counterH + rows * 2.0 + 1.2;
    return {
        width: parseFloat(width.toFixed(2)),
        height: parseFloat(height.toFixed(2))
    };
};

export const getDimensionsForRoom = (room: Partial<RoomConfig>): { width: number, height: number } => {
    const type = room.type as RoomType;
    const capacity = room.capacity || 1;
    const template = ROOM_TEMPLATES[type];

    switch (type) {
        case RoomType.POOL:
            return calculatePoolDimensions(capacity, !!room.hasLockers, room.lockerCount || 0);
        case RoomType.SSHH:
            return calculateSSHHDimensions(capacity, room.sshhType || 'unitary');
        case RoomType.RECEPCION:
            return calculateReceptionDimensions(capacity);
        case RoomType.LOUNGE:
            return calculateLoungeDimensions(capacity);
        case RoomType.COMEDOR:
            return calculateDiningDimensions(capacity, !!room.hasKitchenette);
        default:
            return { width: template.width, height: template.height };
    }
};
