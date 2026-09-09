export interface CafeTheme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  fontDisplay?: string;
  fontSans?: string;
}

export interface Cafe {
  cafeId: string;
  name: string;
  tagline?: string;
  venueType?: string;
  icon?: string;
  location: string;
  phone: string;
  defaultTableId: string;
  specialtyItemIds?: string[];
  theme?: CafeTheme;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItemSize {
  label: string;
  extra: number;
}

export interface MenuItemAddOn {
  label: string;
  price: number;
}

export interface MenuItem {
  itemId: string;
  cafeId: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  tags?: string[];
  image?: string;
  description?: string;
  sizes?: MenuItemSize[];
  milkOptions?: string[];
  addOns?: MenuItemAddOn[];
  recommendationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemSnapshot {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  customization?: {
    size?: string | null;
    milk?: string | null;
    addOns?: string[];
  };
  customizationSummary?: string;
}

export type PaymentMethod = 'upi' | 'card' | 'cash';
export type PaymentStatus = 'pending_payment' | 'paid' | 'failed';
export type KitchenStatus = 'confirmed' | 'preparing' | 'ready' | 'collected' | 'cancelled' | 'pending_payment';

export interface OrderStatusTimestamps {
  created: string;
  confirmed?: string | null;
  preparing?: string | null;
  ready?: string | null;
  collected?: string | null;
  cancelled?: string | null;
}

export interface Order {
  id: string;
  cafeId: string;
  deviceId: string;
  tableId?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  gst: number;
  loyaltyDiscount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  kitchenStatus: KitchenStatus;
  pointsEarned: number;
  confirmationCode: string;
  isReturningAtOrderTime: boolean;
  statusTimestamps: OrderStatusTimestamps;
  confirmedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  razorpayOrderId?: string | null;
}

export interface Device {
  deviceId: string;
  cafeId: string;
  granted: boolean;
  updatedAt: string;
  createdAt?: string;
}

export interface Session {
  sessionToken: string;
  cafeId: string;
  tableId: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
}

export type StaffRole = 'manager' | 'chef' | 'support' | 'customer';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: StaffRole;
  cafeId: string | null;
  googleId?: string | null;
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

export interface QRCode {
  codeId: string;
  cafeId: string;
  tableId?: string | null;
  destinationUrl: string;
  svgPayload: string;
  version: number;
  active: boolean;
  menuChecksum: string;
  createdAt: string;
  updatedAt?: string;
}

export type ComplaintIssueType = 'wrong_item' | 'missing_item' | 'quality_issue' | 'wrong_quantity' | 'other';
export type ComplaintStatus = 'open' | 'resolved';

export interface Complaint {
  complaintId: string;
  orderId: string;
  cafeId: string;
  tableId?: string;
  issueType: ComplaintIssueType;
  itemName?: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
}

export interface AuditLog {
  id: string;
  orderId?: string;
  cafeId: string;
  eventType: 'order_created' | 'payment_started' | 'payment_completed' | 'order_advanced' | 'order_cancelled' | 'complaint_created' | 'complaint_resolved';
  payload: Record<string, any>;
  timestamp: string;
}
