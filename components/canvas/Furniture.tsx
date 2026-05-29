import React from 'react';

export const StructuralColumn: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <rect
        x={x - 2.5}
        y={y - 2.5}
        width={5}
        height={5}
        fill="black"
        stroke="none"
    />
);

export const MainEntrance: React.FC<{ x: number; y: number; width: number; rotation?: number }> = ({ x, y, width, rotation = 0 }) => {
    const doorW = 30;
    return (
        <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <rect x={-width / 2} y={-4} width={width} height={8} fill="#eee" stroke="none" />
            <path d={`M -${doorW} 0 A ${doorW} ${doorW} 0 0 0 0 -${doorW}`} fill="none" stroke="black" strokeWidth="0.8" strokeDasharray="3,3" />
            <line x1={-doorW} y1={0} x2={-doorW} y2={-doorW} stroke="black" strokeWidth="2" />
            <path d={`M ${doorW} 0 A ${doorW} ${doorW} 0 0 1 0 -${doorW}`} fill="none" stroke="black" strokeWidth="0.8" strokeDasharray="3,3" />
            <line x1={doorW} y1={0} x2={doorW} y2={-doorW} stroke="black" strokeWidth="2" />
            <g transform={`rotate(${-rotation})`}>
                <text x={0} y={rotation === 180 ? -15 : 25} textAnchor="middle" fontSize="10" fontFamily="Arial" fontWeight="bold" letterSpacing="2">INGRESO</text>
                <polygon points={`-5,${rotation === 180 ? -10 : 15} 5,${rotation === 180 ? -10 : 15} 0,${rotation === 180 ? -5 : 10}`} fill="black" />
            </g>
        </g>
    )
}

export const DoorBottom: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 20 }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d={`M -${size} 0 A ${size} ${size} 0 0 0 0 -${size}`} fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
        <line x1="0" y1="0.5" x2="0" y2={-size} stroke="black" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="0.3" fill="black" />
    </g>
);

export const DoorTop: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 20 }) => (
    <g transform={`translate(${x}, ${y})`}>
        <path d={`M ${size} 0 A ${size} ${size} 0 0 1 0 ${size}`} fill="none" stroke="#94a3b8" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
        <line x1="0" y1="-0.5" x2="0" y2={size} stroke="black" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="0.3" fill="black" />
    </g>
);

export const DoorVertical: React.FC<{ x: number; y: number; size?: number; flip?: boolean }> = ({ x, y, size = 20, flip = false }) => {
    const dir = flip ? -1 : 1;
    return (
        <g transform={`translate(${x}, ${y})`}>
            <path
                d={`M 0 ${size} A ${size} ${size} 0 0 ${flip ? 1 : 0} ${size * dir} 0`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.4"
                strokeDasharray="1.5,1.5"
            />
            <line x1={dir * -0.5} y1="0" x2={size * dir} y2="0" stroke="black" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="0.3" fill="black" />
        </g>
    )
};

export const Chair: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-chair" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-seat" x="-6.2" y="-7" width="12.4" height="13" rx="2.5" stroke="black" strokeWidth="1.2" fill="white" />
        <rect x="-6.2" y="-9.5" width="12.4" height="2.5" rx="1.2" stroke="black" strokeWidth="1.2" fill="#333" />
        <rect x="-8.5" y="-5" width="2.3" height="10" rx="1" stroke="black" strokeWidth="0.8" fill="#eee" />
        <rect x="6.2" y="-5" width="2.3" height="10" rx="1" stroke="black" strokeWidth="0.8" fill="#eee" />
        <line x1="-3" y1="-7" x2="-3" y2="4" stroke="#ddd" strokeWidth="0.5" />
        <line x1="3" y1="-7" x2="-3" y2="4" stroke="#ddd" strokeWidth="0.5" />
    </g>
);

export const DiningChair: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-dining-chair" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-seat" x="-5" y="-5" width="10" height="10" rx="2" stroke="black" strokeWidth="0.8" fill="white" />
        <rect x="-5" y="-6.5" width="10" height="2.5" rx="1" stroke="black" strokeWidth="0.8" fill="#666" />
        <circle cx="-3.5" cy="-3.5" r="0.6" fill="#333" />
        <circle cx="3.5" cy="-3.5" r="0.6" fill="#333" />
    </g>
);

export const VisitorChair: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-visitor-chair" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-seat" x="-6" y="-6" width="12" height="12" rx="2" stroke="black" strokeWidth="1.2" fill="white" />
        <rect x="-6" y="-8" width="12" height="3" rx="1.5" stroke="black" strokeWidth="1" fill="#444" />
        <rect x="-8.2" y="-4" width="2" height="9" rx="0.5" stroke="black" strokeWidth="0.6" fill="#f5f5f5" />
        <rect x="6.2" y="-4" width="2" height="9" rx="0.5" stroke="black" strokeWidth="0.6" fill="#f5f5f5" />
    </g>
);

export const Toilet: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-toilet" transform={`translate(${x}, ${y}) rotate(${r}) scale(1.2)`}>
        <rect className="furn-ceramic" x="-4" y="-8.5" width="8" height="2.8" rx="0.5" fill="white" stroke="black" strokeWidth="0.8" />
        <path className="furn-ceramic" d="M -3 -5.7 L 3 -5.7 L 4 -2 C 4 3 2 5.5 0 5.5 C -2 5.5 -4 3 -4 -2 Z" fill="white" stroke="black" strokeWidth="0.8" />
        <ellipse cx="0" cy="-0.5" rx="2.5" ry="4" fill="none" stroke="#666" strokeWidth="0.4" />
    </g>
);

export const ArmChair: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-armchair" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-sofa" x="-10" y="-10" width="20" height="20" rx="2" stroke="black" strokeWidth="1" fill="white" />
        <rect x="-10" y="-10" width="20" height="6" rx="1" fill="#f5f5f5" stroke="black" strokeWidth="0.5" />
        <rect x="-10" y="-10" width="4" height="20" rx="1" fill="#eee" stroke="black" strokeWidth="0.5" />
        <rect x="6" y="-10" width="4" height="20" rx="1" fill="#eee" stroke="black" strokeWidth="0.5" />
    </g>
);

export const Sofa: React.FC<{ x: number; y: number; w?: number; h?: number; r?: number }> = ({ x, y, w = 60, h = 18, r = 0 }) => (
    <g className="furn-sofa-group" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-sofa" x={-w / 2} y={-h / 2} width={w} height={h} rx="2" stroke="black" strokeWidth="1.2" fill="white" />
        <rect x={-w / 2} y={-h / 2} width={w} height={6} rx="1" fill="#f5f5f5" stroke="black" strokeWidth="0.5" />
        <rect x={-w / 2} y={-h / 2} width={5} height={h} rx="1" fill="#eee" stroke="black" strokeWidth="0.5" />
        <rect x={w / 2 - 5} y={-h / 2} width={5} height={h} rx="1" fill="#eee" stroke="black" strokeWidth="0.5" />
        <line x1={-w / 6} y1={-h / 2 + 6} x2={-w / 6} y2={h / 2} stroke="#ccc" strokeWidth="0.5" />
        <line x1={w / 6} y1={-h / 2 + 6} x2={w / 6} y2={h / 2} stroke="#ccc" strokeWidth="0.5" />
    </g>
);

export const Person: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-person" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <ellipse className="furn-person-body" cx="0" cy="2" rx="8" ry="5" fill="white" stroke="black" strokeWidth="1" />
        <circle className="furn-person-head" cx="0" cy="-2" r="3.5" fill="white" stroke="black" strokeWidth="1" />
    </g>
);

export const Plant: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
    <g className="furn-plant" transform={`translate(${x}, ${y}) scale(${scale})`}>
        <circle className="furn-plant-pot" r="5" fill="white" stroke="black" strokeWidth="1.5" />
        <path className="furn-plant-leaf" d="M-4,-2 C-6,-6 0,-8 2,-4 M2,-4 C6,-8 8,-2 4,0 M4,0 C8,4 2,8 0,4 M0,4 C-4,8 -8,4 -4,0 Z" fill="#eee" stroke="black" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.2" fill="black" />
    </g>
);

export const Sink: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
    <g className="furn-sink" transform={`translate(${x}, ${y}) rotate(${r})`}>
        <rect className="furn-ceramic" x="-5" y="-7" width="10" height="14" rx="2" fill="white" stroke="black" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="1.8" fill="none" stroke="black" strokeWidth="0.5" />
        <line x1="-5" y1="0" x2="-2" y2="0" stroke="black" strokeWidth="1" />
    </g>
);
