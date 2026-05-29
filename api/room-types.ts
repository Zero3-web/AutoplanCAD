import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RoomType } from '../types';
import { ROOM_TEMPLATES } from '../constants';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Room type labels in Spanish
const ROOM_LABELS: Record<RoomType, string> = {
    [RoomType.GERENCIA]: 'Oficina Gerencia',
    [RoomType.JEFATURA]: 'Oficina Jefatura',
    [RoomType.POOL]: 'Pool de Trabajo',
    [RoomType.REUNION]: 'Sala de Reunión',
    [RoomType.DIRECTORIO]: 'Directorio',
    [RoomType.MEETBOX]: 'Cabina de Reunión',
    [RoomType.PHONEBOOTH]: 'Cabina Telefónica',
    [RoomType.KITCHENETTE]: 'Kitchenette',
    [RoomType.COMEDOR]: 'Comedor',
    [RoomType.LOUNGE]: 'Sala Lounge',
    [RoomType.LACTARIO]: 'Lactario',
    [RoomType.RECEPCION]: 'Recepción',
    [RoomType.LIMPIEZA]: 'Cuarto de Limpieza',
    [RoomType.ALMACEN]: 'Almacén',
    [RoomType.DATACENTER]: 'Centro de Datos',
    [RoomType.LOCKERS]: 'Casilleros',
    [RoomType.SSHH]: 'Servicios Higiénicos',
};

// Room categories
const ROOM_CATEGORIES = {
    trabajo: [RoomType.GERENCIA, RoomType.JEFATURA, RoomType.POOL],
    reuniones: [RoomType.REUNION, RoomType.DIRECTORIO, RoomType.MEETBOX, RoomType.PHONEBOOTH],
    comunes: [RoomType.KITCHENETTE, RoomType.COMEDOR, RoomType.LOUNGE, RoomType.LACTARIO],
    soporte: [RoomType.RECEPCION, RoomType.SSHH, RoomType.LIMPIEZA, RoomType.ALMACEN, RoomType.DATACENTER, RoomType.LOCKERS],
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

    if (req.method !== 'GET') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }

    const roomTypes = Object.values(RoomType).map(type => {
        const template = ROOM_TEMPLATES[type];
        return {
            type,
            label: ROOM_LABELS[type],
            defaultWidth: template.width,
            defaultHeight: template.height,
            area: template.width * template.height,
        };
    });

    res.status(200).json({
        success: true,
        data: {
            roomTypes,
            categories: ROOM_CATEGORIES,
        }
    });
}
