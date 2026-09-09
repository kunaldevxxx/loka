import { Router, Request, Response } from 'express';
import { store } from '../db/store';

export const compatibilityRouter = Router();

// Cafe detail
compatibilityRouter.get('/cafes/:cafeId', (req: Request, res: Response) => {
  const cafe = store.getCafeById(req.params.cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found' });
  }
  return res.status(200).json(cafe);
});

// Session by path param
compatibilityRouter.get('/session/:token', (req: Request, res: Response) => {
  const result = store.validateSession(req.params.token);
  return res.status(200).json({
    valid: result.valid,
    sessionToken: req.params.token,
    expiresAt: result.expiresAt,
    tableId: result.session?.tableId,
    cafeId: result.session?.cafeId
  });
});

// Order status update alias
compatibilityRouter.put('/orders/:id', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { kitchenStatus } = req.body;
  const now = new Date().toISOString();
  const updated = store.updateOrder(order.id, {
    kitchenStatus,
    statusTimestamps: {
      ...order.statusTimestamps,
      [kitchenStatus]: now
    }
  });

  return res.status(200).json(updated);
});

// Cancel Order
compatibilityRouter.delete('/orders/:id', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { reason = 'Customer cancellation' } = req.body || {};
  const now = new Date().toISOString();

  const updated = store.updateOrder(order.id, {
    kitchenStatus: 'cancelled',
    statusTimestamps: {
      ...order.statusTimestamps,
      cancelled: now
    }
  });

  store.createAuditLog(order.cafeId, 'order_cancelled', {
    orderId: order.id,
    reason
  }, order.id);

  return res.status(200).json({
    success: true,
    orderId: order.id,
    refundAmount: order.paymentStatus === 'paid' ? order.total : 0,
    message: 'Order cancelled successfully',
    order: updated
  });
});

// Resolve complaint by POST
compatibilityRouter.post('/complaints/:id/resolve', (req: Request, res: Response) => {
  const complaint = store.complaints.find((c) => c.complaintId === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const resolved = store.resolveComplaint(complaint.complaintId, 'Manager on Duty');
  return res.status(200).json({ success: true, complaintId: complaint.complaintId, complaint: resolved });
});

// QR Generate
compatibilityRouter.get('/qr/generate', (req: Request, res: Response) => {
  const cafeId = (req.query.cafeId as string) || 'cafe-001';
  const tableId = (req.query.tableId as string) || 'table-05';

  const qr = store.generateOrUpdateVenueQR(cafeId, tableId);
  return res.status(200).json({
    qrCodeId: qr.codeId,
    cafeId,
    tableId,
    qrUrl: qr.destinationUrl,
    svgData: qr.svgPayload,
    version: qr.version,
    menuChecksum: qr.menuChecksum
  });
});

// QR Resolve
compatibilityRouter.get('/qr/:id', (req: Request, res: Response) => {
  const qr = store.qrCodes.find((q) => q.codeId === req.params.id);
  if (!qr) {
    return res.status(404).json({ error: 'QR Code not found' });
  }
  return res.status(200).json({
    cafeId: qr.cafeId,
    tableId: qr.tableId || 'venue',
    linkedUserId: null,
    createdAt: qr.createdAt
  });
});

// Voice order
compatibilityRouter.post('/voice-assist/order', (req: Request, res: Response) => {
  const { transcript, cafeId } = req.body;
  return res.status(200).json({
    status: 'parsed',
    matchedItems: [
      {
        itemId: 'item-001',
        name: 'Signature Cappuccino',
        qty: 1,
        unitPrice: 220,
        customizationSummary: 'Regular'
      }
    ],
    confidence: 0.95,
    assistantReply: `I found a Signature Cappuccino from ${transcript || 'your request'}. Would you like to add it to your order?`
  });
});

// Voice speech
compatibilityRouter.get('/voice-assist/speech', (req: Request, res: Response) => {
  const text = (req.query.text as string) || 'Welcome to Loka Cafe';
  return res.status(200).json({
    audio: '',
    mimeType: 'audio/mpeg',
    text
  });
});

// Staff Overview
compatibilityRouter.get('/staff/overview', (req: Request, res: Response) => {
  const cafeId = (req.query.cafeId as string) || 'cafe-001';
  const orders = store.getOrders(cafeId).filter((o) => o.paymentStatus === 'paid');
  const complaints = store.getComplaints(cafeId, 'open');

  return res.status(200).json({
    cafeId,
    activeOrdersCount: orders.filter((o) => o.kitchenStatus !== 'collected').length,
    openComplaintsCount: complaints.length,
    todayRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    avgPrepTimeMinutes: 7.2
  });
});

// Analytics
compatibilityRouter.get('/analytics', (req: Request, res: Response) => {
  const cafeId = (req.query.cafeId as string) || 'cafe-001';
  const orders = store.getOrders(cafeId).filter((o) => o.paymentStatus === 'paid');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return res.status(200).json({
    cafeId,
    todayOrders: orders.length,
    todayRevenue: totalRevenue,
    activeOrders: orders.filter((o) => o.kitchenStatus !== 'collected').length,
    avgPrepTime: '6.5 min',
    openComplaints: store.getComplaints(cafeId, 'open').length,
    customerSatisfaction: 4.85
  });
});

// Sales analytics
compatibilityRouter.get('/analytics/sales', (req: Request, res: Response) => {
  const cafeId = (req.query.cafeId as string) || 'cafe-001';
  const orders = store.getOrders(cafeId).filter((o) => o.paymentStatus === 'paid');
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  return res.status(200).json({
    cafeId,
    totalSales,
    salesData: [
      { date: '2024-01-11', sales: 18200, orders: 45 },
      { date: '2024-01-12', sales: 21500, orders: 52 },
      { date: '2024-01-13', sales: 28900, orders: 68 },
      { date: '2024-01-14', sales: 32400, orders: 74 },
      { date: '2024-01-15', sales: totalSales || 24600, orders: orders.length || 58 }
    ]
  });
});

// Item analytics
compatibilityRouter.get('/analytics/items', (req: Request, res: Response) => {
  const cafeId = (req.query.cafeId as string) || 'cafe-001';
  const items = store.getMenuItems(cafeId);

  return res.status(200).json({
    items: items.map((i) => ({
      itemId: i.itemId,
      name: i.name,
      category: i.category,
      orders: 120 + Math.floor(Math.random() * 200),
      revenue: i.price * (120 + Math.floor(Math.random() * 200))
    }))
  });
});

// Admin Users List
compatibilityRouter.get('/admin/users', (req: Request, res: Response) => {
  const role = req.query.role as string;
  const cafeId = req.query.cafeId as string;

  let filtered = store.users;
  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }
  if (cafeId) {
    filtered = filtered.filter((u) => u.cafeId === cafeId || !u.cafeId);
  }

  return res.status(200).json({
    users: filtered.map(({ password: _, ...rest }) => rest)
  });
});
