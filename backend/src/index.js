import express from "express";
import bodyParser from "body-parser";
import dns from "dns";

// Fix for Node.js v18+ on Windows: SRV DNS queries fail with local resolver
// Must be set before any mongoose/mongodb connection attempts
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
import config from "./config/server-config.js"
import connect from "./config/database-config.js"
import userroutes from "./routes/user-routes.js";
import cors from "cors";
import blogroutes from './routes/blog-routes.js';
import faqRoutes from './routes/faqRoutes.js';
import multer from 'multer';
import adminroutes from './routes/admin-routes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import CareerRoutes from './routes/career-routes.js';
import jobApplicationRoutes from './routes/jobApplication-routes.js';
import supportRoutes from './routes/support-routes.js';
import comicRoutes from './routes/comic-routes.js';
import characterRoutes from './routes/character-routes.js';
import researchPaperRoutes from './routes/research-paper-routes.js';
import aboutTimelineRoutes from './routes/aboutTimelineRoutes.js';
import paymentRoutes from './routes/payment-routes.js'
import comicChapRoutes from './routes/comicChap-routes.js'
import researchApplicationRoutes from './routes/researchApplication-routes.js'
import contactQueryRoutes from './routes/contactQuery-routes.js'
import gameRoutes from './routes/game-routes.js';
import artistRoutes from './routes/artist-routes.js';
import newsletterRoutes from './routes/newsletter-routes.js';
import searchRoutes from './routes/search-routes.js';
import readingProgressRoutes from './routes/readingProgress-routes.js';
import wishlistRoutes from './routes/wishlist-routes.js';
import employeeRoutes from './routes/employee-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import auditLogRoutes from './routes/auditLog-routes.js';
import attendanceRoutes from './routes/attendance-routes.js';
import leaveRoutes from './routes/leave-routes.js';
import calendarEventRoutes from './routes/calendarEvent-routes.js';
import taskRoutes from './routes/task-routes.js';
import workAssignmentRoutes from './routes/workAssignment-routes.js';
import projectRoutes from './routes/project-routes.js';
import performanceRoutes from './routes/performance-routes.js';
import goalRoutes from './routes/goal-routes.js';
import recognitionRoutes from './routes/recognition-routes.js';
import salaryRoutes from './routes/salary-routes.js';
import payrollRoutes from './routes/payroll-routes.js';
import onboardingRoutes from './routes/onboarding-routes.js';
import hrDocumentRoutes from './routes/hrDocument-routes.js';
import recruitmentPipelineRoutes from './routes/recruitmentPipeline-routes.js';
import chatRoutes from './routes/chat-routes.js';
import wikiRoutes from './routes/wiki-routes.js';
import selfServiceRoutes from './routes/selfService-routes.js';
import aiRoutes from './routes/ai-routes.js';
import productRoutes from './routes/product-routes.js';
import categoryRoutes from './routes/category-routes.js';
import inventoryRoutes from './routes/inventory-routes.js';


const explicitOrigins = [
  config.FRONTEND_URL,
  config.ADMIN_URL,
  config.RESEARCH_URL,
  config.FOUNDATION_URL,
  config.SHOP_URL,
  // Local development origins
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
].filter(Boolean);

// Any *.infinitohq.com subdomain is trusted, so we don't have to keep
// hard-coding shop / store / research / foundation URLs into the config.
const infinitoDomainPattern = /^https:\/\/([a-z0-9-]+\.)?infinitohq\.com$/i;

app.use(cors({
  origin: (origin, cb) => {
    // Non-browser requests (curl, server-to-server, health checks) have no Origin — allow.
    if (!origin) return cb(null, true);
    if (explicitOrigins.includes(origin)) return cb(null, true);
    if (infinitoDomainPattern.test(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// Serve static files for uploaded shop images.
// setHeaders ensures SVGs go out with the correct MIME type — some hosts
// default to application/octet-stream which browsers refuse to render inline.
app.use('/uploads/shop', express.static('uploads/shop', {
  setHeaders: (res, filePath) => {
    if (filePath.toLowerCase().endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    // Allow the shop / admin sites to read these images cross-origin.
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Cache uploaded images for an hour — they're immutable once uploaded.
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));

// API Routes
app.use('/api', userroutes);
app.use('/blog', blogroutes);
app.use('/research-papers', researchPaperRoutes);
app.use('/faq', faqRoutes);
app.use('/admin', adminroutes);
app.use('/timeline', timelineRoutes);
app.use('/timeline/aboutUs', aboutTimelineRoutes);
app.use('/career', CareerRoutes);
app.use('/career', jobApplicationRoutes);
app.use('/support', supportRoutes);
app.use('/comic', comicRoutes);
app.use('/comicChap', comicChapRoutes);
app.use('/research-application', researchApplicationRoutes);
app.use('/contact-query', contactQueryRoutes);
app.use('/character',    characterRoutes);
app.use('/payment',      paymentRoutes);
app.use('/games',        gameRoutes);
app.use('/artists',      artistRoutes);
app.use('/newsletter',   newsletterRoutes);
app.use('/search',       searchRoutes);
app.use('/reading-progress', readingProgressRoutes);
app.use('/wishlist',     wishlistRoutes);
app.use('/hr/employees',      employeeRoutes);
app.use('/hr/notifications',  notificationRoutes);
app.use('/hr/audit',          auditLogRoutes);
app.use('/hr/attendance',     attendanceRoutes);
app.use('/hr/leaves',         leaveRoutes);
app.use('/hr/calendar',       calendarEventRoutes);
app.use('/hr/tasks',          taskRoutes);
app.use('/hr/assignments',    workAssignmentRoutes);
app.use('/hr/projects',       projectRoutes);
app.use('/hr/performance',    performanceRoutes);
app.use('/hr/goals',          goalRoutes);
app.use('/hr/recognition',    recognitionRoutes);
app.use('/hr/salary',         salaryRoutes);
app.use('/hr/payroll',        payrollRoutes);
app.use('/hr/onboarding',     onboardingRoutes);
app.use('/hr/documents',      hrDocumentRoutes);
app.use('/hr/recruitment',    recruitmentPipelineRoutes);
app.use('/hr/chat',           chatRoutes);
app.use('/hr/wiki',           wikiRoutes);
app.use('/hr/self-service',   selfServiceRoutes);
app.use('/hr/ai',             aiRoutes);

// Shop routes
app.use('/shop/products',     productRoutes);
app.use('/shop/categories',   categoryRoutes);
app.use('/shop/inventory',    inventoryRoutes);

app.get('/', (req, res) => {
  res.send('Backend is up and running!');
});

const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

const setupandstartserver = async () => {
    app.listen(config.PORT, async () => {
        console.log(`Server started at ${config.PORT}`);
        await connect();
        console.log("mongodb connected");
    })
}

setupandstartserver();
