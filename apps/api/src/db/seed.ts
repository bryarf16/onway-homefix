import { db } from "./index";
import { users, categories, providers, bookings } from "./schema";
import { eq } from "drizzle-orm";
const bcrypt = require("bcryptjs");

async function seed() {
    console.log("Starting clean seed...");

    // Seed admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db
        .insert(users)
        .values({
            name: "Admin User",
            email: "admin@homefix.test",
            passwordHash: adminPassword,
            role: "admin",
        })
        .onConflictDoNothing();

    console.log("Admin user ready (admin@homefix.test / admin123)");

    // Seed demo customer
    const customerPassword = await bcrypt.hash("customer123", 10);
    await db
        .insert(users)
        .values({
            name: "Demo Customer (کڕیار)",
            email: "customer@homefix.test",
            passwordHash: customerPassword,
            role: "customer",
        })
        .onConflictDoNothing();

    console.log("Demo customer ready (customer@homefix.test / customer123)");

    // Reset existing transactional data
    await db.delete(bookings);
    await db.delete(providers);
    await db.delete(categories);

    // Seed service categories
    const categoryData = [
        { name: "House Cleaning", nameCkb: "پاککردنەوەی ماڵ", icon: "home" },
        { name: "AC Repair", nameCkb: "چاککردنەوەی سپلیت", icon: "snow" },
        { name: "Plumbing", nameCkb: "بۆڕیچێتی و سەنتەری", icon: "water" },
        { name: "Electrical", nameCkb: "کارەباچێتی", icon: "flash" },
        { name: "Washing Machine", nameCkb: "چاککردنەوەی جلشۆر", icon: "refresh" },
        { name: "Refrigerator", nameCkb: "چاککردنەوەی سەلاجە", icon: "cube" },
        { name: "Kitchen Cabinet", nameCkb: "وەستای کەوەنتەر", icon: "hammer" },
        { name: "Painting & Decor", nameCkb: "بۆیاخکاری و دیکۆر", icon: "color-palette" },
    ];

    const insertedCategories = await db
        .insert(categories)
        .values(categoryData)
        .returning();

    console.log(`Inserted ${insertedCategories.length} categories`);

    const cleaning = insertedCategories.find((c) => c.name === "House Cleaning");
    const acRepair = insertedCategories.find((c) => c.name === "AC Repair");
    const plumbing = insertedCategories.find((c) => c.name === "Plumbing");
    const electrical = insertedCategories.find((c) => c.name === "Electrical");
    const washingMachine = insertedCategories.find((c) => c.name === "Washing Machine");
    const refrigerator = insertedCategories.find((c) => c.name === "Refrigerator");
    const cabinet = insertedCategories.find((c) => c.name === "Kitchen Cabinet");

    // Seed service providers across designated provinces
    const providerData = [];

    if (acRepair) {
        providerData.push(
            {
                name: "وەستا کاروان مەحموود",
                categoryId: acRepair.id,
                city: "Erbil",
                phone: "07509876543",
                hourlyRate: 30000,
            },
            {
                name: "وەستا دیار ئەحمەد",
                categoryId: acRepair.id,
                city: "Sulaymaniyah",
                phone: "07703344556",
                hourlyRate: 25000,
            },
            {
                name: "وەستا محەمەد ڕانیەیی",
                categoryId: acRepair.id,
                city: "Ranya",
                phone: "07504443322",
                hourlyRate: 25000,
            },
            {
                name: "وەستا شێرزاد دهۆکی",
                categoryId: acRepair.id,
                city: "Duhok",
                phone: "07506667788",
                hourlyRate: 28000,
            }
        );
    }

    if (cleaning) {
        providerData.push(
            {
                name: "تیمی پاکوخاوێنی خێرا",
                categoryId: cleaning.id,
                city: "Erbil",
                phone: "07505554433",
                hourlyRate: 15000,
            },
            {
                name: "سەنتەری پاکی و درەوشاوەیی",
                categoryId: cleaning.id,
                city: "Sulaymaniyah",
                phone: "07701122334",
                hourlyRate: 18000,
            },
            {
                name: "تیمی درەوشاوەی بیتوێن",
                categoryId: cleaning.id,
                city: "Ranya",
                phone: "07503332211",
                hourlyRate: 15000,
            },
            {
                name: "تیمی پاککردنەوەی بەهدینان",
                categoryId: cleaning.id,
                city: "Duhok",
                phone: "07508881122",
                hourlyRate: 17000,
            }
        );
    }

    if (plumbing) {
        providerData.push(
            {
                name: "ئەحمەد فەرهاد (بۆڕیچی)",
                categoryId: plumbing.id,
                city: "Erbil",
                phone: "07501234567",
                hourlyRate: 25000,
            },
            {
                name: "ڕەنجدەر عەلی (بۆڕیچی)",
                categoryId: plumbing.id,
                city: "Sulaymaniyah",
                phone: "07701234567",
                hourlyRate: 20000,
            },
            {
                name: "عومەر ڕانیەیی (بۆڕیچی)",
                categoryId: plumbing.id,
                city: "Ranya",
                phone: "07507771234",
                hourlyRate: 20000,
            },
            {
                name: "دڵشاد دهۆکی (بۆڕیچی)",
                categoryId: plumbing.id,
                city: "Duhok",
                phone: "07509998877",
                hourlyRate: 25000,
            }
        );
    }

    if (electrical) {
        providerData.push(
            {
                name: "سۆران کامەران (کارەباچی)",
                categoryId: electrical.id,
                city: "Sulaymaniyah",
                phone: "07709876543",
                hourlyRate: 25000,
            },
            {
                name: "بڕیار عەلی محەمەد",
                categoryId: electrical.id,
                city: "Duhok",
                phone: "07501746345",
                hourlyRate: 35000,
            },
            {
                name: "ڕێباز حوسێن (کارەباچی)",
                categoryId: electrical.id,
                city: "Ranya",
                phone: "07502223344",
                hourlyRate: 25000,
            },
            {
                name: "زانا سەعدی (کارەباچی)",
                categoryId: electrical.id,
                city: "Erbil",
                phone: "07503334455",
                hourlyRate: 30000,
            }
        );
    }

    if (washingMachine) {
        providerData.push(
            {
                name: "سەنتەری تەکنیکی جلشۆر",
                categoryId: washingMachine.id,
                city: "Erbil",
                phone: "07508889900",
                hourlyRate: 20000,
            },
            {
                name: "وەستا هێمن جلشۆرچی",
                categoryId: washingMachine.id,
                city: "Ranya",
                phone: "07506665544",
                hourlyRate: 20000,
            }
        );
    }

    if (refrigerator) {
        providerData.push(
            {
                name: "وەستا سەلاح سەلاجەچی",
                categoryId: refrigerator.id,
                city: "Erbil",
                phone: "07507776655",
                hourlyRate: 25000,
            },
            {
                name: "وەستا نەوزاد سەلاجەچی",
                categoryId: refrigerator.id,
                city: "Sulaymaniyah",
                phone: "07705556677",
                hourlyRate: 25000,
            }
        );
    }

    if (cabinet) {
        providerData.push(
            {
                name: "وەستا ئاراس کەوەنتەرچی",
                categoryId: cabinet.id,
                city: "Erbil",
                phone: "07504445566",
                hourlyRate: 25000,
            },
            {
                name: "وەستا کامەران مۆبیلیات و کەوەنتەر",
                categoryId: cabinet.id,
                city: "Sulaymaniyah",
                phone: "07702223344",
                hourlyRate: 25000,
            },
            {
                name: "وەستا سەربەست کەوەنتەر",
                categoryId: cabinet.id,
                city: "Ranya",
                phone: "07501112299",
                hourlyRate: 20000,
            },
            {
                name: "وەستا جوان دهۆکی (کەوەنتەر)",
                categoryId: cabinet.id,
                city: "Duhok",
                phone: "07508887766",
                hourlyRate: 25000,
            }
        );
    }

    let insertedProviders: any[] = [];
    if (providerData.length > 0) {
        insertedProviders = await db
            .insert(providers)
            .values(providerData)
            .returning();
        console.log(`Inserted ${insertedProviders.length} providers across Erbil, Sulaymaniyah, Ranya, Duhok`);
    }

    // Seed initial demo customer bookings
    if (insertedProviders.length > 0) {
        const customer = await db.query.users.findFirst({
            where: eq(users.email, "customer@homefix.test"),
        });

        if (customer) {
            const sampleBookings = [
                {
                    customerId: customer.id,
                    providerId: insertedProviders[0].id,
                    customerName: "کڕیاری تێست (ڕەوەند عەلی)",
                    phone: "07501234567",
                    address: "هەولێر",
                    scheduledAt: new Date(Date.now() + 86400000),
                    notes: "سپلیتەکە با ناکات و پێویستی بە پشکنینی گازە",
                    status: "pending" as const,
                },
                {
                    customerId: customer.id,
                    providerId: insertedProviders[1] ? insertedProviders[1].id : insertedProviders[0].id,
                    customerName: "سارا محەمەد",
                    phone: "07709876543",
                    address: "سلێمانی",
                    scheduledAt: new Date(Date.now() + 172800000),
                    notes: "پاککردنەوەی گشتی ماڵ پێش هاتنی میوان",
                    status: "confirmed" as const,
                },
                {
                    customerId: customer.id,
                    providerId: insertedProviders[2] ? insertedProviders[2].id : insertedProviders[0].id,
                    customerName: "کاروان فەرهاد",
                    phone: "07505554433",
                    address: "ڕانیە",
                    scheduledAt: new Date(Date.now() - 3600000),
                    notes: "بۆڕی مەتبەخ تەقیوە و پێویستی بە چارەسەری خێرایە",
                    status: "in_progress" as const,
                },
                {
                    customerId: customer.id,
                    providerId: insertedProviders[3] ? insertedProviders[3].id : insertedProviders[0].id,
                    customerName: "ئارام عوسمان",
                    phone: "07507778899",
                    address: "دهۆک",
                    scheduledAt: new Date(Date.now() - 86400000),
                    notes: "بە سەرکەوتوویی تەواو بوو و دەستخۆشی لێکرا",
                    status: "completed" as const,
                },
                {
                    customerId: customer.id,
                    providerId: insertedProviders[2] ? insertedProviders[2].id : insertedProviders[0].id,
                    customerName: "هەڵمەت عەزیز",
                    phone: "07701112233",
                    address: "ڕانیە",
                    scheduledAt: new Date(Date.now() + 259200000),
                    notes: "لەبەر گەشتکردن هەڵوەشێندرایەوە",
                    status: "cancelled" as const,
                },
            ];

            await db.insert(bookings).values(sampleBookings);
            console.log(`Inserted ${sampleBookings.length} sample bookings with clean province locations`);
        }
    }

    console.log("Clean seed completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});