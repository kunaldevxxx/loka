import { Cafe, MenuItem, MenuResponse } from '../types/api';

export const DEFAULT_CAFE: Cafe = {
  cafeId: 'cafe-001',
  name: 'Brew Haven Cafe',
  tagline: 'Where artisanal coffee meets culinary craft',
  venueType: 'cafe',
  icon: '☕',
  location: 'Bandra West, Mumbai',
  phone: '+91-9820123456',
  defaultTableId: 'table-05',
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
};

export const FALLBACK_CAFES: Cafe[] = [
  DEFAULT_CAFE,
  {
    cafeId: 'cafe-002',
    name: 'The Daily Grind Roasters',
    tagline: 'Fresh micro-lot roasts & sourdough bakes',
    venueType: 'roastery',
    icon: '🫘',
    location: 'Koramangala, Bangalore',
    phone: '+91-9845098765',
    defaultTableId: 'table-02',
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
      fontDisplay: 'Outfit, sans-serif',
      fontSans: 'Plus Jakarta Sans, sans-serif'
    }
  },
  {
    cafeId: 'cafe-003',
    name: 'Velvet Bean Lounge',
    tagline: 'Evening coffee cocktails & dessert pairings',
    venueType: 'lounge',
    icon: '🍸',
    location: 'Hauz Khas Village, New Delhi',
    phone: '+91-9910987654',
    defaultTableId: 'table-07',
    theme: {
      background: '#faf5f6',
      foreground: '#2e101a',
      card: '#ffffff',
      cardForeground: '#2e101a',
      primary: '#be185d',
      primaryForeground: '#ffffff',
      secondary: '#9d174d',
      secondaryForeground: '#ffffff',
      muted: '#fbe8ee',
      mutedForeground: '#78686d',
      accent: '#e53170',
      accentForeground: '#ffffff',
      border: '#f1d8d3',
      fontDisplay: 'Outfit, sans-serif',
      fontSans: 'Plus Jakarta Sans, sans-serif'
    }
  }
];

export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    itemId: 'item-001',
    name: 'Signature Cappuccino',
    description: 'Double espresso shot balanced with silky steamed whole milk and velvety microfoam.',
    price: 220,
    category: 'Coffee Drinks',
    rating: 4.9,
    orders: 342,
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
    name: 'Espresso Martini Mocktail',
    description: 'Velvety cold-brewed espresso shaken with hazelnut essence, dark chocolate and sweet foam.',
    price: 350,
    category: 'Cold Beverages',
    rating: 4.8,
    orders: 189,
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
    name: 'Artisan French Butter Croissant',
    description: 'Freshly baked flaky viennoiserie made with 84% Normandy butter and caramelized layers.',
    price: 190,
    category: 'Pastries & Bakes',
    rating: 4.9,
    orders: 265,
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
    name: 'Spanish Iced Latte',
    description: 'Sweetened condensed milk topped with freshly pulled espresso over crushed ice and whole milk.',
    price: 260,
    category: 'Cold Beverages',
    rating: 4.7,
    orders: 210,
    available: true,
    tags: ['iced', 'sweet', 'popular'],
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Regular (300ml)', extra: 0 },
      { label: 'Large (450ml)', extra: 60 }
    ],
    milkOptions: ['Whole Milk', 'Oat Milk (+₹40)', 'Almond Milk (+₹40)'],
    addOns: [
      { label: 'Extra Sweet Foam', price: 40 },
      { label: 'Caramel Drizzle', price: 30 }
    ],
    recommendationReason: 'Smooth sweetness paired with bold single-origin espresso'
  },
  {
    itemId: 'item-005',
    name: 'Avocado Tartine with Poached Eggs',
    description: 'Sourdough toast topped with smashed Hass avocado, dual poached eggs, microgreens & chili flakes.',
    price: 380,
    category: 'Breakfast & Brunch',
    rating: 4.8,
    orders: 145,
    available: true,
    tags: ['healthy', 'brunch', 'chef-special'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { label: 'Standard Portion', extra: 0 }
    ],
    milkOptions: [],
    addOns: [
      { label: 'Extra Poached Egg', price: 45 },
      { label: 'Smoked Salmon Slice', price: 120 }
    ],
    recommendationReason: 'Perfect hearty breakfast prepared freshly to order'
  }
];

export function getFallbackMenuResponse(cafe: Cafe = DEFAULT_CAFE): MenuResponse {
  return {
    cafe,
    isReturning: true,
    visitCount: 1,
    favoriteDish: FALLBACK_MENU_ITEMS[0],
    recentOrders: [],
    recommendations: [FALLBACK_MENU_ITEMS[0], FALLBACK_MENU_ITEMS[2]],
    timeOfDay: 'morning',
    categories: ['All', 'Coffee Drinks', 'Cold Beverages', 'Pastries & Bakes', 'Breakfast & Brunch'],
    items: FALLBACK_MENU_ITEMS
  };
}
