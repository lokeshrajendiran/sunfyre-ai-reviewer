import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import { config } from './config';
import { connectDB } from './config/database';
import { errorHandler } from './middleware';
import routes from './routes';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.client.url,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sunfyre API',
    version: '1.0.0',
    description: 'AI-Powered Pull Request Reviewer',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Sunfyre server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.env}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
