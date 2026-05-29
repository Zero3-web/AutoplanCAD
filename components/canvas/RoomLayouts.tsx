import React from 'react';
import { RoomType } from '../../types';
import {
    Chair, DiningChair, VisitorChair, Toilet, ArmChair, Sofa,
    Person, Plant, Sink, DoorBottom, DoorVertical
} from './Furniture';

export const DeskAccessories: React.FC<{ seed: number, isBottom?: boolean }> = ({ seed, isBottom = false }) => {
    const hasMouse = (seed * 7) % 10 > 2;
    const hasPhone = (seed * 13) % 10 > 6;
    const hasCoffee = (seed * 17) % 10 > 7;
    const yFactor = isBottom ? -1 : 1;

    return (
        <g>
            {hasMouse && (
                <rect x="7" y={yFactor * 1} width="1.5" height="2.5" rx="0.8" fill="#444" stroke="black" strokeWidth="0.2" />
            )}
            {hasPhone && (
                <rect x="-10" y={yFactor * 0} width="3" height="5.5" rx="0.6" fill="#222" stroke="black" strokeWidth="0.2" />
            )}
            {hasCoffee && (
                <g transform={`translate(${(seed % 2 === 0 ? -9 : 9)}, ${yFactor * (seed % 3 === 0 ? -4 : -3)})`}>
                    <circle cx="0" cy="0" r="2.4" fill="white" stroke="black" strokeWidth="0.5" />
                    <circle cx="0" cy="0" r="1.8" fill="#6f4e37" />
                    <path d="M 2 -1 Q 3.5 -1 3.5 0 Q 3.5 1 2 1" fill="none" stroke="black" strokeWidth="0.5" />
                </g>
            )}
        </g>
    );
};

export const Desk: React.FC<{ x: number; y: number; w?: number; h?: number; seed?: number }> = ({ x, y, w = 30, h = 15, seed = 0 }) => (
    <g transform={`translate(${x}, ${y})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="3" stroke="black" strokeWidth="1.5" fill="white" />
        <rect x={-6} y={-h / 2 + 2} width="12" height="2" rx="0.5" fill="#111827" />
        <rect x={-5} y={-h / 2 + 2.5} width="10" height="1" fill="#60a5fa" opacity="0.4" />
        <rect x={-4} y={-h / 2 + 5} width="8" height="3" rx="0.5" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.3" />
        <DeskAccessories seed={seed || (x + y)} />
    </g>
);

export const LockerBank: React.FC<{ x: number; y: number; count: number }> = ({ x, y, count }) => {
    const safeCount = Math.max(0, count);
    if (safeCount === 0) return null;
    const UNIT_W = 12;
    const totalW = safeCount * UNIT_W;
    const depth = 11;

    return (
        <g transform={`translate(${x}, ${y})`}>
            <rect x="0" y="0" width={totalW} height={depth} fill="white" stroke="black" strokeWidth="1.2" />
            {Array.from({ length: safeCount }).map((_, i) => (
                <g key={i} transform={`translate(${i * UNIT_W}, 0)`}>
                    <line x1="0" y1="0" x2={UNIT_W} y2={depth} stroke="#ddd" strokeWidth="0.5" />
                    <line x1={UNIT_W} y1="0" x2="0" y2={depth} stroke="#ddd" strokeWidth="0.5" />
                    {i > 0 && <line x1="0" y1="0" x2="0" y2={depth} stroke="black" strokeWidth="0.8" />}
                    <line x1="0" y1={depth} x2={UNIT_W} y2={depth} stroke="black" strokeWidth="2.5" />
                </g>
            ))}
        </g>
    );
};

export const PhoneBoothLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => (
    <g>
        <line x1="0" y1={h * 0.33} x2={w} y2={h * 0.33} stroke="#e2e8f0" strokeWidth="0.5" />
        <line x1="0" y1={h * 0.66} x2={w} y2={h * 0.66} stroke="#e2e8f0" strokeWidth="0.5" />
        <rect x={w * 0.1} y="6" width={w * 0.8} height="7" fill="white" stroke="black" strokeWidth="0.8" rx="0.5" />
        <DiningChair x={w / 2} y={20} r={180} />
        <rect x={w / 2 - 5} y="7.5" width="7" height="4" fill="#94a3b8" rx="0.2" />
        <rect x={w / 2 - 5} y="7.5" width="7" height="0.5" fill="#475569" />
        <circle cx={w / 2 + 6} cy="9.5" r="1.5" fill="white" stroke="#60a5fa" strokeWidth="0.3" />
        <circle cx={w / 2 + 6} cy="9.5" r="1.1" fill="#6f4e37" />
    </g>
);

export const LoungeAccessories: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
        <rect x="-11" y="-6" width="22" height="12" rx="1" fill="#1a1a1a" stroke="#444" strokeWidth="0.5" />
        <circle cx="-6" cy="0" r="2.2" fill="white" stroke="#ccc" strokeWidth="0.3" />
        <circle cx="-6" cy="0" r="1.6" fill="#6f4e37" />
        <g transform="rotate(-8)">
            <rect x="1" y="-4" width="8" height="10" fill="white" stroke="#999" strokeWidth="0.2" />
            <rect x="2" y="-3" width="6" height="0.8" fill="#3b82f6" opacity="0.6" />
            <rect x="2" y="-1" width="6" height="0.4" fill="#eee" />
            <rect x="2" y="1" width="4" height="0.4" fill="#eee" />
        </g>
        <circle cx="7" cy="3" r="1.8" fill="#ddd" stroke="#999" strokeWidth="0.3" />
    </g>
);

export const MeetingTable: React.FC<{ w: number; h: number, capacity?: number, big?: boolean }> = ({ w, h, capacity, big = false }) => {
    const tableW = Math.max(20, w * 0.75);
    const tableH = Math.max(15, h * 0.40); 
    const effCap = capacity || (big ? 10 : 6);
    
    // Determine number of chairs on the ends (width-wise)
    // We add end chairs if the capacity is large enough or explicitly "big"
    const endChairsCount = (effCap > 6 || big) ? 2 : 0;
    const remainingCap = effCap - endChairsCount;
    const sidePeopleCount = Math.ceil(remainingCap / 2);
    
    // Safety check: if table is too narrow for sidePeopleCount, we might have collisions
    // But calculateReunionDimensions should provide enough room.

    return (
        <g transform={`translate(${w / 2}, ${h / 2})`}>
            {/* Top Side */}
            {Array.from({ length: sidePeopleCount }).map((_, i) => {
                const spacing = tableW / (sidePeopleCount + 1);
                return <Chair key={`t-${i}`} x={-tableW / 2 + spacing * (i + 1)} y={-tableH / 2 - 1.2} r={0} />;
            })}
            {/* Bottom Side (Handles odd remainingCap by placing fewer chairs if needed) */}
            {Array.from({ length: Math.floor(remainingCap / 2) }).map((_, i) => {
                const spacing = tableW / (sidePeopleCount + 1);
                // Center correctly if there are fewer chairs than the top side
                const offset = (sidePeopleCount > Math.floor(remainingCap / 2)) ? (tableW / (sidePeopleCount + 1)) / 2 : 0;
                return <Chair key={`b-${i}`} x={-tableW / 2 + spacing * (i + 1) + offset} y={tableH / 2 + 1.2} r={180} />;
            })}
            {/* End Chairs */}
            {endChairsCount > 0 && (
                <>
                    <Chair x={-tableW / 2 - 2.8} y={0} r={270} />
                    {/* Only add second end chair if total capacity allows it */}
                    {effCap >= (sidePeopleCount + Math.floor(remainingCap / 2) + 2) && (
                        <Chair x={tableW / 2 + 2.8} y={0} r={90} />
                    )}
                </>
            )}
            <rect x={-tableW / 2 + 1} y={-tableH / 2 + 1} width={tableW} height={tableH} rx="8" fill="black" opacity="0.05" />
            <rect x={-tableW / 2} y={-tableH / 2} width={tableW} height={tableH} rx="8" stroke="black" strokeWidth="1.5" fill="white" />
            <rect x={-tableW * 0.25} y="-1" width={tableW * 0.5} height="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" rx="0.3" />
        </g>
    );
};

export const OfficeLayout: React.FC<{ w: number; h: number, executive?: boolean }> = ({ w, h, executive = false }) => {
    const deskW = executive ? 42 : 30;
    const deskH = executive ? 18 : 15;
    const cx = w / 2;
    const cy = h / 2;

    return (
        <g>
            {executive && (
                <rect x={w * 0.12} y={h * 0.12} width={w * 0.76} height={h * 0.76} rx="4" fill="#fcfcfc" stroke="#f0f0f0" strokeWidth="0.5" />
            )}
            <g transform={`translate(${cx}, ${cy})`}>
                <rect x={-deskW / 2} y={-deskH / 2} width={deskW} height={deskH} rx="1" stroke="black" strokeWidth="1.2" fill="white" />
                <g transform={`translate(0, ${-deskH / 2 + 4})`}>
                    <rect x="-8.5" y="1" width="17" height="7" rx="1" fill="#f3f4f6" stroke="#4b5563" strokeWidth="0.5" />
                    <rect x="-7" y="2" width="14" height="4" rx="0.5" fill="#d1d5db" opacity="0.5" />
                    <rect x="-1.5" y="6.5" width="3" height="1" rx="0.2" fill="#9ca3af" />
                    <rect x="-8" y="-1" width="16" height="2" rx="0.5" fill="#111827" />
                    <rect x="-7" y="-0.5" width="14" height="1" fill="#3b82f6" opacity="0.5" />
                </g>
                <DeskAccessories seed={123} />
            </g>
            <Chair x={cx} y={cy + deskH / 2 + 6} r={180} /> {/* Closer to desk (was +8) */}
            {executive && (
                <g transform={`translate(${cx - deskW / 2 - 10}, ${cy - 5})`}>
                    <rect x="-4" y="-12" width="8" height="28" fill="white" stroke="#aaa" strokeWidth="0.5" rx="0.5" />
                    <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#eee" strokeWidth="0.5" />
                    <line x1="-4" y1="8" x2="4" y2="8" stroke="#eee" strokeWidth="0.5" />
                </g>
            )}
            {(executive || w > 60) && (
                <g>
                    <VisitorChair x={cx - 12} y={cy - deskH / 2 - 6} r={0} /> {/* Closer to desk (was -8) */}
                    <VisitorChair x={cx + 12} y={cy - deskH / 2 - 6} r={0} />
                </g>
            )}
            {executive && <Plant x={w - 12} y={15} />}
        </g>
    );
};

export const KitchenLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => {
    const counterDepth = 12;
    return (
        <g>
            <path
                d={`M 0 6 L ${w - 6} 6 L ${w - 6} ${counterDepth + 6} L ${counterDepth + 6} ${counterDepth + 6} L ${counterDepth + 6} ${h - 6} L 0 ${h - 6} Z`}
                fill="white"
                stroke="black"
                strokeWidth="1"
            />
            <g transform={`translate(${(w - 6) / 2}, ${counterDepth / 2 + 6})`}>
                <rect x="-7" y="-5" width="14" height="10" fill="#eee" stroke="none" />
                <circle cx="-3" cy="-2" r="1.5" fill="#333" />
                <circle cx="3" cy="-2" r="1.5" fill="#333" />
                <circle cx="-3" cy="2" r="1.5" fill="#333" />
                <circle cx="3" cy="2" r="1.5" fill="#333" />
            </g>
            <g transform={`translate(${counterDepth / 2 + 6}, ${(h - 6) / 2})`}>
                <rect x="-4" y="-6" width="8" height="12" fill="white" stroke="black" rx="1" />
                <circle cx="0" cy="0" r="1" fill="black" />
                <line x1="-4" y1="0" x2="-6" y2="0" stroke="black" strokeWidth="1.5" />
                <rect x="-5" y="-1" width="2" height="2" fill="black" />
            </g>
            <line x1={counterDepth + 6} y1={6} x2={w - 6} y2={6} stroke="black" strokeWidth="2" />
        </g>
    );
};

export const ReceptionLayout: React.FC<{ w: number; h: number; capacity?: number; loungeCapacity?: number }> = ({ w, h, capacity, loungeCapacity }) => {
    const isMerged = !!loungeCapacity;
    const deskCX = isMerged ? w * 0.28 : w / 2;
    const loungeCX = isMerged ? w * 0.72 : w / 2;
    const deskY = 12;

    return (
        <g>
            {/* Reception Desk Cluster */}
            <g transform={`translate(${deskCX}, ${h / 2 - 15})`}>
                <g transform="translate(0, -20)">
                    <rect x="-25" y="0" width="50" height="6" fill="#fcfcfc" stroke="#aaa" strokeWidth="0.5" rx="0.5" />
                    <line x1="-8.3" y1="0.5" x2="-8.3" y2="5.5" stroke="#eee" strokeWidth="0.5" />
                    <line x1="8.3" y1="0.5" x2="8.3" y2="5.5" stroke="#eee" strokeWidth="0.5" />
                </g>
                <g>
                    <path d="M -35 0 L -35 15 A 10 10 0 0 0 -25 25 L 25 25 A 10 10 0 0 0 35 15 L 35 0" fill="white" stroke="black" strokeWidth="2" />
                    <path d="M -29 -4 L -29 12 A 8 8 0 0 0 -21 20 L 21 20 A 8 8 0 0 0 29 12 L 29 -4" fill="#2d2d2d" />
                    <rect x="-6" y="14" width="12" height="3" fill="black" rx="0.5" />
                    <Chair x={0} y={1} r={180} />
                    <Person x={0} y={1} r={180} />
                </g>
            </g>

            {isMerged && (
                /* Lounge / Waiting Cluster */
                <g transform={`translate(${loungeCX}, ${h / 2})`}>
                    {/* Area Rug */}
                    <rect x="-55" y="-45" width="110" height="90" rx="4" fill="#f8f8f8" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.8" />
                    <rect x="-18" y="-9" width="36" height="18" fill="#111" rx="1" stroke="#333" strokeWidth="0.5" />
                    <LoungeAccessories x={0} y={0} />

                    <ArmChair x={-42} y={0} r={270} />
                    <ArmChair x={42} y={0} r={90} />
                    <Sofa x={0} y={-35} w={70} h={18} r={0} />
                    <Sofa x={0} y={35} w={70} h={18} r={180} />
                </g>
            )}

            {/* Cleaned up Plant Placement */}
            <Plant x={15} y={15} />
            <Plant x={w - 15} y={h - 15} />
        </g>
    );
};

export const LoungeLayout: React.FC<{ w: number; h: number; capacity?: number }> = ({ w, h, capacity }) => {
    const cx = w / 2;
    const cy = h / 2;
    const pax = capacity || 4;

    return (
        <g>
            <rect x="0" y="0" width={w} height={h} fill="#f8fafc" opacity="0.1" />
            <g transform={`translate(${cx}, ${cy})`}>
                <rect x="-45" y="-45" width="90" height="90" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="0.5" opacity="0.6" />
                <rect x="-18" y="-9" width="36" height="18" fill="#111" rx="1" stroke="#333" strokeWidth="0.5" />
                <LoungeAccessories x={0} y={0} />
                {pax <= 4 ? (
                    <>
                        <ArmChair x={-38} y={0} r={90} />
                        <ArmChair x={38} y={0} r={270} />
                        <Sofa x={0} y={32} w={65} h={18} r={180} />
                        <Sofa x={0} y={-32} w={65} h={18} r={0} />
                    </>
                ) : (
                    <g>
                        {Array.from({ length: Math.min(pax, 12) }).map((_, i) => {
                            const count = Math.min(pax, 12);
                            const angle = (i * 360) / count;
                            const rad = (angle * Math.PI) / 180;
                            // Reduce radius slightly for small rooms
                            const dist = Math.min(42, w/2.5, h/2.5);
                            const sx = Math.cos(rad) * dist;
                            const sy = Math.sin(rad) * dist;
                            return <ArmChair key={i} x={sx} y={sy} r={angle + 90} />;
                        })}
                    </g>
                )}
            </g>
            <Plant x={12} y={12} />
            <Plant x={w - 12} y={h - 12} />
        </g>
    );
};

export const LockerRow: React.FC<{ w: number; count: number }> = ({ w, count }) => {
    const UNIT_W = 12;
    const GAP_W = 18;
    const startX = 5;

    if (count > 5) {
        const part1 = Math.ceil(count / 2);
        const part2 = count - part1;
        const rowW = (count * UNIT_W) + GAP_W;
        const gapX = startX + (part1 * UNIT_W);
        return (
            <g>
                <LockerBank x={startX} y={2} count={part1} />
                <LockerBank x={gapX + GAP_W} y={2} count={part2} />
                <line x1={gapX + 2} y1={2} x2={gapX + 2} y2={13} stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1={gapX + GAP_W - 2} y1={2} x2={gapX + GAP_W - 2} y2={13} stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1={startX} y1={22} x2={startX + rowW} y2={22} stroke="#ccc" strokeWidth="0.5" strokeDasharray="3,3" />
                <rect x={startX + rowW / 2 - 40} y={24} width="80" height="8" fill="white" opacity="0.85" rx="1" />
                <text x={startX + rowW / 2} y={30} fontSize="5" textAnchor="middle" fill="#999" fontStyle="italic" fontFamily="Arial">PASILLO Y PASO VERTICAL</text>
            </g>
        );
    }
    const rowW = count * UNIT_W;
    return (
        <g>
            <LockerBank x={startX} y={7} count={count} />
            <line x1={startX} y1={27} x2={startX + rowW} y2={27} stroke="#ccc" strokeWidth="0.5" strokeDasharray="3,3" />
            <rect x={startX + rowW / 2 - 20} y={29} width="40" height="8" fill="white" opacity="0.85" rx="1" />
            <text x={startX + rowW / 2} y={35} fontSize="5" textAnchor="middle" fill="#999" fontStyle="italic" fontFamily="Arial">PASILLO</text>
        </g>
    )
}

export const OpenSpaceLayout: React.FC<{
    w: number;
    h: number;
    capacity?: number;
    hasLockers?: boolean;
    lockerCount?: number;
    showLabels?: boolean;
    poolOrientation?: 'horizontal' | 'vertical'
}> = ({ w, h, capacity, hasLockers, lockerCount, showLabels = true, poolOrientation = 'horizontal' }) => {
    const isVertical = poolOrientation === 'vertical';
    const deskW = isVertical ? 15 : 24;
    const deskD = isVertical ? 24 : 12;
    const chairSpace = 10;
    const aisleSpace = 15;
    const LOCKERS_PER_UNIT = 4;
    const physicalLockerCount = Math.ceil((lockerCount || 0) / LOCKERS_PER_UNIT);
    let lockerRows = 0;
    let placeLockersOnSide = false;

    if (hasLockers && physicalLockerCount > 0) {
        if (!isVertical && h <= 150 && w > 140) { // Indicates horizontal layout proportion
            placeLockersOnSide = true;
        } else {
            const bankW = w - 10;
            const unitsPerRow = Math.max(1, Math.floor((bankW - 18) / 12));
            lockerRows = Math.ceil(physicalLockerCount / unitsPerRow);
        }
    }

    const lockerAreaHeight = (!placeLockersOnSide && lockerRows > 0) ? lockerRows * 30 + 5 : 0;
    const lockerElements = [];

    if (hasLockers && physicalLockerCount > 0) {
        if (placeLockersOnSide) {
            // Lockers on the right side, rotated
            const lockerCols = Math.ceil(physicalLockerCount / 5);
            let remainingUnits = physicalLockerCount;
            // Place lockers at w - 15 - cols * 15
            const baseStartX = w - 15 - lockerCols * 15;
            for (let c = 0; c < lockerCols; c++) {
                const unitsInCol = Math.min(remainingUnits, 5);
                lockerElements.push(
                    <g key={`l-side-${c}`} transform={`translate(${baseStartX + c * 15}, 15)`}>
                        <g transform="rotate(90, 0, 0)">
                            <LockerBank x={0} y={0} count={unitsInCol} />
                        </g>
                    </g>
                );
                remainingUnits -= unitsInCol;
            }
            if (showLabels) {
                // Shift further left to avoid overlapping the bank (depth is 11)
                const labelX = baseStartX - 25; 
                const labelY = 15 + (Math.min(5, physicalLockerCount) * 12) / 2;
                lockerElements.push(
                    <text 
                        key="l-txt" 
                        x={labelX} 
                        y={labelY} 
                        fontSize="5" 
                        textAnchor="middle" 
                        fill="#666" 
                        letterSpacing="0.5" 
                        fontWeight="bold" 
                        transform={`rotate(-90, ${labelX}, ${labelY})`}
                    >
                        CASILLEROS ({lockerCount})
                    </text>
                );
            }

        } else {
            let remainingUnits = physicalLockerCount;
            const bankW = w - 10;
            const unitsPerRow = Math.max(1, Math.floor((bankW - 18) / 12));
            for (let i = 0; i < lockerRows; i++) {
                const inThisRow = Math.min(remainingUnits, unitsPerRow);
                lockerElements.push(<g key={`l-${i}`} transform={`translate(0, ${i * 32})`}><LockerRow w={w} count={inThisRow} /></g>);
                remainingUnits -= inThisRow;
            }
            if (showLabels) {
                lockerElements.push(<text key="l-txt" x={w / 2} y={lockerAreaHeight - 5} fontSize="6" textAnchor="middle" fill="#555" letterSpacing="1" fontWeight="bold">CASILLEROS ({lockerCount})</text>)
            }
        }
    }
    const maxCapacity = capacity || 10;
    const peoplePerBench = isVertical ? 6 : 10;
    const numBenchesToRender = Math.ceil(maxCapacity / peoplePerBench);
    const benchTotalH = isVertical ? 0 : (deskD * 2 + 2) + (chairSpace * 2);
    const benches = [];
    let remainingPeople = maxCapacity;

    if (!isVertical) {
        // Multi-column grid logic for horizontal benches
        const benchW_10 = 5 * deskW; // Standard 10-person bench width
        const hGap = 30; // Horizontal gap between benches
        const maxBenchesPerRow = Math.max(1, Math.floor((w + hGap) / (benchW_10 + hGap)));
        const numRows = Math.ceil(numBenchesToRender / maxBenchesPerRow);
        const contentH = lockerAreaHeight + 10 + numRows * benchTotalH + (numRows - 1) * aisleSpace;
        const vOffset = Math.max(0, (h - contentH) / 2);

        for (let b = 0; b < numBenchesToRender; b++) {
            const inThisBench = Math.min(peoplePerBench, remainingPeople);
            remainingPeople -= inThisBench;

            const bCols = Math.max(1, Math.ceil(inThisBench / 2));
            const bW = bCols * deskW;

            const row = Math.floor(b / maxBenchesPerRow);
            const col = b % maxBenchesPerRow;

            // Center the entire row of benches
            const numInThisRow = Math.min(maxBenchesPerRow, numBenchesToRender - row * maxBenchesPerRow);
            const rowTotalW = numInThisRow * benchW_10 + (numInThisRow - 1) * hGap;
            const availableW = placeLockersOnSide ? (w - (Math.ceil(physicalLockerCount / 5) * 15 + 20)) : w;
            const startX = (availableW - rowTotalW) / 2;

            const bX = startX + col * (benchW_10 + hGap);
            const bY = vOffset + lockerAreaHeight + row * (benchTotalH + aisleSpace);

            const chairs = [];
            const deskStuff = [];
            let rowCount = 0;
            for (let c = 0; c < bCols; c++) {
                if (rowCount < inThisBench) {
                    const tx = c * deskW + deskW / 2;
                    const ty = chairSpace + deskD / 2;
                    chairs.push(
                        <g key={`chair-top-${c}`} transform={`translate(${tx}, ${ty})`}>
                            <Chair x={0} y={-8} r={0} />
                        </g>
                    );
                    deskStuff.push(
                        <g key={`stuff-top-${c}`} transform={`translate(${tx}, ${ty})`}>
                            <rect x="-6" y="-3" width="12" height="1" rx="0.5" fill="#333" opacity="0.8" />
                            <rect x="-4" y="-1" width="8" height="5" rx="1" fill="#f0f0f0" stroke="black" strokeWidth="0.5" />
                            <rect x="-2" y="1" width="4" height="2" fill="#ddd" rx="0.5" />
                            <DeskAccessories seed={b * 13 + c * 7} />
                        </g>
                    );
                    rowCount++;
                }
                if (rowCount < inThisBench) {
                    const bx = c * deskW + deskW / 2;
                    const by = chairSpace + deskD + 2 + deskD / 2;
                    chairs.push(
                        <g key={`chair-bot-${c}`} transform={`translate(${bx}, ${by})`}>
                            <Chair x={0} y={8} r={180} />
                        </g>
                    );
                    deskStuff.push(
                        <g key={`stuff-bot-${c}`} transform={`translate(${bx}, ${by})`}>
                            <rect x="-4" y="-4" width="8" height="5" rx="1" fill="#f0f0f0" stroke="black" strokeWidth="0.5" />
                            <rect x="-2" y="-3" width="4" height="2" fill="#ddd" rx="0.5" />
                            <rect x="-6" y="2" width="12" height="1" rx="0.5" fill="#333" opacity="0.8" />
                            <DeskAccessories seed={b * 17 + c * 11} isBottom={true} />
                        </g>
                    );
                    rowCount++;
                }
            }

            benches.push(
                <g key={`bench-${b}`} transform={`translate(${bX}, ${bY})`}>
                    {chairs}
                    <rect x="0" y={chairSpace} width={bW} height={deskD * 2 + 2} rx="4" fill="#ffffff" stroke="black" strokeWidth="1" />
                    <rect x="0" y={chairSpace + deskD} width={bW} height="2" fill="#ff6b00" />
                    {deskStuff}
                </g>
            );
        }
    } else {
        // Vertical Orientation (Desks facing left/right)
        const benchW = (deskD * 2 + 2) + (chairSpace * 2);
        const rowSpacing = 20;
        for (let b = 0; b < numBenchesToRender; b++) {
            const inThisBench = Math.min(peoplePerBench, remainingPeople);
            remainingPeople -= inThisBench;
            const bRows = Math.max(1, Math.ceil(inThisBench / 2));
            const bH = bRows * rowSpacing;

            // Layout benches side-by-side
            const totalWidthOfBenches = numBenchesToRender * benchW + (numBenchesToRender - 1) * aisleSpace;
            const bX = (w - totalWidthOfBenches) / 2 + b * (benchW + aisleSpace);
            const bY = lockerAreaHeight + 15;

            const deskItems = [];
            let rowCount = 0;
            for (let r = 0; r < bRows; r++) {
                if (rowCount < inThisBench) {
                    deskItems.push(
                        <g key={`c-left-${r}`} transform={`translate(${chairSpace + deskD / 2}, ${r * rowSpacing + rowSpacing / 2})`}>
                            <Chair x={-8} y={0} r={270} />
                            <rect x="-3" y="-6" width="1" height="12" rx="0.5" fill="#333" opacity="0.8" />
                            <rect x="-1" y="-4" width="5" height="8" rx="1" fill="#f0f0f0" stroke="black" strokeWidth="0.5" />
                            <rect x="1" y="-2" width="2" height="4" fill="#ddd" rx="0.5" />
                        </g>
                    );
                    rowCount++;
                }
                if (rowCount < inThisBench) {
                    deskItems.push(
                        <g key={`c-right-${r}`} transform={`translate(${chairSpace + deskD + 2 + deskD / 2}, ${r * rowSpacing + rowSpacing / 2})`}>
                            <Chair x={8} y={0} r={90} />
                            <rect x="2" y="-6" width="1" height="12" rx="0.5" fill="#333" opacity="0.8" />
                            <rect x="-4" y="-4" width="5" height="8" rx="1" fill="#f0f0f0" stroke="black" strokeWidth="0.5" />
                            <rect x="-3" y="-2" width="2" height="4" fill="#ddd" rx="0.5" />
                        </g>
                    );
                    rowCount++;
                }
            }

            benches.push(
                <g key={`bench-v-${b}`} transform={`translate(${bX}, ${bY})`}>
                    <rect x={chairSpace} y="0" width={deskD * 2 + 2} height={bH} rx="4" fill="#ffffff" stroke="black" strokeWidth="1" />
                    <rect x={chairSpace + deskD} y="0" width="2" height={bH} fill="#ff6b00" />
                    {deskItems}
                </g>
            );
        }
    }
    return <g>{lockerElements}{benches}</g>;
};

export const DiningLayout: React.FC<{ w: number; h: number; capacity?: number; hasKitchenette?: boolean }> = ({ w, h, capacity = 10, hasKitchenette = false }) => {
    const pax = capacity;
    const tableW = 45;
    const tableH = 18;
    const aisleH = 25;
    const counterDepth = 12;

    return (
        <g>
            {hasKitchenette && (
                <g transform="translate(0, 7)">
                    <rect x="0" y="0" width={w} height={counterDepth} fill="white" stroke="black" strokeWidth="1.2" />
                    <g transform={`translate(${w * 0.15}, ${counterDepth / 2})`}><rect x="-8" y="-4.5" width="16" height="9" rx="0.5" fill="white" stroke="black" strokeWidth="0.8" /><rect x="-7" y="-4" width="3" height="1" fill="#444" /><rect x="-7" y="3" width="3" height="1" fill="#444" /></g>
                    <g transform={`translate(${w * 0.45}, ${counterDepth / 2})`}><rect x="-6" y="-4" width="12" height="8" rx="0.5" fill="white" stroke="black" strokeWidth="0.8" /><rect x="2" y="-3" width="3" height="6" fill="#eee" /><rect x="-5" y="-3" width="6.5" height="5" fill="#333" opacity="0.1" /></g>
                    <g transform={`translate(${w * 0.65}, ${counterDepth / 2})`}><rect x="-5" y="-4" width="10" height="8" rx="1" fill="white" stroke="black" strokeWidth="0.8" /><circle cx="0" cy="0" r="2.5" fill="none" stroke="#ccc" strokeWidth="0.5" /><rect x="-2" y="1" width="4" height="2" rx="0.5" fill="#333" /></g>
                    <g transform={`translate(${w * 0.85}, ${counterDepth / 2})`}><rect x="-7" y="-5" width="14" height="10" rx="0.5" fill="white" stroke="black" strokeWidth="1" /><line x1="0" y1="-5" x2="0" y2="5" stroke="black" strokeWidth="0.5" /><rect x="-2" y="-2" width="1" height="4" fill="black" /><rect x="1" y="-2" width="1" height="4" fill="black" /></g>
                    {Array.from({ length: Math.floor(w / 30) }).map((_, i) => (<line key={i} x1={i * 30} y1="0" x2={i * 30} y2={counterDepth} stroke="#ccc" strokeWidth="0.5" />))}
                </g>
            )}
            {(() => {
                const tables = [];
                const paxPerTable = 6;
                const numTablesNeeded = Math.ceil(pax / paxPerTable);
                const startY = (hasKitchenette ? counterDepth : 0) + aisleH;
                const rows = Math.ceil(numTablesNeeded / 2);
                let assigned = 0;
                
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < 2; c++) {
                        if (assigned >= numTablesNeeded) break;
                        const dx = (w / 2) * (c + 0.5) - tableW / 2;
                        const dy = startY + r * (tableH + 20);
                        if (dy + tableH + 10 > h) continue;
                        
                        const chairsInThisTable = Math.min(6, pax - assigned * 6);
                        const topChairs = Math.ceil(chairsInThisTable / 2);
                        const bottomChairs = chairsInThisTable - topChairs;

                        tables.push(
                            <g key={`${r}-${c}`} transform={`translate(${dx}, ${dy})`}>
                                {Array.from({ length: topChairs }).map((_, i) => (
                                    <DiningChair key={`t-${i}`} x={(tableW / (topChairs + 1)) * (i + 1)} y={0} r={0} />
                                ))}
                                {Array.from({ length: bottomChairs }).map((_, i) => (
                                    <DiningChair key={`b-${i}`} x={(tableW / (bottomChairs + 1)) * (i + 1)} y={tableH} r={180} />
                                ))}
                                <rect x="0" y="0" width={tableW} height={tableH} fill="white" stroke="black" strokeWidth="1.2" rx="1.5" />
                                <rect x={tableW * 0.2} y={tableH * 0.3} width={tableW * 0.6} height={tableH * 0.4} fill="#f8fafc" opacity="0.5" rx="0.5" />
                            </g>
                        );
                        assigned++;
                    }
                }
                return tables;
            })()}
            <Plant x={10} y={h - 10} />
        </g>
    );
};

export const LockerLayout: React.FC<{ w: number; h: number; capacity?: number }> = ({ w, h, capacity }) => {
    const rowHeight = 30;
    const rows = Math.max(1, Math.floor(h / rowHeight));
    const banks = [];
    let remaining = capacity || 9999;
    for (let r = 0; r < rows; r++) {
        if (remaining <= 0) break;
        const yPos = (h / (rows + 1)) * (r + 1);
        const bankW = w - 10;
        const maxInRow = Math.floor(bankW / 8);
        const count = Math.min(remaining, maxInRow);
        if (count > 0) {
            banks.push(<g key={r} transform={`translate(5, ${yPos - 6})`}><LockerBank x={0} y={0} count={count} /><line x1={0} y1={15} x2={count * 12} y2={15} stroke="black" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" /></g>);
        }
        remaining -= count;
    }
    return <g>{banks}</g>;
};

export const DatacenterLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => {
    const rackSize = 12;
    const spacing = 4;
    const cols = Math.min(3, Math.floor((w - 8) / (rackSize + spacing)));
    const topMargin = 8;
    return (
        <g>
            <g transform={`translate(${(w - (cols * (rackSize + spacing) - spacing)) / 2}, ${topMargin})`}>
                {Array.from({ length: Math.max(1, cols) }).map((_, c) => (
                    <g key={c} transform={`translate(${c * (rackSize + spacing)}, 0)`}>
                        <rect x="0" y="0" width={rackSize} height={rackSize} fill="#1e293b" stroke="black" strokeWidth="1" />
                        <rect x="1.5" y="2" width={rackSize - 3} height={1.5} fill="#334155" />
                        <rect x="1.5" y="4.5" width={rackSize - 3} height={1.5} fill="#334155" />
                        <rect x="1.5" y="7" width={rackSize - 3} height={1.5} fill="#334155" />
                        <circle cx={rackSize - 2.5} cy={rackSize - 2.5} r="0.8" fill="#10b981" />
                    </g>
                ))}
            </g>
            <g transform={`translate(0, ${h * 0.6})`}><rect x="0" y="0" width="3" height="15" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" /><line x1="1" y1="3" x2="2.5" y2="3" stroke="#cbd5e1" strokeWidth="0.3" /><line x1="1" y1="12" x2="2.5" y2="12" stroke="#cbd5e1" strokeWidth="0.3" /></g>
        </g>
    );
};

export const StorageLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => {
    const shelfD = 9;
    return (
        <g>
            <g transform="translate(0, 7)">
                <rect x="0" y="0" width={w} height={shelfD} fill="white" stroke="black" strokeWidth="1" />
                {Array.from({ length: Math.floor(w / 15) }).map((_, i) => (
                    <g key={`t-${i}`} transform={`translate(${i * 15}, 0)`}>
                        <line x1="0" y1="0" x2="0" y2={shelfD} stroke="#ccc" strokeWidth="0.5" />
                        <rect x="2" y="1" width="11" height={shelfD - 2} fill="#e2e8f0" rx="0.5" />
                        <line x1="2" y1="1" x2="13" y2={shelfD - 1} stroke="#94a3b8" strokeWidth="0.3" opacity="0.3" />
                    </g>
                ))}
            </g>
            <g transform={`translate(0, ${shelfD + 7})`}><rect x="0" y="0" width={shelfD} height={Math.max(0, h - shelfD - 25)} fill="white" stroke="black" strokeWidth="1" />{Array.from({ length: Math.floor(Math.max(0, h - shelfD - 25) / 15) }).map((_, i) => (<g key={`l-${i}`} transform={`translate(0, ${i * 15})`}><line x1="0" y1="0" x2={shelfD} y2="0" stroke="#ccc" strokeWidth="0.5" /><rect x="1" y="2" width={shelfD - 2} height="11" fill="#cbd5e1" rx="0.5" /></g>))}</g>
            <g transform={`translate(${w - shelfD}, ${shelfD + 7})`}><rect x="0" y="0" width={shelfD} height={Math.max(0, h - shelfD - 25)} fill="white" stroke="black" strokeWidth="1" />{Array.from({ length: Math.floor(Math.max(0, h - shelfD - 25) / 15) }).map((_, i) => (<g key={`r-${i}`} transform={`translate(0, ${i * 15})`}><line x1="0" y1="0" x2={shelfD} y2="0" stroke="#ccc" strokeWidth="0.5" /><rect x="1" y="2" width={shelfD - 2} height="11" fill="#cbd5e1" rx="0.5" /></g>))}</g>
        </g>
    );
};

export const SSHHLayout: React.FC<{ w: number; h: number; capacity?: number; type?: 'unitary' | 'multiple'; showLabels?: boolean }> = ({ w, h, capacity, type = 'unitary', showLabels = true }) => {
    const people = capacity || 10;
    if (type === 'unitary') {
        const minBathW = 32;
        const idealBathCount = Math.max(1, Math.ceil(people / 10));
        const bathCount = Math.max(1, Math.min(idealBathCount, Math.floor(w / minBathW)));
        const actualBathW = w / bathCount;
        return (
            <g>
                {Array.from({ length: bathCount }).map((_, i) => (
                    <g key={i} transform={`translate(${i * actualBathW}, 7)`}>
                        <Toilet x={actualBathW / 2} y={12} />
                        <Sink x={actualBathW - 10} y={h - 22} r={180} />
                        {i > 0 && <line x1="0" y1="0" x2="0" y2={h - 7} stroke="black" strokeWidth="1.2" />}
                    </g>
                ))}
            </g>
        );
    } else {
        const sc = Math.max(3, Math.ceil(people / 20)); // stalls per side
        const sectionW = w / 2;
        const actualStallW = sectionW / sc;
        const stallD = 32;
        const doorSize = 10;
        
        return (
            <g>
                {/* Central Partition */}
                <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="black" strokeWidth="2" />
                
                {showLabels && (
                    <g opacity="0.6">
                        <text x={w * 0.25} y={h - 2} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569">DAMAS</text>
                        <text x={w * 0.75} y={h - 2} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569">VARONES</text>
                    </g>
                )}

                {/* DAMAS Stalls */}
                {Array.from({ length: sc }).map((_, i) => (
                    <g key={`w-${i}`} transform={`translate(${i * actualStallW}, 7)`}>
                        <line x1="0" y1="0" x2={actualStallW} y2="0" stroke="black" strokeWidth="1.2" />
                        <line x1="0" y1="0" x2="0" y2={stallD} stroke="black" strokeWidth="1.2" />
                        <line x1={actualStallW} y1="0" x2={actualStallW} y2={stallD} stroke="black" strokeWidth="1.2" />
                        <Toilet x={actualStallW / 2} y={11} />
                        <g transform={`translate(0, ${stallD})`}>
                            <line x1="0" y1="0" x2="4" y2="0" stroke="black" strokeWidth="1.2" />
                            <g transform="translate(4, 0)">
                                <circle cx="0" cy="0" r="0.6" fill="black" />
                                <line x1="0" y1="0" x2="0" y2={-doorSize} stroke="black" strokeWidth="1" />
                                <path d={`M 0 -${doorSize} A ${doorSize} ${doorSize} 0 0 1 ${doorSize} 0`} fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
                            </g>
                            <line x1={4 + doorSize} y1="0" x2={actualStallW} y2="0" stroke="black" strokeWidth="1.2" />
                        </g>
                    </g>
                ))}

                {/* VARONES Stalls */}
                {Array.from({ length: sc }).map((_, i) => (
                    <g key={`m-${i}`} transform={`translate(${sectionW + i * actualStallW}, 7)`}>
                        <line x1="0" y1="0" x2={actualStallW} y2="0" stroke="black" strokeWidth="1.2" />
                        <line x1="0" y1="0" x2="0" y2={stallD} stroke="black" strokeWidth="1.2" />
                        <line x1={actualStallW} y1="0" x2={actualStallW} y2={stallD} stroke="black" strokeWidth="1.2" />
                        <Toilet x={actualStallW / 2} y={11} />
                        <g transform={`translate(0, ${stallD})`}>
                            <line x1="0" y1="0" x2="4" y2="0" stroke="black" strokeWidth="1.2" />
                            <g transform="translate(4, 0)">
                                <circle cx="0" cy="0" r="0.6" fill="black" />
                                <line x1="0" y1="0" x2="0" y2={-doorSize} stroke="black" strokeWidth="1" />
                                <path d={`M 0 -${doorSize} A ${doorSize} ${doorSize} 0 0 1 ${doorSize} 0`} fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
                            </g>
                            <line x1={4 + doorSize} y1="0" x2={actualStallW} y2="0" stroke="black" strokeWidth="1.2" />
                        </g>
                    </g>
                ))}

                {/* Sinks (1 per Toilet) */}
                {(() => {
                    const vanityH = 12;
                    const sinkSpacing = sectionW / sc;
                    
                    return (
                        <g>
                            {/* DAMAS Sinks */}
                            <g transform={`translate(2, ${h - vanityH})`}>
                                <rect x="0" y="0" width={sectionW - 4} height={vanityH} fill="white" stroke="black" strokeWidth="1" />
                                {Array.from({ length: sc }).map((_, i) => (
                                    <g key={`ws-${i}`} transform={`translate(${sinkSpacing * (i + 0.5) - 2}, 6)`}>
                                        <Sink x={0} y={0} r={270} />
                                    </g>
                                ))}
                            </g>
                            {/* VARONES Sinks */}
                            <g transform={`translate(${sectionW + 2}, ${h - vanityH})`}>
                                <rect x="0" y="0" width={sectionW - 4} height={vanityH} fill="white" stroke="black" strokeWidth="1" />
                                {Array.from({ length: sc }).map((_, i) => (
                                    <g key={`ms-${i}`} transform={`translate(${sinkSpacing * (i + 0.5) - 2}, 6)`}>
                                        <Sink x={0} y={0} r={270} />
                                    </g>
                                ))}
                            </g>
                        </g>
                    );
                })()}
            </g>
        );
    }
};

export const MeetingLayout: React.FC<{ w: number; h: number, capacity?: number }> = ({ w, h, capacity }) => (
    <g>
        {/* Whiteboard/Screen on Top Wall */}
        <rect x={w / 2 - 15} y="8" width="30" height="1.5" fill="white" stroke="black" strokeWidth="0.8" />
        <rect x={w / 2 - 15} y="9" width="30" height="0.4" fill="#ccc" />
        <MeetingTable w={w} h={h} capacity={capacity} />
    </g>
);

export const BoardroomLayout: React.FC<{ w: number; h: number, capacity?: number }> = ({ w, h, capacity }) => (
    <g>
        {/* Large Professional Whiteboard/Screen on Top Wall */}
        <rect x={w / 2 - 25} y="8" width="50" height="2" fill="#1e293b" stroke="black" strokeWidth="1" />
        <rect x={w / 2 - 25} y="10" width="50" height="0.6" fill="#94a3b8" />
        {/* Screen detail */}
        <rect x={w / 2 - 23} y="8.5" width="46" height="1" fill="#3b82f6" opacity="0.3" />
        <MeetingTable w={w} h={h} capacity={capacity} big={true} />
    </g>
);

export const MeetboxLayout: React.FC<{ w: number; h: number; capacity?: number }> = ({ w, h, capacity }) => {
    // Force even capacity (minimum 2)
    const rawPax = capacity || 2;
    const pax = rawPax % 2 === 0 ? rawPax : rawPax + 1;
    
    const cx = w / 2;
    const cy = h / 2;
    
    // Base unit requirements in pixels (unscaled)
    const perSide = pax / 2;
    const chairSize = 10;
    const chairGap = 3;
    const padding = 6;
    
    const requiredW = (perSide * chairSize) + ((perSide - 1) * 2) + padding;
    const requiredH = 10 + (2 * (chairSize/2 + chairGap)) + 4; // tableH + chairs + outer margin

    // Dynamic scale to fit content within the room pixels (with 92% safe area)
    const scale = Math.min(1.1, (w * 0.92) / requiredW, (h * 0.92) / requiredH);
    
    const tableW = Math.min(requiredW, (w * 0.8) / scale);
    const tableH = 10;

    return (
        <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
            {/* Table Shadow */}
            <rect x={-tableW / 2 + 0.8} y={-tableH / 2 + 0.8} width={tableW} height={tableH} fill="black" opacity="0.05" rx="1.5" />
            
            {/* Top Seats */}
            {Array.from({ length: perSide }).map((_, i) => {
                const step = perSide > 1 ? (tableW - 8) / (perSide - 1) : 0;
                const x = perSide > 1 ? (-tableW / 2 + 4 + i * step) : 0;
                return <DiningChair key={`t-${i}`} x={x} y={-tableH/2 - 2.8} r={0} />;
            })}
            
            {/* Bottom Seats */}
            {Array.from({ length: perSide }).map((_, i) => {
                const step = perSide > 1 ? (tableW - 8) / (perSide - 1) : 0;
                const x = perSide > 1 ? (-tableW / 2 + 4 + i * step) : 0;
                return <DiningChair key={`b-${i}`} x={x} y={tableH/2 + 2.8} r={180} />;
            })}
            
            {/* Table Surface */}
            <rect x={-tableW / 2} y={-tableH / 2} width={tableW} height={tableH} fill="white" stroke="black" strokeWidth="1.2" rx="2" />
            
            {/* Professional connectivity detail */}
            <rect x={-tableW * 0.2} y={-1.5} width={tableW * 0.4} height={3} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" rx="0.3" />
            
            {/* Accessories */}
            <circle cx={tableW/2 - 3} cy={0} r={0.8} fill="#6f4e37" opacity="0.8" />
            <circle cx={tableW/2 - 3} cy={0} r={1.2} fill="none" stroke="#60a5fa" strokeWidth="0.2" />
        </g>
    );
};

export const LactaryLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => (
    <g transform="translate(0, 7)">
        {/* L-Shaped Countertop with Sink - Sink flush to wall */}
        <rect x="0" y="0" width="30" height="12" fill="white" stroke="black" strokeWidth="1" />
        <Sink x={5} y={6} />

        {/* Mini Fridge */}
        <g transform="translate(18, 1)">
            <rect x="0" y="0" width="10" height="10" fill="white" stroke="black" strokeWidth="1" rx="0.5" />
            <line x1="1" y1="2" x2="9" y2="2" stroke="#ccc" strokeWidth="0.5" />
            <circle cx="8" cy="5" r="0.8" fill="#aaa" />
        </g>

        {/* Side Table */}
        <rect x={w / 2 + 2} y={h / 2 - 12} width="8" height="8" rx="1" fill="white" stroke="black" strokeWidth="0.8" />
        <circle cx={w / 2 + 6} cy={h / 2 - 8} r="1.5" fill="white" stroke="#60a5fa" strokeWidth="0.3" />

        {/* Comfy Sofa (1-seater) */}
        <g transform={`translate(${w / 2 - 10}, ${h / 2 + 1})`}>
            <rect x="-9" y="-8" width="18" height="16" rx="3" fill="white" stroke="black" strokeWidth="1.2" />
            <rect x="-9" y="-8" width="18" height="5" rx="2" fill="#f8fafc" stroke="black" strokeWidth="0.8" />
            <rect x="-9" y="-5" width="4" height="13" rx="2" fill="#f1f5f9" stroke="black" strokeWidth="0.5" />
            <rect x="5" y="-5" width="4" height="13" rx="2" fill="#f1f5f9" stroke="black" strokeWidth="0.5" />
            <line x1="-5" y1="-3" x2="5" y2="-3" stroke="#e2e8f0" strokeWidth="0.5" />
        </g>

        {/* Decorative Plant */}
        <Plant x={w - 8} y={8} scale={0.7} />
    </g>
);

export const CleaningLayout: React.FC<{ w: number; h: number }> = ({ w, h }) => (
    <g transform="translate(0, 7)">
        {/* Utility Sink (Botadero) - Fixed in top-left corner */}
        <g transform="translate(6, 1)">
            <rect x="0" y="0" width="14" height="14" fill="white" stroke="black" strokeWidth="1.2" rx="1" />
            <rect x="2" y="2" width="10" height="10" fill="#f1f5f9" rx="0.5" stroke="#94a3b8" strokeWidth="0.5" />
            <circle cx="7" cy="7" r="1.2" fill="black" />
            <rect x="6" y="-1.5" width="2" height="4" fill="#334155" />
        </g>

        {/* Cleaning Bucket */}
        <g transform="translate(12, 23)">
            <circle r="4.5" fill="white" stroke="black" strokeWidth="1" />
            <rect x="-4.5" y="-0.5" width="9" height="1" fill="black" />
            <circle r="1" fill="#64748b" />
        </g>

        {/* Storage Shelving */}
        <g transform={`translate(${w - 18}, 1)`}>
            <rect x="0" y="0" width="12" height={h * 0.55} fill="#fcfcfc" stroke="black" strokeWidth="1" rx="0.5" />
            <line x1="0" y1={h * 0.18} x2="12" y2={h * 0.18} stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="0" y1={h * 0.36} x2="12" y2={h * 0.36} stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="0" y1="0" x2="12" y2={h * 0.55} stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="12" y1="0" x2="0" y2={h * 0.55} stroke="#e2e8f0" strokeWidth="0.5" />
        </g>

        {/* Cleaning Cart Zone (Dashed) */}
        <rect x="14" y={h - 22} width="16" height="10" fill="none" stroke="#e2e8f0" strokeDasharray="2,2" />
    </g>
);
