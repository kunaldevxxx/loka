import { Router, Response } from 'express';
import { store } from '../db/store';
import { authenticateStaff, requireRole, AuthenticatedRequest } from '../lib/auth';

export const adminRouter = Router();

// Only /admin routes require support access. Scoping the middleware prevents
// this router from intercepting unrelated API paths mounted after it.
adminRouter.use('/admin', authenticateStaff, requireRole(['support']));

// 1. GET /admin/cafes: All venues with menuItemCount
adminRouter.get('/admin/cafes', (_req: AuthenticatedRequest, res: Response) => {
  const venues = store.getCafes().map((cafe) => {
    const items = store.getMenuItems(cafe.cafeId);
    const qr = store.getQRCode(cafe.cafeId);
    return {
      ...cafe,
      menuItemCount: items.length,
      activeQR: qr
    };
  });

  return res.status(200).json({ cafes: venues });
});

// 2. POST /admin/cafes: Creates venue from identity/theme and creates venue QR.
adminRouter.post('/admin/cafes', (req: AuthenticatedRequest, res: Response) => {
  const { cafeId, name, tagline, venueType, icon, location, phone, defaultTableId, specialtyItemIds, theme } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Venue name is required' });
  }

  const generatedId = (cafeId && cafeId.trim())
    ? cafeId.trim()
    : `cafe-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 16)}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    const newCafe = store.createCafe({
      cafeId: generatedId,
      name: name.trim(),
      tagline,
      venueType,
      icon,
      location,
      phone,
      defaultTableId,
      specialtyItemIds,
      theme
    });

    const venueQR = store.getQRCode(newCafe.cafeId);
    return res.status(201).json({
      cafe: newCafe,
      qr: venueQR
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create venue' });
  }
});

// 3. PATCH /admin/cafes/:cafeId: Updates venue fields/theme
adminRouter.patch('/admin/cafes/:cafeId', (req: AuthenticatedRequest, res: Response) => {
  const cafe = store.getCafeById(req.params.cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  const updated = store.updateCafe(cafe.cafeId, req.body);
  return res.status(200).json(updated);
});

// 4. GET /admin/cafes/:cafeId/menu: Full menu for one venue
adminRouter.get('/admin/cafes/:cafeId/menu', (req: AuthenticatedRequest, res: Response) => {
  const cafe = store.getCafeById(req.params.cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  const items = store.getMenuItems(cafe.cafeId);
  const qr = store.getQRCode(cafe.cafeId);

  return res.status(200).json({
    cafe,
    items,
    qr
  });
});

// 5. POST /admin/cafes/:cafeId/menu: Creates menu item. Recalculates QR.
adminRouter.post('/admin/cafes/:cafeId/menu', (req: AuthenticatedRequest, res: Response) => {
  const cafeId = req.params.cafeId;
  const cafe = store.getCafeById(cafeId);
  if (!cafe) {
    return res.status(404).json({ error: 'Venue not found' });
  }

  const {
    itemId,
    name,
    price,
    category,
    available = true,
    tags = [],
    image,
    description,
    sizes = [],
    milkOptions = [],
    addOns = [],
    recommendationReason
  } = req.body;

  if (!name || !name.trim() || price === undefined || !category) {
    return res.status(400).json({ error: 'name, price, and category are required' });
  }

  const generatedItemId = (itemId && itemId.trim())
    ? itemId.trim()
    : `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    const newItem = store.createMenuItem({
      itemId: generatedItemId,
      cafeId,
      name: name.trim(),
      price: Number(price),
      category,
      available,
      tags: Array.isArray(tags) ? tags : [],
      image: image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      description: description || '',
      sizes: Array.isArray(sizes) ? sizes : [],
      milkOptions: Array.isArray(milkOptions) ? milkOptions : [],
      addOns: Array.isArray(addOns) ? addOns : [],
      recommendationReason: recommendationReason || ''
    });

    const activeQR = store.getQRCode(cafeId);
    return res.status(201).json({
      item: newItem,
      activeQR
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create item' });
  }
});

// 6. PATCH /admin/menu/:itemId: Updates menu item fields; regenerates venue QR on checksum change
adminRouter.patch('/admin/menu/:itemId', (req: AuthenticatedRequest, res: Response) => {
  const item = store.getMenuItemById(req.params.itemId);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const updated = store.updateMenuItem(item.itemId, req.body);
  const activeQR = store.getQRCode(item.cafeId);

  return res.status(200).json({
    item: updated,
    activeQR
  });
});
