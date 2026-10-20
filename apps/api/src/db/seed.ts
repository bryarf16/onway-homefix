import { db } from "./index";
import { users, categories, providers } from "./schema";
const bcrypt = require("bcryptjs");
async function seed() {
    console.log("Starting seed...");

    // 1. دروستکردنی ئەکاونتی ئەدمین
    const adminPassword = await bcrypt.hash("admin123", 10);
    const [adminUser] = await db
        .insert(users)
        .values({
            name: "Admin User",
            email: "admin@homefix.test",
            passwordHash: adminPassword,
            role: "admin",
        })
        .onConflictDoNothing()
        .returning();

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
        .onConflictDoNothing()
        .returning();

    console.log("Demo customer ready (customer@homefix.test / customer123)");

    // 2. دروستکردنی بەشەکان (Categories)
    const categoryData = [
        { name: "Plumbing", nameCkb: "بۆڕیچێتی" },
        { name: "Electrical", nameCkb: "کارەباچێتی" },
        { name: "Cleaning", nameCkb: "پاککردنەوە" },
        { name: "HVAC & AC", nameCkb: "سپلیت و تەبریدی" },
    ];

    const insertedCategories = await db
        .insert(categories)
        .values(categoryData)
        .onConflictDoNothing()
        .returning();

    console.log(`Inserted ${insertedCategories.length} categories`);

    // ئەگەر بەشەکان پێشتر هەبوون، لە داتابەیس دەیانهێنینەوە بۆ پەیوەستکردنی وەستاکان
    const allCategories = await db.select().from(categories);

    const plumbing = allCategories.find((c) => c.name === "Plumbing");
    const electrical = allCategories.find((c) => c.name === "Electrical");
    const cleaning = allCategories.find((c) => c.name === "Cleaning");

    // 3. دروستکردنی وەستاکان (Providers)
    const providerData = [];

    if (plumbing) {
        providerData.push(
            {
                name: "ئەحمەد فەرهاد",
                categoryId: plumbing.id,
                city: "Erbil",
                phone: "07501234567",
                hourlyRate: 25000,
            },
            {
                name: "ڕەنجدەر عەلی",
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
                name: "کاروان مەحموود",
                categoryId: electrical.id,
                city: "Erbil",
                phone: "07509876543",
                hourlyRate: 30000,
            },
            {
                name: "سۆران کامەران",
                categoryId: electrical.id,
                city: "Sulaymaniyah",
                phone: "07709876543",
                hourlyRate: 25000,
            }
        );
    }

    if (cleaning) {
        providerData.push({
            name: "تیمی پاکوخاوێنی خێرا",
            categoryId: cleaning.id,
            city: "Erbil",
            phone: "07505554433",
            hourlyRate: 15000,
        });
    }

    if (providerData.length > 0) {
        const insertedProviders = await db
            .insert(providers)
            .values(providerData)
            .returning();
        console.log(`Inserted ${insertedProviders.length} providers`);
    }

    console.log("Seed completed successfully!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});