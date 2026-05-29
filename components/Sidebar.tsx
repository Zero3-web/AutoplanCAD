import React, { useState } from 'react';
import { RoomConfig, RoomType } from '../types';
import {
  Trash2, ChevronRight, ChevronDown, MousePointer2, LayoutGrid
} from 'lucide-react';
import {
  calculatePoolDimensions,
  calculateSSHHDimensions,
  calculateReceptionDimensions,
  calculateLoungeDimensions,
  calculateDiningDimensions,
  calculateReunionDimensions,
  calculateMeetboxDimensions,
  calculateDirectorioDimensions,
  calculateLockersDimensions,
  calculateLactarioDimensions
} from '../utils/dimensionCalculators';
import { ROOM_TEMPLATES } from '../constants';
import { GlobalSettings, RoomPalette, RoomItem } from './sidebar/SidebarComponents';
import { BudgetResult } from '../utils/budgetCalculator';
import { Ruler, DollarSign } from 'lucide-react';

interface SidebarProps {
  rooms: RoomConfig[];
  onAddRoom: (type: RoomType) => void;
  onUpdateRoom: (id: string, updates: Partial<RoomConfig>) => void;
  onRemoveRoom: (id: string) => void;
  buildingWidth: number;
  onUpdateBuildingWidth: (width: number) => void;
  onSmartSort: () => void;
  onOptimizeShape: (ratio: number) => void;
  showCirculation: boolean;
  onToggleCirculation: () => void;
  showInteractive: boolean;
  onToggleInteractive: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  paintedMode: boolean;
  onTogglePaintedMode: () => void;
  aspectRatio: number;
  layoutVersion: number;
  onUpdateLayoutVersion: (v: number) => void;
  globalCalculationModes: Record<string, 'person' | 'space'>;
  onUpdateGlobalModes: (modes: Record<string, 'person' | 'space'>) => void;
  globalCapacities: Record<string, number>;
  onUpdateGlobalCapacities: (capacities: Record<string, number>) => void;
  budget: BudgetResult;
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  onAddRoom,
  onUpdateRoom,
  onRemoveRoom,
  buildingWidth,
  onUpdateBuildingWidth,
  onSmartSort,
  onOptimizeShape,
  showCirculation,
  onToggleCirculation,
  showInteractive,
  onToggleInteractive,
  showLabels,
  onToggleLabels,
  paintedMode,
  onTogglePaintedMode,
  aspectRatio,
  layoutVersion,
  onUpdateLayoutVersion,
  globalCalculationModes,
  onUpdateGlobalModes,
  globalCapacities,
  onUpdateGlobalCapacities,
  budget
}) => {
  const [isRoomListOpen, setRoomListOpen] = useState(true);

  // Dimension calculation logic moved to utils/dimensionCalculators.ts


  const handleCapacityChange = (id: string, type: RoomType, capacity: number, roomConfig: RoomConfig) => {
    const cap = Math.max(1, capacity);

    if (type === RoomType.POOL) {
      const { width, height } = calculatePoolDimensions(
        cap,
        roomConfig.hasLockers || false,
        roomConfig.lockerCount || 0,
        roomConfig.poolOrientation || 'horizontal',
        buildingWidth,
        aspectRatio >= 1.8
      );
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.SSHH) {
      const sshhType = roomConfig.sshhType || 'unitary';
      const { width, height } = calculateSSHHDimensions(cap, sshhType);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.RECEPCION) {
      const { width, height } = calculateReceptionDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.LOUNGE) {
      const { width, height } = calculateLoungeDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.COMEDOR) {
      const { width, height } = calculateDiningDimensions(cap, roomConfig.hasKitchenette || false);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.REUNION) {
      const { width, height } = calculateReunionDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.MEETBOX) {
      const { width, height } = calculateMeetboxDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.DIRECTORIO) {
      const { width, height } = calculateDirectorioDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.LOCKERS) {
      const { width, height } = calculateLockersDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else if (type === RoomType.LACTARIO) {
      const { width, height } = calculateLactarioDimensions(cap);
      onUpdateRoom(id, { capacity: cap, width, height });
    } else {
      onUpdateRoom(id, { capacity: cap });
    }
  };

  const handleToggleKitchenette = (room: RoomConfig) => {
    const newHasKitchenette = !room.hasKitchenette;
    const { width, height } = calculateDiningDimensions(room.capacity || 12, newHasKitchenette);
    onUpdateRoom(room.id, { hasKitchenette: newHasKitchenette, width, height });
  };

  const handleLockerCountChange = (room: RoomConfig, count: number) => {
    const safeCount = Math.max(1, count);
    const { width, height } = calculatePoolDimensions(
      room.capacity || 1,
      room.hasLockers || false,
      safeCount,
      room.poolOrientation || 'horizontal',
      buildingWidth,
      aspectRatio >= 1.8
    );
    onUpdateRoom(room.id, { lockerCount: safeCount, width, height });
  };

  const handleToggleLockers = (room: RoomConfig) => {
    const newHasLockers = !room.hasLockers;
    const newLockerCount = newHasLockers ? (room.lockerCount || room.capacity || 1) : 0;
    const { width, height } = calculatePoolDimensions(
      room.capacity || 12,
      newHasLockers,
      newLockerCount,
      room.poolOrientation || 'horizontal',
      buildingWidth,
      aspectRatio >= 1.8
    );

    onUpdateRoom(room.id, { hasLockers: newHasLockers, lockerCount: newLockerCount, width, height });
  };

  const handleSSHHTypeChange = (room: RoomConfig, newType: 'unitary' | 'multiple') => {
    const cap = room.capacity || 10;
    const { width, height } = calculateSSHHDimensions(cap, newType);
    onUpdateRoom(room.id, { sshhType: newType, width, height });
  };

  const handleUpdateGlobalMode = (type: string, mode: 'person' | 'space') => {
    onUpdateGlobalModes({ ...globalCalculationModes, [type]: mode });
  };

  const handleCalculationModeChange = (id: string, mode: 'space' | 'person') => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    if (mode === 'space') {
      const template = ROOM_TEMPLATES[room.type];
      onUpdateRoom(id, {
        calculationMode: 'space',
        quantity: room.quantity || 1,
        width: template.width,
        height: template.height
      });
    } else {
      const capacityMap: Partial<Record<RoomType, number>> = {
        [RoomType.POOL]: 12,
        [RoomType.LOCKERS]: 20,
        [RoomType.REUNION]: 6,
        [RoomType.DIRECTORIO]: 12,
        [RoomType.COMEDOR]: 20,
        [RoomType.LOUNGE]: 4,
        [RoomType.LACTARIO]: 1,
        [RoomType.MEETBOX]: 2,
        [RoomType.SSHH]: 10,
        [RoomType.RECEPCION]: 1,
      };
      const defaultCap = capacityMap[room.type as unknown as RoomType] || 1;

      const sshhType = room.sshhType || 'unitary';
      let w = room.width;
      let h = room.height;

      // Recalculate dimensions for person mode
      if (room.type === RoomType.POOL) {
        const dims = calculatePoolDimensions(defaultCap, !!room.hasLockers, room.lockerCount || 0);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.SSHH) {
        const dims = calculateSSHHDimensions(defaultCap, sshhType);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.COMEDOR) {
        const dims = calculateDiningDimensions(defaultCap, !!room.hasKitchenette);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.RECEPCION) {
        const dims = calculateReceptionDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.LOUNGE) {
        const dims = calculateLoungeDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.REUNION) {
        const dims = calculateReunionDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.MEETBOX) {
        const dims = calculateMeetboxDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.DIRECTORIO) {
        const dims = calculateDirectorioDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.LOCKERS) {
        const dims = calculateLockersDimensions(defaultCap);
        w = dims.width; h = dims.height;
      } else if (room.type === RoomType.LACTARIO) {
        const dims = calculateLactarioDimensions(defaultCap);
        w = dims.width; h = dims.height;
      }

      onUpdateRoom(id, {
        calculationMode: 'person',
        capacity: defaultCap,
        width: w,
        height: h
      });
    }
  };

  const handlePoolOrientationChange = (room: RoomConfig, newOrientation: 'horizontal' | 'vertical') => {
    const { width, height } = calculatePoolDimensions(room.capacity || 12, room.hasLockers || false, room.lockerCount || 0, newOrientation);
    onUpdateRoom(room.id, { poolOrientation: newOrientation, width, height });
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    onUpdateRoom(id, { quantity: Math.max(1, quantity) });
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full text-sm shadow-2xl z-20 text-slate-300 font-sans">
      <div className="p-4 border-b border-slate-700 bg-slate-950">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
          <LayoutGrid size={18} className="text-blue-500" />
          AUTOPLAN <span className="text-blue-500">CAD</span>
        </h1>
        <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-wider">Generador de Esquemas</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <GlobalSettings
          buildingWidth={buildingWidth}
          onUpdateBuildingWidth={onUpdateBuildingWidth}
          onSmartSort={onSmartSort}
          onOptimizeShape={onOptimizeShape}
          showCirculation={showCirculation}
          onToggleCirculation={onToggleCirculation}
          showInteractive={showInteractive}
          onToggleInteractive={onToggleInteractive}
          showLabels={showLabels}
          onToggleLabels={onToggleLabels}
          paintedMode={paintedMode}
          onTogglePaintedMode={onTogglePaintedMode}
          aspectRatio={aspectRatio}
          layoutVersion={layoutVersion}
          onUpdateLayoutVersion={onUpdateLayoutVersion}
          globalCalculationModes={globalCalculationModes}
          onUpdateGlobalMode={handleUpdateGlobalMode}
          globalCapacities={globalCapacities}
          onUpdateGlobalCapacity={(type, cap) => onUpdateGlobalCapacities({ ...globalCapacities, [type]: cap })}
        />

        <RoomPalette onAddRoom={onAddRoom} />

        <div className="p-2">
          <button
            onClick={() => setRoomListOpen(!isRoomListOpen)}
            className="flex items-center w-full text-left p-2 text-slate-300 hover:bg-slate-800 rounded mb-2 select-none"
          >
            {isRoomListOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="ml-2 font-semibold text-xs uppercase tracking-wide">Lista de Ambientes ({rooms.length})</span>
          </button>

          {isRoomListOpen && (
            <div className="space-y-2 pb-10">
              {rooms.length === 0 && (
                <div className="text-center p-6 text-slate-600 text-xs border border-dashed border-slate-800 rounded mx-2">
                  <MousePointer2 className="mx-auto mb-2 opacity-50" size={24} />
                  Selecciona un ambiente para comenzar
                </div>
              )}
              {rooms.map((room, index) => (
                <RoomItem
                  key={room.id}
                  room={room}
                  index={index}
                  onRemoveRoom={onRemoveRoom}
                  onUpdateRoom={onUpdateRoom}
                  handleCapacityChange={handleCapacityChange}
                  handleToggleKitchenette={handleToggleKitchenette}
                  handleLockerCountChange={handleLockerCountChange}
                  handleToggleLockers={handleToggleLockers}
                  handleSSHHTypeChange={handleSSHHTypeChange}
                  handlePoolOrientationChange={handlePoolOrientationChange}
                  handleCalculationModeChange={handleCalculationModeChange}
                  handleQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget Summary Card */}
      <div className="p-4 bg-slate-950 border-t border-slate-700 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Ruler size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Área Total</p>
                <p className="text-xl font-mono font-bold text-white tracking-tight">
                  {Math.ceil(budget.totalM2)}<small className="text-xs ml-1 opacity-50">m²</small>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Inversión Est.</p>
              <p className="text-xl font-mono font-bold text-emerald-400 tracking-tight">
                {budget.totalPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <div className="flex-1">
              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500 font-medium">
                <span>Construcción</span>
                <span className="text-slate-400">{Math.round(budget.totalM2 - budget.circulationM2)} m²</span>
              </div>
              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500 font-medium mt-1">
                <span>Circulación (5%)</span>
                <span className="text-slate-400">{Math.round(budget.circulationM2)} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;