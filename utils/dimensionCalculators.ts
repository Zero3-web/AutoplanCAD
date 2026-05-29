import { RoomType } from '../types';

/**
 * Calculations for room dimensions based on capacity and specific configurations.
 * Extracted from Sidebar.tsx for better maintainability.
 */

// Pool Dimensions (Bench style: max 5 persons per side = 10 total per bench)
export const calculatePoolDimensions = (
    peopleCapacity: number,
    hasLockers: boolean,
    lockerCount: number,
    orientation: 'horizontal' | 'vertical' = 'horizontal',
    buildingWidth?: number,
    isHorizontal?: boolean
) => {
    const isVertical = orientation === 'vertical';
    const peoplePerBench = isVertical ? 6 : 10;
    const benchesCount = Math.ceil(peopleCapacity / peoplePerBench);

    let width = 0;
    let baseHeight = 0;

    if (!isVertical) {
        if (isHorizontal && buildingWidth) {
            // Multi-column logic: how many benches of 6.0m fit in buildingWidth
            const benchW_10 = 6.0; // 5 desks * 1.2m
            const hGap = 1.5;
            const effectiveW = buildingWidth - 1.0;
            const maxBenchesPerRow = Math.max(1, Math.floor((effectiveW + hGap) / (benchW_10 + hGap)));

            const rowsNeeded = Math.ceil(benchesCount / maxBenchesPerRow);
            const numInFirstRow = Math.min(maxBenchesPerRow, benchesCount);

            // Natural width based on content, allowing building to shrink
            width = numInFirstRow * benchW_10 + (numInFirstRow - 1) * hGap + 1.2;
            baseHeight = rowsNeeded * 3.2 + 1.2;
        } else {
            // Original single-column logic
            const totalPax = peopleCapacity;
            let maxColsForBench = 5;
            if (totalPax > 16) maxColsForBench = 8;
            if (totalPax > 30) maxColsForBench = 10;

            const currentCols = Math.min(maxColsForBench, Math.max(2, Math.ceil(totalPax / 2)));
            width = currentCols * 1.2 + 1.2;
            const rowsNeeded = Math.ceil(totalPax / (currentCols * 2));
            baseHeight = rowsNeeded * 4.0 + 1.5;
        }
    } else {
        // Vertical: Width depends on number of benches, Height on desks per row
        // Each vertical bench is approx 3.5m wide including chair space
        width = benchesCount * 3.5 + 1.0;
        const desksPerRow = Math.min(peopleCapacity, 3); // 3 rows max per vertical bench usually
        baseHeight = desksPerRow * 1.8 + 2.0;
    }

    if (hasLockers && lockerCount > 0) {
        const LOCKERS_PER_UNIT = 4;
        const physicalLockerUnits = Math.ceil(lockerCount / LOCKERS_PER_UNIT);
        const unitsPerRowLimit = 10;
        const inOneRow = Math.min(physicalLockerUnits, unitsPerRowLimit);
        const gapM = inOneRow > 5 ? 0.9 : 0;
        const lockersWidth = (inOneRow * 0.6) + gapM + 0.6;
        width = Math.max(width, lockersWidth);
    }

    let extraHeight = 0;
    let extraWidth = 0;

    if (hasLockers && lockerCount > 0) {
        const LOCKERS_PER_UNIT = 4;
        const physicalLockerUnits = Math.ceil(lockerCount / LOCKERS_PER_UNIT);

        if (isHorizontal && !isVertical) {
            // Place lockers on the right side.
            // A locker bank of 5 units = 3m length. We stack them side by side if > 5.
            const lockerCols = Math.ceil(physicalLockerUnits / 5);
            extraWidth = lockerCols * 1.5 + 1.0; // 1.5m per col, plus 1m spacing
            extraHeight = 0;
        } else {
            const lockerBankWidth = width - 0.5;
            const unitsPerRow = Math.max(1, Math.floor(lockerBankWidth / 0.6));
            const lockerRows = Math.ceil(physicalLockerUnits / unitsPerRow);
            extraHeight = lockerRows * 1.6;
        }
    }

    const totalHeight = baseHeight + extraHeight;
    return {
        width: parseFloat((width + extraWidth).toFixed(2)),
        height: parseFloat(totalHeight.toFixed(2))
    };
};

// SSHH (Restroom) Dimensions
export const calculateSSHHDimensions = (peopleCapacity: number, type: 'unitary' | 'multiple') => {
    if (type === 'unitary') {
        const numBaths = Math.ceil(peopleCapacity / 10);
        const width = numBaths * 1.8 + 0.2;
        const height = 2.4;
        return { width: parseFloat(width.toFixed(2)), height };
    } else {
        // Multiple bathroom: Split by men/women
        // User says minimum 5 stalls total (e.g., 3 and 2, but let's keep it even)
        // Let's go with 1 stall per 15 people per side, min 3 per side.
        const stallsPerGender = Math.max(3, Math.ceil(peopleCapacity / 20)); 
        const width = (stallsPerGender * 1.0) * 2; // Stall width is ~1.0m, double for two sides
        const height = 4.8; // Enough depth for stall + sink aisle
        return { width: parseFloat(width.toFixed(2)), height };
    }
};

export const calculateReceptionDimensions = (pax: number) => {
    const width = pax <= 1 ? 5.5 : 6.5;
    const height = 5.5;
    return { width, height };
};

export const calculateLoungeDimensions = (pax: number) => {
    let width = 4.5;
    let height = 4.5;

    if (pax > 4) {
        width = 5.5;
        height = 5.0;
    }
    if (pax > 8) {
        width = 7.0;
        height = 6.0;
    }
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

export const calculateReunionDimensions = (pax: number) => {
    // Standard: 6 pax = 4.5 x 3.5
    // 4 pax = 3.5 x 3.0
    // 8 pax = 5.5 x 3.5
    let width = 4.5;
    let height = 3.5;

    if (pax <= 4) {
        width = 3.5;
        height = 3.0;
    } else if (pax > 6) {
        width = 5.5;
        height = 3.5;
    }

    return { width, height };
};

export const calculateMeetboxDimensions = (pax: number) => {
    // 1-2 pax = 1.5 x 1.2
    // 3-4 pax = 2.0 x 1.8
    // 5-6 pax = 2.5 x 2.2
    let width = 1.5;
    let height = 1.2;

    if (pax > 2 && pax <= 4) {
        width = 2.2;
        height = 1.8;
    } else if (pax > 4) {
        width = 3.0;
        height = 2.2;
    }

    return { 
        width: parseFloat(width.toFixed(2)), 
        height: parseFloat(height.toFixed(2)) 
    };
};

export const calculateDirectorioDimensions = (pax: number) => {
    // Default 12 pax. Table + chairs = ~ 6.0 x 4.0
    // Every 2 pax adds 1.0 to length
    const width = 4.0 + Math.max(0, (pax - 8) / 2);
    const height = 4.0;
    return { width: parseFloat(width.toFixed(2)), height: parseFloat(height.toFixed(2)) };
};

export const calculateLockersDimensions = (pax: number) => {
    // 20 pax = ~ 3.0 x 4.0. Let's say every 10 pax requires a 2x1 block
    const physicalUnits = Math.ceil(pax / 10);
    const width = Math.max(2.0, physicalUnits * 1.5);
    const height = Math.max(3.0, physicalUnits > 2 ? 4.0 : 3.0);
    return { width, height };
};

export const calculateLactarioDimensions = (pax: number) => {
    // 1 pax = 2.0 x 2.0. Every extra pax adds 1.5 to width
    const width = 2.0 + Math.max(0, (pax - 1) * 1.5);
    return { width, height: 2.0 };
};
