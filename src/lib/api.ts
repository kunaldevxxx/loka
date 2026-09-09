import {
  AnalyticsResponse,
  AuthResponse,
  Cafe,
  Complaint,
  ComplaintInput,
  ItemAnalyticsItem,
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
  VoiceOrderResponse
} from '../types/api';

const RAW_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');
const BASE_URL = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL.slice(0, -4) : RAW_BASE_URL;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('loka_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
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

  // Voice Assistant
  processVoiceOrder: (data: { cafeId: string; deviceId: string; language?: string; transcript?: string }) =>
    request<VoiceOrderResponse>('/api/voice-assist/order', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getVoiceSpeech: (text: string, language: string = 'en') =>
    request<{ audio: string; mimeType: string; text: string }>(`/api/voice-assist/speech?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}`),

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

  // Admin
  getUsers: (cafeId?: string, role?: string) => {
    const params = new URLSearchParams();
    if (cafeId) params.append('cafeId', cafeId);
    if (role) params.append('role', role);
    const qs = params.toString();
    return request<{ users: User[] }>(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },

  createCafe: (data: Partial<Cafe>) =>
    request<Cafe>('/api/admin/cafes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCafe: (cafeId: string, data: Partial<Cafe>) =>
    request<Cafe>(`/api/admin/cafes/${encodeURIComponent(cafeId)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};
