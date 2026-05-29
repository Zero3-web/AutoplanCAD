/**
 * Local development server for testing API endpoints
 * Run with: npx ts-node --esm server.ts
 * or: npx tsx server.ts
 */
import http from 'http';
import { packRooms } from './utils/packer';
import { ROOM_TEMPLATES, GRID_SIZE } from './constants';
import { RoomType, RoomConfig, PlacedRoom } from './types';
import fs from 'fs';
import path from 'path';
import {
    calculatePoolDimensions,
    calculateSSHHDimensions,
    calculateReceptionDimensions,
    calculateLoungeDimensions,
    calculateDiningDimensions
} from './utils/dimensionCalculators';

const PORT = 3002;

// Room labels for display
const ROOM_LABELS: Record<RoomType, string> = {
    [RoomType.GERENCIA]: 'Gerencia',
    [RoomType.JEFATURA]: 'Jefatura',
    [RoomType.POOL]: 'Pool',
    [RoomType.REUNION]: 'Reunión',
    [RoomType.DIRECTORIO]: 'Directorio',
    [RoomType.MEETBOX]: 'Meet Box',
    [RoomType.PHONEBOOTH]: 'Phone',
    [RoomType.KITCHENETTE]: 'Kitchen',
    [RoomType.COMEDOR]: 'Comedor',
    [RoomType.LOUNGE]: 'Lounge',
    [RoomType.LACTARIO]: 'Lactario',
    [RoomType.RECEPCION]: 'Recepción',
    [RoomType.LIMPIEZA]: 'Limpieza',
    [RoomType.ALMACEN]: 'Almacén',
    [RoomType.DATACENTER]: 'Data Center',
    [RoomType.LOCKERS]: 'Lockers',
    [RoomType.SSHH]: 'SS.HH'
};

interface RoomInput {
    type: string;
    name?: string;
    capacity?: number;
    hasLockers?: boolean;
    lockerCount?: number;
    sshhType?: 'unitary' | 'multiple';
}

let idCounter = 0;
const generateId = () => `room-${++idCounter}-${Date.now()}`;

const createRoomConfigs = (inputs: RoomInput[]): RoomConfig[] => {
    return inputs.map((input, index) => {
        const roomType = Object.values(RoomType).find(rt => rt === input.type);
        if (!roomType) {
            throw new Error(`Unknown room type: ${input.type}`);
        }

        const template = { ...ROOM_TEMPLATES[roomType] };
        const capacity = input.capacity || 0;

        // Apply dynamic dimension calculations if capacity is provided
        if (capacity > 0) {
            if (roomType === RoomType.POOL) {
                const dims = calculatePoolDimensions(capacity, !!input.hasLockers, input.lockerCount || 0);
                template.width = dims.width;
                template.height = dims.height;
            } else if (roomType === RoomType.SSHH) {
                const dims = calculateSSHHDimensions(capacity, input.sshhType || 'unitary');
                template.width = dims.width;
                template.height = dims.height;
            } else if (roomType === RoomType.COMEDOR) {
                const dims = calculateDiningDimensions(capacity, true);
                template.width = dims.width;
                template.height = dims.height;
            } else if (roomType === RoomType.RECEPCION) {
                const dims = calculateReceptionDimensions(capacity);
                template.width = dims.width;
                template.height = dims.height;
            } else if (roomType === RoomType.LOUNGE) {
                const dims = calculateLoungeDimensions(capacity);
                template.width = dims.width;
                template.height = dims.height;
            }
        }

        return {
            ...template,
            id: generateId(),
            name: input.name || `${input.type}-${index + 1}`,
            capacity: input.capacity,
            hasLockers: input.hasLockers,
            lockerCount: input.lockerCount,
            sshhType: input.sshhType,
        };
    });
};

const generateSVG = (rooms: PlacedRoom[], buildingWidth: number, totalHeight: number): string => {
    const widthPx = buildingWidth * GRID_SIZE;
    const heightPx = (totalHeight + 1) * GRID_SIZE;
    const padding = 20;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${widthPx + padding * 2}" 
     height="${heightPx + padding * 2}" 
     viewBox="0 0 ${widthPx + padding * 2} ${heightPx + padding * 2}">
  <defs>
    <pattern id="grid" width="${GRID_SIZE}" height="${GRID_SIZE}" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.5" fill="#e5e5e5"/>
    </pattern>
  </defs>
  
  <rect width="100%" height="100%" fill="white"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  
  <g transform="translate(${padding}, ${padding})">
    <rect x="0" y="0" width="${widthPx}" height="${heightPx}" 
          fill="none" stroke="black" stroke-width="3"/>
`;

    rooms.forEach(room => {
        const pxX = room.x * GRID_SIZE;
        const pxY = room.y * GRID_SIZE;
        const pxW = room.width * GRID_SIZE;
        const pxH = room.height * GRID_SIZE;
        const label = ROOM_LABELS[room.type] || room.type;

        svg += `    <g transform="translate(${pxX}, ${pxY})">
      <rect x="0" y="0" width="${pxW}" height="${pxH}" 
            fill="white" stroke="black" stroke-width="1.5"/>
      <text x="${pxW / 2}" y="${pxH / 2}" 
            text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial" font-size="10" font-weight="bold">
        ${label}
      </text>
      <text x="${pxW / 2}" y="${pxH / 2 + 12}" 
            text-anchor="middle" font-family="Arial" font-size="8" fill="#666">
        ${room.width.toFixed(1)}m x ${room.height.toFixed(1)}m
      </text>
    </g>
`;
    });

    svg += `  </g>
</svg>`;

    return svg;
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);

    // Set CORS headers for all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoint: /api/generate-layout
    if (url.pathname === '/api/generate-layout' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { rooms, buildingWidth = 20, format = 'json' } = data;

                if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'rooms array is required' }));
                    return;
                }

                const roomConfigs = createRoomConfigs(rooms);
                const { placedRooms, totalHeight } = packRooms(roomConfigs, buildingWidth);

                const response: any = {
                    success: true,
                    data: {
                        placedRooms,
                        totalHeight,
                        buildingWidth,
                        roomCount: placedRooms.length
                    }
                };

                if (format === 'svg') {
                    response.data.svg = generateSVG(placedRooms, buildingWidth, totalHeight);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const fullPath = path.join(process.cwd(), filePath);

    const extname = path.extname(fullPath);
    const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ts': 'application/javascript',
        '.tsx': 'application/javascript',
    };

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentTypes[extname] || 'text/plain' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 API & Test Server running at http://localhost:${PORT}`);
    console.log(`📋 API endpoint: http://localhost:${PORT}/api/generate-layout`);
    console.log(`🎨 UI / Frontend: http://localhost:3001 (Use this for the app)`);
    console.log(`✨ Wizard: http://localhost:${PORT}/wizard-layout.html\n`);
});
