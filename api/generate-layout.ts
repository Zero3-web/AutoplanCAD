import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RoomConfig, RoomType, PlacedRoom } from '../types';
import { packRooms, calculateOptimalWidth } from '../utils/packer';
import { ROOM_TEMPLATES, GRID_SIZE } from '../constants';

// CORS headers for cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

interface RoomInput {
    type: RoomType;
    name?: string;
    capacity?: number;
    hasLockers?: boolean;
    lockerCount?: number;
    sshhType?: 'unitary' | 'multiple';
}

interface GenerateLayoutRequest {
    rooms: RoomInput[];
    buildingWidth?: number;
    format?: 'json' | 'svg';
}

interface GenerateLayoutResponse {
    success: boolean;
    data?: {
        placedRooms: PlacedRoom[];
        buildingWidth: number;
        totalHeight: number;
        svg?: string;
    };
    error?: string;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Convert room inputs to RoomConfig
const createRoomConfigs = (inputs: RoomInput[]): RoomConfig[] => {
    return inputs.map((input, index) => {
        const template = ROOM_TEMPLATES[input.type];
        if (!template) {
            throw new Error(`Unknown room type: ${input.type}`);
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

// Generate SVG from placed rooms
const generateSVG = (
    rooms: PlacedRoom[],
    buildingWidth: number,
    totalHeight: number
): string => {
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
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="white"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  
  <g transform="translate(${padding}, ${padding})">
    <!-- Building Outline -->
    <rect x="0" y="0" width="${widthPx}" height="${heightPx}" 
          fill="none" stroke="black" stroke-width="3"/>
    
    <!-- Rooms -->
`;

    rooms.forEach(room => {
        const pxX = room.x * GRID_SIZE;
        const pxY = room.y * GRID_SIZE;
        const pxW = room.width * GRID_SIZE;
        const pxH = room.height * GRID_SIZE;

        svg += `    <g transform="translate(${pxX}, ${pxY})">
      <rect x="0" y="0" width="${pxW}" height="${pxH}" 
            fill="white" stroke="black" stroke-width="1.5"/>
      <text x="${pxW / 2}" y="${pxH / 2}" 
            text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial" font-size="10" font-weight="bold">
        ${room.type}
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

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        res.status(200).end();
        return;
    }

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }

    try {
        const body = req.body as GenerateLayoutRequest;

        if (!body.rooms || !Array.isArray(body.rooms) || body.rooms.length === 0) {
            res.status(400).json({
                success: false,
                error: 'rooms array is required and must not be empty'
            });
            return;
        }

        // Convert inputs to room configs
        const roomConfigs = createRoomConfigs(body.rooms);

        // Calculate building width if not provided
        const buildingWidth = body.buildingWidth || calculateOptimalWidth(roomConfigs, 1.5);

        // Pack the rooms
        const { placedRooms, totalHeight } = packRooms(roomConfigs, buildingWidth);

        // Generate response
        const response: GenerateLayoutResponse = {
            success: true,
            data: {
                placedRooms,
                buildingWidth,
                totalHeight,
            }
        };

        // Add SVG if requested
        if (body.format === 'svg') {
            response.data!.svg = generateSVG(placedRooms, buildingWidth, totalHeight);
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Layout generation error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}
