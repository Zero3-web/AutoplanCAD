import { RoomType, RoomConfig } from '../types';

interface BudgetData {
  m2: number;
  price: number;
  pre: number;
  var: number;
  mob: number;
}

export const ROOM_PRICING: Record<string, BudgetData> = {
  [RoomType.POOL]: { m2: 4.50, price: 439.47, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.GERENCIA]: { m2: 12.00, price: 449.54, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.JEFATURA]: { m2: 10.00, price: 445.51, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.RECEPCION]: { m2: 15.00, price: 414.60, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.REUNION]: { m2: 2.00, price: 434.80, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.DIRECTORIO]: { m2: 4.00, price: 449.17, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.LOUNGE]: { m2: 3.00, price: 364.44, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.MEETBOX]: { m2: 1.00, price: 414.60, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.PHONEBOOTH]: { m2: 1.50, price: 427.09, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.KITCHENETTE]: { m2: 9.00, price: 391.12, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.COMEDOR]: { m2: 2.00, price: 391.12, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.LACTARIO]: { m2: 7.50, price: 391.12, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.LOCKERS]: { m2: 0.15, price: 348.90, pre: 25.09, var: 28.28, mob: 249.15 },
  [RoomType.ALMACEN]: { m2: 0.40, price: 348.90, pre: 25.09, var: 28.28, mob: 249.15 },
  // SSHH logic is handled specially in calculateBudget
  'sshh_multiple': { m2: 3.00, price: 312.75, pre: 25.09, var: 28.28, mob: 99.66 },
  'sshh_unitary': { m2: 2.25, price: 309.16, pre: 25.09, var: 28.28, mob: 99.66 },
  [RoomType.DATACENTER]: { m2: 3.00, price: 418.38, pre: 25.09, var: 28.28, mob: 0 },
  [RoomType.LIMPIEZA]: { m2: 3.00, price: 309.16, pre: 25.09, var: 28.28, mob: 99.66 }
};

export interface BudgetResult {
  totalM2: number;
  totalPrice: number;
  circulationM2: number;
  circulationPrice: number;
}

export function calculateBudget(rooms: RoomConfig[]): BudgetResult {
  let subtotalM2 = 0;
  let subtotalPrice = 0;

  rooms.forEach(room => {
    let pricingKey: string = room.type;
    if (room.type === RoomType.SSHH) {
      pricingKey = room.sshhType === 'multiple' ? 'sshh_multiple' : 'sshh_unitary';
    }

    const data = ROOM_PRICING[pricingKey];
    if (data) {
      const costPerM2 = data.price + data.pre + data.var + data.mob;
      
      // Calculate quantity based on mode
      let qty = 1;
      if (room.calculationMode === 'person') {
        qty = room.capacity || 1;
      } else {
        qty = room.quantity || 1;
      }

      const m2ForRoom = data.m2 * qty;
      const priceForRoom = costPerM2 * m2ForRoom;

      subtotalM2 += m2ForRoom;
      subtotalPrice += priceForRoom;
    }
  });

  // Calculate Circulation (5% extra as per legacy logic)
  const circulationM2 = subtotalM2 * 0.05;
  const circulationPrice = circulationM2 * 500; // Legacy uses 500 USD fixed for circulation

  return {
    totalM2: subtotalM2 + circulationM2,
    totalPrice: subtotalPrice + circulationPrice,
    circulationM2,
    circulationPrice
  };
}
