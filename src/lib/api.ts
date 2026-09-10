import {
  AnalyticsResponse,
  AuthResponse,
  Cafe,
  Complaint,
  ComplaintInput,
  ItemAnalyticsItem,
  MenuItem,
  MenuResponse,
  Order,
  OrderItemInput,
  OrderStatusResponse,
  QRCodeResponse,
  ReceiptResponse,
  SalesAnalyticsResponse,
  SessionResponse,
  StaffOverviewResponse,
  User,
  VoiceOrderResponse,
  VoiceSpeechResponse,
  VoiceTranscribeResponse
} from '../types/api';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('loka_backend_url');
    if (override && override.trim()) {
      const clean = override.trim().replace(/\/+$/, '');
      return clean.endsWith('/api') ? clean.slice(0, -4) : clean;
    }
  }
  const envUrl = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl.slice(0, -4) : envUrl;
  }
  // Production default for Cloudflare Pages deployments
  if (typeof window !== 'undefined' && (window.location.hostname.endsWith('pages.dev') || window.location.hostname.includes('cloudflare'))) {
    return 'https://loka-fstack.onrender.com';
  }
  return '';
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      const clean = url.trim().replace(/\/+$/, '');
      localStorage.setItem('loka_backend_url', clean);
    } else {
      localStorage.removeItem('loka_backend_url');
    }
  }
}

export function isBackendConfigured(): boolean {
  const url = getApiBaseUrl();
  if (url && url.length > 0) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Localhost has relative backend proxy
    return host === 'localhost' || host === '127.0.0.1';
  }
  return false;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('loka_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      headers
    });
  } catch (netErr: any) {
    throw new Error(`Network Error: Cannot reach API at ${baseUrl || window.location.origin}. Please ensure your backend is awake.`);
  }

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
    if (res.status === 405) {
      errorMsg = `HTTP 405: The frontend is deployed on Cloudflare Pages, but VITE_API_BASE_URL is not set to your Render backend API. Please configure your Render URL or connect it in the login screen.`;
    }
    try {
      const errorJson = await res.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  googleLogin: (idToken: string) =>
    request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    }),

  // Menu & Discovery
  getMenu: (cafeId: string = 'cafe-001', deviceId: string = 'device-456') =>
    request<MenuResponse>(`/api/menu?cafeId=${encodeURIComponent(cafeId)}&deviceId=${encodeURIComponent(deviceId)}`),

  getAllCafes: () =>
    request<{ cafes: Cafe[] }>('/api/cafes'),

  getCafe: (cafeId: string) =>
    request<Cafe>(`/api/cafes/${encodeURIComponent(cafeId)}`),

  // Order Management
  createOrder: (data: { cafeId: string; deviceId: string; tableId: string; items: OrderItemInput[] }) =>
    request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getOrderStatus: (orderId: string, sessionToken?: string, confirmationCode?: string) => {
    let query = '';
    const params = new URLSearchParams();
    if (sessionToken) params.append('sessionToken', sessionToken);
    if (confirmationCode) params.append('confirmationCode', confirmationCode);
    const qs = params.toString();
    if (qs) query = `?${qs}`;
    return request<OrderStatusResponse>(`/api/orders/${encodeURIComponent(orderId)}/status${query}`);
  },

  payOrder: (orderId: string, method: 'upi' | 'card' | 'cash') =>
    request<{ id: string; paymentMethod: string; paymentStatus: string; total: number; confirmedAt: string }>(
      `/api/orders/${encodeURIComponent(orderId)}/pay`,
      {
        method: 'POST',
        body: JSON.stringify({ method })
      }
    ),

  getReceipt: (orderId: string, sessionToken?: string, code?: string) => {
    const params = new URLSearchParams();
    if (sessionToken) params.append('sessionToken', sessionToken);
    if (code) params.append('code', code);
    const qs = params.toString();
    return request<ReceiptResponse>(`/api/orders/${encodeURIComponent(orderId)}/receipt${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (orderId: string, kitchenStatus: 'confirmed' | 'preparing' | 'ready' | 'collected') =>
    request<{ id: string; kitchenStatus: string; statusTimestamps: any }>(
      `/api/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ kitchenStatus })
      }
    ),

  cancelOrder: (orderId: string, reason?: string) =>
    request<{ success: boolean; orderId: string; refundAmount: number; message: string }>(
      `/api/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ reason })
      }
    ),

  // Sessions
  createSession: (cafeId: string, tableId: string, deviceId: string) =>
    request<SessionResponse>('/api/session/create', {
      method: 'POST',
      body: JSON.stringify({ cafeId, tableId, deviceId })
    }),

  validateSession: (sessionToken: string) =>
    request<SessionResponse>(`/api/session/${encodeURIComponent(sessionToken)}`),

  // Complaints
  getStaffComplaints: (cafeId: string = 'cafe-001', status?: 'open' | 'resolved') => {
    const params = new URLSearchParams();
    if (cafeId) params.append('cafeId', cafeId);
    if (status) params.append('status', status);
    const qs = params.toString();
    return request<{ complaints: Complaint[] }>(`/api/staff/complaints${qs ? `?${qs}` : ''}`);
  },

  submitComplaint: (data: ComplaintInput) =>
    request<{ complaintId: string }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  resolveComplaint: (complaintId: string) =>
    request<{ success: boolean; complaintId: string }>(`/api/complaints/${encodeURIComponent(complaintId)}/resolve`, {
      method: 'POST'
    }),

  // Device Management
  recordDeviceConsent: (deviceId: string, cafeId: string, granted: boolean) =>
    request<{ success: boolean; deviceId: string }>('/api/device/consent', {
      method: 'POST',
      body: JSON.stringify({ deviceId, cafeId, granted })
    }),

  deleteDeviceData: (deviceId: string, cafeId: string = 'cafe-001') =>
    request<{ success: boolean; message: string }>(`/api/device/${encodeURIComponent(deviceId)}?cafeId=${encodeURIComponent(cafeId)}`, {
      method: 'DELETE'
    }),

  // Voice Assistant (Powered by Sarvam AI)
  processVoiceOrder: (data: {
    cafeId: string;
    deviceId: string;
    language?: string;
    transcript?: string;
    speaker?: string;
  }) =>
    request<VoiceOrderResponse>('/api/voice-assist/order', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getVoiceSpeech: (text: string, language: string = 'en-IN', speaker: string = 'shubh') =>
    request<VoiceSpeechResponse>(
      `/api/voice-assist/speech?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}&speaker=${encodeURIComponent(speaker)}`
    ),

  transcribeAudio: (audioBase64: string, language: string = 'en-IN') =>
    request<VoiceTranscribeResponse>('/api/voice-assist/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, language })
    }),

  assistVoiceQuery: (data: {
    message: string;
    cafe?: any;
    conversationHistory?: any[];
    menuItems?: any[];
    sessionId?: string;
    language?: string;
    speaker?: string;
  }) =>
    request<{
      response: string;
      audio: string | null;
      audioFormat: string;
      speaker: string;
      language: string;
      intent: string;
      recommendations: any[];
      sessionId: string;
    }>('/api/voice-assist', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // QR Code
  generateQR: (cafeId: string, tableId: string) =>
    request<QRCodeResponse>(`/api/qr/generate?cafeId=${encodeURIComponent(cafeId)}&tableId=${encodeURIComponent(tableId)}`),

  resolveQR: (qrCodeId: string) =>
    request<{ cafeId: string; tableId: string; linkedUserId: string | null; createdAt: string }>(
      `/api/qr/${encodeURIComponent(qrCodeId)}`
    ),

  // Analytics
  getAnalytics: (cafeId: string = 'cafe-001', timeframe: 'today' | '7days' | '30days' = 'today') =>
    request<AnalyticsResponse>(`/api/analytics?cafeId=${encodeURIComponent(cafeId)}&timeframe=${encodeURIComponent(timeframe)}`),

  getSalesAnalytics: (cafeId: string = 'cafe-001', startDate?: string, endDate?: string, period: string = 'daily') =>
    request<SalesAnalyticsResponse>(
      `/api/analytics/sales?cafeId=${encodeURIComponent(cafeId)}&period=${period}`
    ),

  getItemAnalytics: (cafeId: string = 'cafe-001') =>
    request<{ items: ItemAnalyticsItem[] }>(`/api/analytics/items?cafeId=${encodeURIComponent(cafeId)}`),

  // Staff
  getStaffOverview: (cafeId: string = 'cafe-001') =>
    request<StaffOverviewResponse>(`/api/staff/overview?cafeId=${encodeURIComponent(cafeId)}`),

  getStaffOrders: (cafeId: string = 'cafe-001', status?: string) => {
    const url = `/api/staff/orders?cafeId=${encodeURIComponent(cafeId)}${status ? `&status=${encodeURIComponent(status)}` : ''}`;
    return request<{ orders: Order[] }>(url);
  },

  getStaffMenu: (cafeId: string = 'cafe-001') =>
    request<{ items: MenuItem[] }>(`/api/staff/menu?cafeId=${encodeURIComponent(cafeId)}`),

  setMenuAvailability: (itemId: string, available: boolean) =>
    request<MenuItem>(`/api/staff/menu/${encodeURIComponent(itemId)}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available })
    }),

  // Admin
  getUsers: (cafeId?: string, role?: string) => {
    const params = new URLSearchParams();
    if (cafeId) params.append('cafeId', cafeId);
    if (role) params.append('role', role);
    const qs = params.toString();
    return request<{ users: User[] }>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },

  createCafe: (data: Partial<Cafe> & { name: string }) =>
    request<{ cafe: Cafe; qr?: any }>('/api/admin/cafes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCafe: (cafeId: string, data: Partial<Cafe>) =>
    request<Cafe>(`/api/admin/cafes/${encodeURIComponent(cafeId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  createMenuItem: (cafeId: string, itemData: Partial<MenuItem> & { name: string; price: number; category: string }) =>
    request<{ item: MenuItem; activeQR?: any }>(`/api/admin/cafes/${encodeURIComponent(cafeId)}/menu`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    }),

  getAdminCafeMenu: (cafeId: string) =>
    request<{ cafe: Cafe; items: MenuItem[]; qr?: any }>(`/api/admin/cafes/${encodeURIComponent(cafeId)}/menu`),

  getAdminCafes: () =>
    request<{ cafes: (Cafe & { menuItemCount?: number; activeQR?: any })[] }>('/api/admin/cafes')
};
