import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../db/store';
import { User, StaffRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'loka_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '12h';

export interface AuthJwtPayload {
  id: string;
  email: string;
  role: StaffRole;
  cafeId: string | null;
  name: string;
}

export function generateStaffToken(user: User): string {
  const payload: AuthJwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    cafeId: user.cafeId,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyStaffToken(token: string): AuthJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthJwtPayload;
}

export function authenticateStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyStaffToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export function requireRole(allowedRoles: StaffRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: requires role in [${allowedRoles.join(', ')}]` });
    }

    next();
  };
}

export function requireCafeAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // support role is global
  if (req.user.role === 'support') {
    return next();
  }

  const targetCafeId = req.params.cafeId || req.query.cafeId || req.body.cafeId;
  if (targetCafeId && req.user.cafeId && req.user.cafeId !== targetCafeId) {
    return res.status(403).json({ error: 'Forbidden: access restricted to own cafe' });
  }

  next();
}
