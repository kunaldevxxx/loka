import { Cafe, MenuItem, User, Order, Device, Complaint, AuditLog, QRCode } from '../types';

export const initialCafes: Cafe[] = [
  {
    cafeId: 'cafe-001',
    name: 'Brew Haven Cafe',
    tagline: 'Where artisanal coffee meets culinary craft',
    venueType: 'cafe',
    icon: '☕',
    location: 'Bandra West, Mumbai',
    phone: '+91-9820123456',
    defaultTableId: 'table-05',
    specialtyItemIds: ['item-001', 'item-002', 'item-003'],
    theme: {
      background: '#faf8f5',
      foreground: '#1c1917',
      card: '#ffffff',
      cardForeground: '#1c1917',
      primary: '#d97706',
      primaryForeground: '#ffffff',
      secondary: '#b45309',
      secondaryForeground: '#ffffff',
      muted: '#f4efe9',
      mutedForeground: '#78716c',
      accent: '#f59e0b',
      accentForeground: '#ffffff',
      border: '#e7e0d8',
      fontDisplay: 'Outfit, sans-serif',
      fontSans: 'Plus Jakarta Sans, sans-serif'
    }
  },
  {
    cafeId: 'cafe-002',
    name: 'The Daily Grind Roasters',
    tagline: 'Fresh micro-lot roasts & sourdough bakes',
    venueType: 'roastery',
    icon: '🫘',
    location: 'Koramangala, Bangalore',
    phone: '+91-9845098765',
    defaultTableId: 'table-02',
    specialtyItemIds: ['item-004', 'item-005'],
    theme: {
      background: '#f6fbf8',
      foreground: '#123026',
      card: '#ffffff',
      cardForeground: '#123026',
      primary: '#059669',
      primaryForeground: '#ffffff',
      secondary: '#047857',
      secondaryForeground: '#ffffff',
      muted: '#e8f5ed',
      mutedForeground: '#5f7469',
      accent: '#10b981',
      accentForeground: '#ffffff',
      border: '#cfe5d8',
      fontDisplay: 'Cabinet Grotesk, sans-serif',
      fontSans: 'Inter, sans-serif'
    }
  },
  {
    cafeId: 'cafe-003',
    name: 'Artisan Bakehouse & Espresso Bar',
    tagline: 'Slow food, sourdough & single origin pours',
    venueType: 'bakery',
    icon: '🥐',
    location: 'Hauz Khas Village, Delhi',
    phone: '+91-9811054321',
    defaultTableId: 'table-07',
    specialtyItemIds: ['item-003', 'item-006'],
    theme: {
      background: '#fffaf5',
      foreground: '#27181d',
      card: '#ffffff',
      cardForeground: '#27181d',
      primary: '#ff8906',
      primaryForeground: '#fffffe',
      secondary: '#f25f4c',
      secondaryForeground: '#fffffe',
      muted: '#fff0eb',
      mutedForeground: '#78686d',
      accent: '#e53170',
      accentForeground: '#fffffe',
      border: '#f1d8d3',
      fontDisplay: 'Outfit, sans-serif',
      fontSans: 'Plus Jakarta Sans, sans-serif'
    }
  }
];

export const initialMenuItems: MenuItem[] = [
  {
    itemId: 'item-001',
    cafeId: 'cafe-001',
    name: 'Signature Cappuccino',
    description: 'Double espresso shot balanced with silky steamed whole milk and velvety microfoam.',
    price: 220,
    category: 'Coffee Drinks',
    available: true,
    tags: ['bestseller', 'signature', 'hot'],
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Regular (250ml)', extra: 0 },
      { label: 'Large (350ml)', extra: 50 }
    ],
    milkOptions: ['Whole Milk', 'Skimmed Milk', 'Oat Milk (+₹40)', 'Almond Milk (+₹40)', 'Soy Milk (+₹30)'],
    addOns: [
      { label: 'Extra Espresso Shot', price: 50 },
      { label: 'Vanilla Bean Syrup', price: 40 },
      { label: 'Caramel Drizzle', price: 40 },
      { label: 'Cacao Powder Dusting', price: 20 }
    ],
    recommendationReason: 'Most ordered morning beverage across all tables'
  },
  {
    itemId: 'item-002',
    cafeId: 'cafe-001',
    name: 'Espresso Martini Mocktail',
    description: 'Velvety cold-brewed espresso shaken with hazelnut essence, dark chocolate and sweet foam.',
    price: 350,
    category: 'Cold Beverages',
    available: true,
    tags: ['signature', 'chef-pick', 'chilled'],
    image: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Standard (200ml)', extra: 0 },
      { label: 'Double (350ml)', extra: 100 }
    ],
    milkOptions: [],
    addOns: [
      { label: 'Extra Cold Brew Shot', price: 60 },
      { label: 'Cinnamon Sugar Rim', price: 30 }
    ],
    recommendationReason: 'Customer favorite for refreshing afternoon vibes'
  },
  {
    itemId: 'item-003',
    cafeId: 'cafe-001',
    name: 'Artisan French Butter Croissant',
    description: 'Freshly baked flaky viennoiserie made with 84% Normandy butter and caramelized layers.',
    price: 190,
    category: 'Pastries & Bakes',
    available: true,
    tags: ['freshly-baked', 'bestseller', 'vegetarian'],
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Single', extra: 0 },
      { label: 'Pair (2 pcs)', extra: 160 }
    ],
    milkOptions: [],
    addOns: [
      { label: 'Whipped French Butter', price: 25 },
      { label: 'Artisanal Berry Jam', price: 35 },
      { label: 'Warm Nutella Pot', price: 45 }
    ],
    recommendationReason: 'Freshly pulled from the oven every morning at 8:00 AM'
  },
  {
    itemId: 'item-004',
    cafeId: 'cafe-001',
    name: 'Spanish Iced Latte',
    description: 'Condensed milk swirled with double ristretto over artisan slow-melt crystal ice cubes.',
    price: 250,
    category: 'Cold Beverages',
    available: true,
    tags: ['sweet', 'popular', 'iced'],
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Regular (300ml)', extra: 0 },
      { label: 'Large (450ml)', extra: 60 }
    ],
    milkOptions: ['Whole Milk', 'Oat Milk (+₹40)', 'Almond Milk (+₹40)'],
    addOns: [
      { label: 'Extra Espresso Shot', price: 50 },
      { label: 'Sweet Cream Cold Foam', price: 50 }
    ],
    recommendationReason: 'Creamy, sweet espresso pick-me-up'
  },
  {
    itemId: 'item-005',
    cafeId: 'cafe-001',
    name: 'Avocado Tartine on Sourdough',
    description: 'Crushed Hass avocado on toasted rustic sourdough with soft-poached egg, chili crunch & herbs.',
    price: 340,
    category: 'Breakfast & Mains',
    available: true,
    tags: ['healthy', 'organic', 'popular'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    sizes: [],
    milkOptions: [],
    addOns: [
      { label: 'Extra Poached Egg', price: 40 },
      { label: 'Smoked Salmon (+₹120)', price: 120 },
      { label: 'Crumbled Goat Feta', price: 50 }
    ],
    recommendationReason: 'Nutrient-rich, savory breakfast favorite'
  },
  {
    itemId: 'item-006',
    cafeId: 'cafe-001',
    name: 'San Sebastian Basque Cheesecake',
    description: 'Caramelized burnt exterior with a molten, velvety custard core made with Madagascar vanilla.',
    price: 280,
    category: 'Desserts',
    available: true,
    tags: ['indulgent', 'signature', 'dessert'],
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    sizes: [],
    milkOptions: [],
    addOns: [
      { label: 'Wild Berry Coulis', price: 40 },
      { label: 'Fresh Chantilly Cream', price: 35 }
    ],
    recommendationReason: 'Exquisite pairing with our pour-over coffees'
  },
  // Items for Cafe-002
  {
    itemId: 'item-101',
    cafeId: 'cafe-002',
    name: 'Pour Over Chemex Single Origin',
    description: 'Ethiopian Yirgacheffe notes of bergamot, jasmine, and citrus honey.',
    price: 260,
    category: 'Coffee Drinks',
    available: true,
    tags: ['single-origin', 'specialty'],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'
  },
  {
    itemId: 'item-102',
    cafeId: 'cafe-002',
    name: 'Matcha Cloud Latte',
    description: 'Ceremonial Uji matcha, steamed oat milk and Madagascar vanilla cold foam.',
    price: 280,
    category: 'Cold Beverages',
    available: true,
    tags: ['matcha', 'healthy', 'vegan'],
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80'
  }
];

export const initialUsers: User[] = [
  {
    id: 'user-support-01',
    email: 'support@cafe.com',
    password: 'supportPassword123',
    name: 'Dev Support Admin',
    role: 'support',
    cafeId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: '2024-01-15T09:00:00.000Z',
    loginCount: 52
  },
  {
    id: 'user-manager-01',
    email: 'manager@cafe.com',
    password: 'managerPassword123',
    name: 'Aarav Sharma',
    role: 'manager',
    cafeId: 'cafe-001',
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLoginAt: '2024-01-15T09:00:00.000Z',
    loginCount: 42
  },
  {
    id: 'user-chef-01',
    email: 'chef@cafe.com',
    password: 'chefPassword123',
    name: 'Chef Maria Rossi',
    role: 'chef',
    cafeId: 'cafe-001',
    createdAt: '2024-01-02T09:00:00.000Z',
    lastLoginAt: '2024-01-15T07:30:00.000Z',
    loginCount: 88
  },
  {
    id: 'user-cust-01',
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'Priya Patel',
    role: 'customer',
    cafeId: null,
    createdAt: '2024-01-15T10:30:00.000Z',
    lastLoginAt: '2024-01-15T10:35:00.000Z',
    loginCount: 5
  }
];

export const initialOrders: Order[] = [
  {
    id: 'order-seed-101',
    cafeId: 'cafe-001',
    deviceId: 'device-456',
    tableId: 'table-05',
    items: [
      {
        itemId: 'item-001',
        name: 'Signature Cappuccino',
        qty: 1,
        unitPrice: 270,
        lineTotal: 270,
        customization: {
          size: 'Large (350ml)',
          milk: 'Oat Milk (+₹40)',
          addOns: ['Vanilla Bean Syrup']
        },
        customizationSummary: 'Large (350ml), Oat Milk (+₹40), Vanilla Bean Syrup'
      },
      {
        itemId: 'item-003',
        name: 'Artisan French Butter Croissant',
        qty: 2,
        unitPrice: 215,
        lineTotal: 430,
        customization: {
          size: 'Single',
          milk: null,
          addOns: ['Whipped French Butter']
        },
        customizationSummary: 'Whipped French Butter'
      }
    ],
    subtotal: 700,
    gst: 35,
    loyaltyDiscount: 35,
    total: 700,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    kitchenStatus: 'preparing',
    pointsEarned: 70,
    confirmationCode: 'LOK789',
    isReturningAtOrderTime: true,
    confirmedAt: '2024-01-15T10:31:00.000Z',
    createdAt: '2024-01-15T10:30:00.000Z',
    statusTimestamps: {
      created: '2024-01-15T10:30:00.000Z',
      confirmed: '2024-01-15T10:31:00.000Z',
      preparing: '2024-01-15T10:33:00.000Z',
      ready: null,
      collected: null
    }
  },
  {
    id: 'order-seed-102',
    cafeId: 'cafe-001',
    deviceId: 'device-789',
    tableId: 'table-03',
    items: [
      {
        itemId: 'item-005',
        name: 'Avocado Tartine on Sourdough',
        qty: 1,
        unitPrice: 380,
        lineTotal: 380,
        customization: {
          size: null,
          milk: null,
          addOns: ['Extra Poached Egg']
        },
        customizationSummary: 'Extra Poached Egg'
      },
      {
        itemId: 'item-004',
        name: 'Spanish Iced Latte',
        qty: 1,
        unitPrice: 300,
        lineTotal: 300,
        customization: {
          size: 'Regular (300ml)',
          milk: 'Whole Milk',
          addOns: ['Sweet Cream Cold Foam']
        },
        customizationSummary: 'Sweet Cream Cold Foam'
      }
    ],
    subtotal: 680,
    gst: 34,
    loyaltyDiscount: 0,
    total: 714,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    kitchenStatus: 'ready',
    pointsEarned: 71,
    confirmationCode: 'KDS456',
    isReturningAtOrderTime: false,
    confirmedAt: '2024-01-15T10:15:00.000Z',
    createdAt: '2024-01-15T10:14:00.000Z',
    statusTimestamps: {
      created: '2024-01-15T10:14:00.000Z',
      confirmed: '2024-01-15T10:15:00.000Z',
      preparing: '2024-01-15T10:18:00.000Z',
      ready: '2024-01-15T10:28:00.000Z',
      collected: null
    }
  }
];

export const initialDevices: Device[] = [
  {
    deviceId: 'device-456',
    cafeId: 'cafe-001',
    granted: true,
    updatedAt: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    deviceId: 'device-789',
    cafeId: 'cafe-001',
    granted: true,
    updatedAt: '2024-01-15T10:05:00.000Z',
    createdAt: '2024-01-15T10:05:00.000Z'
  }
];

export const initialComplaints: Complaint[] = [
  {
    complaintId: 'complaint-001',
    orderId: 'order-seed-101',
    cafeId: 'cafe-001',
    tableId: 'table-05',
    issueType: 'wrong_item',
    itemName: 'Signature Cappuccino',
    description: 'Requested Oat Milk but ticket was labeled Whole Milk',
    status: 'resolved',
    createdAt: '2024-01-15T10:45:00.000Z',
    resolvedAt: '2024-01-15T10:50:00.000Z',
    resolvedBy: 'Aarav Sharma (Manager)'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    orderId: 'order-seed-101',
    cafeId: 'cafe-001',
    eventType: 'order_created',
    payload: { subtotal: 700, total: 700 },
    timestamp: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 'audit-002',
    orderId: 'order-seed-101',
    cafeId: 'cafe-001',
    eventType: 'payment_completed',
    payload: { method: 'upi', total: 700 },
    timestamp: '2024-01-15T10:31:00.000Z'
  }
];
