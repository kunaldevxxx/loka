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
  fontDisplay: string;
  fontSans: string;
}

export interface Cafe {
  cafeId: string;
  name: string;
  tagline: string;
  venueType: string;
  icon: string;
  location: string;
  phone?: string;
  theme: CafeTheme;
  defaultTableId?: string;
}

export interface ItemSize {
  label: string;
  extra: number;
}

export interface ItemAddOn {
  label: string;
  price: number;
}

export interface MenuItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  orders: number;
  tags: string[];
  image: string;
  available: boolean;
  sizes?: ItemSize[];
  milkOptions?: string[];
  addOns?: ItemAddOn[];
  recommendationReason?: string;
}

export interface RecentOrder {
  dishId: string;
  dishName: string;
  customization: string;
  timestamp: string;
  dayOfWeek: string;
  timeOfDay: string;
}

export interface MenuResponse {
  cafe: Cafe;
  isReturning: boolean;
  visitCount: number;
  favoriteDish: MenuItem | null;
  recentOrders?: RecentOrder[];
  recentItems?: any[];
  recommendations?: MenuItem[];
  recommendedIds?: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  categories: string[];
  items: MenuItem[];
}

export interface CustomizationSelection {
  size?: string;
  milk?: string;
  sweetness?: string;
  extras?: string[];
  notes?: string;
}

export interface OrderItemInput {
  itemId: string;
  qty: number;
  customization?: CustomizationSelection;
}

export interface OrderLineItem {
  itemId: string;
  name: string;
  customizationSummary: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type KitchenStatus = 'pending_payment' | 'confirmed' | 'preparing' | 'ready' | 'collected' | 'cancelled';

export interface OrderStatusTimestamps {
  created: string;
  confirmed: string | null;
  preparing: string | null;
  ready: string | null;
  collected: string | null;
}

export interface Order {
  id: string;
  cafeId: string;
  deviceId: string;
  tableId: string;
  items: OrderLineItem[];
  subtotal: number;
  gst: number;
  loyaltyDiscount: number;
  total: number;
  paymentMethod: 'upi' | 'card' | 'cash' | null;
  paymentStatus: PaymentStatus;
  kitchenStatus: KitchenStatus;
  isReturningAtOrderTime: boolean;
  pointsEarned: number;
  confirmedAt: string | null;
  createdAt: string;
  confirmationCode: string;
  statusTimestamps?: OrderStatusTimestamps;
}

export interface OrderStatusResponse {
  orderId: string;
  paymentStatus: PaymentStatus;
  status: KitchenStatus;
  stepIndex: number;
  isComplete: boolean;
  progressPct: number;
  timestamps: OrderStatusTimestamps;
}

export interface ReceiptResponse {
  order: {
    id: string;
    items: OrderLineItem[];
    subtotal: number;
    gst: number;
    total: number;
    createdAt: string;
    confirmationCode: string;
    paymentMethod?: string | null;
    tableId?: string;
  };
  visitCount: number;
  totalPoints: number;
  nextRewardAt: number;
  rewardUnlocked: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'manager' | 'chef' | 'support';
  cafeId?: string | null;
  createdAt?: string;
  lastLoginAt?: string;
  loginCount?: number;
  googleId?: string;
  authProvider?: string;
  lifetimeSpend?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SessionResponse {
  sessionToken: string;
  expiresAt: string;
  isValid?: boolean;
  cafeId?: string;
  tableId?: string;
  deviceId?: string;
}

export type ComplaintIssueType = 'wrong_item' | 'missing_item' | 'quality_issue' | 'wrong_quantity' | 'other';

export interface Complaint {
  id: string;
  complaintId?: string;
  orderId: string;
  cafeId: string;
  tableId: string;
  issueType: ComplaintIssueType;
  itemName: string;
  description: string;
  sessionToken?: string;
  createdAt: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ComplaintInput {
  orderId: string;
  cafeId: string;
  tableId: string;
  issueType: ComplaintIssueType;
  itemName: string;
  description: string;
  sessionToken?: string;
}

export interface AnalyticsResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentBreakdown: {
    upi: number;
    card: number;
    cash: number;
  };
  hourlyDistribution: {
    hour: string;
    orders: number;
  }[];
  topItems: {
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface SalesDataPoint {
  date: string;
  orders: number;
  revenue: number;
  gst: number;
  paymentMethods: {
    upi: number;
    card: number;
    cash: number;
  };
}

export interface SalesAnalyticsResponse {
  period: string;
  cafeId: string;
  data: SalesDataPoint[];
  totals: {
    orders: number;
    revenue: number;
    gst: number;
  };
}

export interface ItemAnalyticsItem {
  itemId: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  averageRating: number;
  returnRate: number;
}

export interface StaffOverviewResponse {
  cafeId: string;
  totalOrders: number;
  totalOrdersToday?: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  recentComplaints: Complaint[];
  todayRevenue: number;
  revenueToday?: number;
  avgPrepTimeMinutes?: number;
}

export interface QRCodeResponse {
  qrCode: string;
  qrCodeId: string;
  url: string;
}

export interface VoiceOrderResponse {
  orderId: string;
  items: {
    itemId: string;
    name: string;
    qty: number;
    customization: string;
  }[];
  total: number;
  speechResponse: string;
  transcript?: string;
  audio?: string | null;
  format?: string;
  speaker?: string;
  language?: string;
}

export interface VoiceSpeechResponse {
  audio: string;
  mimeType: string;
  text: string;
  speaker?: string;
  language?: string;
}

export interface VoiceTranscribeResponse {
  transcript: string;
  languageCode?: string;
  notice?: string;
}

