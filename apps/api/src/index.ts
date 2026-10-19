import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { users, categories, providers, bookings } from "./db/schema";

// پێناسەکردنی تایپەکانی Context بۆ Hono تا کێشەی c.get و c.set نەمێنێت
type Variables = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

const app = new Hono<{ Variables: Variables }>();

// چالاککردنی CORS
app.use("/*", cors());

const JWT_SECRET = process.env.JWT_SECRET || "homefix-secret-jwt-key-2026";

// شێوازی ستانداردی وەڵامەکان
const sendSuccess = (c: any, data: any, message?: string, status: any = 200) => {
  return c.json({ success: true, message, data }, status);
};

const sendError = (c: any, message: string, status: any = 400) => {
  return c.json({ success: false, message }, status);
};

// Middleware: پاراستنی ڕاوتەکان بە تۆکن
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(c, "Unauthorized: Token missing", 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = (await verify(token, JWT_SECRET, "HS256")) as {
      id: string;
      email: string;
      role: string;
    };
    c.set("user", payload);
    await next();
  } catch (err) {
    return sendError(c, "Unauthorized: Invalid or expired token", 401);
  }
};

// Middleware: تەنها بۆ ئەدمین
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return sendError(c, "Forbidden: Admin access required", 403);
  }
  await next();
};

// ----------------------------------------------------
// ڕاوتەکان (Routes)
// ----------------------------------------------------

// 1. Health check (API up + database connected)
app.get("/health", async (c) => {
  try {
    await db.select().from(categories).limit(1);
    return sendSuccess(c, { status: "ok", database: "connected" }, "API and database are healthy");
  } catch (err: any) {
    return c.json(
      {
        success: false,
        status: "error",
        database: "disconnected",
        message: err.message || "Database connection error",
      },
      500
    );
  }
});

// 2. Auth: Register (کڕیار)
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

app.post("/api/v1/auth/register", zValidator("json", registerSchema), async (c) => {
  const { name, email, password } = c.req.valid("json");

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return sendError(c, "Email already exists", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "customer" })
    .returning();

  const token = await sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    "HS256"
  );

  return sendSuccess(
    c,
    {
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token,
    },
    "Registration successful",
    201
  );
});

// 3. Auth: Login (کڕیار و ئەدمین)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post("/api/v1/auth/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return sendError(c, "Invalid email or password", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return sendError(c, "Invalid email or password", 401);
  }

  const token = await sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    "HS256"
  );

  return sendSuccess(
    c,
    {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    },
    "Login successful"
  );
});

// 4. Categories: هێنانی هەموو بەشە چالاکەکان
app.get("/api/v1/categories", async (c) => {
  const data = await db.select().from(categories).where(eq(categories.isActive, true));
  return sendSuccess(c, data);
});

// زیادکردنی بەشی نوێ (Category)
const createCategorySchema = z.object({
  name: z.string().min(2),
  nameCkb: z.string().min(2),
  isActive: z.boolean().optional(),
});

app.post(
  "/api/v1/categories",
  authMiddleware,
  adminMiddleware,
  zValidator("json", createCategorySchema),
  async (c) => {
    const body = c.req.valid("json");
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: body.name,
        nameCkb: body.nameCkb,
        isActive: body.isActive ?? true,
      })
      .returning();

    return sendSuccess(c, newCategory, "Category created successfully", 201);
  }
);

// زیادکردنی وەستای نوێ (Provider)
const createProviderSchema = z.object({
  name: z.string().min(2),
  categoryId: z.string(),
  city: z.string().min(2),
  phone: z.string().min(6),
  hourlyRate: z.number().positive(),
  isActive: z.boolean().optional(),
});

app.post(
  "/api/v1/providers",
  authMiddleware,
  adminMiddleware,
  zValidator("json", createProviderSchema),
  async (c) => {
    const body = c.req.valid("json");
    const [newProvider] = await db
      .insert(providers)
      .values({
        name: body.name,
        categoryId: body.categoryId,
        city: body.city,
        phone: body.phone,
        hourlyRate: body.hourlyRate,
        isActive: body.isActive ?? true,
      })
      .returning();

    return sendSuccess(c, newProvider, "Provider created successfully", 201);
  }
);

// 5. Providers: هێنانی وەستاکان
app.get("/api/v1/providers", async (c) => {
  const categoryId = c.req.query("categoryId") || c.req.query("category_id");
  const city = c.req.query("city");
  const includeAll = c.req.query("all") === "true"; // بۆ ئەدمین

  const conditions = [];

  // ئەگەر all دانەنرابوو، تەنها چالاکەکان دەهێنێت (بۆ مۆبایل)
  if (!includeAll) {
    conditions.push(eq(providers.isActive, true));
  }

  if (categoryId) {
    conditions.push(eq(providers.categoryId, categoryId));
  }
  if (city) {
    conditions.push(eq(providers.city, city));
  }

  const data = await db
    .select()
    .from(providers)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return sendSuccess(c, data);
});

// 6. Bookings: دروستکردنی حجزکردن بۆ کڕیار
const bookingSchema = z.object({
  providerId: z.string().uuid(),
  customerName: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

app.post("/api/v1/bookings", authMiddleware, zValidator("json", bookingSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  const [newBooking] = await db
    .insert(bookings)
    .values({
      customerId: user.id,
      providerId: body.providerId,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes,
      status: "pending",
    })
    .returning();

  return sendSuccess(c, newBooking, "Booking created successfully", 201);
});

// 7. Bookings: بینینی داواکارییەکانی کڕیاری لۆگینبوو (پشتگیری /me و /my دەکات)
const getCustomerBookings = async (c: any) => {
  const user = c.get("user");
  const data = await db.query.bookings.findMany({
    where: eq(bookings.customerId, user.id),
    orderBy: [desc(bookings.createdAt)],
    with: {
      provider: true,
    },
  });
  return sendSuccess(c, data);
};

app.get("/api/v1/bookings/me", authMiddleware, getCustomerBookings);
app.get("/api/v1/bookings/my", authMiddleware, getCustomerBookings);

// ئەپدەیتکردنی وەستا (Edit Provider / Toggle isActive)
app.patch("/api/v1/providers/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const [updated] = await db
    .update(providers)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.phone && { phone: body.phone }),
      ...(body.city && { city: body.city }),
      ...(body.hourlyRate && { hourlyRate: Number(body.hourlyRate) }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    })
    .where(eq(providers.id, id))
    .returning();

  return sendSuccess(c, updated, "Provider updated successfully");
});

// ئەپدەیتکردنی کەتەگۆری (Edit Category / Toggle isActive)
app.patch("/api/v1/categories/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const [updated] = await db
    .update(categories)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.nameCkb && { nameCkb: body.nameCkb }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    })
    .where(eq(categories.id, id))
    .returning();

  return sendSuccess(c, updated, "Category updated successfully");
});

// 8. Admin Bookings: بینینی هەموو داواکارییەکان (پشتگیری /bookings و /admin/bookings دەکات)
const getAdminBookings = async (c: any) => {
  const statusFilter = c.req.query("status");
  const conditions = [];

  if (statusFilter) {
    conditions.push(eq(bookings.status, statusFilter as any));
  }

  const data = await db.query.bookings.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(bookings.createdAt)],
    with: {
      provider: true,
      customer: true,
    },
  });

  return sendSuccess(c, data);
};

app.get("/api/v1/bookings", authMiddleware, adminMiddleware, getAdminBookings);
app.get("/api/v1/admin/bookings", authMiddleware, adminMiddleware, getAdminBookings);

// 9. Status Update: گۆڕینی دۆخی حجزکردن بەپێی زنجیرەی دروست
const validTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
});

app.patch(
  "/api/v1/bookings/:id/status",
  authMiddleware,
  adminMiddleware,
  zValidator("json", updateStatusSchema),
  async (c) => {
    const id = c.req.param("id");
    const { status: newStatus } = c.req.valid("json");

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      return sendError(c, "Booking not found", 404);
    }

    const currentStatus = booking.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return sendError(
        c,
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(", ")}]`,
        400
      );
    }

    const [updated] = await db
      .update(bookings)
      .set({ status: newStatus })
      .where(eq(bookings.id, id))
      .returning();

    return sendSuccess(c, updated, `Status updated to ${newStatus}`);
  }
);

export default {
  port: Number(process.env.PORT) || 3001,
  fetch: app.fetch,
};