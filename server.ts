import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { CATALOG_PRODUCTS, DELIVERY_METHODS } from './src/data/catalog.ts';
import type {
  AuthUser,
  DeliveryMethodId,
  SimulationOrder,
  SimulationOrderItem,
} from './src/types/shop.ts';

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface SessionRecord {
  userId: string;
  expiresAt: number;
}

interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
  authToken?: string;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_AUTH_ATTEMPTS_PER_MIN = 25;

const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const sessionsByToken = new Map<string, SessionRecord>();
const ordersByUserId = new Map<string, SimulationOrder[]>();
const authRateBuckets = new Map<string, RateBucket>();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  if (derivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, expectedBuffer);
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessionsByToken.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function rateLimitAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const existing = authRateBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    authRateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    next();
    return;
  }

  if (existing.count >= MAX_AUTH_ATTEMPTS_PER_MIN) {
    res.status(429).json({
      error: 'Zbyt wiele prób logowania lub rejestracji. Odczekaj chwilę i spróbuj ponownie.',
    });
    return;
  }

  existing.count += 1;
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Wymagane jest zalogowanie do konta.' });
    return;
  }

  const session = sessionsByToken.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) {
      sessionsByToken.delete(token);
    }
    res.status(401).json({ error: 'Sesja wygasła. Zaloguj się ponownie.' });
    return;
  }

  const storedUser = usersById.get(session.userId);
  if (!storedUser) {
    sessionsByToken.delete(token);
    res.status(401).json({ error: 'Nie znaleziono konta użytkownika.' });
    return;
  }

  req.authUser = toPublicUser(storedUser);
  req.authToken = token;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/auth/register', rateLimitAuth, (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const rawName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawPassword = typeof body?.password === 'string' ? body.password : '';

    if (rawName.length < 2 || rawName.length > 80) {
      res.status(400).json({
        error: 'Podaj imię i nazwisko (od 2 do 80 znaków).',
      });
      return;
    }

    if (!rawEmail || rawEmail.length > 120 || !isValidEmail(rawEmail)) {
      res.status(400).json({
        error: 'Podaj prawidłowy adres e-mail.',
      });
      return;
    }

    if (rawPassword.length < 8 || rawPassword.length > 128) {
      res.status(400).json({
        error: 'Hasło musi mieć od 8 do 128 znaków.',
      });
      return;
    }

    if (usersByEmail.has(rawEmail)) {
      res.status(409).json({
        error: 'Konto z tym adresem e-mail już istnieje.',
      });
      return;
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      fullName: rawName,
      email: rawEmail,
      passwordHash: hashPassword(rawPassword),
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(rawEmail, user);
    usersById.set(user.id, user);

    const token = createSession(user.id);
    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  });

  app.post('/api/auth/login', rateLimitAuth, (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawPassword = typeof body?.password === 'string' ? body.password : '';

    if (!rawEmail || !rawPassword) {
      res.status(400).json({
        error: 'Podaj adres e-mail oraz hasło.',
      });
      return;
    }

    const storedUser = usersByEmail.get(rawEmail);
    if (!storedUser || !verifyPassword(rawPassword, storedUser.passwordHash)) {
      res.status(401).json({
        error: 'Nieprawidłowy adres e-mail lub hasło.',
      });
      return;
    }

    const token = createSession(storedUser.id);
    res.json({
      token,
      user: toPublicUser(storedUser),
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const token = extractBearerToken(req);
    if (token) {
      sessionsByToken.delete(token);
    }
    res.status(204).end();
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.authUser });
  });

  app.get('/api/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.authUser!.id;
    const orders = ordersByUserId.get(userId) ?? [];
    res.json({ orders });
  });

  app.post('/api/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const body = req.body as Record<string, unknown> | undefined;
    const rawCustomerName =
      typeof body?.customerName === 'string' ? body.customerName.trim() : '';
    const deliveryMethodId =
      typeof body?.deliveryMethodId === 'string'
        ? (body.deliveryMethodId as DeliveryMethodId)
        : null;
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (rawItems.length === 0 || rawItems.length > 50) {
      res.status(400).json({ error: 'Koszyk zamówienia nie może być pusty.' });
      return;
    }

    const deliveryMethod = DELIVERY_METHODS.find((m) => m.id === deliveryMethodId);
    if (!deliveryMethod) {
      res.status(400).json({ error: 'Wybrano nieprawidłową metodę dostawy.' });
      return;
    }

    const verifiedItems: SimulationOrderItem[] = [];
    const qtyByProductId = new Map<string, number>();
    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== 'object') {
        res.status(400).json({ error: 'Nieprawidłowa pozycja w zamówieniu.' });
        return;
      }
      const itemRecord = rawItem as Record<string, unknown>;
      const productId = typeof itemRecord.productId === 'string' ? itemRecord.productId : '';
      const variant =
        typeof itemRecord.variant === 'string' && itemRecord.variant.trim().length > 0
          ? itemRecord.variant.trim().slice(0, 80)
          : 'Standard';
      const quantity =
        typeof itemRecord.quantity === 'number' && Number.isInteger(itemRecord.quantity)
          ? itemRecord.quantity
          : 0;

      const product = CATALOG_PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        res.status(400).json({ error: 'Jeden z wybranych produktów nie istnieje w katalogu.' });
        return;
      }

      const nextQtyTotal = (qtyByProductId.get(product.id) ?? 0) + quantity;
      if (quantity < 1 || nextQtyTotal > product.stock) {
        res.status(400).json({
          error: `Nieprawidłowa ilość dla produktu: ${product.name}.`,
        });
        return;
      }
      qtyByProductId.set(product.id, nextQtyTotal);

      verifiedItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        variant,
        unitPricePln: product.pricePln,
        quantity,
        lineTotalPln: product.pricePln * quantity,
      });
    }

    const subtotalPln = verifiedItems.reduce((sum, item) => sum + item.lineTotalPln, 0);
    const deliveryPln = deliveryMethod.pricePln;
    const totalPln = subtotalPln + deliveryPln;
    const randomSuffix = crypto.randomInt(1000, 9999);

    const order: SimulationOrder = {
      orderNumber: `#SYM-2026-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
      customerName:
        rawCustomerName.length >= 2 && rawCustomerName.length <= 80
          ? rawCustomerName
          : user.fullName,
      deliveryMethod,
      items: verifiedItems,
      subtotalPln,
      deliveryPln,
      totalPln,
    };

    const existingOrders = ordersByUserId.get(user.id) ?? [];
    ordersByUserId.set(user.id, [order, ...existingOrders]);

    res.status(201).json({ order });
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

void startServer();
