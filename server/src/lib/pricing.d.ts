export interface PricingCustomization {
  size?: string | null;
  milk?: string | null;
  addOns?: string[] | { label: string }[];
}

export interface RequestedOrderItem {
  itemId: string;
  qty?: number;
  customization?: PricingCustomization;
}

export interface CalculatedOrderItem {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  customization: {
    size: string | null;
    milk: string | null;
    addOns: string[];
  };
  customizationSummary: string;
}

export interface PricingResult {
  items: CalculatedOrderItem[];
  subtotal: number;
  gst: number;
  loyaltyDiscount: number;
  total: number;
  pointsEarned: number;
  isReturning: boolean;
}

export declare function parseMilkPrice(milkLabel?: string | null): number;

export declare function calculatePricing(
  requestedItems: RequestedOrderItem[],
  menuCatalog: any[] | Record<string, any>,
  isReturning?: boolean
): PricingResult;

declare const _default: {
  parseMilkPrice: typeof parseMilkPrice;
  calculatePricing: typeof calculatePricing;
};

export default _default;
