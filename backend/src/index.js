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


const allowedOrigins = [
  config.FRONTEND_URL,
  config.ADMIN_URL,
  config.RESEARCH_URL,
  config.FOUNDATION_URL,
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

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

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
app.use('/character', characterRoutes);
app.use('/payment', paymentRoutes);
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
