import { Router, Request, Response } from 'express';
import { store } from '../db/store';
import { calculatePricing } from '../lib/pricing.js';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

export const customerRouter = Router();

// 1. Health
customerRouter.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ ok: true });
});

// 2. Cafes Venue-picker list
customerRouter.get('/cafes', (_req: Request, res: Response) => {
  const cafes = store.getCafes().map((c) => ({
    cafeId: c.cafeId,
    name: c.name,
    tagline: c.tagline,
    venueType: c.venueType,
    icon: c.icon,
    location: c.location,
    phone: c.phone,
    defaultTableId: c.defaultTableId,
    specialtyItemIds: c.specialtyItemIds || [],
    theme: c.theme
  }));
  return res.status(200).json({ cafes });
});

// Helper: derive time of day
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

// 3. Menu with Personalization
customerRouter.get('/menu', (req: Request, res: Response) => {
  const cafeId = req.query.cafeId as string;
  const deviceId = req.query.deviceId as string;

  if (!cafeId) {
    return res.status(400).json({ error: 'cafeId is required' });
  }

  const cafe = store.getCafeById(cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found' });
  }

  const items = store.getMenuItems(cafeId);
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const timeOfDay = getTimeOfDay();

  let isReturning = false;
  let visitCount = 0;
  let favoriteDish: any = null;
  let recentOrders: any[] = [];
  let recentItems: any[] = [];
  let recommendations: any[] = [];

  if (deviceId) {
    const paidOrders = store.getPaidOrdersForDevice(deviceId, cafeId);
    visitCount = paidOrders.length;
    isReturning = visitCount > 0;

    if (isReturning) {
      // Favorite dish calculation
      const itemCounts: Record<string, { itemId: string; name: string; count: number }> = {};
      for (const ord of paidOrders) {
        for (const item of ord.items) {
          if (!itemCounts[item.itemId]) {
            itemCounts[item.itemId] = { itemId: item.itemId, name: item.name, count: 0 };
          }
          itemCounts[item.itemId].count += item.qty;
        }
      }

      const sortedFaves = Object.values(itemCounts).sort((a, b) => b.count - a.count);
      if (sortedFaves.length > 0) {
        const topFav = sortedFaves[0];
        favoriteDish = items.find((i) => i.itemId === topFav.itemId || i.name === topFav.name) || null;
      }

      // Five recent order lines formatted as RecentOrder
      recentOrders = paidOrders
        .slice()
        .reverse()
        .flatMap((o) =>
          o.items.map((it) => ({
            dishId: it.itemId,
            dishName: it.name,
            customization: it.customizationSummary || 'Standard',
            timestamp: o.createdAt,
            dayOfWeek: new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
            timeOfDay
          }))
        )
        .slice(0, 5);

      const flatItems = paidOrders
        .slice()
        .reverse()
        .flatMap((o) => o.items);
      recentItems = flatItems.slice(0, 5);

      // Recommendations based on favorite or popular items
      recommendations = items
        .filter((i) => i.available && (i.tags?.includes('bestseller') || i.tags?.includes('signature')))
        .slice(0, 4);
    }
  }

  // Default recommendations if none found
  if (recommendations.length === 0) {
    recommendations = items
      .filter((i) => i.available && (i.tags?.includes('bestseller') || i.tags?.includes('signature')))
      .slice(0, 3);
    if (recommendations.length === 0) {
      recommendations = items.slice(0, 3);
    }
  }

  const recommendedIds = recommendations.map((r) => r.itemId);

  return res.status(200).json({
    cafe,
    items,
    categories,
    timeOfDay,
    isReturning,
    visitCount,
    favoriteDish,
    recentOrders,
    recentItems,
    recommendations,
    recommendedIds
  });
});

// 4. Session Create
customerRouter.post('/session/create', (req: Request, res: Response) => {
  const { cafeId, tableId, deviceId } = req.body;
  if (!cafeId || !deviceId) {
    return res.status(400).json({ error: 'cafeId and deviceId are required' });
  }

  const cafe = store.getCafeById(cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found' });
  }

  const targetTableId = tableId || cafe.defaultTableId;
  const session = store.createSession(cafeId, targetTableId, deviceId);

  return res.status(200).json({
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt
  });
});

// 5. Session Validate
customerRouter.get('/session/validate', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = store.validateSession(token);
  if (!result.valid) {
    return res.status(200).json({ valid: false, expiresAt: result.expiresAt });
  }
  return res.status(200).json({
    valid: true,
    expiresAt: result.expiresAt
  });
});

// 6. Device Consent
customerRouter.post('/device/consent', (req: Request, res: Response) => {
  const { deviceId, cafeId, granted } = req.body;
  if (!deviceId || !cafeId || typeof granted !== 'boolean') {
    return res.status(400).json({ error: 'deviceId, cafeId, and boolean granted are required' });
  }

  const device = store.upsertConsent(deviceId, cafeId, granted);
  return res.status(200).json({
    deviceId: device.deviceId,
    cafeId: device.cafeId,
    granted: device.granted,
    updatedAt: device.updatedAt
  });
});

// 7. Privacy Deletion
customerRouter.delete('/device/:deviceId', (req: Request, res: Response) => {
  const deviceId = req.params.deviceId;
  const cafeId = req.query.cafeId as string;

  if (!cafeId) {
    return res.status(400).json({ error: 'cafeId query parameter is required' });
  }

  const result = store.deleteDeviceData(deviceId, cafeId);
  return res.status(200).json({
    success: true,
    message: `Data deleted successfully: ${result.ordersDeleted} orders removed`,
    ...result
  });
});

// Helper: generate 6-char alphanumeric confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 8. Order Creation
customerRouter.post('/orders', (req: Request, res: Response) => {
  const { cafeId, deviceId, tableId, items } = req.body;

  if (!cafeId || !deviceId) {
    return res.status(400).json({ error: 'cafeId and deviceId are required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  const cafe = store.getCafeById(cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found' });
  }

  const cafeMenuItems = store.getMenuItems(cafeId);

  // Check if patron is a returning visitor at this venue
  const priorPaidOrders = store.getPaidOrdersForDevice(deviceId, cafeId);
  const isReturning = priorPaidOrders.length > 0;

  let pricing;
  try {
    pricing = calculatePricing(items, cafeMenuItems, isReturning);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Price calculation failed' });
  }

  const now = new Date().toISOString();
  const confirmationCode = generateConfirmationCode();
  const orderId = `ord-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const newOrder = store.createOrder({
    id: orderId,
    cafeId,
    deviceId,
    tableId: tableId || cafe.defaultTableId,
    items: pricing.items,
    subtotal: pricing.subtotal,
    gst: pricing.gst,
    loyaltyDiscount: pricing.loyaltyDiscount,
    total: pricing.total,
    paymentMethod: 'upi',
    paymentStatus: 'pending_payment',
    kitchenStatus: 'pending_payment',
    pointsEarned: pricing.pointsEarned,
    confirmationCode,
    isReturningAtOrderTime: isReturning,
    createdAt: now,
    statusTimestamps: {
      created: now,
      confirmed: null,
      preparing: null,
      ready: null,
      collected: null
    }
  });

  return res.status(201).json(newOrder);
});

// 9. Payment
customerRouter.post('/orders/:id/pay', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { method = 'upi' } = req.body;
  if (!['upi', 'card', 'cash'].includes(method)) {
    return res.status(400).json({ error: 'Invalid payment method. Allowed: upi, card, cash' });
  }

  // Idempotent paid order handling
  if (order.paymentStatus === 'paid') {
    return res.status(200).json(order);
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  // Real Razorpay integration when credentials are configured and not cash
  if (razorpayKeyId && razorpaySecret && method !== 'cash') {
    const razorpayOrderId = `order_rzp_${crypto.randomBytes(8).toString('hex')}`;
    store.updateOrder(order.id, {
      razorpayOrderId,
      paymentMethod: method
    });

    store.createAuditLog(order.cafeId, 'payment_started', {
      orderId: order.id,
      razorpayOrderId,
      amountPaise: Math.round(order.total * 100)
    }, order.id);

    return res.status(200).json({
      razorpayOrderId,
      amount: Math.round(order.total * 100),
      currency: 'INR',
      key_id: razorpayKeyId,
      orderId: order.id,
      confirmationCode: order.confirmationCode
    });
  }

  // Cash or Simulated Instant Payment
  const now = new Date().toISOString();
  const updated = store.updateOrder(order.id, {
    paymentMethod: method,
    paymentStatus: 'paid',
    kitchenStatus: 'confirmed',
    confirmedAt: now,
    statusTimestamps: {
      ...order.statusTimestamps,
      confirmed: now
    }
  });

  store.createAuditLog(order.cafeId, 'payment_completed', {
    orderId: order.id,
    method,
    total: order.total
  }, order.id);

  return res.status(200).json(updated);
});

// 10. Verify Razorpay Payment
customerRouter.post('/orders/:id/verify', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  if (!razorpay_payment_id || !razorpay_order_id) {
    return res.status(400).json({ error: 'Missing payment verification credentials' });
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (razorpaySecret && razorpay_signature) {
    const generatedSig = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Razorpay signature verification' });
    }
  }

  const now = new Date().toISOString();
  const updated = store.updateOrder(order.id, {
    paymentStatus: 'paid',
    kitchenStatus: 'confirmed',
    confirmedAt: now,
    statusTimestamps: {
      ...order.statusTimestamps,
      confirmed: now
    }
  });

  store.createAuditLog(order.cafeId, 'payment_completed', {
    orderId: order.id,
    razorpay_payment_id,
    razorpay_order_id
  }, order.id);

  return res.status(200).json(updated);
});

// 11. Order Status
customerRouter.get('/orders/:id/status', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const sessionToken = req.query.sessionToken as string;
  let hasValidSession = false;

  if (sessionToken) {
    const sessionValidation = store.validateSession(sessionToken);
    if (sessionValidation.valid && sessionValidation.session) {
      const sess = sessionValidation.session;
      if (sess.cafeId === order.cafeId && (sess.deviceId === order.deviceId || sess.tableId === order.tableId)) {
        hasValidSession = true;
      }
    }
  }

  // Without matching session token, only expose pending payment status
  if (!hasValidSession) {
    return res.status(200).json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      message: order.paymentStatus === 'pending_payment' ? 'Awaiting payment confirmation' : 'Session token required for live kitchen tracking'
    });
  }

  const stepMap: Record<string, { stepIndex: number; progressPct: number }> = {
    pending_payment: { stepIndex: 0, progressPct: 0 },
    confirmed: { stepIndex: 1, progressPct: 25 },
    preparing: { stepIndex: 2, progressPct: 50 },
    ready: { stepIndex: 3, progressPct: 75 },
    collected: { stepIndex: 4, progressPct: 100 },
    cancelled: { stepIndex: 0, progressPct: 0 }
  };

  const currentStep = stepMap[order.kitchenStatus] || { stepIndex: 1, progressPct: 25 };

  return res.status(200).json({
    orderId: order.id,
    paymentStatus: order.paymentStatus,
    status: order.kitchenStatus,
    kitchenStatus: order.kitchenStatus,
    stepIndex: currentStep.stepIndex,
    progressPct: currentStep.progressPct,
    isComplete: order.kitchenStatus === 'collected',
    timestamps: order.statusTimestamps
  });
});

// 12. Receipt / Loyalty
customerRouter.get('/orders/:id/receipt', (req: Request, res: Response) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const sessionToken = req.query.sessionToken as string;
  const code = req.query.code as string;

  let authorized = false;

  if (code && order.confirmationCode.toUpperCase() === code.trim().toUpperCase()) {
    authorized = true;
  } else if (sessionToken) {
    const val = store.validateSession(sessionToken);
    if (val.valid && val.session && val.session.cafeId === order.cafeId && val.session.deviceId === order.deviceId) {
      authorized = true;
    }
  }

  if (!authorized) {
    return res.status(403).json({ error: 'Authorization required: provide valid sessionToken or matching confirmation code' });
  }

  const paidOrders = store.getPaidOrdersForDevice(order.deviceId, order.cafeId);
  const visitCount = paidOrders.length;
  const totalPoints = paidOrders.reduce((sum, o) => sum + (o.pointsEarned || 0), 0);
  const nextRewardAt = 500;
  const rewardUnlocked = totalPoints >= nextRewardAt;

  return res.status(200).json({
    order,
    visitCount,
    totalPoints,
    nextRewardAt,
    rewardUnlocked
  });
});

// 13. Order by Confirmation Code
customerRouter.get('/orders/by-code/:code', (req: Request, res: Response) => {
  const code = req.params.code;
  const order = store.getOrderByCode(code);
  if (!order) {
    return res.status(404).json({ error: 'Order not found for code' });
  }

  const paidOrders = store.getPaidOrdersForDevice(order.deviceId, order.cafeId);
  const visitCount = paidOrders.length;
  const totalPoints = paidOrders.reduce((sum, o) => sum + (o.pointsEarned || 0), 0);
  const nextRewardAt = 500;
  const rewardUnlocked = totalPoints >= nextRewardAt;

  return res.status(200).json({
    order,
    visitCount,
    totalPoints,
    nextRewardAt,
    rewardUnlocked
  });
});

// 14. Complaints
customerRouter.post('/complaints', (req: Request, res: Response) => {
  const { orderId, cafeId, tableId, issueType, itemName, description } = req.body;

  if (!orderId || !cafeId || !issueType || !description) {
    return res.status(400).json({ error: 'orderId, cafeId, issueType, and description are required' });
  }

  const allowedTypes = ['wrong_item', 'missing_item', 'quality_issue', 'wrong_quantity', 'other'];
  if (!allowedTypes.includes(issueType)) {
    return res.status(400).json({ error: `issueType must be one of: ${allowedTypes.join(', ')}` });
  }

  const complaint = store.createComplaint({
    orderId,
    cafeId,
    tableId,
    issueType,
    itemName,
    description
  });

  return res.status(201).json({ complaintId: complaint.complaintId });
});

// 15. Voice Assist (Gemini Powered or Natural Fallback)
customerRouter.post('/voice-assist', async (req: Request, res: Response) => {
  const { message, cafe, conversationHistory, menuItems, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const activeSessionId = sessionId || `voice-${Date.now()}`;
  const apiKey = process.env.GEMINI_API_KEY;

  let responseText = "I'd love to help you with that! Would you like to explore our signature cappuccino or artisanal pastries?";
  let recommendations: any[] = [];
  let intent = 'inquiry';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a warm, courteous digital barista for ${cafe?.name || 'Loka Cafe'}.
User says: "${message}"
Menu highlights: ${Array.isArray(menuItems) ? menuItems.slice(0, 8).map((m: any) => `${m.name} (₹${m.price})`).join(', ') : 'Signature Cappuccino, Avocado Tartine, Basque Cheesecake'}
Instructions:
- Keep answers concise, natural, and friendly (under 40 words).
- If they want to order or ask for recommendation, give 1-2 specific suggestions.
- Respond in plain text.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (aiResponse.text) {
        responseText = aiResponse.text.trim();
        intent = 'recommendation';
      }
    } catch {
      // Graceful fallback if Gemini quota is reached
    }
  }

  // If user mentioned coffee, croissant, sweet etc.
  const lower = message.toLowerCase();
  if (lower.includes('coffee') || lower.includes('latte') || lower.includes('cappuccino')) {
    intent = 'order_coffee';
  } else if (lower.includes('croissant') || lower.includes('eat') || lower.includes('food')) {
    intent = 'order_food';
  }

  return res.status(200).json({
    response: responseText,
    audio: null, // MP3 base64 only when ElevenLabs is configured
    intent,
    recommendations,
    sessionId: activeSessionId
  });
});

// 16. Catalog Alternate Feed
customerRouter.get('/catalog/:cafeId', (req: Request, res: Response) => {
  const cafeId = req.params.cafeId;
  const cafe = store.getCafeById(cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Cafe not found' });
  }

  const items = store.getMenuItems(cafeId);

  // Group by category with derived dietary flags
  const grouped: Record<string, any[]> = {};

  for (const item of items) {
    const isVegetarian = !item.name.toLowerCase().includes('salmon') && !item.name.toLowerCase().includes('chicken') && !item.name.toLowerCase().includes('meat');
    const isVegan = isVegetarian && !item.name.toLowerCase().includes('cheesecake') && !item.name.toLowerCase().includes('butter') && !item.name.toLowerCase().includes('egg');
    const isGlutenFree = item.category.includes('Coffee') || item.category.includes('Beverages');

    const enriched = {
      ...item,
      dietary: {
        isVegetarian,
        isVegan,
        isGlutenFree,
        isDairyFree: item.milkOptions && item.milkOptions.some((m) => m.toLowerCase().includes('oat') || m.toLowerCase().includes('almond'))
      }
    };

    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(enriched);
  }

  return res.status(200).json({
    cafe,
    catalog: grouped
  });
});
