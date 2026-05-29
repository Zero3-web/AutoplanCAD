import * as React from 'react';
import { useState, useMemo } from 'react';
import { RectangleVertical, Square, RectangleHorizontal, Eye, EyeOff, MousePointer2, Box, Sparkles, SlidersHorizontal, ChevronRight, Ruler } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BlueprintCanvas from './components/BlueprintCanvas';
import AppTour, { TourStep } from './components/AppTour';
import { RoomConfig, RoomType, PlacedRoom } from './types';
import { DEFAULT_BUILDING_WIDTH, ROOM_TEMPLATES } from './constants';
import { packRooms, smartSortRooms, calculateOptimalWidth } from './utils/packer';
import {
  calculatePoolDimensions,
  calculateSSHHDimensions,
  calculateReceptionDimensions,
  calculateLoungeDimensions,
  calculateDiningDimensions,
  calculateReunionDimensions,
  calculateDirectorioDimensions,
  calculateMeetboxDimensions,
  calculateLockersDimensions,
  calculateLactarioDimensions
} from './utils/dimensionCalculators';
import { calculateBudget, BudgetResult } from './utils/budgetCalculator';

const App: React.FC = () => {
  const [rooms, setRooms] = useState<RoomConfig[]>([]);
  const [buildingWidth, setBuildingWidth] = useState(DEFAULT_BUILDING_WIDTH);
  const [showCirculation, setShowCirculation] = useState(true);
  const [showInteractive, setShowInteractive] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [paintedMode, setPaintedMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(2.0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [globalCalculationModes, setGlobalCalculationModes] = useState<Record<string, 'person' | 'space'>>({});
  const [globalCapacities, setGlobalCapacities] = useState<Record<string, number>>({});

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFSTourOpen, setIsFSTourOpen] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [hasSeenFSTour, setHasSeenFSTour] = useState(false);

  const lastConfigRef = React.useRef<string>('');

  const getFlattenedRooms = (roomList: RoomConfig[]) => {
    return roomList.flatMap(r => {
      // 1. Handle regular Space Mode quantity flattening
      const qty = r.calculationMode === 'space' ? (r.quantity || 1) : 1;

      // 2. Handle Meetbox splitting rule: > 6 pax = multiple units, always even capacity
      if (r.calculationMode === 'person' && r.type === RoomType.MEETBOX && r.capacity) {
        const capacity = r.capacity % 2 === 0 ? r.capacity : r.capacity + 1;
        if (capacity > 6) {
          const meetboxQty = Math.ceil(capacity / 6);
          const rawCapacityPerBox = Math.ceil(capacity / meetboxQty);
          const capacityPerBox = rawCapacityPerBox % 2 === 0 ? rawCapacityPerBox : rawCapacityPerBox + 1;

          return Array.from({ length: meetboxQty }).map((_, i) => ({
            ...r,
            id: `${r.id}__${i}`,
            name: `${r.name} ${i + 1}`,
            capacity: capacityPerBox
          }));
        } else {
          return [{
            ...r,
            capacity: capacity
          }];
        }
      }

      if (qty <= 1) return [{
        ...r,
        id: r.id,
        name: r.name,
      }];

      return Array.from({ length: qty }).map((_, i) => ({
        ...r,
        id: `${r.id}__${i}`,
        name: `${r.name} ${i + 1}`,
      }));
    });
  };

  const pendingConfigRef = React.useRef<string>('');

  const loadConfigData = (config: any) => {
    if (!config || !config.rooms) return;

    const configFingerprint = JSON.stringify(config.rooms);

    // 1. If we are already working on this EXACT config, ignore the message
    if (pendingConfigRef.current === configFingerprint) return;

    // 2. If it's the first time or different, mark it as pending
    pendingConfigRef.current = configFingerprint;
    console.log('App: Processing fresh config update');

    // 3. Send ACK to parent to stop retries
    if (window.parent) {
      window.parent.postMessage({ type: 'AUTOPLAN_READY' }, '*');
    }
    // 3. Send ACK to parent to stop retries - MOVED TO END OF FUNCTION
    // if (window.parent) {
    //   window.parent.postMessage({ type: 'AUTOPLAN_READY' }, '*');
    // }

    if (config.rooms && Array.isArray(config.rooms)) {
      const loadedRooms: RoomConfig[] = config.rooms.map((r: any, index: number) => {
        const roomType = r.type as RoomType;
        const template = ROOM_TEMPLATES[roomType] || ROOM_TEMPLATES[RoomType.POOL];
        let w = template.width, h = template.height;

        // PERFECTLY DETERMINISTIC ID
        const stableId = `${roomType}_${index}_${r.capacity || 0}`;

        const isPersonDefault = [
          RoomType.POOL, RoomType.COMEDOR, RoomType.LOUNGE,
          RoomType.LACTARIO, RoomType.LOCKERS, RoomType.REUNION,
          RoomType.DIRECTORIO, RoomType.MEETBOX
        ].includes(roomType);

        // SSHH is special: Unitary is SPACE (by unit), Multiple is PERSON (by pax)
        const mode = r.calculationMode || globalCalculationModes[roomType] || (
          (roomType === RoomType.SSHH)
            ? (r.sshhType === 'multiple' ? 'person' : 'space')
            : (r.capacity || isPersonDefault ? 'person' : 'space')
        );

        // Dynamic dimension adjustment
        if (r.capacity || mode === 'space') {
          const cap = r.capacity || 1;
          if (roomType === RoomType.POOL) {
            const dims = calculatePoolDimensions(cap, !!r.hasLockers, r.lockerCount || 0);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.LOCKERS) {
            const lockersPerRow = 10;
            const rows = Math.ceil(cap / lockersPerRow);
            w = cap < 10 ? Math.max(2, cap * 0.5) : 4.5;
            h = Math.max(2, rows * 1.8);
          } else if (roomType === RoomType.REUNION) {
            const dims = calculateReunionDimensions(mode === 'space' ? 6 : cap);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.DIRECTORIO) {
            const dims = calculateDirectorioDimensions(mode === 'space' ? 12 : cap);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.MEETBOX) {
            const dims = calculateMeetboxDimensions(mode === 'space' ? 2 : cap);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.SSHH) {
            // If space mode, calculate for 1 unit only (1.8m width)
            const dims = calculateSSHHDimensions(mode === 'space' ? 1 : cap, r.sshhType || 'unitary');
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.COMEDOR) {
            const dims = calculateDiningDimensions(mode === 'space' ? 20 : cap, true);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.RECEPCION) {
            const dims = calculateReceptionDimensions(mode === 'space' ? 1 : cap);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.LOUNGE) {
            const dims = calculateLoungeDimensions(mode === 'space' ? 4 : cap);
            w = dims.width; h = dims.height;
          } else if (roomType === RoomType.LACTARIO) {
            const dims = calculateLactarioDimensions(mode === 'space' ? 1 : cap);
            w = dims.width; h = dims.height;
          }
        }


        return {
          ...template,
          id: stableId,
          name: roomType,
          capacity: r.capacity || (mode === 'person' ? 1 : undefined),
          width: w, height: h,
          hasLockers: r.hasLockers, lockerCount: r.lockerCount,
          hasKitchenette: r.hasKitchenette, sshhType: r.sshhType,
          calculationMode: mode as 'person' | 'space', quantity: 1
        };
      });

      const flattened = getFlattenedRooms(loadedRooms);
      const sorted = smartSortRooms(flattened);
      const autoWidth = calculateOptimalWidth(sorted, aspectRatio);

      setBuildingWidth(autoWidth);

      // Re-calculate some rooms with autoWidth
      const updatedRooms = loadedRooms.map(r => {
        if (r.type === RoomType.POOL && r.calculationMode === 'person') {
          const dims = calculatePoolDimensions(
            r.capacity || 12,
            r.hasLockers || false,
            r.lockerCount || 0,
            r.poolOrientation || 'horizontal',
            autoWidth,
            aspectRatio >= 1.8
          );
          return { ...r, width: dims.width, height: dims.height };
        }
        return r;
      });

      console.log('App: Sending READY signal to parent');
      window.parent.postMessage({ type: 'AUTOPLAN_READY' }, '*');

      setRooms(updatedRooms);

      // Trigger tour on first successful generation
      if (!hasSeenTour) {
        setTimeout(() => setIsTourOpen(true), 1500);
      }
    }
  };

  // Consistently manage tour triggers
  // ...
  // Listen for Fullscreen to trigger FS Tour
  React.useEffect(() => {
    const handleFS = () => {
      if (document.fullscreenElement && hasSeenTour && !hasSeenFSTour) {
        // Small delay to let FS settle
        setTimeout(() => setIsFSTourOpen(true), 800);
      }
    };
    document.addEventListener('fullscreenchange', handleFS);
    return () => document.removeEventListener('fullscreenchange', handleFS);
  }, [hasSeenTour, hasSeenFSTour]);

  const generalTourSteps: TourStep[] = [
    {
      target: 'center',
      title: '¡Diseño Generado!',
      content: 'Hemos optimizado tu espacio. Aquí tienes un tour rápido por las herramientas profesionales.'
    },
    {
      target: '#tour-variation',
      title: 'Variaciones Infinitas',
      content: '¿No te convence el resultado? Pulsa aquí para generar una nueva distribución con los mismos espacios.',
      position: 'right'
    },
    {
      target: '#tour-labels',
      title: 'Etiquetas de Espacio',
      content: 'Puedes mostrar u ocultar los nombres y capacidades de cada ambiente para una vista más limpia.',
      position: 'right'
    },
    {
      target: '#tour-fullscreen',
      title: 'Vista Profesional',
      content: 'Entra en modo pantalla completa para inspeccionar el plano a detalle y usar herramientas avanzadas.',
      position: 'right'
    }
  ];

  const fsTourSteps: TourStep[] = [
    {
      target: '#tour-interactive',
      title: 'Modo Interactivo',
      content: 'En pantalla completa, el plano se desbloquea. Puedes arrastrarlo para navegar por todo el diseño.',
      position: 'right'
    },
    {
      target: '#tour-zoom',
      title: 'Control de Zoom',
      content: 'Usa la lupa o el slider para acercarte a los detalles técnicos de cada mobiliario.',
      position: 'right'
    }
  ];

  // Initial Load & Message Listener
  React.useEffect(() => {
    // 1. Try to load from LocalStorage on mount
    try {
      const savedConfig = localStorage.getItem('autoplan_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        loadConfigData(config);
      }
    } catch (err) {
      console.error('Error loading wizard config:', err);
    }

    // 2. Listen for 'message' events from iframe parent (cross-domain)
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      console.log('App: Received message', event.data.type);

      // Support both legacy and new protocol
      const config = event.data.config || event.data.payload;
      const isConfigMessage = event.data.type === 'AUTOPLAN_CONFIG' || event.data.type === 'AUTOPLAN_CONFIG_UPDATE';

      if (isConfigMessage && config) {
        console.log('App: Processing config update');
        loadConfigData(config);
      } else if (event.data.type === 'UPDATE_OPTIONS' && config) {
        console.log('App: Received options via postMessage');
        const p = config;
        if (p.aspectRatio !== undefined) setAspectRatio(p.aspectRatio);
        if (p.showCirculation !== undefined) setShowCirculation(p.showCirculation);
        if (p.showInteractive !== undefined) setShowInteractive(p.showInteractive);
        if (p.showLabels !== undefined) setShowLabels(p.showLabels);
        if (p.paintedMode !== undefined) setPaintedMode(p.paintedMode);
      }
    };

    // 3. Load global calculation modes
    try {
      const savedModes = localStorage.getItem('autoplan_calculation_modes');
      if (savedModes) {
        setGlobalCalculationModes(JSON.parse(savedModes));
      }
      const savedCapacities = localStorage.getItem('autoplan_global_capacities');
      if (savedCapacities) {
        setGlobalCapacities(JSON.parse(savedCapacities));
      }
    } catch (err) {
      console.error('Error loading global settings:', err);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [aspectRatio]);

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const BACKEND_URL = isLocalhost ? 'http://localhost:8000' : 'https://autoplancad.onrender.com';

  // Wake up backend on mount
  React.useEffect(() => {
    fetch(`${BACKEND_URL}/health`).catch(() => { });
  }, [BACKEND_URL]);

  const [layoutResult, setLayoutResult] = useState<{ placedRooms: PlacedRoom[], totalHeight: number, efficiency: number }>({
    placedRooms: [],
    totalHeight: 12,
    efficiency: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Create a stable key for the layout to prevent redundant fetches when IDs change but content is identical
  const layoutKey = React.useMemo(() => {
    return JSON.stringify(rooms.map(r => ({ type: r.type, w: r.width, h: r.height, c: r.capacity }))) +
      `-${buildingWidth}-${aspectRatio}-${layoutVersion}`;
  }, [rooms, buildingWidth, aspectRatio, layoutVersion]);

  // Sync with Python Backend for Advanced Geometry
  React.useEffect(() => {
    let isMounted = true;
    const minLoadingTime = 1000; // Stabilize loader for 1s
    const startTime = Date.now();

    const fetchOptimizedLayout = async () => {
      if (rooms.length === 0) return;

      console.log('App: Starting stable optimization');
      setIsOptimizing(true);
      const flattenedRoomsInput = getFlattenedRooms(rooms);

      try {
        const response = await fetch(`${BACKEND_URL}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buildingWidth,
            buildingHeight: buildingWidth / (aspectRatio || 1.6),
            mode: aspectRatio >= 1.8 ? "vertical" : "horizontal",
            variation_seed: layoutVersion,
            rooms: flattenedRoomsInput
          })
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          const backendPlaced: PlacedRoom[] = data.rooms.map((pr: any) => {
            const baseId = pr.id.includes('__') ? pr.id.split('__')[0] : pr.id;
            const original = rooms.find(r => r.id === baseId);
            return {
              ...original!,
              id: pr.id,
              name: pr.name,
              x: pr.x,
              y: pr.y,
              width: pr.width,
              height: pr.height
            };
          });
          setLayoutResult({
            placedRooms: backendPlaced,
            totalHeight: data.totalHeight,
            efficiency: data.efficiency
          });
        } else {
          throw new Error("Backend optimization failed");
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Falling back to local packer:', err);
        const flattened = getFlattenedRooms(rooms);
        const local = packRooms(flattened, buildingWidth, aspectRatio >= 1.8, layoutVersion);
        setLayoutResult({
          placedRooms: local.placedRooms,
          totalHeight: local.totalHeight,
          efficiency: 0
        });
      } finally {
        if (isMounted) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minLoadingTime - elapsed);
          setTimeout(() => { if (isMounted) setIsOptimizing(false); }, remaining);
        }
      }
    };

    fetchOptimizedLayout();

    return () => { isMounted = false; };
  }, [layoutKey]);

  const { placedRooms, totalHeight, efficiency } = layoutResult;

  const budget = React.useMemo(() => calculateBudget(rooms), [rooms]);

  const addRoom = (type: RoomType) => {
    const template = ROOM_TEMPLATES[type];
    const mode = globalCalculationModes[type] || (
      [
        RoomType.POOL, RoomType.SSHH, RoomType.COMEDOR, RoomType.LOUNGE,
        RoomType.LACTARIO, RoomType.LOCKERS, RoomType.REUNION,
        RoomType.DIRECTORIO, RoomType.MEETBOX, RoomType.RECEPCION
      ].includes(type) ? 'person' : 'space'
    );

    const newRoom: RoomConfig = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: type,
      quantity: 1,
      calculationMode: mode
    };

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

    const defaultCap = globalCapacities[type] || capacityMap[type] || 1;
    if (capacityMap[type] || globalCapacities[type]) {
      newRoom.capacity = defaultCap;
    }

    if (type === RoomType.SSHH) {
      newRoom.sshhType = 'unitary';
    }

    if (mode === 'person') {
      if (type === RoomType.POOL) {
        const dims = calculatePoolDimensions(newRoom.capacity!, false, 0, 'horizontal', buildingWidth, aspectRatio >= 1.8);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.SSHH) {
        const dims = calculateSSHHDimensions(newRoom.capacity!, 'unitary');
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.COMEDOR) {
        const dims = calculateDiningDimensions(newRoom.capacity!, true);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.RECEPCION) {
        const dims = calculateReceptionDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.LOUNGE) {
        const dims = calculateLoungeDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.REUNION) {
        const dims = calculateReunionDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.DIRECTORIO) {
        const dims = calculateDirectorioDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.MEETBOX) {
        const dims = calculateMeetboxDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.LOCKERS) {
        const dims = calculateLockersDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      } else if (type === RoomType.LACTARIO) {
        const dims = calculateLactarioDimensions(newRoom.capacity!);
        newRoom.width = dims.width;
        newRoom.height = dims.height;
      }
    }

    setRooms([...rooms, newRoom]);
  };

  const updateGlobalModes = (modes: Record<string, 'person' | 'space'>) => {
    setGlobalCalculationModes(modes);
    localStorage.setItem('autoplan_calculation_modes', JSON.stringify(modes));
  };

  const updateGlobalCapacities = (capacities: Record<string, number>) => {
    setGlobalCapacities(capacities);
    localStorage.setItem('autoplan_global_capacities', JSON.stringify(capacities));
  };

  const updateRoom = (id: string, updates: Partial<RoomConfig>) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const recalculateDependentRooms = (currentRooms: RoomConfig[], newWidth: number, newRatio: number) => {
    const updated = currentRooms.map(r => {
      if (r.type === RoomType.POOL && r.calculationMode === 'person') {
        const dims = calculatePoolDimensions(
          r.capacity || 12,
          r.hasLockers || false,
          r.lockerCount || 0,
          r.poolOrientation || 'horizontal',
          newWidth,
          newRatio >= 1.8
        );
        return { ...r, width: dims.width, height: dims.height };
      }
      return r;
    });
    setRooms(updated);
  };

  const handleSmartSort = () => {
    const flattened = getFlattenedRooms(rooms);
    const sorted = smartSortRooms(flattened);
    const initialW = calculateOptimalWidth(sorted, aspectRatio);
    // Fast pack to find real used width
    const { actualWidth } = packRooms(sorted, initialW, aspectRatio >= 1.8, layoutVersion);
    setBuildingWidth(actualWidth);
    recalculateDependentRooms(rooms, actualWidth, aspectRatio);
  };

  const handleOptimizeShape = (ratio: number) => {
    setAspectRatio(ratio);
    const flattened = getFlattenedRooms(rooms);
    const initialWidth = calculateOptimalWidth(flattened, ratio);
    // Auto-shrink-wrap on shape optimization
    const { actualWidth } = packRooms(flattened, initialWidth, ratio >= 1.8, layoutVersion);
    setBuildingWidth(actualWidth);
    recalculateDependentRooms(rooms, actualWidth, ratio);
  };

  const isIframeMode = new URLSearchParams(window.location.search).get('mode') === 'iframe';

  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      {!isIframeMode && (
        <Sidebar
          rooms={rooms}
          onAddRoom={addRoom}
          onUpdateRoom={updateRoom}
          onRemoveRoom={removeRoom}
          buildingWidth={buildingWidth}
          onUpdateBuildingWidth={setBuildingWidth}
          onSmartSort={handleSmartSort}
          onOptimizeShape={handleOptimizeShape}
          showCirculation={showCirculation}
          onToggleCirculation={() => setShowCirculation(!showCirculation)}
          showInteractive={showInteractive}
          onToggleInteractive={() => setShowInteractive(!showInteractive)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
          paintedMode={paintedMode}
          onTogglePaintedMode={() => setPaintedMode(!paintedMode)}
          aspectRatio={aspectRatio}
          layoutVersion={layoutVersion}
          onUpdateLayoutVersion={setLayoutVersion}
          globalCalculationModes={globalCalculationModes}
          onUpdateGlobalModes={updateGlobalModes}
          globalCapacities={globalCapacities}
          onUpdateGlobalCapacities={updateGlobalCapacities}
          budget={budget}
        />
      )}
      <main className="flex-1 h-full relative overflow-hidden">
        {(isOptimizing || (isIframeMode && rooms.length === 0)) && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-300">
            {/* Minimal Technical Skeleton */}
            <div className="w-[85%] h-[75%] border border-blue-100 rounded-lg relative overflow-hidden bg-slate-50/50">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

              {/* Shimmering Boxes representing rooms */}
              <div className="absolute top-[10%] left-[10%] w-[30%] h-[20%] bg-blue-100/40 rounded animate-pulse"></div>
              <div className="absolute top-[10%] left-[45%] w-[15%] h-[20%] bg-blue-100/40 rounded animate-pulse delay-75"></div>
              <div className="absolute top-[35%] left-[10%] w-[50%] h-[30%] bg-blue-100/40 rounded animate-pulse delay-150"></div>
              <div className="absolute top-[10%] right-[10%] w-[20%] h-[55%] bg-blue-100/40 rounded animate-pulse delay-300"></div>

              {/* Subtle Spinner */}
              <div className="absolute bottom-10 right-10 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-blue-500 tracking-widest uppercase opacity-60">Optimizing Geometry</span>
              </div>
            </div>
          </div>
        )}
        <BlueprintCanvas
          rooms={placedRooms}
          buildingWidth={buildingWidth}
          totalHeight={totalHeight}
          showCirculation={showCirculation}
          showInteractive={showInteractive}
          showLabels={showLabels}
          paintedMode={paintedMode}
          isIframeMode={isIframeMode}
          efficiency={efficiency}
          budget={budget}
          onGenerateVariation={() => setLayoutVersion(v => v + 1)}
        >
          <AppTour
            isOpen={isTourOpen}
            steps={generalTourSteps}
            onComplete={() => {
              setIsTourOpen(false);
              setHasSeenTour(true);
            }}
          />

          <AppTour
            isOpen={isFSTourOpen}
            steps={fsTourSteps}
            onComplete={() => {
              setIsFSTourOpen(false);
              setHasSeenFSTour(true);
            }}
          />
        </BlueprintCanvas>
      </main>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default App;