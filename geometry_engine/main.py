from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from shapely.geometry import box, Polygon
from fastapi.middleware.cors import CORSMiddleware
import math
import random

app = FastAPI(title="AutoplanCAD Geometry Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoomRequest(BaseModel):
    id: str
    name: str
    type: str 
    width: float
    height: float
    minWidth: Optional[float] = 1.0
    minHeight: Optional[float] = 1.0
    capacity: Optional[int] = None

class LayoutRequest(BaseModel):
    buildingWidth: float
    buildingHeight: float
    rooms: List[RoomRequest]
    mode: str = "horizontal"
    variation_seed: Optional[int] = 0

class OptimizedRoom(BaseModel):
    id: str
    x: float
    y: float
    width: float
    height: float
    name: str
    type: str

class LayoutResponse(BaseModel):
    rooms: List[OptimizedRoom]
    efficiency: float
    totalHeight: float

def pack_band_multi_row(container_w, start_y, rooms: List[RoomRequest], min_w_limit=2.0, corridor_h=2.4, fill_width=False):
    """
    Packs a list of rooms into one or more rows if they don't fit in one.
    fill_width=True forces rooms to always stretch to fill the full container width.
    Smart scaling: small utility rooms have a lower stretch cap to avoid absurd proportions.
    """
    if not rooms:
        return [], start_y

    # Room types that should NOT be stretched excessively
    SMALL_ROOM_TYPES = {'cabina', 'telefónic', 'telefonic', 'phonebooth', 'ss.hh', 'sshh', 
                        'limpieza', 'almacén', 'almacen', 'lactario', 'meetbox', 'data'}

    rows = []
    current_row = []
    current_row_w = 0
    
    for r in rooms:
        room_min_w = max(r.width, min_w_limit)
        if current_row_w + room_min_w > container_w and current_row:
            rows.append(current_row)
            current_row = [r]
            current_row_w = room_min_w
        else:
            current_row.append(r)
            current_row_w += room_min_w
            
    if current_row:
        rows.append(current_row)

    placed = []
    curr_y = start_y
    MAX_SCALE = 1.25
    SMALL_ROOM_MAX_SCALE = 1.5  # Small rooms can stretch a bit more than default but not infinitely
    
    for row in rows:
        row_h = max([r.height for r in row], default=3.5)
        total_ideal_w = sum([max(r.width, min_w_limit) for r in row])
        raw_scale = container_w / total_ideal_w if total_ideal_w > 0 else 1
        
        # Check if the row is entirely composed of small/utility rooms
        is_small_row = all(
            any(st in r.type.lower() for st in SMALL_ROOM_TYPES) or any(st in r.name.lower() for st in SMALL_ROOM_TYPES)
            for r in row
        )
        
        if fill_width:
            if is_small_row and raw_scale > SMALL_ROOM_MAX_SCALE:
                # Don't stretch small rooms infinitely — cap and center them
                scale = SMALL_ROOM_MAX_SCALE
            else:
                scale = raw_scale
        else:
            scale = min(raw_scale, MAX_SCALE)
        
        total_actual_w = total_ideal_w * scale
        
        # CENTER the row if it doesn't fill the width (small rooms capped)
        if total_actual_w < container_w:
            curr_x = (container_w - total_actual_w) / 2
        else:
            curr_x = 0
        
        for r in row:
            final_w = max(r.width, min_w_limit) * scale
            placed.append(OptimizedRoom(
                id=r.id, x=curr_x, y=curr_y, width=final_w, height=row_h, name=r.name, type=r.type
            ))
            curr_x += final_w
        curr_y += row_h + corridor_h
        
    return placed, curr_y


def calculate_layout_v3(container_w, container_h, rooms_req: List[RoomRequest]):
    """
    V3.3: Smart proportional layout.
    - Auto-shrinks building for few rooms
    - Dynamic corridor sizes
    - Top (y=0, North): Services & Private
    - Bottom (y=max, South): Public & Entrance
    """
    
    back_rooms = []   # Services / Quiet
    mgmt_rooms = []   # Private offices
    pool_rooms = []   # Open space
    front_rooms = []  # Entry / Public
    
    for r in rooms_req:
        t = r.type.lower()
        if 'gerencia' in t or 'jefatura' in t or 'reunión' in t or 'directorio' in t or 'office' in t:
            mgmt_rooms.append(r)
        elif 'recepción' in t or 'recepcion' in t or 'lounge' in t or 'espera' in t or 'recep' in t or 'comedor' in t:
            front_rooms.append(r)
        elif 'pool' in t or 'trabajo' in t or 'work' in t:
            pool_rooms.append(r)
        elif 'ss.hh' in t or 'aseo' in t or 'baño' in t or 'datos' in t or 'data' in t or 'limpieza' in t or 'almacén' in t or 'almacen' in t or 'lactario' in t or 'cafetería' in t or 'kitchen' in t or 'telefónic' in t or 'telefonic' in t or 'cabina' in t:
            back_rooms.append(r)
        else:
            front_rooms.append(r)

    # AUTO-SHRINK: If few rooms, reduce building width proportionally
    total_room_area = sum(r.width * r.height for r in rooms_req)
    total_rooms = len(rooms_req)
    
    # Calculate a reasonable width based on room area
    if total_rooms <= 4:
        # For very few rooms, use a tighter aspect ratio
        optimal_w = math.sqrt(total_room_area * 1.8)  # ~1.8 aspect
        container_w = min(container_w, max(optimal_w, 8.0))  # Min 8m width
    elif total_rooms <= 6:
        optimal_w = math.sqrt(total_room_area * 1.5)
        container_w = min(container_w, max(optimal_w, 10.0))

    # DYNAMIC CORRIDORS based on number of bands
    active_bands = sum(1 for band in [back_rooms, mgmt_rooms, pool_rooms, front_rooms] if band)
    CORRIDOR_H = 1.2 if active_bands <= 3 else 1.5
    
    optimized = []
    current_y = 0
    
    # DYNAMIC VERTICAL CORRIDOR: Smaller for smaller buildings
    VERTICAL_CORRIDOR_W = 1.2 if container_w < 14 else 1.8
    effective_w = container_w - VERTICAL_CORRIDOR_W
    
    # 1. Back (Services/Top) — use container_w (Full Width) to cap corridor
    if back_rooms:
        placed, next_y = pack_band_multi_row(container_w, current_y, back_rooms, min_w_limit=1.5, corridor_h=CORRIDOR_H, fill_width=True)
        optimized.extend(placed)
        current_y = next_y

    # 2. Private/Management — use effective_w (leave space for vertical corridor)
    if mgmt_rooms:
        placed, next_y = pack_band_multi_row(effective_w, current_y, mgmt_rooms, min_w_limit=2.5, corridor_h=CORRIDOR_H, fill_width=True)
        optimized.extend(placed)
        current_y = next_y

    # 3. Core (Pool) — use effective_w (leave space for vertical corridor)  
    if pool_rooms:
        placed, next_y = pack_band_multi_row(effective_w, current_y, pool_rooms, min_w_limit=4.0, corridor_h=CORRIDOR_H, fill_width=True)
        optimized.extend(placed)
        current_y = next_y

    # 4. Front (Public/Bottom) — use container_w (Full Width) to cap corridor
    if front_rooms:
        placed, next_y = pack_band_multi_row(container_w, current_y, front_rooms, min_w_limit=3.0, corridor_h=0, fill_width=True)
        optimized.extend(placed)
        current_y = next_y

    # Calculate final bounding height
    final_building_h = current_y

    # Efficiency using Shapely
    total_area = 0
    for r in optimized:
        total_area += box(r.x, r.y, r.x + r.width, r.y + r.height).area
    
    efficiency = (total_area / (container_w * final_building_h)) * 100 if final_building_h > 0 else 0
    
    return optimized, round(efficiency, 1), round(final_building_h, 2)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/optimize", response_model=LayoutResponse)
async def optimize_layout(request: LayoutRequest):
    # Apply variation seed to shuffle rooms within categories for different layouts
    req_rooms = list(request.rooms)
    if request.variation_seed and request.variation_seed > 0:
        rng = random.Random(request.variation_seed)
        rng.shuffle(req_rooms)
    rooms, eff, total_h = calculate_layout_v3(request.buildingWidth, request.buildingHeight, req_rooms)
    return LayoutResponse(rooms=rooms, efficiency=eff, totalHeight=total_h)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
