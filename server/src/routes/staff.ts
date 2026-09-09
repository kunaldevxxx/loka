import { Router, Response } from 'express';
import { store } from '../db/store';
import {
  generateStaffToken,
  authenticateStaff,
  requireRole,
  AuthenticatedRequest
} from '../lib/auth';

export const staffRouter = Router();

// 1. Staff Login (Email & Password)
staffRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = store.getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  store.updateUserLogin(user.id);
  const token = generateStaffToken(user);
  const cafe = user.cafeId ? store.getCafeById(user.cafeId) : null;

  const { password: _, ...userWithoutPass } = user;
  return res.status(200).json({
    token,
    user: userWithoutPass,
    cafe
  });
});

// 2. Staff Google Auth
staffRouter.post('/auth/google', (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Google accessToken is required' });
  }

  // Find or provision support user for Google login
  let user = store.users.find((u) => u.googleId === accessToken || u.email.includes('google'));
  if (!user) {
    user = store.createUser({
      id: `user-google-${Date.now()}`,
      email: `google.user.${Date.now().toString().slice(-4)}@loka.cafe`,
      name: 'Google Staff Member',
      role: 'support', // New Google users are created as support as per spec
      cafeId: null,
      googleId: accessToken,
      createdAt: new Date().toISOString(),
      loginCount: 1,
      lastLoginAt: new Date().toISOString()
    });
  } else {
    store.updateUserLogin(user.id);
  }

  const token = generateStaffToken(user);
  const cafe = user.cafeId ? store.getCafeById(user.cafeId) : null;
  const { password: _, ...userWithoutPass } = user;

  return res.status(200).json({
    token,
    user: userWithoutPass,
    cafe
  });
});

// 3. Restore Staff Session (Me)
staffRouter.get('/auth/me', authenticateStaff, (req: AuthenticatedRequest, res: Response) => {
  const user = store.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User record not found' });
  }

  const cafe = user.cafeId ? store.getCafeById(user.cafeId) : null;
  const { password: _, ...userWithoutPass } = user;

  return res.status(200).json({
    user: userWithoutPass,
    cafe
  });
});

// Helper to determine cafeId for staff actions
function getStaffCafeId(req: AuthenticatedRequest): string | null {
  if (req.user?.role === 'support') {
    return (req.query.cafeId as string) || store.getCafes()[0]?.cafeId || null;
  }
  return req.user?.cafeId || null;
}

// 4. KDS Orders: Own-cafe paid orders, oldest first
staffRouter.get(
  '/staff/orders',
  authenticateStaff,
  requireRole(['manager', 'chef', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const cafeId = getStaffCafeId(req);
    if (!cafeId) {
      return res.status(400).json({ error: 'Staff account has no assigned cafe' });
    }

    const includeCollected = req.query.includeCollected === 'true';

    // Own-cafe paid orders, oldest first
    const orders = store
      .getOrders(cafeId)
      .filter((o) => o.paymentStatus === 'paid')
      .filter((o) => (includeCollected ? true : o.kitchenStatus !== 'collected'))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return res.status(200).json({ orders });
  }
);

// 5. Advance Order: confirmed -> preparing -> ready -> collected
staffRouter.post(
  '/staff/orders/:id/advance',
  authenticateStaff,
  requireRole(['manager', 'chef', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const order = store.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Role check: manager/chef tied to cafeId
    if (req.user?.role !== 'support' && order.cafeId !== req.user?.cafeId) {
      return res.status(403).json({ error: 'Cannot modify orders belonging to another venue' });
    }

    const flow: Array<'confirmed' | 'preparing' | 'ready' | 'collected'> = [
      'confirmed',
      'preparing',
      'ready',
      'collected'
    ];
    const currentIndex = flow.indexOf(order.kitchenStatus as any);

    if (currentIndex === -1) {
      return res.status(400).json({ error: `Cannot advance order with status ${order.kitchenStatus}` });
    }

    if (currentIndex >= flow.length - 1) {
      return res.status(400).json({ error: 'Order is already collected and finalized' });
    }

    const nextStatus = flow[currentIndex + 1];
    const now = new Date().toISOString();

    const updated = store.updateOrder(order.id, {
      kitchenStatus: nextStatus,
      statusTimestamps: {
        ...order.statusTimestamps,
        [nextStatus]: now
      }
    });

    store.createAuditLog(order.cafeId, 'order_advanced', {
      orderId: order.id,
      fromStatus: order.kitchenStatus,
      toStatus: nextStatus,
      advancedBy: req.user?.name || req.user?.email
    }, order.id);

    return res.status(200).json(updated);
  }
);

// 6. Staff Analytics (Manager)
staffRouter.get(
  '/staff/analytics',
  authenticateStaff,
  requireRole(['manager', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const cafeId = getStaffCafeId(req);
    if (!cafeId) {
      return res.status(400).json({ error: 'Staff account has no assigned cafe' });
    }

    // Get today's paid orders for own-cafe
    const today = new Date().toISOString().slice(0, 10);
    const paidOrders = store
      .getOrders(cafeId)
      .filter((o) => o.paymentStatus === 'paid' && o.createdAt.startsWith(today));

    const totalOrders = paidOrders.length;
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Top 5 item quantities
    const itemTotals: Record<string, { itemId: string; name: string; quantity: number; revenue: number }> = {};
    for (const ord of paidOrders) {
      for (const item of ord.items) {
        if (!itemTotals[item.itemId]) {
          itemTotals[item.itemId] = { itemId: item.itemId, name: item.name, quantity: 0, revenue: 0 };
        }
        itemTotals[item.itemId].quantity += item.qty;
        itemTotals[item.itemId].revenue += item.lineTotal;
      }
    }

    const topItems = Object.values(itemTotals)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({
      cafeId,
      date: today,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topItems
    });
  }
);

// 7. Staff Menu: Own-cafe menu, sorted by category/name (Manager)
staffRouter.get(
  '/staff/menu',
  authenticateStaff,
  requireRole(['manager', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const cafeId = getStaffCafeId(req);
    if (!cafeId) {
      return res.status(400).json({ error: 'Staff account has no assigned cafe' });
    }

    const items = store
      .getMenuItems(cafeId)
      .sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

    return res.status(200).json({ items });
  }
);

// 8. Staff Menu Availability: Only manager menu mutation
staffRouter.patch(
  '/staff/menu/:itemId/availability',
  authenticateStaff,
  requireRole(['manager', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const item = store.getMenuItemById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    if (req.user?.role !== 'support' && item.cafeId !== req.user?.cafeId) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit item from another venue' });
    }

    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'available boolean is required' });
    }

    const updated = store.updateMenuItem(item.itemId, { available });
    return res.status(200).json(updated);
  }
);

// 9. Staff Complaints: Own-cafe complaints, newest first. Query's cafeId is intentionally ignored.
staffRouter.get(
  '/staff/complaints',
  authenticateStaff,
  requireRole(['manager', 'chef', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const cafeId = getStaffCafeId(req);
    if (!cafeId) {
      return res.status(400).json({ error: 'Staff account has no assigned cafe' });
    }

    const status = req.query.status as 'open' | 'resolved' | undefined;
    // Note: Query's cafeId is intentionally ignored per spec! We enforce the staff token's cafeId.
    const complaints = store.getComplaints(cafeId, status);

    return res.status(200).json({ complaints });
  }
);

// 10. Staff Resolve Complaint
staffRouter.patch(
  '/staff/complaints/:id/resolve',
  authenticateStaff,
  requireRole(['manager', 'chef', 'support']),
  (req: AuthenticatedRequest, res: Response) => {
    const complaint = store.complaints.find((c) => c.complaintId === req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    if (req.user?.role !== 'support' && complaint.cafeId !== req.user?.cafeId) {
      return res.status(403).json({ error: 'Cannot resolve complaints for another venue' });
    }

    const staffIdentifier = `${req.user?.name || 'Staff'} (${req.user?.role || 'staff'})`;
    const resolved = store.resolveComplaint(complaint.complaintId, staffIdentifier);

    return res.status(200).json(resolved);
  }
);
