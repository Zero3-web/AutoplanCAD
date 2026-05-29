import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Maximize2, RotateCcw, Dice5, MousePointer2, Hand, Tag, ZoomIn, ZoomOut, Search, Ruler, DollarSign, Share2, Image as ImageIcon, FileText } from 'lucide-react';
import { PlacedRoom, RoomType } from '../types';
import { GRID_SIZE } from '../constants';
import {
  StructuralColumn, MainEntrance, DoorBottom, DoorTop, DoorVertical, Chair, DiningChair, VisitorChair, Toilet, ArmChair, Sofa, Person, Plant, Sink
} from './canvas/Furniture';
import {
  DatacenterLayout, OfficeLayout, OpenSpaceLayout, MeetingTable,
  PhoneBoothLayout, KitchenLayout, DiningLayout, LoungeLayout,
  ReceptionLayout, StorageLayout, LockerLayout, SSHHLayout,
  MeetingLayout, BoardroomLayout, MeetboxLayout, LactaryLayout, CleaningLayout
} from './canvas/RoomLayouts';

interface BlueprintCanvasProps {
  rooms: PlacedRoom[];
  buildingWidth: number;
  totalHeight: number;
  showCirculation: boolean;
  showInteractive: boolean;
  showLabels: boolean;
  paintedMode?: boolean;
  isIframeMode?: boolean;
  efficiency?: number;
  budget?: import('../utils/budgetCalculator').BudgetResult;
  onGenerateVariation?: () => void;
  children?: React.ReactNode;
}

const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ rooms, buildingWidth, totalHeight, showCirculation, showInteractive, showLabels, paintedMode, isIframeMode, efficiency, budget, onGenerateVariation, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [localShowLabels, setLocalShowLabels] = useState(showLabels);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with prop if it changes from outside
  useEffect(() => {
    setLocalShowLabels(showLabels);
  }, [showLabels]);

  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [lastHoveredRoom, setLastHoveredRoom] = useState<PlacedRoom | null>(null);
  const [scale, setScale] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredSubArea, setHoveredSubArea] = useState<string | null>(null);
  const [selectedRoomImage, setSelectedRoomImage] = useState<{ img: string; name: string } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const widthPx = buildingWidth * GRID_SIZE;
  const heightPx = (totalHeight + 1) * GRID_SIZE;

  // Auto-fit Logic: Centered and grows/shrinks to fit
  const autoFit = () => {
    if (!containerRef.current || rooms.length === 0) return;
    const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
    const planW = buildingWidth * GRID_SIZE;
    // Account for annotations at the bottom (Escala Grafica + Text = ~100px)
    const planH = (totalHeight + 1) * GRID_SIZE + 100;

    if (planW === 0 || planH === 0) return;

    const padding = 40;
    const scaleX = (cw - padding * 2) / planW;
    const scaleY = (ch - padding * 2) / planH;
    const newScale = Math.min(scaleX, scaleY, 4.0);

    setScale(newScale);
    setOffset({
      x: (cw - planW * newScale) / 2,
      y: (ch - planH * newScale) / 2
    });
  };

  useEffect(() => {
    // Auto-fit on mount and on window resize to keep it centered and scaled
    const handleResize = () => autoFit();

    const handleFSChange = () => {
      autoFit();
      // Auto-unlock when entering fullscreen, auto-lock when exiting
      if (document.fullscreenElement) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFSChange);

    // Initial delay to allow container dimensions to be settled
    const timer = setTimeout(autoFit, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFSChange);
      clearTimeout(timer);
    };
  }, [rooms.length, buildingWidth, totalHeight]);




  React.useEffect(() => {
    const room = rooms.find(r => r.id === hoveredRoomId);
    if (room) setLastHoveredRoom(room);
  }, [hoveredRoomId, rooms]);

  // Efficiency Calculation
  // Efficiency Calculation (Primary from Backend, fallback to local)
  const displayEfficiency = useMemo(() => {
    if (efficiency !== undefined) return efficiency;
    if (buildingWidth === 0 || totalHeight === 0) return 0;
    const totalArea = buildingWidth * totalHeight;
    const usedArea = rooms.reduce((acc, r) => acc + (r.width * r.height), 0);
    return Math.round((usedArea / totalArea) * 100);
  }, [efficiency, rooms, buildingWidth, totalHeight]);

  // No more openConceptRooms — all rooms get walls

  const handleWheel = (e: React.WheelEvent) => {
    if (isLocked) return;
    e.preventDefault();
    const newScale = Math.max(0.1, Math.min(6, scale - e.deltaY * 0.001));
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autoplan_cad_${new Date().getTime()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPNG = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Create canvas with higher resolution for quality
      const scaleFactor = 2;
      const canvas = document.createElement('canvas');
      canvas.width = (widthPx + 100) * scaleFactor;
      canvas.height = (heightPx + 100) * scaleFactor;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scale and draw SVG
      ctx.scale(scaleFactor, scaleFactor);
      ctx.drawImage(img, 0, 0);

      // Export as PNG
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `autoplan_cad_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const getGroupedRooms = () => {
    const groups: Record<string, { type: RoomType; count: number; capacities: number[] }> = {};
    rooms.forEach(room => {
      const typeKey = room.type;
      if (!groups[typeKey]) {
        groups[typeKey] = { type: room.type, count: 0, capacities: [] };
      }
      groups[typeKey].count += 1;
      if (room.capacity) {
        groups[typeKey].capacities.push(room.capacity);
      }
    });
    return Object.values(groups);
  };

  const ROOM_DISPLAY_NAMES_SPANISH: Record<string, string> = {
    [RoomType.RECEPCION]: 'Recepción',
    [RoomType.LOUNGE]: 'Sala Lounge',
    [RoomType.GERENCIA]: 'Oficina Gerencia',
    [RoomType.JEFATURA]: 'Oficina Jefatura',
    [RoomType.POOL]: 'Pool de Trabajo',
    [RoomType.REUNION]: 'Sala de Reunión',
    [RoomType.DIRECTORIO]: 'Directorio',
    [RoomType.MEETBOX]: 'Meetbox',
    [RoomType.PHONEBOOTH]: 'Cabina Telefónica',
    [RoomType.KITCHENETTE]: 'Kitchenette',
    [RoomType.COMEDOR]: 'Comedor',
    [RoomType.DATACENTER]: 'Data Center',
    [RoomType.ALMACEN]: 'Almacén',
    [RoomType.LOCKERS]: 'Casilleros',
    [RoomType.SSHH]: 'SS.HH',
    [RoomType.LIMPIEZA]: 'Cuarto de Limpieza',
    [RoomType.LACTARIO]: 'Lactario'
  };

  const generateCombinedCanvas = (callback: (canvas: HTMLCanvasElement) => void) => {
    if (!svgRef.current) return;

    // 1. Clone the SVG element
    const svgElement = svgRef.current.cloneNode(true) as SVGSVGElement;
    
    // Reset pan/zoom transform so the exported blueprint is always perfectly unshifted and aligned
    const contentG = svgElement.querySelector('g[transform^="translate"]');
    if (contentG) {
      contentG.setAttribute('transform', 'translate(0, 0) scale(1)');
    }

    // Remove the grid dots background pattern for a 100% clean, pure white professional presentation
    const gridRect = svgElement.querySelector('rect[fill="url(#grid)"]');
    if (gridRect) {
      gridRect.remove();
    }

    const fullSVGWidth = widthPx;
    const fullSVGHeight = heightPx + 100; // include graphic scale at the bottom
    svgElement.setAttribute('width', String(fullSVGWidth));
    svgElement.setAttribute('height', String(fullSVGHeight));
    svgElement.setAttribute('viewBox', `0 0 ${fullSVGWidth} ${fullSVGHeight}`);

    // Serialize the cloned SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scaleFactor = 2; // High Resolution for stunning quality

      const margin = 40;
      const contentW = 720; // 800px total width minus 40px margins on both sides
      const planW = fullSVGWidth;
      const planH = fullSVGHeight;

      const grouped = getGroupedRooms();
      const rowsCount = Math.ceil(grouped.length / 2);
      const rowHeight = 26; // Compact, clean row height

      // Lock to A4 Portrait Aspect Ratio: Width 800px, Height 1130px (1:1.4125)
      const canvasW = 800 * scaleFactor;
      const canvasH = 1130 * scaleFactor;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Enable premium anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 2. Pure White Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 3. Draw content under scaled context
      ctx.save();
      ctx.scale(scaleFactor, scaleFactor);

      // Top block (Header & Metadata) stays at the top
      let currentY = margin;

      // Header: Ultra-minimalist Category & Title
      ctx.fillStyle = '#64748b'; // Slate-500
      ctx.font = '700 7px Outfit, Arial, sans-serif';
      ctx.fillText('FICHA TÉCNICA DEL PROYECTO', margin, currentY + 6);

      ctx.fillStyle = '#0f172a'; // Slate-900 (Deep charcoal)
      ctx.font = 'bold 20px Outfit, Arial, sans-serif';
      ctx.fillText('Propuesta de Distribución', margin, currentY + 28);

      currentY += 40;

      // Top Sleek Metadata Bar
      ctx.strokeStyle = '#cbd5e1'; // Slate-300
      ctx.lineWidth = 1;
      
      // Top line of metadata bar
      ctx.beginPath();
      ctx.moveTo(margin, currentY);
      ctx.lineTo(margin + contentW, currentY);
      ctx.stroke();

      // Bottom line of metadata bar
      ctx.beginPath();
      ctx.moveTo(margin, currentY + 55);
      ctx.lineTo(margin + contentW, currentY + 55);
      ctx.stroke();

      // Middle vertical separator
      ctx.beginPath();
      ctx.moveTo(margin + 360, currentY + 10);
      ctx.lineTo(margin + 360, currentY + 45);
      ctx.stroke();

      // Left Column: Area Est.
      ctx.fillStyle = '#64748b';
      ctx.font = '700 7px Outfit, Arial, sans-serif';
      ctx.fillText('ÁREA TOTAL EST. (INCLUYE CIRCULACIÓN)', margin + 10, currentY + 18);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Outfit, Arial, sans-serif';
      const m2Text = budget ? Math.ceil(budget.totalM2 + (budget.totalM2 * 0.20)) : 0;
      ctx.fillText(`${m2Text} m²`, margin + 10, currentY + 44);

      // Right Column: Price Est.
      ctx.fillStyle = '#64748b';
      ctx.font = '700 7px Outfit, Arial, sans-serif';
      ctx.fillText('HABILITACIÓN ESTIMADA', margin + 380, currentY + 18);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px Outfit, Arial, sans-serif';
      const finalPriceVal = budget ? (budget.totalPrice + (budget.totalM2 * 0.20 * 450)) : 0;
      ctx.fillText(finalPriceVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }), margin + 380, currentY + 44);

      // Calculate Bottom Block Height to anchor it perfectly to the bottom of the page
      const bottomBlockHeight = 105 + (rowsCount * rowHeight);
      const listStartY = 1130 - margin - bottomBlockHeight;

      // Middle space available for plan drawing between metadata bar and environments list
      const blueprintStartY = currentY + 55 + 20;
      const blueprintAvailableHeight = (listStartY - 20) - blueprintStartY;

      // Scale the blueprint drawing to maximize both width and height available in the middle
      const planScale = Math.min(contentW / planW, blueprintAvailableHeight / planH);
      const drawnW = planW * planScale;
      const drawnH = planH * planScale;

      // Draw Blueprint drawing centered inside the middle space
      ctx.save();
      const planX = margin + (contentW - drawnW) / 2;
      const planY = blueprintStartY + (blueprintAvailableHeight - drawnH) / 2;
      ctx.translate(planX, planY);
      ctx.scale(planScale, planScale);
      ctx.drawImage(img, 0, 0, planW, planH);
      ctx.restore();

      // Lock Environments section start
      currentY = listStartY;

      // Divider line before environments list
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin, currentY);
      ctx.lineTo(margin + contentW, currentY);
      ctx.stroke();

      currentY += 15;

      // Environments List Section Header
      ctx.fillStyle = '#64748b';
      ctx.font = '700 8px Outfit, Arial, sans-serif';
      ctx.fillText('AMBIENTES PLANIFICADOS', margin, currentY + 8);

      currentY += 20;

      const innerListStartY = currentY;
      let totalSpaces = 0;
      const colWidth = 340;
      const colGap = 40;

      // Render Environments list in a beautiful, clean 2-Column Grid
      grouped.forEach((group, index) => {
        const colIndex = index % 2;
        const rowIndex = Math.floor(index / 2);
        
        const itemX = margin + colIndex * (colWidth + colGap);
        const itemY = innerListStartY + rowIndex * rowHeight;

        const displayName = ROOM_DISPLAY_NAMES_SPANISH[group.type] || group.type;
        const totalPax = group.capacities.reduce((a, b) => a + b, 0);

        let finalCount = group.count;
        let isPersons = false;

        if (group.type === RoomType.POOL) {
          finalCount = 1;
          isPersons = true;
        } else if (group.type === RoomType.SSHH) {
          const isMulti = rooms.some(r => r.type === RoomType.SSHH && r.sshhType === 'multiple');
          if (isMulti) {
            finalCount = Math.ceil(totalPax / 20);
            isPersons = true;
          } else {
            finalCount = group.count;
            isPersons = false;
          }
        } else if ([RoomType.COMEDOR, RoomType.LOUNGE, RoomType.LACTARIO, RoomType.RECEPCION].includes(group.type)) {
          finalCount = 1;
          isPersons = true;
        } else if (group.type === RoomType.MEETBOX) {
          finalCount = Math.ceil(totalPax / 6);
          isPersons = true;
        } else if ([RoomType.REUNION, RoomType.DIRECTORIO].includes(group.type)) {
          const maxPax = group.type === RoomType.DIRECTORIO ? 14 : 8;
          finalCount = Math.ceil(totalPax / maxPax);
          isPersons = true;
        }

        totalSpaces += finalCount;

        // Clean Name and Pax description
        ctx.fillStyle = '#475569'; // Slate-600 (Soft Charcoal)
        ctx.font = '500 11px Outfit, Arial, sans-serif';
        const labelText = isPersons ? `${displayName} (${totalPax} pax)` : displayName;
        ctx.fillText(labelText, itemX, itemY + 12);

        // Sleek Right-Aligned Quantity Value
        ctx.fillStyle = '#0f172a'; // Slate-900
        ctx.font = 'bold 11px Outfit, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(finalCount), itemX + colWidth - 5, itemY + 12);
        ctx.textAlign = 'left'; // restore alignment

        // Extremely faint row divider
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(itemX, itemY + 18);
        ctx.lineTo(itemX + colWidth, itemY + 18);
        ctx.stroke();
      });

      currentY = innerListStartY + rowsCount * rowHeight + 10;

      // Draw final total spaces bar
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(margin, currentY);
      ctx.lineTo(margin + contentW, currentY);
      ctx.stroke();

      currentY += 18;

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px Outfit, Arial, sans-serif';
      ctx.fillText('TOTAL ESPACIOS PLANIFICADOS', margin, currentY + 10);

      ctx.font = 'bold 13px Outfit, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(totalSpaces), margin + contentW - 5, currentY + 10);
      ctx.textAlign = 'left'; // restore

      // Draw disclaimer & notes at the very bottom
      currentY += 40;
      ctx.fillStyle = '#94a3b8'; // Slate-400
      ctx.font = 'italic 7.5px Outfit, Arial, sans-serif';
      const lines = [
        '* Incluye ~20% de circulación técnica estándar en Lima.',
        'Los montos son referenciales para oficinas Prime.'
      ];
      ctx.fillText(lines[0], margin, currentY);
      ctx.fillText(lines[1], margin, currentY + 10);

      // Elegant Minimalist Branding
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)'; // Slate-900
      ctx.font = '800 13px Outfit, Arial, sans-serif';
      ctx.fillText('AREA PRIME', margin + contentW - 90, currentY + 10);

      ctx.restore();

      callback(canvas);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadCombinedPNG = () => {
    generateCombinedCanvas((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `autoplan_cotizacion_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    });
  };

  const downloadCombinedPDF = () => {
    generateCombinedCanvas((canvas) => {
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Cotización Autoplan CAD - Area Prime</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background-color: #ffffff;
              }
              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    });
  };

  useEffect(() => {
    const handleExportMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;
      if (event.data.type === 'TRIGGER_EXPORT_PNG') {
        downloadCombinedPNG();
      } else if (event.data.type === 'TRIGGER_EXPORT_PDF') {
        downloadCombinedPDF();
      }
    };
    window.addEventListener('message', handleExportMessage);
    return () => window.removeEventListener('message', handleExportMessage);
  }, [rooms, buildingWidth, totalHeight, budget]);

  const renderScaledContent = (room: PlacedRoom) => {
    const pxW = room.width * GRID_SIZE;
    const pxH = room.height * GRID_SIZE;

    let idealW = 80;
    let idealH = 60;

    let content = null;

    switch (room.type) {
      case RoomType.DATACENTER:
        content = <DatacenterLayout w={pxW} h={pxH} />;
        break;

      case RoomType.GERENCIA:
        idealW = pxW; idealH = pxH;
        content = <OfficeLayout w={pxW} h={pxH} executive={true} />;
        break;
      case RoomType.JEFATURA:
        idealW = pxW; idealH = pxH;
        content = <OfficeLayout w={pxW} h={pxH} executive={false} />;
        break;
      case RoomType.POOL:
        idealW = pxW; idealH = pxH;
        content = <OpenSpaceLayout w={pxW} h={pxH} capacity={room.capacity} hasLockers={room.hasLockers} lockerCount={room.lockerCount} showLabels={showLabels} poolOrientation={room.poolOrientation} />;
        break;
      case RoomType.REUNION:
        idealW = pxW; idealH = pxH;
        content = <MeetingLayout w={pxW} h={pxH} capacity={room.capacity} />;
        break;
      case RoomType.DIRECTORIO:
        idealW = pxW; idealH = pxH;
        content = <BoardroomLayout w={pxW} h={pxH} capacity={room.capacity} />;
        break;
      case RoomType.MEETBOX:
        idealW = pxW; idealH = pxH;
        content = <MeetboxLayout w={pxW} h={pxH} capacity={room.capacity} />;
        break;
      case RoomType.PHONEBOOTH:
        idealW = pxW; idealH = pxH;
        content = <PhoneBoothLayout w={pxW} h={pxH} />;
        break;
      case RoomType.KITCHENETTE:
        idealW = pxW; idealH = pxH;
        content = <KitchenLayout w={pxW} h={pxH} />;
        break;
      case RoomType.COMEDOR:
        idealW = pxW; idealH = pxH;
        content = <DiningLayout w={pxW} h={pxH} capacity={room.capacity} hasKitchenette={room.hasKitchenette} />;
        break;
      case RoomType.LOUNGE:
        idealW = pxW; idealH = pxH;
        content = <LoungeLayout w={pxW} h={pxH} capacity={room.capacity} />;
        break;
      case RoomType.LACTARIO:
        idealW = pxW; idealH = pxH;
        content = <LactaryLayout w={pxW} h={pxH} />;
        break;
      case RoomType.RECEPCION:
        idealW = pxW; idealH = pxH;
        content = <ReceptionLayout w={pxW} h={pxH} capacity={room.capacity} loungeCapacity={room.lockerCount} />;
        break;
      case RoomType.LIMPIEZA:
        idealW = 50; idealH = 40;
        content = <CleaningLayout w={pxW} h={pxH} />;
        break;
      case RoomType.ALMACEN:
        idealW = pxW; idealH = pxH;
        content = <StorageLayout w={pxW} h={pxH} />;
        break;
      case RoomType.LOCKERS:
        // This case might be unreachable now if removed from palette, but kept for safety
        idealW = pxW; idealH = pxH;
        content = <LockerLayout w={pxW} h={pxH} capacity={room.capacity} />;
        break;
      case RoomType.SSHH:
        idealW = pxW; idealH = pxH;
        // PASSING CAPACITY AND TYPE
        content = <SSHHLayout w={pxW} h={pxH} capacity={room.capacity} type={room.sshhType} showLabels={showLabels} />;
        break;
      default: return null;
    }

    const scaleX = pxW / idealW;
    const scaleY = pxH / idealH;
    let scale = Math.min(scaleX, scaleY) * 0.9;

    // For Pool/Lockers/SSHH/Reception/Lounge, we want 1:1 scale mostly
    const isAutoScaled = [
      RoomType.POOL,
      RoomType.LOCKERS,
      RoomType.SSHH,
      RoomType.ALMACEN,
      RoomType.RECEPCION,
      RoomType.LOUNGE,
      RoomType.DATACENTER,
      RoomType.PHONEBOOTH,
      RoomType.COMEDOR,
      RoomType.DIRECTORIO,
      RoomType.REUNION,
      RoomType.GERENCIA,
      RoomType.JEFATURA,
      RoomType.KITCHENETTE,
      RoomType.LACTARIO,
      RoomType.LIMPIEZA,
      RoomType.MEETBOX
    ].includes(room.type);

    if (isAutoScaled) {
      scale = 1;
      idealW = pxW;
      idealH = pxH;
    } else {
      if (scale > 1.3) scale = 1.3;
      if (scale < 0.6) scale = 0.6; // Better visibility
    }

    // ANTI-CROWDING: Hide furniture in extremely narrow rooms
    if (room.width < 1.5 && room.type !== RoomType.POOL) {
      return null;
    }

    // DOOR COLLISION PREVENTION: Nudge furniture away from the door wall
    const isTopRow = room.y < 0.1;
    const isBottomRow = room.y > (totalHeight / 2) && room.type !== RoomType.POOL;
    const isMiddleRow = !isTopRow && !isBottomRow && [RoomType.GERENCIA, RoomType.JEFATURA, RoomType.REUNION, RoomType.DIRECTORIO, RoomType.MEETBOX].includes(room.type);

    // Nudge amount in pixels
    let yNudge = 0;
    if (isTopRow || isMiddleRow) {
      yNudge = -4; // Shift UP (away from bottom door)
    } else if (isBottomRow || room.type === RoomType.POOL) {
      yNudge = 4; // Shift DOWN (away from top door)
    }

    return (
      <g transform={`translate(${pxW / 2}, ${pxH / 2 + yNudge}) scale(${scale}) translate(${-idealW / 2}, ${-idealH / 2})`}>
        {content}
      </g>
    );
  };

  // Generate Structural Grid with COLLISION DETECTION
  const renderStructuralGrid = () => {
    const columns: React.ReactElement[] = [];

    // Helper to check collision with any room
    const isColliding = (cx: number, cy: number) => {
      return rooms.some(room => {
        const rx = room.x * GRID_SIZE;
        const ry = room.y * GRID_SIZE;
        const rw = room.width * GRID_SIZE;
        const rh = room.height * GRID_SIZE;
        // Add a small buffer to avoid touching walls
        return cx > rx + 4 && cx < rx + rw - 4 && cy > ry + 4 && cy < ry + rh - 4;
      });
    };

    const addColumn = (x: number, y: number, key: string) => {
      if (!isColliding(x, y)) {
        columns.push(<StructuralColumn key={key} x={x} y={y} />);
      }
    };

    // Always corners
    addColumn(0, 0, "c-tl");
    addColumn(widthPx, 0, "c-tr");
    addColumn(0, heightPx, "c-bl");
    addColumn(widthPx, heightPx, "c-br");

    const colSpacing = 160; // 8 meters

    // Top & Bottom Edge intermediates
    const xSteps = Math.floor(widthPx / colSpacing);
    if (xSteps > 1) {
      const step = widthPx / xSteps;
      for (let i = 1; i < xSteps; i++) {
        addColumn(i * step, 0, `c-t-${i}`);
        addColumn(i * step, heightPx, `c-b-${i}`);
      }
    }

    // Left & Right Edge intermediates
    const ySteps = Math.floor(heightPx / colSpacing);
    if (ySteps > 1) {
      const step = heightPx / ySteps;
      for (let i = 1; i < ySteps; i++) {
        addColumn(0, i * step, `c-l-${i}`);
        addColumn(widthPx, i * step, `c-r-${i}`);
      }
    }

    // Internal Grid Points REMOVED based on user feedback (cleaning up visual clutter)
    /*
    if (xSteps > 1 && ySteps > 1) {
      const xStep = widthPx / xSteps;
            const yStep = heightPx / ySteps;
            for (let ix = 1; ix < xSteps; ix++) {
        for (let iy = 1; iy < ySteps; iy++) {
              addColumn(ix * xStep, iy * yStep, `c-in-${ix}-${iy}`);
        }
      }
    }
            */

    return <g>{columns}</g>;
  }

  // Room display names (user-friendly titles)
  const ROOM_DISPLAY_NAMES: Record<string, string> = {
    [RoomType.RECEPCION]: 'Recepción',
    [RoomType.LOUNGE]: 'Sala Lounge',
    [RoomType.GERENCIA]: 'Oficina Gerencia',
    [RoomType.JEFATURA]: 'Oficina Jefatura',
    [RoomType.POOL]: 'Pool de Trabajo',
    [RoomType.REUNION]: 'Sala de Reunión',
    [RoomType.DIRECTORIO]: 'Directorio',
    [RoomType.MEETBOX]: 'Meetbox',
    [RoomType.PHONEBOOTH]: 'Cabina Telefónica',
    [RoomType.KITCHENETTE]: 'Kitchenette',
    [RoomType.COMEDOR]: 'Comedor',
    [RoomType.DATACENTER]: 'Data Center',
    [RoomType.ALMACEN]: 'Almacén',
    [RoomType.LOCKERS]: 'Lockers',
    [RoomType.SSHH]: 'SS.HH',
    [RoomType.LIMPIEZA]: 'Cuarto de Limpieza',
    [RoomType.LACTARIO]: 'Lactario'
  };

  const ROOM_INFO: Record<string, { desc: string, img: string }> = {
    [RoomType.RECEPCION]: {
      desc: 'Recepción',
      img: '/assets/room_images/reception.png'
    },
    [RoomType.LOUNGE]: {
      desc: 'Sala Lounge',
      img: '/assets/room_images/lounge.png'
    },
    [RoomType.GERENCIA]: {
      desc: 'Oficina Gerencia',
      img: '/assets/room_images/office.png'
    },
    [RoomType.JEFATURA]: {
      desc: 'Oficina Jefatura',
      img: '/assets/room_images/office.png'
    },
    [RoomType.POOL]: {
      desc: 'Pool de Trabajo',
      img: '/assets/room_images/pool.png'
    },
    [RoomType.REUNION]: {
      desc: 'Sala de Reunión',
      img: '/assets/room_images/meeting.png'
    },
    [RoomType.DIRECTORIO]: {
      desc: 'Directorio',
      img: '/assets/room_images/meeting.png'
    },
    [RoomType.MEETBOX]: {
      desc: 'Meetbox',
      img: '/assets/room_images/phonebooth.png'
    },
    [RoomType.PHONEBOOTH]: {
      desc: 'Cabina Telefónica',
      img: '/assets/room_images/phonebooth.png'
    },
    [RoomType.KITCHENETTE]: {
      desc: 'Kitchenette',
      img: '/assets/room_images/kitchen.png'
    },
    [RoomType.COMEDOR]: {
      desc: 'Comedor',
      img: '/assets/room_images/comedor.png'
    },
    [RoomType.DATACENTER]: {
      desc: 'Data Center',
      img: '/assets/room_images/datacenter.png'
    },
    [RoomType.ALMACEN]: {
      desc: 'Almacén',
      img: '/assets/room_images/almacen.png'
    },
    [RoomType.LOCKERS]: {
      desc: 'Lockers',
      img: '/assets/room_images/lockers.png'
    },
    [RoomType.SSHH]: {
      desc: 'SS.HH',
      img: '/assets/room_images/sshh.png'
    },
    [RoomType.LIMPIEZA]: {
      desc: 'Cuarto de Limpieza',
      img: '/assets/room_images/almacen.png'
    },
    [RoomType.LACTARIO]: {
      desc: 'Lactario',
      img: '/assets/room_images/lounge.png'
    }
  };

  const hoveredRoom = rooms.find(r => r.id === hoveredRoomId);
  const activeRoom = hoveredRoom || lastHoveredRoom;
  const cardInfo = activeRoom ? ROOM_INFO[activeRoom.type] : null;
  const isCardVisible = !isLocked && hoveredRoomId !== null && cardInfo !== null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-gray-200 relative overflow-hidden font-sans"
    >
      {/* Minimal Hover Card - Image + Title only, positioned outside the wall */}
      {(showInteractive || !isLocked) && activeRoom && cardInfo && (
        <div
          className="absolute z-[9999] pointer-events-none transition-all duration-300 ease-out"
          style={{
            right: '25px',
            top: '25px',
            opacity: isCardVisible ? 1 : 0,
            transform: isCardVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
          }}
        >
          <div className={`bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/60 overflow-hidden ${document.fullscreenElement ? 'w-64' : 'w-48'} cursor-pointer`}>
            <div className={`${document.fullscreenElement ? 'h-40' : 'h-28'} w-full overflow-hidden relative`}>
              <img
                src={cardInfo.img}
                alt={activeRoom.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="px-3 py-2 text-center bg-blue-50/80">
              <p className={`text-blue-900 font-bold ${document.fullscreenElement ? 'text-lg' : 'text-sm'} leading-tight`}>
                {activeRoom.type === RoomType.POOL && activeRoom.hasLockers && hoveredSubArea === 'lockers'
                  ? 'Casilleros del Equipo'
                  : activeRoom.type === RoomType.POOL && activeRoom.hasLockers
                    ? 'Pool + Casilleros'
                    : (ROOM_DISPLAY_NAMES[activeRoom.type] || activeRoom.name)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Click-to-Expand Image Modal */}
      {selectedRoomImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          onClick={() => setSelectedRoomImage(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-4 animate-[scaleIn_0.3s_ease-out_forwards]">
            <div className="relative">
              <img
                src={selectedRoomImage.img}
                alt={selectedRoomImage.name}
                className="w-full h-72 object-cover"
              />
              <button
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedRoomImage(null); }}
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-gray-900 font-bold text-xl">{selectedRoomImage.name}</h3>
            </div>
          </div>
          <style>{`
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* Top Toolbar */}
      {!isIframeMode && (
        <div className="absolute top-4 right-4 z-10 flex gap-1.5">
          {/* Zoom Controls */}
          <div className="flex gap-0 shadow-lg rounded-lg overflow-hidden">
            <button
              onClick={() => setScale(s => Math.min(5, s + 0.3))}
              className="bg-white hover:bg-gray-100 text-gray-700 px-2.5 py-1 border border-gray-300 text-sm font-bold"
              title="Acercar"
            >
              🔍+
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.3, s - 0.3))}
              className="bg-white hover:bg-gray-100 text-gray-700 px-2.5 py-1 border-y border-r border-gray-300 text-sm font-bold"
              title="Alejar"
            >
              🔍−
            </button>
          </div>
          {/* Main Actions */}
          <div className="flex gap-0 shadow-lg rounded-lg overflow-hidden">
            <button
              onClick={() => { setOffset({ x: 50, y: 50 }); setScale(1.2); }}
              className="bg-white hover:bg-gray-100 text-gray-800 px-3 py-1 border border-gray-300 text-xs font-semibold"
            >
              ⟳ Vista
            </button>
            {onGenerateVariation && (
              <button
                onClick={onGenerateVariation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 border border-purple-600 text-xs font-bold"
                title="Generar una variación del diseño actual"
              >
                🎲 Variación
              </button>
            )}
            <button
              onClick={downloadPNG}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 border border-green-600 text-xs font-mono font-bold"
            >
              .PNG
            </button>
            <button
              onClick={downloadSVG}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 border border-blue-600 text-xs font-mono font-bold"
            >
              .SVG
            </button>
          </div>
        </div>
      )}

      <div
        className={`w-full h-full relative overflow-hidden ${isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Vertical floating control bar on the left */}
        <div className="absolute top-1/2 left-6 -translate-y-1/2 z-[150] flex flex-col items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-5 rounded-full shadow-2xl border border-gray-100">

          {document.fullscreenElement && (
            <>
              <button
                id="tour-interactive"
                onClick={() => {
                  setIsLocked(!isLocked);
                  if (isLocked) {
                    autoFit();
                  }
                }}
                className={`p-2 rounded-full transition-all ${!isLocked ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-50'}`}
                title={isLocked ? "Activar Modo Interactivo" : "Modo Interactivo Activo"}
              >
                {isLocked ? <MousePointer2 size={18} /> : <Hand size={18} />}
              </button>

              <div className="w-6 h-[1px] bg-gray-200 my-1"></div>
            </>
          )}

          {document.fullscreenElement && (
            <>
              {/* Zoom Control Group */}
              <div id="tour-zoom" className="flex flex-col gap-1 items-center bg-gray-50/50 rounded-full p-1">
                <button
                  onClick={() => setScale(s => Math.min(6, s + 0.4))}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-full"
                  title="Acercar (Zoom +)"
                >
                  <ZoomIn size={18} />
                </button>

                <div className="h-20 w-1 flex items-center justify-center relative">
                  <input
                    type="range"
                    min="0.3"
                    max="6"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="absolute w-16 h-1 appearance-none bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
                    style={{ transform: 'rotate(-90deg)' }}
                  />
                </div>

                <button
                  onClick={() => setScale(s => Math.max(0.2, s - 0.4))}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-full"
                  title="Alejar (Zoom -)"
                >
                  <ZoomOut size={18} />
                </button>
              </div>

              <div className="w-6 h-[1px] bg-gray-200 my-1"></div>
            </>
          )}

          {onGenerateVariation && (
            <button
              id="tour-variation"
              onClick={onGenerateVariation}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all rounded-full"
              title="Generar Variación"
            >
              <Dice5 size={18} />
            </button>
          )}

          <button
            id="tour-labels"
            onClick={() => setLocalShowLabels(!localShowLabels)}
            className={`p-2 rounded-full transition-all ${localShowLabels ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
            title="Mostrar/Ocultar Etiquetas"
          >
            <Tag size={18} />
          </button>

          <div className="w-6 h-[1px] bg-gray-200 my-1"></div>

          {/* Premium Direct PDF Export */}
          <button
            onClick={downloadCombinedPDF}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-full"
            title="Exportar Plano y Cotización a PDF"
          >
            <Share2 size={18} />
          </button>

          <div className="w-6 h-[1px] bg-gray-200 my-1"></div>

          <button
            id="tour-fullscreen"
            onClick={() => {
              if (containerRef.current) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  containerRef.current.requestFullscreen();
                }
              }
            }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all rounded-full"
            title="Pantalla Completa"
          >
            <Maximize2 size={18} />
          </button>
        </div>


        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ backgroundColor: '#ffffff' }}
        >
          <defs>
            <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e5e5e5" />
            </pattern>
            <pattern id="circulationHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1" opacity="0.3" />
            </pattern>
            <pattern id="lobbyTiles" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="25" height="25" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <pattern id="sshhTiles" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect width="6" height="6" fill="#f8fafc" opacity="0.5" />
              <rect x="6" y="6" width="6" height="6" fill="#f8fafc" opacity="0.5" />
            </pattern>
            <pattern id="kitchenTiles" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="16" height="16" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
            <pattern id="woodFloor" width="40" height="8" patternUnits="userSpaceOnUse">
              <rect width="40" height="8" fill="none" />
              <line x1="0" y1="0" x2="40" y2="0" stroke="#e2e8f0" strokeWidth="0.5" />
              <line x1="20" y1="0" x2="20" y2="8" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.7" />
            </pattern>
            <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.12" />
            </filter>
            {rooms.map(room => (
              <clipPath key={`clip-${room.id}`} id={`clip-${room.id}`}>
                <rect x="0" y="0" width={room.width * GRID_SIZE} height={room.height * GRID_SIZE} />
              </clipPath>
            ))}
          </defs>

          {paintedMode && (
            <style>
              {`
                /* Subtle grays for base furniture / desks */
                .painted-content rect[fill="white"] { fill: #f1f5f9 !important; }
                .painted-content rect[fill="#f5f5f5"] { fill: #e2e8f0 !important; }
                .painted-content rect[fill="#eee"] { fill: #cbd5e1 !important; }
                
                /* Specific Furniture Colors */
                .painted-content .furn-chair .furn-seat { fill: #dbeafe !important; } /* Soft blue */
                .painted-content .furn-dining-chair .furn-seat { fill: #fed7aa !important; } /* Orange/woodish */
                .painted-content .furn-visitor-chair .furn-seat { fill: #fef08a !important; } /* Soft yellow */
                .painted-content .furn-sofa { fill: #e0e7ff !important; } /* Indigo stylish */
                
                /* Ceramics & Plants */
                .painted-content .furn-ceramic { fill: #f8fafc !important; }
                .painted-content .furn-plant-leaf { fill: #4ade80 !important; stroke: #14532d !important; }
                .painted-content .furn-plant-pot { fill: #c2410c !important; }
                
                /* People */
                .painted-content .furn-person-body { fill: #f9a8d4 !important; }
                .painted-content .furn-person-head { fill: #fbcfe8 !important; }
              `}
            </style>
          )}

          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>

            {/* Circulation Slab (Background) - CONDITIONAL RENDERING */}
            {rooms.length > 0 && showCirculation && (
              <rect
                x={0}
                y={0}
                width={widthPx}
                height={heightPx}
                fill="url(#circulationHatch)"
                stroke="none"
              />
            )}

            {/* PASS 1: Floors */}
            <g>
              {rooms.map((room) => {
                const pxX = room.x * GRID_SIZE;
                const pxY = room.y * GRID_SIZE;
                const pxW = room.width * GRID_SIZE;
                const pxH = room.height * GRID_SIZE;
                const isHovered = hoveredRoomId === room.id;

                const getBgColor = () => {
                  if (showInteractive && isHovered) return "rgba(27, 53, 160, 0.25)";

                  switch (room.type) {
                    case RoomType.PHONEBOOTH:
                    case RoomType.KITCHENETTE:
                    case RoomType.DATACENTER:
                      return paintedMode ? "#f8fafc" : "#f1f5f9";
                    case RoomType.GERENCIA:
                    case RoomType.JEFATURA:
                    case RoomType.DIRECTORIO:
                    case RoomType.REUNION:
                      return paintedMode ? "#fdfcf8" : "#f8fafc";
                    case RoomType.RECEPCION:
                      return paintedMode ? "#fafafa" : "#fdfdfd";
                    default:
                      return "white";
                  }
                };

                return (
                  <g key={`floor-group-${room.id}`}>
                    <rect
                      x={pxX}
                      y={pxY}
                      width={pxW}
                      height={pxH}
                      fill={getBgColor()}
                      stroke={!isLocked && isHovered ? "#1B35A0" : "none"}
                      strokeWidth={!isLocked && isHovered ? 4 : 0}
                      onMouseEnter={() => {
                        setHoveredRoomId(room.id);
                      }}
                      onMouseMove={(e) => {
                        if (room.type === RoomType.POOL && room.hasLockers) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const relativeY = (e.clientY - rect.top) / scale;

                          // Match OpenSpaceLayout logic for locker height
                          const LOCKERS_PER_UNIT = 4;
                          const physicalLockerCount = Math.ceil((room.lockerCount || 0) / LOCKERS_PER_UNIT);
                          const bankW = room.width * 10 - 10;
                          const unitsPerRow = Math.max(1, Math.floor((bankW - 18) / 12));
                          const lockerRowsCount = Math.ceil(physicalLockerCount / unitsPerRow);
                          const lockerAreaH = lockerRowsCount * 30 + 5;

                          if (relativeY < lockerAreaH) {
                            setHoveredSubArea('lockers');
                          } else {
                            setHoveredSubArea(null);
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredRoomId(null);
                        setHoveredSubArea(null);
                      }}
                      style={{ transition: 'all 0.3s ease', cursor: !isLocked ? 'pointer' : 'grab' }}
                    />
                    {paintedMode && room.type === RoomType.RECEPCION && <rect x={pxX} y={pxY} width={pxW} height={pxH} fill="url(#lobbyTiles)" opacity="0.5" pointerEvents="none" />}
                    {paintedMode && (room.type === RoomType.SSHH || room.type === RoomType.LIMPIEZA) && <rect x={pxX} y={pxY} width={pxW} height={pxH} fill="url(#sshhTiles)" opacity="0.6" pointerEvents="none" />}
                    {paintedMode && (room.type === RoomType.KITCHENETTE || room.type === RoomType.COMEDOR) && <rect x={pxX} y={pxY} width={pxW} height={pxH} fill="url(#kitchenTiles)" opacity="0.5" pointerEvents="none" />}
                    {paintedMode && ([RoomType.GERENCIA, RoomType.JEFATURA, RoomType.DIRECTORIO, RoomType.REUNION].includes(room.type)) && <rect x={pxX} y={pxY} width={pxW} height={pxH} fill="url(#woodFloor)" opacity="0.5" pointerEvents="none" />}
                  </g>
                );
              })}
            </g>

            {/* PASS 2: Black Walls (Outlines) */}
            <g pointerEvents="none">
              {rooms.map((room) => {
                const pxX = room.x * GRID_SIZE;
                const pxY = room.y * GRID_SIZE;
                const pxW = room.width * GRID_SIZE;
                const pxH = room.height * GRID_SIZE;
                const openConceptRooms = [RoomType.RECEPCION, RoomType.LOUNGE];
                const isOC = openConceptRooms.includes(room.type);

                const nRight = rooms.find(r => r.id !== room.id && Math.abs(room.x + room.width - r.x) < 0.25 && Math.abs(r.y - room.y) < 0.5);
                const nLeft = rooms.find(r => r.id !== room.id && Math.abs(r.x + r.width - room.x) < 0.25 && Math.abs(r.y - room.y) < 0.5);
                const nTop = rooms.find(r => r.id !== room.id && Math.abs(room.y - (r.y + r.height)) < 0.25 && Math.abs(r.x - room.x) < 0.5);
                const nBottom = rooms.find(r => r.id !== room.id && Math.abs(room.y + room.height - r.y) < 0.25 && Math.abs(r.x - room.x) < 0.5);

                const skipRightOC = isOC && nRight && openConceptRooms.includes(nRight.type);
                const skipLeftOC = isOC && nLeft && openConceptRooms.includes(nLeft.type);
                const skipTopOC = isOC && nTop && openConceptRooms.includes(nTop.type);
                const skipBottomOC = isOC && nBottom && openConceptRooms.includes(nBottom.type);

                const isTopRow = room.y < 0.1;
                const isBottomRow = room.y > (totalHeight / 2) && room.type !== RoomType.POOL;

                const isTouchingLeft = room.x < 0.1;
                const isTouchingRight = (room.x + room.width) > buildingWidth - 0.1;
                const isTouchingTop = room.y < 0.1;
                const isTouchingBottom = (room.y + room.height) > (totalHeight - 0.1);

                const hasNeighborRight = !!nRight;
                const hasNeighborBottom = !!nBottom;
                const hasNeighborTop = !!nTop;
                const hasNeighborLeft = !!nLeft;

                const isMiddleRow = !isTopRow && !isBottomRow && [RoomType.GERENCIA, RoomType.JEFATURA, RoomType.REUNION, RoomType.DIRECTORIO, RoomType.MEETBOX].includes(room.type);
                const isPool = room.type === RoomType.POOL;
                const isSSHH = room.type === RoomType.SSHH;

                // SSHH always gets door on bottom (interior side), never on top/perimeter
                const canDoorBottom = (isTopRow || isMiddleRow || (isSSHH && !isTouchingBottom)) && !isTouchingBottom;
                const canDoorTop = (isBottomRow || isPool) && !isTouchingTop && !isSSHH;

                const canDoorRight = isTouchingRight && false; // No side doors for now
                const canDoorLeft = false;

                const isSmallDoor = [RoomType.DATACENTER, RoomType.KITCHENETTE, RoomType.ALMACEN, RoomType.MEETBOX, RoomType.PHONEBOOTH, RoomType.LACTARIO, RoomType.LIMPIEZA].includes(room.type);
                const doorSize = isSmallDoor ? 14 : 18;

                // Double door logic for large rooms and multi-occupancy SSHH
                const isMultiSSHH = isSSHH && room.sshhType === 'multiple';
                const useDoubleDoor = (pxW > 220 && room.type === RoomType.POOL) || isMultiSSHH;
                const doorPositions = useDoubleDoor
                  ? [pxW * 0.25 - doorSize / 2, pxW * 0.75 - doorSize / 2]
                  : [pxW / 2 - doorSize / 2];

                const doorTopVisible = canDoorTop && !skipTopOC;
                const doorBottomVisible = canDoorBottom && !skipBottomOC;

                return (
                  <g key={`walls-black-${room.id}`} transform={`translate(${pxX}, ${pxY})`} stroke="black" strokeWidth="6" strokeLinecap="butt">
                    {/* Top — Skip if Perimeter (Pass 5 handles it) */}
                    {!isTouchingTop && !skipTopOC && (doorTopVisible ? (
                      <>
                        {doorPositions.map((pos, idx) => (
                          <React.Fragment key={`top-b-${idx}`}>
                            <line x1={idx === 0 ? 0 : doorPositions[idx - 1] + doorSize} y1="0" x2={pos} y2="0" />
                            {idx === doorPositions.length - 1 && <line x1={pos + doorSize} y1="0" x2={pxW} y2="0" />}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (room.type === RoomType.SSHH ? null : <line x1="0" y1="0" x2={pxW} y2="0" />))}

                    {/* Bottom — Skip if Perimeter (Pass 5 handles it) */}
                    {!isTouchingBottom && !skipBottomOC && (doorBottomVisible ? (
                      <>
                        {doorPositions.map((pos, idx) => (
                          <React.Fragment key={`bot-b-${idx}`}>
                            <line x1={idx === 0 ? 0 : doorPositions[idx - 1] + doorSize} y1={pxH} x2={pos} y2={pxH} />
                            {idx === doorPositions.length - 1 && <line x1={pos + doorSize} y1={pxH} x2={pxW} y2={pxH} />}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (room.type === RoomType.SSHH ? null : <line x1="0" y1={pxH} x2={pxW} y2={pxH} />))}

                    {/* Left — Skip if Perimeter */}
                    {!isTouchingLeft && !skipLeftOC && (canDoorLeft ? (
                      <>
                        <line x1="0" y1="0" x2="0" y2={pxH - doorSize - 5} />
                        <line x1="0" y1={pxH - 5} x2="0" y2={pxH} />
                      </>
                    ) : <line x1="0" y1="0" x2="0" y2={pxH} />)}

                    {/* Right — Skip if Perimeter */}
                    {!isTouchingRight && !skipRightOC && !hasNeighborRight && (canDoorRight ? (
                      <>
                        <line x1={pxW} y1="0" x2={pxW} y2={pxH - 12 - doorSize} />
                        <line x1={pxW} y1={pxH - 12} x2={pxW} y2={pxH} />
                      </>
                    ) : <line x1={pxW} y1="0" x2={pxW} y2={pxH} />)}
                  </g>
                );
              })}
            </g>

            {/* PASS 3: White Walls (Inner Fill to clean unions) — mirrors Pass 2 exactly */}
            <g pointerEvents="none">
              {rooms.map((room) => {
                const pxX = room.x * GRID_SIZE;
                const pxY = room.y * GRID_SIZE;
                const pxW = room.width * GRID_SIZE;
                const pxH = room.height * GRID_SIZE;

                const openConceptRooms = [RoomType.RECEPCION, RoomType.LOUNGE];
                const isOC = openConceptRooms.includes(room.type);

                const nRight = rooms.find(r => r.id !== room.id && Math.abs(room.x + room.width - r.x) < 0.25 && Math.abs(r.y - room.y) < 0.5);
                const nLeft = rooms.find(r => r.id !== room.id && Math.abs(r.x + r.width - room.x) < 0.25 && Math.abs(r.y - room.y) < 0.5);
                const nTop = rooms.find(r => r.id !== room.id && Math.abs(room.y - (r.y + r.height)) < 0.25 && Math.abs(r.x - room.x) < 0.5);
                const nBottom = rooms.find(r => r.id !== room.id && Math.abs(room.y + room.height - r.y) < 0.25 && Math.abs(r.x - room.x) < 0.5);

                const skipRightOC = isOC && nRight && openConceptRooms.includes(nRight.type);
                const skipLeftOC = isOC && nLeft && openConceptRooms.includes(nLeft.type);
                const skipTopOC = isOC && nTop && openConceptRooms.includes(nTop.type);
                const skipBottomOC = isOC && nBottom && openConceptRooms.includes(nBottom.type);

                const isTouchingLeft = room.x < 0.1;
                const isTouchingRight = (room.x + room.width) > buildingWidth - 0.1;
                const isTouchingTop = room.y < 0.1;
                const isTouchingBottom = (room.y + room.height) > (totalHeight - 0.1);

                const isTopRow = isTouchingTop;
                const isBottomRow = room.y > (totalHeight / 2) && room.type !== RoomType.POOL;

                const hasNeighborRight = !!nRight;

                const isMiddleRow = !isTopRow && !isBottomRow && [RoomType.GERENCIA, RoomType.JEFATURA, RoomType.REUNION, RoomType.DIRECTORIO, RoomType.MEETBOX].includes(room.type);
                const isPool = room.type === RoomType.POOL;
                const isSSHH = room.type === RoomType.SSHH;

                const canDoorBottom = (isTopRow || isMiddleRow || (isSSHH && !isTouchingBottom)) && !isTouchingBottom;
                const canDoorTop = (isBottomRow || isPool) && !isTouchingTop && !isSSHH;

                const isSmallDoor = [RoomType.DATACENTER, RoomType.KITCHENETTE, RoomType.ALMACEN, RoomType.MEETBOX, RoomType.PHONEBOOTH, RoomType.LACTARIO, RoomType.LIMPIEZA].includes(room.type);
                const doorSize = isSmallDoor ? 14 : 18;

                const isMultiSSHH = isSSHH && room.sshhType === 'multiple';
                const useDoubleDoor = (pxW > 220 && room.type === RoomType.POOL) || isMultiSSHH;
                const doorPositions = useDoubleDoor
                  ? [pxW * 0.25 - doorSize / 2, pxW * 0.75 - doorSize / 2]
                  : [pxW / 2 - doorSize / 2];

                const doorTopVisible = canDoorTop && !skipTopOC;
                const doorBottomVisible = canDoorBottom && !skipBottomOC;

                return (
                  <g key={`walls-white-${room.id}`} transform={`translate(${pxX}, ${pxY})`} stroke="white" strokeWidth="2" strokeLinecap="butt">
                    {/* Top — Skip if Perimeter */}
                    {!isTouchingTop && !skipTopOC && (doorTopVisible ? (
                      <>
                        {doorPositions.map((pos, idx) => (
                          <React.Fragment key={`top-w-${idx}`}>
                            <line x1={idx === 0 ? 0 : doorPositions[idx - 1] + doorSize + 2} y1="0" x2={pos - 2} y2="0" />
                            {idx === doorPositions.length - 1 && <line x1={pos + doorSize + 2} y1="0" x2={pxW} y2="0" />}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (room.type === RoomType.SSHH ? null : <line x1="0" y1="0" x2={pxW} y2="0" />))}

                    {/* Bottom — Skip if Perimeter */}
                    {!isTouchingBottom && !skipBottomOC && (doorBottomVisible ? (
                      <>
                        {doorPositions.map((pos, idx) => (
                          <React.Fragment key={`bot-w-${idx}`}>
                            <line x1={idx === 0 ? 0 : doorPositions[idx - 1] + doorSize + 2} y1={pxH} x2={pos - 2} y2={pxH} />
                            {idx === doorPositions.length - 1 && <line x1={pos + doorSize + 2} y1={pxH} x2={pxW} y2={pxH} />}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (room.type === RoomType.SSHH ? null : <line x1="0" y1={pxH} x2={pxW} y2={pxH} />))}

                    {/* Left — Skip if Perimeter */}
                    {!isTouchingLeft && !skipLeftOC && <line x1="0" y1="0" x2="0" y2={pxH} />}

                    {/* Right — Skip if Perimeter */}
                    {!isTouchingRight && !skipRightOC && !hasNeighborRight && <line x1={pxW} y1="0" x2={pxW} y2={pxH} />}
                  </g>
                );
              })}
            </g>

            {/* PASS 4: Furniture, Doors, Labels */}
            <g pointerEvents="none">
              {rooms.map((room) => {
                const pxX = room.x * GRID_SIZE;
                const pxY = room.y * GRID_SIZE;
                const pxW = room.width * GRID_SIZE;
                const pxH = room.height * GRID_SIZE;

                const isTopRow = room.y < 0.1;
                const isBottomRow = room.y > (totalHeight / 2) && room.type !== RoomType.POOL;

                const isTouchingLeft = room.x < 0.1;
                const isTouchingRight = room.x + room.width > buildingWidth - 0.1;
                const hasNeighborOnLeft = rooms.some(r => r.id !== room.id && Math.abs(r.x + r.width - room.x) < 0.1 && Math.abs(r.y - room.y) < 1);
                const hasNeighborOnRight = rooms.some(r => r.id !== room.id && Math.abs(room.x + room.width - r.x) < 0.1 && Math.abs(r.y - room.y) < 1);

                const isMiddleOffice = [RoomType.GERENCIA, RoomType.JEFATURA, RoomType.REUNION, RoomType.DIRECTORIO, RoomType.MEETBOX].includes(room.type);
                const isPool = room.type === RoomType.POOL;
                const isSSHH = room.type === RoomType.SSHH;

                const canDoorBottom = isTopRow || isMiddleOffice || (isSSHH && !(room.y + room.height > (totalHeight - 0.1)));
                const canDoorTop = (isBottomRow || isPool) && !isSSHH;
                const canDoorLeft = false;
                const canDoorRight = isTouchingRight;

                const isSmallDoor = [RoomType.DATACENTER, RoomType.KITCHENETTE, RoomType.ALMACEN, RoomType.MEETBOX, RoomType.PHONEBOOTH, RoomType.LACTARIO, RoomType.LIMPIEZA].includes(room.type);
                const doorSize = isSmallDoor ? 14 : 18;

                const isMultiSSHH = isSSHH && room.sshhType === 'multiple';
                const useDoubleDoor = (pxW > 220 && room.type === RoomType.POOL) || isMultiSSHH;
                const doorPositions = useDoubleDoor
                  ? [pxW * 0.25 - doorSize / 2, pxW * 0.75 - doorSize / 2]
                  : [pxW / 2 - doorSize / 2];

                const rightDoorY = pxH > 35 ? pxH / 2 - doorSize / 2 : pxH - doorSize - 2;

                return (
                  <g key={`content-${room.id}`} transform={`translate(${pxX}, ${pxY})`}>
                    {/* Furniture */}
                    <g className={paintedMode ? "painted-content" : ""} clipPath={`url(#clip-${room.id})`} filter={paintedMode ? "url(#dropShadow)" : "none"}>
                      {renderScaledContent(room)}
                    </g>

                    {/* Doors */}
                    {canDoorTop && doorPositions.map((pos, i) => (
                      <DoorTop key={`dt-${i}`} x={pos} y={0} size={doorSize} />
                    ))}
                    {canDoorBottom && doorPositions.map((pos, i) => (
                      <DoorBottom key={`db-${i}`} x={pos + doorSize} y={pxH} size={doorSize} />
                    ))}
                    {canDoorRight && !isTouchingRight && !hasNeighborOnRight && <DoorVertical x={pxW} y={rightDoorY} size={doorSize} flip={true} />}
                    {canDoorLeft && !isTouchingLeft && !hasNeighborOnLeft && <DoorVertical x={0} y={pxH - 5} size={doorSize} />}

                    {/* Labels - Always visible if toggled */}
                    {localShowLabels && (
                      <g transform={`translate(${pxW / 2}, ${pxH / 2})`}>
                        {(() => {
                          const isTiny = room.width < 2 || room.height < 2;
                          const isNarrow = room.width < 3;

                          // Calculate Vertical Jitter to avoid collisions in rows
                          const roomIndex = rooms.indexOf(room);
                          const yOffset = (isNarrow && roomIndex % 2 === 0) ? -20 :
                            (isNarrow && roomIndex % 2 !== 0) ? 20 : 0;

                          // Smart abbreviations for narrow rooms
                          const ABBREVIATIONS: Record<string, string> = {
                            'Cabina Telefónica': 'TEL.',
                            'Centro de Datos': 'DATA',
                            'Cuarto Limpieza': 'LIMP.',
                            'Cabina Reunión': 'MEETBOX',
                            'Sala Reunión': 'REUNIÓN',
                            'Pool de Trabajo': 'POOL',
                            'Oficina Gerencia': 'GERENCIA',
                            'Oficina Jefatura': 'JEFATURA',
                            'Sala Lounge': 'LOUNGE',
                          };

                          const getLabel = () => {
                            const capacityStr = !isTiny && room.capacity ? ` (${room.capacity})` : '';
                            let baseName = room.name;

                            // Locker integration label logic
                            if (room.type === RoomType.POOL && room.hasLockers) {
                              baseName = isNarrow ? 'P+C' : 'Pool + Casilleros';
                            }

                            if (pxW < 50) {
                              const abbr = ABBREVIATIONS[baseName] || baseName;
                              return abbr.length > 10 ? abbr.substring(0, 8) + '..' : abbr;
                            }
                            if (pxW < 80) {
                              const abbr = ABBREVIATIONS[baseName] || baseName;
                              return abbr + capacityStr;
                            }
                            if (room.id === 'lobby-merged') return "LOBBY (RECEP + LOUNGE)";
                            return baseName + capacityStr;
                          };

                          return (
                            <g transform={`translate(0, ${yOffset})`}>
                              {!isTiny && <rect x="-35" y="-8" width="70" height="16" fill="white" opacity="0.85" rx="2" />}
                              <text y={isTiny ? 2 : 3} textAnchor="middle" fill="black" fontSize={isTiny ? "5" : "7"} fontFamily="Arial, sans-serif" fontWeight="bold" style={{ textTransform: 'uppercase' }}>
                                {getLabel()}
                              </text>
                            </g>
                          )
                        })()}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Building Envelope (Perimeter) - Drawn LAST */}
            {
              rooms.length > 0 && (
                <g>
                  {/* Main Outer Walls (Thick) with Entrance Gap Logic */}
                  {(() => {
                    const entryWidth = 60; // 3 meters

                    // Find the most bottom reception/lounge room
                    const receptionCandidates = rooms.filter(r =>
                      r.type === RoomType.RECEPCION ||
                      r.type === RoomType.LOUNGE ||
                      r.id === 'lobby-merged' ||
                      r.id.startsWith('lobby')
                    );

                    const bottomReception = receptionCandidates.length > 0
                      ? receptionCandidates.reduce((prev, curr) => {
                        // Priority 1: Pick room further down (higher Y)
                        if (curr.y > prev.y + 0.1) return curr;
                        if (prev.y > curr.y + 0.1) return prev;
                        // Same row? Prioritize Reception/Lobby type over generic Lounge
                        const isPrevFavored = prev.type === RoomType.RECEPCION || prev.id.includes('lobby');
                        const isCurrFavored = curr.type === RoomType.RECEPCION || curr.id.includes('lobby');
                        if (isCurrFavored && !isPrevFavored) return curr;
                        return prev;
                      })
                      : null;

                    const topReception = receptionCandidates.length > 0
                      ? receptionCandidates.reduce((prev, curr) => (prev.y < curr.y) ? prev : curr)
                      : null;

                    const hasTopReception = topReception && topReception.y < 2;
                    const hasBottomReception = bottomReception && bottomReception.y > (totalHeight / 2);

                    // If no specific reception found, default to bottom entrance (Standard)
                    const showBottomEntrance = hasBottomReception || (!hasTopReception && !hasBottomReception);

                    let entryX = widthPx / 2;
                    if (showBottomEntrance && hasBottomReception && bottomReception) {
                      // If it's a merged lobby or has lounge capacity, align with the desk (usually on the left side, ~25%)
                      const isMerged = bottomReception.id.includes('lobby') || (bottomReception.lockerCount && bottomReception.lockerCount > 0);
                      const multiplier = isMerged ? 0.25 : 0.5;
                      entryX = (bottomReception.x + bottomReception.width * multiplier) * GRID_SIZE;
                    } else if (hasTopReception && topReception) {
                      entryX = (topReception.x + topReception.width / 2) * GRID_SIZE;
                    }

                    return (
                      <>
                        {/* Top Wall */}
                        {hasTopReception ? (
                          <>
                            {/* Double Line Wall Effect */}
                            <line x1={0} y1={0} x2={entryX - entryWidth / 2} y2={0} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={0} y1={0} x2={entryX - entryWidth / 2} y2={0} stroke="white" strokeWidth="2" strokeLinecap="square" />

                            <line x1={entryX + entryWidth / 2} y1={0} x2={widthPx} y2={0} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={entryX + entryWidth / 2} y1={0} x2={widthPx} y2={0} stroke="white" strokeWidth="2" strokeLinecap="square" />

                            <MainEntrance x={entryX} y={0} width={entryWidth} rotation={180} />
                          </>
                        ) : (
                          <>
                            <line x1={0} y1={0} x2={widthPx} y2={0} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={0} y1={0} x2={widthPx} y2={0} stroke="white" strokeWidth="2" strokeLinecap="square" />
                          </>
                        )}

                        {/* Right Wall */}
                        <line x1={widthPx} y1={0} x2={widthPx} y2={heightPx} stroke="black" strokeWidth="6" strokeLinecap="square" />
                        <line x1={widthPx} y1={0} x2={widthPx} y2={heightPx} stroke="white" strokeWidth="2" strokeLinecap="square" />

                        {/* Left Wall */}
                        <line x1={0} y1={0} x2={0} y2={heightPx} stroke="black" strokeWidth="6" strokeLinecap="square" />
                        <line x1={0} y1={0} x2={0} y2={heightPx} stroke="white" strokeWidth="2" strokeLinecap="square" />

                        {/* Bottom Wall */}
                        {showBottomEntrance ? (
                          <>
                            <line x1={0} y1={heightPx} x2={entryX - entryWidth / 2} y2={heightPx} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={0} y1={heightPx} x2={entryX - entryWidth / 2} y2={heightPx} stroke="white" strokeWidth="2" strokeLinecap="square" />

                            <line x1={entryX + entryWidth / 2} y1={heightPx} x2={widthPx} y2={heightPx} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={entryX + entryWidth / 2} y1={heightPx} x2={widthPx} y2={heightPx} stroke="white" strokeWidth="2" strokeLinecap="square" />

                            <MainEntrance x={entryX} y={heightPx} width={entryWidth} rotation={0} />
                          </>
                        ) : (
                          <>
                            <line x1={0} y1={heightPx} x2={widthPx} y2={heightPx} stroke="black" strokeWidth="6" strokeLinecap="square" />
                            <line x1={0} y1={heightPx} x2={widthPx} y2={heightPx} stroke="white" strokeWidth="2" strokeLinecap="square" />
                          </>
                        )}
                      </>
                    )
                  })()}

                  {/* Structural Columns */}
                  {renderStructuralGrid()}
                </g>
              )
            }

            {/* TOOLTIP LAYER - Rendered LAST to be on top of everything */}

            {/* External Dimensions */}


            {/* PASS 6: Architectural Annotations (North, Scale) */}
            <g>
              {/* North Arrow Removed */}
              {/* Graphic Scale - Bottom Left outside building */}
              <g transform={`translate(0, ${heightPx + 30})`}>
                <rect x="0" y="0" width="100" height="4" fill="white" stroke="black" strokeWidth="0.5" />
                <rect x="0" y="0" width="50" height="4" fill="black" />
                <text x="0" y="15" fontSize="8" fontFamily="Arial">0</text>
                <text x="50" y="15" fontSize="8" fontFamily="Arial">2.5m</text>
                <text x="100" y="15" fontSize="8" fontFamily="Arial">5m</text>
                <text x="0" y="-8" fontSize="10" fontStyle="italic" fontFamily="Arial">Escala Gráfica</text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <div className="bg-white border-t border-gray-300 p-1 px-4 text-[10px] font-mono text-gray-500 flex justify-between select-none items-center">
        <div className="flex gap-4">
        </div>

        {/* New Efficiency Metrics */}
        <div className="flex gap-4 items-center">
          {budget && (
            <>
              <span className="flex items-center gap-1 border-r border-gray-300 pr-4">
                <Ruler size={10} className="text-blue-500" /> AREA TOTAL: <b>{Math.ceil(budget.totalM2)} m²</b>
              </span>
              <span className="flex items-center gap-1 border-r border-gray-300 pr-4">
                <DollarSign size={10} className="text-emerald-500" /> INVERSIÓN: <b className="text-emerald-600">{budget.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</b>
              </span>
            </>
          )}
          <span title="Ratio of Usable Room Area vs Total Area">EFICIENCIA: <b>{displayEfficiency}%</b></span>
          <span>{rooms.length} ZONAS DEFINIDAS</span>
        </div>
      </div>

      {children}
    </div>
  );
};

export default BlueprintCanvas;