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
    
    // Navigation & Tabs
    home: "Services",
    myBookings: "My Bookings",
    profile: "Profile",
    
    // Home / Categories
    categoriesTitle: "What service do you need?",
    categoriesSubtitle: "Select a category to view verified providers",
    noCategories: "No service categories available right now.",
    
    // Providers
    providersTitle: "Available Providers",
    noProviders: "No providers found for this service yet.",
    hourlyRate: "Hourly Rate",
    iqd: "IQD",
    bookNow: "Book Service",
    callProvider: "Call",
    city: "City",
    
    // Booking Form
    createBookingTitle: "Book Provider",
    bookingFor: "Booking for",
    customerName: "Your Name",
    phone: "Phone Number",
    address: "Home Address",
    scheduledAt: "Scheduled Date & Time",
    notes: "Notes / Description of Problem",
    notesPlaceholder: "e.g. Water leak under the kitchen sink...",
    confirmBooking: "Confirm Booking",
    submittingBooking: "Submitting...",
    bookingSuccess: "Your booking request has been submitted successfully!",
    
    // My Bookings
    bookingsTitle: "My Bookings",
    noBookings: "You have no bookings yet.",
    bookFirstService: "Explore services and book your first provider!",
    status: "Status",
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    
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
    
    // Navigation & Tabs
    home: "خزمەتگوزارییەکان",
    myBookings: "داواکارییەکانم",
    profile: "پڕۆفایل",
    
    // Home / Categories
    categoriesTitle: "پێویستت بە چ خزمەتگوزارییەکە؟",
    categoriesSubtitle: "بەشێک هەڵبژێرە بۆ بینینی وەستا باوەڕپێکراوەکان",
    noCategories: "لە ئێستادا هیچ خزمەتگوزارییەک بەردەست نییە.",
    
    // Providers
    providersTitle: "وەستا بەردەستەکان",
    noProviders: "هیچ وەستایەک بۆ ئەم بەشە نەدۆزرایەوە.",
    hourlyRate: "نرخی کاتژمێری",
    iqd: "د.ع",
    bookNow: "حجزکردنی وەستا",
    callProvider: "پەیوەندی",
    city: "شار",
    
    // Booking Form
    createBookingTitle: "داواکردنی وەستا",
    bookingFor: "حجزکردن بۆ",
    customerName: "ناوی داواکار",
    phone: "ژمارەی مۆبایل",
    address: "ناونیشانی ماڵ",
    scheduledAt: "کات و بەرواری دیاریکراو",
    notes: "تێبینی یان کێشەی کارەکە",
    notesPlaceholder: "بۆ نموونە: دزەکردنی ئاو لە ژێر سینکی چێشتخانە...",
    confirmBooking: "ناردنی داواکاری",
    submittingBooking: "ناردنی داواکاری...",
    bookingSuccess: "داواکارییەکەت بە سەرکەوتوویی تۆمارکرا!",
    
    // My Bookings
    bookingsTitle: "داواکارییەکانم",
    noBookings: "هیچ داواکارییەکت نەکردووە تا ئێستا.",
    bookFirstService: "سەیری بەشەکان بکە و یەکەم وەستات داوا بکە!",
    status: "دۆخ",
    pending: "چاوەڕوانکراو",
    confirmed: "پەسەندکراو",
    in_progress: "لە جێبەجێکردندا",
    completed: "تەواوکراو",
    cancelled: "هەڵوەشاوە",
    
    // General
    loading: "کەمێک چاوەڕوانبە...",
    error: "هەڵەیەک ڕوویدا",
    retry: "دووبارە هەوڵبدەرەوە",
    switchLanguage: "English",
  },
};
