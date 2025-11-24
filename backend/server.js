const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

// Initialize Firebase Admin SDK
try {
    const serviceAccount = require("./serviceAccountKey.json");
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://parkqueue-216c7.firebaseio.com"
    });
    
    console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    process.exit(1);
}

// Email transporter setup
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kenightgallaza@gmail.com',
            pass: 'rnbq ytju tjoc apnv'
        },
        pool: true,
        maxConnections: 1,
        maxMessages: 5
    });
};

let transporter = createTransporter();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED: SIMPLIFIED CORS - Remove conflicting headers
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// ✅ FIXED: Remove the custom CSP middleware that's causing MIME type issues
// app.use((req, res, next) => {
//     res.setHeader(...) // ← THIS IS CAUSING THE MIME TYPE PROBLEMS
// });

// ✅ FIXED: PROPER STATIC FILE SERVING
// Serve ALL static files from frontend directory with proper MIME types
app.use(express.static(path.join(__dirname, "../frontend"), {
    // Let Express automatically detect MIME types
    setHeaders: (res, path) => {
        // You can optionally set specific headers if needed
        // But let Express handle MIME types automatically
    }
}));

// ✅ FIXED: HTML ROUTES - Keep these for navigation
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Login&Register.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/Dashboard/dashboard.html"));
});

app.get("/verification", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/verification.html"));
});

app.get("/user-verification", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/userVerification/user-verification.html"));
});

// ✅ REMOVE THESE - They're causing conflicts with static serving:
// app.get("/firebase.js", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/firebase.js"));
// });
//
// app.get("/userVerification/user-verification.js", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/userVerification/user-verification.js"));
// });
//
// app.get("/userVerification/user-verification.css", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/userVerification/user-verification.css"));
// });

// Keep your API routes
app.post("/send-verification-email", async (req, res) => {
    // Your existing email code...
});

app.get("/test-email", async (req, res) => {
    // Your existing test email code...
});

app.get("/test-firebase", async (req, res) => {
    // Your existing Firebase test code...
});

app.get("/health", (req, res) => {
    res.json({
        status: "Server is running",
        firebase: "Admin SDK initialized",
        email: "Transporter configured",
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 Serving files from: ${path.join(__dirname, "../frontend")}`);
    console.log(`\n📧 Available Endpoints:`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Firebase test: http://localhost:${PORT}/test-firebase`);
    console.log(`✅ Email test: http://localhost:${PORT}/test-email`);
    console.log(`✅ Main app: http://localhost:${PORT}/`);
    console.log(`✅ Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`✅ Email Verification: http://localhost:${PORT}/verification`);
    console.log(`✅ User Verification: http://localhost:${PORT}/user-verification`);
});