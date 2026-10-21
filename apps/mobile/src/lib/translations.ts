export type Language = "en" | "ckb";

export const translations = {
  en: {
    dir: "ltr",
    appName: "HomeFix",
    tagline: "Reliable Home Services at Your Doorstep",
    
    // Auth
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to book plumbers, electricians & more",
    registerTitle: "Create Account",
    registerSubtitle: "Join HomeFix to book trusted professionals",
    name: "Full Name",
    email: "Email address",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    signUp: "Sign Up",
    signingUp: "Creating account...",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    demoCustomerBtn: "Fill Demo Customer",
    invalidCredentials: "Invalid email or password",
    loginFailed: "Failed to sign in. Please try again.",
    registerFailed: "Failed to create account. Email may already exist.",
    logout: "Logout",
    
    // Navigation & Bottom Tabs
    home: "Home",
    bookings: "Bookings",
    myBookings: "My Bookings",
    support: "Support",
    account: "Account",
    profile: "Profile",
    
    // Top Bar & Search
    deliverTo: "Delivering to",
    currentCity: "Erbil, Kurdistan",
    searchPlaceholder: "Search for service, plumber, cleaner...",
    
    // Promo Banner
    bannerTitle: "AC or Plumbing Issues?",
    bannerSubtitle: "We will fix it fast • Expert technicians at your door",
    scheduleService: "Schedule Service",
    fastService: "Instant Booking",
    
    // Sections
    popularServices: "Popular Services",
    recommendedForYou: "Top Recommended Providers",
    seeAll: "See all",
    bestseller: "Top Rated",
    verifiedPro: "Verified Professional",
    hourlyRate: "Hourly Rate",
    iqd: "IQD",
    perHour: "/ hr",
    bookNow: "Book Now",
    callProvider: "Call",
    
    // Trust Badges
    badgeVerified: "Verified Pros",
    badgePricing: "Transparent Pricing",
    badgeWarranty: "Satisfaction Guarantee",
    badgeSupport: "Direct Support",
    
    // Home / Categories
    categoriesTitle: "What service do you need?",
    categoriesSubtitle: "Select a category to view verified providers",
    noCategories: "No service categories available right now.",
    
    // Providers
    providersTitle: "Available Providers",
    noProviders: "No providers found for this service yet.",
    city: "City",
    allCities: "All Cities",
    filterByCity: "Filter by city",
    
    // Booking Form
    createBookingTitle: "Book Provider",
    bookingFor: "Booking for",
    customerName: "Your Name",
    phone: "Phone Number",
    address: "Home Address",
    scheduledAt: "Scheduled Date & Time",
    notes: "Notes / Description of Problem",
    notesPlaceholder: "e.g. Water leak under kitchen sink, needs urgent repair...",
    confirmBooking: "Confirm Booking",
    submittingBooking: "Submitting Booking...",
    bookingSuccess: "Your booking request has been submitted successfully!",
    viewMyBookings: "View in My Bookings",
    backToHome: "Back to Home",
    
    // My Bookings
    bookingsSubtitle: "Track live status of your home service requests",
    noBookings: "You have no bookings yet.",
    bookFirstService: "Explore services and book your first provider!",
    status: "Status",
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    scheduledFor: "Scheduled for",
    addressLabel: "Address",
    
    // General
    loading: "Loading...",
    error: "An error occurred",
    retry: "Try Again",
    switchLanguage: "کوردی",
  },
  ckb: {
    dir: "rtl",
    appName: "هۆمفیکس",
    tagline: "خزمەتگوزارییە متمانەپێکراوەکانی ناوماڵ لە دەستتایە",
    
    // Auth
    loginTitle: "بەخێربێیتەوە",
    loginSubtitle: "بچۆ ژوورەوە بۆ داواکردنی بۆڕیچی، کارەباچی و زیاتر",
    registerTitle: "دروستکردنی هەژمار",
    registerSubtitle: "ببە بە ئەندام بۆ دۆزینەوەی باشترین وەستاکان",
    name: "ناوی تەواو",
    email: "ئیمەیڵ",
    password: "تێپەڕەوشە (پاسۆرد)",
    signIn: "چوونەژوورەوە",
    signingIn: "چوونەژوورەوە...",
    signUp: "خۆتۆمارکردن",
    signingUp: "دروستکردنی هەژمار...",
    dontHaveAccount: "هەژمارت نییە؟",
    alreadyHaveAccount: "پێشتر هەژمارت دروستکردووە؟",
    demoCustomerBtn: "کڕیاری تێست (خێرا)",
    invalidCredentials: "ئیمەیڵ یان تێپەڕەوشە هەڵەیە!",
    loginFailed: "چوونەژوورەوە سەرکەوتوو نەبوو. تکایە دووبارە هەوڵبدەرەوە.",
    registerFailed: "خۆتۆمارکردن سەرکەوتوو نەبوو. رەنگە ئیمەیڵەکە بەکارهاتبێت.",
    logout: "دەرچوون",
    
    // Navigation & Bottom Tabs
    home: "سەرەکی",
    bookings: "حجزەکانم",
    myBookings: "داواکارییەکانم",
    support: "پشتیوانی",
    account: "پڕۆفایل",
    profile: "پڕۆفایل",
    
    // Top Bar & Search
    deliverTo: "شوێنی خزمەتگوزاری",
    currentCity: "هەولێر، کوردستان",
    searchPlaceholder: "...گەڕان بۆ خزمەتگوزاری، بۆڕیچی، سپلیت",
    
    // Promo Banner
    bannerTitle: "سپلیت یان بۆڕییەکانت تێکچووە؟",
    bannerSubtitle: "بە پەلە و بە گەرەنتی بۆت چاک دەکەینەوە • وەستای شارەزا",
    scheduleService: "دیاریکردنی کات",
    fastService: "داواکاری خێرا",
    
    // Sections
    popularServices: "خزمەتگوزارییە باوەکان",
    recommendedForYou: "باشترین وەستا پێشنیازکراوەکان",
    seeAll: "هەمووی ببینە",
    bestseller: "باوەڕپێکراو",
    verifiedPro: "وەستای پەسەندکراو",
    hourlyRate: "نرخی کاتژمێری",
    iqd: "د.ع",
    perHour: "/ کاتژمێر",
    bookNow: "حجزکردن",
    callProvider: "پەیوەندی",
    
    // Trust Badges
    badgeVerified: "وەستای باوەڕپێکراو",
    badgePricing: "نرخی ڕوون و ئاشکرا",
    badgeWarranty: "گەرەنتی جۆری کار",
    badgeSupport: "پشتیوانی بەردەوام",
    
    // Home / Categories
    categoriesTitle: "پێویستت بە چ خزمەتگوزارییەکە؟",
    categoriesSubtitle: "بەشێک هەڵبژێرە بۆ بینینی وەستا باوەڕپێکراوەکان",
    noCategories: "لە ئێستادا هیچ خزمەتگوزارییەک بەردەست نییە.",
    
    // Providers
    providersTitle: "وەستا بەردەستەکان",
    noProviders: "هیچ وەستایەک بۆ ئەم بەشە نەدۆزرایەوە.",
    city: "شار",
    allCities: "هەموو شارەکان",
    filterByCity: "فلتەر بەپێی شار",
    
    // Booking Form
    createBookingTitle: "داواکردنی وەستا",
    bookingFor: "حجزکردن بۆ",
    customerName: "ناوی داواکار",
    phone: "ژمارەی مۆبایل",
    address: "ناونیشانی ماڵ",
    scheduledAt: "کات و بەرواری دیاریکراو",
    notes: "تێبینی یان کێشەی کارەکە",
    notesPlaceholder: "بۆ نموونە: دزەکردنی ئاو لە ژێر سینکی چێشتخانە، پێویستی بە چاککردنی خێرایە...",
    confirmBooking: "ناردنی داواکاری",
    submittingBooking: "ناردنی داواکاری...",
    bookingSuccess: "داواکارییەکەت بە سەرکەوتوویی تۆمارکرا!",
    viewMyBookings: "بینین لە لیستی حجزەکانم",
    backToHome: "گەڕانەوە بۆ سەرەکی",
    
    // My Bookings
    bookingsSubtitle: "چاودێری دۆخی ڕاستەوخۆی حجزەکانت بکە",
    noBookings: "هیچ داواکارییەکت نەکردووە تا ئێستا.",
    bookFirstService: "سەیری بەشەکان بکە و یەکەم وەستات داوا بکە!",
    status: "دۆخ",
    pending: "چاوەڕوانکراو",
    confirmed: "پەسەندکراو",
    in_progress: "لە جێبەجێکردندا",
    completed: "تەواوکراو",
    cancelled: "هەڵوەشاوە",
    scheduledFor: "کاتی دیاریکراو",
    addressLabel: "ناونیشان",
    
    // General
    loading: "کەمێک چاوەڕوانبە...",
    error: "هەڵەیەک ڕوویدا",
    retry: "دووبارە هەوڵبدەرەوە",
    switchLanguage: "English",
  },
};
