import {
  Cafe,
  MenuItem,
  Order,
  Device,
  Session,
  User,
  QRCode,
  Complaint,
  AuditLog
} from '../types';
import {
  initialCafes,
  initialMenuItems,
  initialUsers,
  initialOrders,
  initialDevices,
  initialComplaints,
  initialAuditLogs
} from '../data/seedData';
import crypto from 'crypto';

class DataStore {
  public cafes: Cafe[] = [];
  public menuItems: MenuItem[] = [];
  public orders: Order[] = [];
  public devices: Device[] = [];
  public sessions: Session[] = [];
  public users: User[] = [];
  public qrCodes: QRCode[] = [];
  public complaints: Complaint[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.cafes = JSON.parse(JSON.stringify(initialCafes));
    this.menuItems = JSON.parse(JSON.stringify(initialMenuItems));
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.orders = JSON.parse(JSON.stringify(initialOrders));
    this.devices = JSON.parse(JSON.stringify(initialDevices));
    this.complaints = JSON.parse(JSON.stringify(initialComplaints));
    this.auditLogs = JSON.parse(JSON.stringify(initialAuditLogs));

    // Generate initial QR codes for seeded cafes
    for (const cafe of this.cafes) {
      this.generateOrUpdateVenueQR(cafe.cafeId);
    }
  }

  // --- CAFES ---
  public getCafes(): Cafe[] {
    return this.cafes;
  }

  public getCafeById(cafeId: string): Cafe | undefined {
    return this.cafes.find((c) => c.cafeId === cafeId);
  }

  public createCafe(data: Partial<Cafe> & { cafeId: string; name: string }): Cafe {
    const existing = this.getCafeById(data.cafeId);
    if (existing) {
      throw new Error(`Cafe with id ${data.cafeId} already exists`);
    }

    const newCafe: Cafe = {
      cafeId: data.cafeId,
      name: data.name,
      tagline: data.tagline || 'Artisanal Cafe & Kitchen',
      venueType: data.venueType || 'cafe',
      icon: data.icon || '☕',
      location: data.location || 'Local Venue',
      phone: data.phone || '+91-0000000000',
      defaultTableId: data.defaultTableId || 'table-01',
      specialtyItemIds: data.specialtyItemIds || [],
      theme: data.theme || initialCafes[0].theme,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.cafes.push(newCafe);
    this.generateOrUpdateVenueQR(newCafe.cafeId);
    return newCafe;
  }

  public updateCafe(cafeId: string, updates: Partial<Cafe>): Cafe | undefined {
    const cafe = this.getCafeById(cafeId);
    if (!cafe) return undefined;

    Object.assign(cafe, updates, { updatedAt: new Date().toISOString() });
    if (updates.theme) {
      cafe.theme = { ...(cafe.theme || initialCafes[0].theme!), ...updates.theme };
    }
    return cafe;
  }

  // --- MENU ITEMS ---
  public getMenuItems(cafeId?: string): MenuItem[] {
    if (cafeId) {
      return this.menuItems.filter((i) => i.cafeId === cafeId);
    }
    return this.menuItems;
  }

  public getMenuItemById(itemId: string): MenuItem | undefined {
    return this.menuItems.find((i) => i.itemId === itemId);
  }

  public createMenuItem(item: MenuItem): MenuItem {
    const existing = this.getMenuItemById(item.itemId);
    if (existing) {
      throw new Error(`Item ${item.itemId} already exists`);
    }

    const newItem: MenuItem = {
      ...item,
      available: item.available !== undefined ? item.available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.menuItems.push(newItem);
    this.generateOrUpdateVenueQR(newItem.cafeId);
    return newItem;
  }

  public updateMenuItem(itemId: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const item = this.getMenuItemById(itemId);
    if (!item) return undefined;

    Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    this.generateOrUpdateVenueQR(item.cafeId);
    return item;
  }

  // --- SESSIONS ---
  public createSession(cafeId: string, tableId: string, deviceId: string): Session {
    const sessionToken = `sess_${crypto.randomBytes(24).toString('hex')}`;
    const now = new Date();
    // 6-hour expiration as specified
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();

    const session: Session = {
      sessionToken,
      cafeId,
      tableId,
      deviceId,
      createdAt: now.toISOString(),
      expiresAt
    };

    // Replace any existing session for this device/cafe or add
    this.sessions.push(session);
    return session;
  }

  public validateSession(sessionToken: string): { valid: boolean; expiresAt?: string; session?: Session } {
    if (!sessionToken) return { valid: false };

    const session = this.sessions.find((s) => s.sessionToken === sessionToken);
    if (!session) return { valid: false };

    const isExpired = new Date(session.expiresAt).getTime() < Date.now();
    if (isExpired) {
      return { valid: false, expiresAt: session.expiresAt };
    }

    return { valid: true, expiresAt: session.expiresAt, session };
  }

  // --- DEVICES & CONSENT ---
  public getDevice(deviceId: string, cafeId: string): Device | undefined {
    return this.devices.find((d) => d.deviceId === deviceId && d.cafeId === cafeId);
  }

  public upsertConsent(deviceId: string, cafeId: string, granted: boolean): Device {
    let device = this.getDevice(deviceId, cafeId);
    const now = new Date().toISOString();

    if (device) {
      device.granted = granted;
      device.updatedAt = now;
    } else {
      device = {
        deviceId,
        cafeId,
        granted,
        createdAt: now,
        updatedAt: now
      };
      this.devices.push(device);
    }
    return device;
  }

  // Privacy deletion: removes both device record and every order for that device at cafeId
  public deleteDeviceData(deviceId: string, cafeId: string): { ordersDeleted: number; deviceDeleted: boolean } {
    const initialOrdersCount = this.orders.length;
    this.orders = this.orders.filter(
      (o) => !(o.deviceId === deviceId && o.cafeId === cafeId)
    );
    const ordersDeleted = initialOrdersCount - this.orders.length;

    const initialDevicesCount = this.devices.length;
    this.devices = this.devices.filter(
      (d) => !(d.deviceId === deviceId && d.cafeId === cafeId)
    );
    const deviceDeleted = initialDevicesCount > this.devices.length;

    return { ordersDeleted, deviceDeleted };
  }

  // --- ORDERS ---
  public getOrders(cafeId?: string): Order[] {
    if (cafeId) {
      return this.orders.filter((o) => o.cafeId === cafeId);
    }
    return this.orders;
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id === orderId);
  }

  public getOrderByCode(code: string): Order | undefined {
    if (!code) return undefined;
    return this.orders.find(
      (o) => o.confirmationCode.toUpperCase() === code.trim().toUpperCase()
    );
  }

  public getPaidOrdersForDevice(deviceId: string, cafeId: string): Order[] {
    return this.orders.filter(
      (o) => o.deviceId === deviceId && o.cafeId === cafeId && o.paymentStatus === 'paid'
    );
  }

  public createOrder(order: Order): Order {
    this.orders.push(order);
    this.createAuditLog(order.cafeId, 'order_created', {
      orderId: order.id,
      total: order.total,
      subtotal: order.subtotal,
      itemCount: order.items.length
    }, order.id);
    return order;
  }

  public updateOrder(orderId: string, updates: Partial<Order>): Order | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;

    Object.assign(order, updates, { updatedAt: new Date().toISOString() });
    return order;
  }

  // --- COMPLAINTS ---
  public getComplaints(cafeId?: string, status?: 'open' | 'resolved'): Complaint[] {
    let result = this.complaints;
    if (cafeId) {
      result = result.filter((c) => c.cafeId === cafeId);
    }
    if (status) {
      result = result.filter((c) => c.status === status);
    }
    // newest first
    return result.slice().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createComplaint(data: Omit<Complaint, 'complaintId' | 'status' | 'createdAt'>): Complaint {
    const complaintId = `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const complaint: Complaint = {
      ...data,
      complaintId,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    this.complaints.push(complaint);
    this.createAuditLog(complaint.cafeId, 'complaint_created', {
      complaintId,
      issueType: complaint.issueType,
      orderId: complaint.orderId
    }, complaint.orderId);
    return complaint;
  }

  public resolveComplaint(complaintId: string, staffName: string): Complaint | undefined {
    const complaint = this.complaints.find((c) => c.complaintId === complaintId);
    if (!complaint) return undefined;

    complaint.status = 'resolved';
    complaint.resolvedAt = new Date().toISOString();
    complaint.resolvedBy = staffName;

    this.createAuditLog(complaint.cafeId, 'complaint_resolved', {
      complaintId,
      resolvedBy: staffName
    }, complaint.orderId);
    return complaint;
  }

  // --- AUDIT LOGS ---
  public createAuditLog(
    cafeId: string,
    eventType: AuditLog['eventType'],
    payload: Record<string, any>,
    orderId?: string
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      cafeId,
      orderId,
      eventType,
      payload,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(log);
    return log;
  }

  // --- USERS & AUTH ---
  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  public updateUserLogin(userId: string): void {
    const user = this.getUserById(userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;
    }
  }

  // --- QR CODES ---
  public generateOrUpdateVenueQR(cafeId: string, tableId?: string): QRCode {
    const items = this.getMenuItems(cafeId);
    const serializedMenu = items
      .map((i) => `${i.itemId}:${i.price}:${i.available}`)
      .sort()
      .join('|');
    const checksum = crypto.createHash('sha256').update(serializedMenu).digest('hex').substring(0, 12);

    const destinationUrl = tableId
      ? `https://loka.cafe/menu?cafeId=${cafeId}&tableId=${tableId}`
      : `https://loka.cafe/menu?cafeId=${cafeId}`;

    const existing = this.qrCodes.find((q) => q.cafeId === cafeId && q.tableId === (tableId || null));
    const version = existing ? (existing.menuChecksum !== checksum ? existing.version + 1 : existing.version) : 1;

    const svgPayload = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#ffffff" rx="16"/>
      <path d="M20 20h60v60h-60zM30 30h40v40h-40zM120 20h60v60h-60zM130 30h40v40h-40zM20 120h60v60h-60zM30 130h40v40h-40z" fill="#000000"/>
      <circle cx="100" cy="100" r="16" fill="#d97706"/>
      <text x="100" y="105" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#ffffff" font-weight="bold">LOKA</text>
      <text x="100" y="185" font-family="sans-serif" font-size="8" text-anchor="middle" fill="#666666">v${version} • ${checksum.substring(0, 6)}</text>
    </svg>`;

    const qr: QRCode = {
      codeId: existing?.codeId || `qr-${cafeId}-${tableId || 'venue'}-${Date.now()}`,
      cafeId,
      tableId: tableId || null,
      destinationUrl,
      svgPayload,
      version,
      active: true,
      menuChecksum: checksum,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existing) {
      Object.assign(existing, qr);
      return existing;
    } else {
      this.qrCodes.push(qr);
      return qr;
    }
  }

  public getQRCode(cafeId: string, tableId?: string): QRCode | undefined {
    return this.qrCodes.find((q) => q.cafeId === cafeId && q.tableId === (tableId || null));
  }
}

export const store = new DataStore();
