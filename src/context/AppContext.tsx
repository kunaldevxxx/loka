import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cafe, MenuItem, Order, User, CustomizationSelection } from '../types/api';
import { api } from '../lib/api';

export interface CartItem {
  id: string;
  item: MenuItem;
  qty: number;
  customization: CustomizationSelection;
  unitPrice: number;
  lineTotal: number;
  summary: string;
}

export type ActiveView = 
  | 'discovery'
  | 'menu'
  | 'cart'
  | 'order_status'
  | 'receipt'
  | 'staff_dashboard'
  | 'kds'
  | 'order_management'
  | 'analytics'
  | 'menu_management'
  | 'api_inspector';

interface AppContextType {
  // Cafe & Theme
  currentCafe: Cafe | null;
  allCafes: Cafe[];
  setCurrentCafe: (cafe: Cafe) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Session & Table
  tableId: string;
  setTableId: (id: string) => void;
  deviceId: string;
  sessionToken: string;

  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // User / Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, qty: number, customization: CustomizationSelection) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQty: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  cartCount: number;

  // Active Order & Tracking
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;

  // Loyalty
  loyaltyPoints: number;
  addLoyaltyPoints: (pts: number) => void;

  // Modals & Overlays
  selectedItemForCustomization: MenuItem | null;
  setSelectedItemForCustomization: (item: MenuItem | null) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  isQRModalOpen: boolean;
  setIsQRModalOpen: (open: boolean) => void;
  isComplaintModalOpen: boolean;
  setIsComplaintModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Refresh trigger
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [currentCafe, setCurrentCafeState] = useState<Cafe | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('loka_dark_mode') === 'true';
  });

  const [tableId, setTableId] = useState<string>('table-05');
  const [deviceId] = useState<string>(() => {
    let id = localStorage.getItem('loka_device_id');
    if (!id) {
      id = 'device-' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('loka_device_id', id);
    }
    return id;
  });
  const [sessionToken, setSessionToken] = useState<string>('');

  const [activeView, setActiveView] = useState<ActiveView>('menu');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('loka_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem('loka_active_order_id') || null;
  });
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(240);

  // Modals
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<MenuItem | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const triggerRefresh = () => setRefreshTrigger((c) => c + 1);

  // Load cafes on start
  useEffect(() => {
    api.getAllCafes()
      .then((res) => {
        setAllCafes(res.cafes);
        if (res.cafes.length > 0 && !currentCafe) {
          setCurrentCafeState(res.cafes[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load cafes', err);
      });
  }, []);

  // Update theme CSS variables when cafe or dark mode changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('loka_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('loka_dark_mode', 'false');
    }

    if (currentCafe?.theme) {
      const t = currentCafe.theme;
      if (isDarkMode) {
        let darkPrimary = '#f59e0b';
        let darkPrimaryFg = '#18181b';
        let darkSecondary = '#fb923c';
        let darkAccent = '#f97316';
        let darkCard = '#13151c';
        let darkBg = '#0b0c10';
        let darkBorder = '#232733';
        let darkMuted = '#1e222d';

        if (currentCafe.cafeId === 'cafe-002') {
          darkPrimary = '#14b8a6';
          darkPrimaryFg = '#042f2e';
          darkSecondary = '#06b6d4';
          darkAccent = '#f59e0b';
          darkCard = '#0e181d';
          darkBg = '#081014';
          darkBorder = '#162c35';
          darkMuted = '#13252d';
        } else if (currentCafe.cafeId === 'cafe-003') {
          darkPrimary = '#fb7185';
          darkPrimaryFg = '#4c0519';
          darkSecondary = '#f43f5e';
          darkAccent = '#fb923c';
          darkCard = '#181620';
          darkBg = '#0e0d13';
          darkBorder = '#2a2538';
          darkMuted = '#221e2f';
        }

        root.style.setProperty('--primary', darkPrimary);
        root.style.setProperty('--primary-foreground', darkPrimaryFg);
        root.style.setProperty('--secondary', darkSecondary);
        root.style.setProperty('--secondary-foreground', '#ffffff');
        root.style.setProperty('--accent', darkAccent);
        root.style.setProperty('--accent-foreground', '#ffffff');
        root.style.setProperty('--card', darkCard);
        root.style.setProperty('--card-foreground', '#f8fafc');
        root.style.setProperty('--background', darkBg);
        root.style.setProperty('--foreground', '#f8fafc');
        root.style.setProperty('--border', darkBorder);
        root.style.setProperty('--muted', darkMuted);
        root.style.setProperty('--muted-foreground', '#94a3b8');
      } else {
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--primary-foreground', t.primaryForeground);
        root.style.setProperty('--secondary', t.secondary);
        root.style.setProperty('--secondary-foreground', t.secondaryForeground);
        root.style.setProperty('--accent', t.accent);
        root.style.setProperty('--accent-foreground', t.accentForeground);
        root.style.setProperty('--card', t.card);
        root.style.setProperty('--card-foreground', t.cardForeground);
        root.style.setProperty('--background', t.background);
        root.style.setProperty('--foreground', t.foreground);
        root.style.setProperty('--border', t.border);
        root.style.setProperty('--muted', '#f4efe9');
        root.style.setProperty('--muted-foreground', '#78716c');
      }
      root.style.setProperty('--font-display', t.fontDisplay);
      root.style.setProperty('--font-sans', t.fontSans);
    }
  }, [currentCafe, isDarkMode]);

  // Create session on load
  useEffect(() => {
    if (currentCafe) {
      api.createSession(currentCafe.cafeId, tableId, deviceId)
        .then((s) => setSessionToken(s.sessionToken))
        .catch(console.error);
    }
  }, [currentCafe?.cafeId, tableId, deviceId]);

  // Save active order ID
  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('loka_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('loka_active_order_id');
    }
  }, [activeOrderId]);

  // Save user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('loka_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('loka_user');
      localStorage.removeItem('loka_auth_token');
    }
  }, [currentUser]);

  const setCurrentCafe = (cafe: Cafe) => {
    setCurrentCafeState(cafe);
    if (cafe.defaultTableId) {
      setTableId(cafe.defaultTableId);
    }
    showToast(`Switched to ${cafe.name}`);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('menu');
    showToast('Signed out successfully');
  };

  // Cart operations
  const addToCart = (item: MenuItem, qty: number, customization: CustomizationSelection) => {
    let unitPrice = item.price;
    const parts: string[] = [];

    if (customization.size) {
      parts.push(customization.size);
      if (customization.size.includes('Large') || customization.size.includes('Double')) {
        unitPrice += 50;
      }
    }
    if (customization.milk) {
      parts.push(customization.milk);
      if (customization.milk.includes('Oat') || customization.milk.includes('Almond')) {
        unitPrice += 40;
      }
    }
    if (customization.sweetness) {
      parts.push(customization.sweetness);
    }
    if (customization.extras && customization.extras.length > 0) {
      parts.push(...customization.extras);
      unitPrice += customization.extras.length * 40;
    }
    if (customization.notes) {
      parts.push(`Note: ${customization.notes}`);
    }

    const summary = parts.join(' • ') || 'Regular';
    const cartItemId = `${item.itemId}-${summary.replace(/\s+/g, '_')}`;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartItemId);
      if (existing) {
        return prev.map((c) =>
          c.id === cartItemId
            ? { ...c, qty: c.qty + qty, lineTotal: (c.qty + qty) * c.unitPrice }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            item,
            qty,
            customization,
            unitPrice,
            lineTotal: unitPrice * qty,
            summary
          }
        ];
      }
    });

    showToast(`Added ${qty}x ${item.name} to order`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const updateCartQty = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.id === cartItemId
          ? { ...c, qty, lineTotal: qty * c.unitPrice }
          : c
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
  const cartTax = +(cartSubtotal * 0.15).toFixed(2);
  const cartTotal = +(cartSubtotal + cartTax).toFixed(2);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addLoyaltyPoints = (pts: number) => {
    setLoyaltyPoints((prev) => prev + pts);
  };

  return (
    <AppContext.Provider
      value={{
        currentCafe,
        allCafes,
        setCurrentCafe,
        isDarkMode,
        toggleDarkMode,
        tableId,
        setTableId,
        deviceId,
        sessionToken,
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        cartCount,
        activeOrderId,
        setActiveOrderId,
        activeOrder,
        setActiveOrder,
        loyaltyPoints,
        addLoyaltyPoints,
        selectedItemForCustomization,
        setSelectedItemForCustomization,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        isQRModalOpen,
        setIsQRModalOpen,
        isComplaintModalOpen,
        setIsComplaintModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        toastMessage,
        showToast,
        refreshTrigger,
        triggerRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
