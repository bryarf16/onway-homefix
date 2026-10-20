import { db } from "./index";
import { users, categories, providers, bookings } from "./schema";
const bcrypt = require("bcryptjs");

async function seed() {
    console.log("Starting clean seed...");

    // 1. دروستکردنی ئەکاونتی ئەدمین
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

    // 1.1 دروستکردنی ئەکاونتی کڕیاری تێست (Demo Customer)
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

    // پاککردنەوەی داتای کۆن بۆ ئەوەی داتای دووبارە نەمێنێت
    await db.delete(bookings);
    await db.delete(providers);
    await db.delete(categories);

    // 2. دروستکردنی بەشەکان بەپێی دیزاینە پێشکەوتووەکە
    const categoryData = [
        { name: "House Cleaning", nameCkb: "پاککردنەوەی ماڵ", icon: "home" },
        { name: "AC Repair", nameCkb: "چاککردنەوەی سپلیت", icon: "snow" },
        { name: "Plumbing", nameCkb: "بۆڕیچێتی و سەنتەری", icon: "water" },
        { name: "Electrical", nameCkb: "کارەباچێتی", icon: "flash" },
        { name: "Washing Machine", nameCkb: "چاککردنەوەی جلشۆر", icon: "refresh" },
        { name: "Refrigerator", nameCkb: "چاککردنەوەی سەلاجە", icon: "cube" },
        { name: "Microwave Oven", nameCkb: "مایکرۆوەیڤ و فڕن", icon: "flame" },
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

    // 3. دروستکردنی وەستاکان بەپێی بەش و شارەکان
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
            }
        );
    }

    if (washingMachine) {
        providerData.push({
            name: "سەنتەری تەکنیکی جلشۆر",
            categoryId: washingMachine.id,
            city: "Erbil",
            phone: "07508889900",
            hourlyRate: 20000,
        });
    }

    if (refrigerator) {
        providerData.push({
            name: "وەستا هێمن سەلاجەچی",
            categoryId: refrigerator.id,
            city: "Erbil",
            phone: "07507776655",
            hourlyRate: 25000,
        });
    }

    if (providerData.length > 0) {
        const insertedProviders = await db
            .insert(providers)
            .values(providerData)
            .returning();
        console.log(`Inserted ${insertedProviders.length} providers`);
    }

    console.log("Clean seed completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});