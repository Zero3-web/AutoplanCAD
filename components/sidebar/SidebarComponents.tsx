import React from 'react';
import { RoomConfig, RoomType } from '../../types';
import { ROOM_TEMPLATES } from '../../constants';
import {
    Trash2, Ruler, MousePointer2, Sparkles, Square, RectangleHorizontal,
    Eye, EyeOff, Users, Box, Lock, Droplets, DollarSign
} from 'lucide-react';
import { ROOM_PRICING } from '../../utils/budgetCalculator';

export const GlobalSettings: React.FC<{
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
    onUpdateGlobalMode: (type: string, mode: 'person' | 'space') => void;
    globalCapacities: Record<string, number>;
    onUpdateGlobalCapacity: (type: string, capacity: number) => void;
}> = ({
    buildingWidth, onUpdateBuildingWidth, onSmartSort, onOptimizeShape,
    showCirculation, onToggleCirculation, showInteractive,
    onToggleInteractive, showLabels, onToggleLabels, paintedMode, onTogglePaintedMode, aspectRatio,
    layoutVersion, onUpdateLayoutVersion, globalCalculationModes, onUpdateGlobalMode,
    globalCapacities, onUpdateGlobalCapacity
}) => {
    const [isAdminOpen, setIsAdminOpen] = React.useState(false);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '0.0.0.0';

    return (
        <>
            {/* Auto Layout Controls */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                    <Sparkles size={14} />
                    Distribución Inteligente
                </h2>
                <div className="space-y-3">
                    <button
                        onClick={onSmartSort}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold text-xs transition-colors shadow-lg shadow-blue-900/20"
                        title="Ordena ambientes por Zona: Silencio, Gerencia, Social, Húmeda"
                    >
                        <Sparkles size={14} />
                        ORGANIZAR POR ZONAS
                    </button>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <button
                            onClick={() => onOptimizeShape(0.7)}
                            className={`bg-slate-800 hover:bg-slate-700 border ${aspectRatio < 0.9 ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'} hover:border-blue-500 text-slate-300 py-1.5 rounded flex flex-col items-center justify-center gap-1 text-[9px] transition-all`}
                            title="Aspecto Vertical (3:4)"
                        >
                            <div className={`w-2 h-3 border-2 ${aspectRatio < 0.9 ? 'border-blue-400' : 'border-current'} rounded-sm mb-1 opacity-70`}></div>
                            Vertical
                        </button>
                        <button
                            onClick={() => onOptimizeShape(1.0)}
                            className={`bg-slate-800 hover:bg-slate-700 border ${Math.abs(aspectRatio - 1.0) < 0.1 ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'} hover:border-blue-500 text-slate-300 py-1.5 rounded flex flex-col items-center justify-center gap-1 text-[9px] transition-all`}
                            title="Aspecto Cuadrado (1:1)"
                        >
                            <Square size={14} className={Math.abs(aspectRatio - 1.0) < 0.1 ? 'text-blue-400' : ''} />
                            Cuadrado
                        </button>
                        <button
                            onClick={() => onOptimizeShape(2.0)}
                            className={`bg-slate-800 hover:bg-slate-700 border ${aspectRatio >= 1.8 ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'} hover:border-blue-500 text-slate-300 py-1.5 rounded flex flex-col items-center justify-center gap-1 text-[9px] transition-all`}
                            title="Aspecto Horizontal (2.0:1)"
                        >
                            <RectangleHorizontal size={16} className={aspectRatio >= 1.8 ? 'text-blue-400' : ''} />
                            Horizontal
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout Version Selection */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                <h2 className="text-amber-400 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                    <Box size={14} />
                    Versión de Distribución
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdateLayoutVersion(0)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${layoutVersion === 0 ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                        PREDETERMINADO
                    </button>
                    <button
                        onClick={() => onUpdateLayoutVersion(1)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${layoutVersion === 1 ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                        title="V1: Recepción compacta a la derecha"
                    >
                        VERSIÓN 1 (V1)
                    </button>
                </div>
            </div>

            {/* Global Settings */}
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-slate-100 font-semibold mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                    <Ruler size={14} className="text-blue-500" />
                    Dimensiones y Vista
                </h2>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-slate-400 text-xs">Ancho Total (metros)</label>
                        <input
                            type="number"
                            value={buildingWidth}
                            onChange={(e) => onUpdateBuildingWidth(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-600 text-white px-3 py-1.5 rounded focus:outline-none focus:border-blue-500 font-mono text-sm"
                            min={5}
                            max={100}
                            step={0.5}
                        />
                    </div>

                    <ToggleSetting
                        label="Mostrar Circulación"
                        checked={showCirculation}
                        onToggle={onToggleCirculation}
                        icon={showCirculation ? <Eye size={14} /> : <EyeOff size={14} />}
                    />

                    <ToggleSetting
                        label="Modo Interactivo"
                        checked={showInteractive}
                        onToggle={onToggleInteractive}
                        icon={<MousePointer2 size={14} className={showInteractive ? "text-blue-400" : ""} />}
                    />

                    <ToggleSetting
                        label="Mostrar Etiquetas"
                        checked={showLabels}
                        onToggle={onToggleLabels}
                        icon={<Box size={14} className={showLabels ? "text-blue-400" : ""} />}
                    />

                    <ToggleSetting
                        label="Pintar Plano"
                        checked={paintedMode}
                        onToggle={onTogglePaintedMode}
                        icon={<Sparkles size={14} className={paintedMode ? "text-blue-400" : ""} />}
                    />
                </div>
            </div>

            {/* Internal Admin Configuration (Localhost Only) */}
            {isLocalhost && (
                <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                    <button
                        onClick={() => setIsAdminOpen(!isAdminOpen)}
                        className="w-full flex items-center justify-between text-indigo-400 font-bold text-xs uppercase tracking-wide mb-2 hover:text-indigo-300 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Lock size={14} />
                            Configuración Interna (API)
                        </span>
                        <span>{isAdminOpen ? '-' : '+'}</span>
                    </button>

                    {isAdminOpen && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="text-[10px] text-slate-500 italic mb-3">
                                Configura el modo de cálculo predeterminado para nuevos ambientes.
                            </p>
                            
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {Object.keys(ROOM_TEMPLATES).map((typeKey) => {
                                    const type = typeKey as RoomType;
                                    const currentMode = globalCalculationModes[type] || (
                                        [
                                            RoomType.POOL, RoomType.SSHH, RoomType.COMEDOR, RoomType.LOUNGE,
                                            RoomType.LACTARIO, RoomType.LOCKERS, RoomType.REUNION,
                                            RoomType.DIRECTORIO, RoomType.MEETBOX, RoomType.RECEPCION
                                        ].includes(type) ? 'person' : 'space'
                                    );

                                    const capacityMap: Partial<Record<RoomType, number>> = {
                                        [RoomType.POOL]: 12, [RoomType.LOCKERS]: 20, [RoomType.REUNION]: 6,
                                        [RoomType.DIRECTORIO]: 12, [RoomType.COMEDOR]: 20, [RoomType.LOUNGE]: 4,
                                        [RoomType.LACTARIO]: 1, [RoomType.MEETBOX]: 2, [RoomType.SSHH]: 10,
                                        [RoomType.RECEPCION]: 1,
                                    };
                                    const capacity = globalCapacities[type] || capacityMap[type] || 1;
                                    const canHavePerson = capacityMap[type] !== undefined;

                                    return (
                                        <div key={type} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                            <span className="text-[10px] text-slate-300 font-medium truncate mr-2" title={type}>{type}</span>
                                            <div className="flex items-center gap-2">
                                                {currentMode === 'person' && canHavePerson && (
                                                    <input
                                                        type="number"
                                                        value={capacity}
                                                        onChange={(e) => onUpdateGlobalCapacity(type, parseInt(e.target.value) || 1)}
                                                        className="w-10 bg-slate-950 border border-slate-700 rounded text-[9px] text-right font-bold text-blue-400 px-1 focus:border-blue-500 outline-none"
                                                        min={1}
                                                        title="Capacidad predeterminada"
                                                    />
                                                )}
                                                <div className="flex bg-slate-900 rounded p-0.5 border border-slate-700 shrink-0">
                                                    <button
                                                        onClick={() => onUpdateGlobalMode(type, 'person')}
                                                        className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${currentMode === 'person' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        PERS
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdateGlobalMode(type, 'space')}
                                                        className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${currentMode === 'space' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        ESP
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    // Feedback for "Save"
                                    const btn = document.getElementById('save-global-config');
                                    if (btn) {
                                        const originalText = btn.innerHTML;
                                        btn.innerHTML = '¡GUARDADO!';
                                        btn.classList.replace('bg-indigo-600', 'bg-green-600');
                                        setTimeout(() => {
                                            btn.innerHTML = originalText;
                                            btn.classList.replace('bg-green-600', 'bg-indigo-600');
                                        }, 2000);
                                    }
                                }}
                                id="save-global-config"
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-bold text-[10px] uppercase tracking-wider transition-all mt-2"
                            >
                                Guardar Preferencias
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

const ToggleSetting: React.FC<{
    label: string;
    checked: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
}> = ({ label, checked, onToggle, icon }) => (
    <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
        <span className="text-xs text-slate-300 flex items-center gap-2">
            {icon}
            {label}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onToggle}
            />
            <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);

export const RoomPalette: React.FC<{
    onAddRoom: (type: RoomType) => void;
}> = ({ onAddRoom }) => (
    <div className="p-4 border-b border-slate-800">
        <h2 className="text-slate-100 font-semibold mb-3 text-xs uppercase tracking-wide">Paleta de Ambientes</h2>
        <div className="grid grid-cols-2 gap-2">
            {Object.keys(ROOM_TEMPLATES)
                .filter(key => key !== RoomType.LOCKERS)
                .map((key) => {
                    const type = key as RoomType;
                    return (
                        <button
                            key={type}
                            onClick={() => onAddRoom(type)}
                            className="flex flex-row items-center gap-2 p-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all group text-left"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-400"></div>
                            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">{type}</span>
                        </button>
                    );
                })}
        </div>
    </div>
);

export const RoomItem: React.FC<{
    room: RoomConfig;
    index: number;
    onRemoveRoom: (id: string) => void;
    onUpdateRoom: (id: string, updates: Partial<RoomConfig>) => void;
    handleCapacityChange: (id: string, type: RoomType, capacity: number, roomConfig: RoomConfig) => void;
    handleToggleKitchenette: (room: RoomConfig) => void;
    handleLockerCountChange: (room: RoomConfig, count: number) => void;
    handleToggleLockers: (room: RoomConfig) => void;
    handleSSHHTypeChange: (room: RoomConfig, newType: 'unitary' | 'multiple') => void;
    handlePoolOrientationChange: (room: RoomConfig, newOrientation: 'horizontal' | 'vertical') => void;
    handleCalculationModeChange: (id: string, mode: 'space' | 'person') => void;
    handleQuantityChange: (id: string, quantity: number) => void;
}> = ({
    room, index, onRemoveRoom, onUpdateRoom, handleCapacityChange,
    handleToggleKitchenette, handleLockerCountChange, handleToggleLockers, handleSSHHTypeChange, handlePoolOrientationChange,
    handleCalculationModeChange, handleQuantityChange
}) => {
        const mode = room.calculationMode || 'space';
        const isAutoSized = mode === 'person' && [
            RoomType.POOL, 
            RoomType.SSHH, 
            RoomType.COMEDOR, 
            RoomType.RECEPCION, 
            RoomType.LOUNGE,
            RoomType.REUNION,
            RoomType.DIRECTORIO,
            RoomType.MEETBOX,
            RoomType.LOCKERS,
            RoomType.LACTARIO
        ].includes(room.type);

        const pricingKey = room.type === RoomType.SSHH ? (room.sshhType === 'multiple' ? 'sshh_multiple' : 'sshh_unitary') : room.type;
        const pricingData = ROOM_PRICING[pricingKey];
        const qty = mode === 'person' ? (room.capacity || 1) : (room.quantity || 1);
        const area = pricingData ? pricingData.m2 * qty : 0;
        const subtotal = pricingData ? (pricingData.price + pricingData.pre + pricingData.var + pricingData.mob) * area : 0;

        return (
            <div className="bg-slate-800/50 border border-slate-700 p-3 rounded hover:border-blue-500/50 transition-colors mx-2 relative group overflow-hidden">
                {/* Subtle side background with area */}
                <div className="absolute top-0 right-0 h-full w-24 bg-blue-500/[0.03] -skew-x-12 translate-x-12 pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-2 relative z-10">
                    <div className="flex flex-col">
                        <span className="font-bold text-[11px] text-white flex items-center gap-2">
                            <span className="text-blue-500 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                            {room.name}
                        </span>
                        {pricingData && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                    <Ruler size={10} /> {Math.ceil(area)} m²
                                </span>
                                <span className="text-[9px] text-emerald-500/70 font-bold flex items-center">
                                    <DollarSign size={10} /> {Math.round(subtotal).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => onRemoveRoom(room.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors bg-slate-900/50 p-1 rounded-full"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>

                {/* Calculation Mode Switcher */}
                <div className="flex bg-slate-900/50 rounded p-1 border border-slate-700/50 mb-3">
                    <button
                        onClick={() => handleCalculationModeChange(room.id, 'person')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[9px] font-bold uppercase rounded transition-all ${mode === 'person' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Users size={11} />
                        Persona
                    </button>
                    <button
                        onClick={() => handleCalculationModeChange(room.id, 'space')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[9px] font-bold uppercase rounded transition-all ${mode === 'space' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Box size={11} />
                        Espacio
                    </button>
                </div>

                {mode === 'space' && (
                    <div className="mb-3">
                        <div className="bg-indigo-900/20 border border-indigo-500/30 p-2 rounded">
                            <label className="text-[10px] text-indigo-300 font-bold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <Box size={12} />
                                Cantidad (Unidades)
                            </label>
                            <input
                                type="number"
                                value={room.quantity || 1}
                                onChange={(e) => handleQuantityChange(room.id, parseInt(e.target.value))}
                                className="w-full bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-sm text-right font-bold text-white focus:border-indigo-500 outline-none"
                                min={1}
                            />
                        </div>
                    </div>
                )}

                {mode === 'person' && isAutoSized && (
                    <div className="mb-3 space-y-2">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded">
                            <label className="text-[10px] text-blue-300 font-bold uppercase tracking-wide flex items-center gap-1 mb-1">
                                <Users size={12} />
                                Personas (Capacidad)
                            </label>
                            <input
                                type="number"
                                value={room.capacity || 1}
                                onChange={(e) => handleCapacityChange(room.id, room.type, parseInt(e.target.value), room)}
                                className="w-full bg-slate-900 border border-blue-500/50 rounded px-2 py-1 text-sm text-right font-bold text-white focus:border-blue-500 outline-none"
                                min={1}
                            />
                        </div>

                        {room.type === RoomType.COMEDOR && (
                            <div
                                onClick={() => handleToggleKitchenette(room)}
                                className={`flex items-center justify-between p-2 rounded border cursor-pointer select-none transition-all ${room.hasKitchenette ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            >
                                <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                                    <Droplets size={12} />
                                    Incluir Kitchenette
                                </span>
                                <div className={`w-3 h-3 rounded-full border ${room.hasKitchenette ? 'bg-white border-white' : 'bg-transparent border-slate-500'}`}></div>
                            </div>
                        )}

                        {room.type === RoomType.POOL && (
                            <>
                                <div
                                    onClick={() => handleToggleLockers(room)}
                                    className={`flex items-center justify-between p-2 rounded border cursor-pointer select-none transition-all ${room.hasLockers ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    <span className="text-[10px] font-bold uppercase flex items-center gap-2">
                                        <Lock size={12} />
                                        Incluir Casilleros
                                    </span>
                                    <div className={`w-3 h-3 rounded-full border ${room.hasLockers ? 'bg-white border-white' : 'bg-transparent border-slate-500'}`}></div>
                                </div>
                                {room.hasLockers && (
                                    <div className="bg-blue-900/10 border border-blue-500/20 p-2 rounded animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] text-blue-200 font-bold uppercase tracking-wide flex items-center gap-1 mb-1">
                                            <Box size={12} />
                                            Cantidad Casilleros
                                        </label>
                                        <input
                                            type="number"
                                            value={room.lockerCount || 0}
                                            onChange={(e) => handleLockerCountChange(room, parseInt(e.target.value))}
                                            className="w-full bg-slate-900 border border-blue-500/30 rounded px-2 py-1 text-sm text-right font-bold text-white focus:border-blue-500 outline-none"
                                            min={1}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-2 rounded border border-slate-700 bg-slate-900/50 mt-2">
                                    <span className="text-[10px] font-bold uppercase flex items-center gap-2 text-slate-400">
                                        <RectangleHorizontal size={12} className={room.poolOrientation !== 'vertical' ? "text-blue-400" : ""} />
                                        Orientación Escritorios
                                    </span>
                                    <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                                        <button
                                            onClick={() => handlePoolOrientationChange(room, 'horizontal')}
                                            className={`px-2 py-1 text-[9px] rounded transition-all ${room.poolOrientation !== 'vertical' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            H
                                        </button>
                                        <button
                                            onClick={() => handlePoolOrientationChange(room, 'vertical')}
                                            className={`px-2 py-1 text-[9px] rounded transition-all ${room.poolOrientation === 'vertical' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            V
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {room.type === RoomType.SSHH && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                    onClick={() => handleSSHHTypeChange(room, 'unitary')}
                                    className={`p-2 rounded border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${room.sshhType === 'unitary' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    <Square size={14} />
                                    Unitario (1:10)
                                </button>
                                <button
                                    onClick={() => handleSSHHTypeChange(room, 'multiple')}
                                    className={`p-2 rounded border text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${room.sshhType === 'multiple' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                >
                                    <RectangleHorizontal size={14} />
                                    Múltiple (1:20)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className={`grid grid-cols-2 gap-3 ${isAutoSized ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="relative">
                        <label className="text-[10px] text-slate-500 absolute -top-1.5 left-2 bg-slate-800 px-1">Ancho</label>
                        <input
                            type="number"
                            value={room.width}
                            onChange={(e) => onUpdateRoom(room.id, { width: parseFloat(e.target.value) || 1 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-right font-mono text-white focus:border-blue-500 outline-none"
                            step={0.1}
                            readOnly={isAutoSized}
                        />
                    </div>
                    <div className="relative">
                        <label className="text-[10px] text-slate-500 absolute -top-1.5 left-2 bg-slate-800 px-1">Largo</label>
                        <input
                            type="number"
                            value={room.height}
                            onChange={(e) => onUpdateRoom(room.id, { height: parseFloat(e.target.value) || 1 })}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-right font-mono text-white focus:border-blue-500 outline-none"
                            step={0.1}
                            readOnly={isAutoSized}
                        />
                    </div>
                </div>
                {isAutoSized && <div className="text-[9px] text-slate-500 text-center mt-1 italic">Dimensiones calculadas auto.</div>}
            </div>
        );
    };
