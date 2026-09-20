import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import sourceRoutes from './routes/source.routes.js';
import transformationRoutes from './routes/transformation.routes.js';
import outputRoutes from './routes/output.routes.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 50 : 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 100 : 20,
  message: {
    success: false,
    message: 'Generation quota reached for the hour. Please try again later.',
    errorCode: 'GENERATION_LIMIT_EXCEEDED',
  },
});

// Parsers
app.use(express.json({ limit: `${env.MAX_FILE_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${env.MAX_FILE_SIZE_MB}mb` }));
app.use(cookieParser());

// Apply General Rate Limiter to all API routes
app.use('/api/v1', generalLimiter);

// Health check & Base API endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ContentForge AI Backend API is operational',
    version: '1.0.0',
    documentation: '/api/v1',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ContentForge AI API v1',
    endpoints: {
      auth: '/api/v1/auth',
      sources: '/api/v1/sources',
      transformations: '/api/v1/transformations',
      outputs: '/api/v1/outputs',
    },
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/sources', sourceRoutes);
app.use('/api/v1/transformations', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return generationLimiter(req, res, next);
  }
  next();
}, transformationRoutes);
app.use('/api/v1/outputs', outputRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
