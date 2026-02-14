import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sunfyre',
  },
  
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
  },
  
  session: {
    secret: process.env.SESSION_SECRET || 'sunfyre-secret-key-change-in-production',
  },
  
  jwt: {
    secret: (process.env.JWT_SECRET || 'jwt-secret-change-in-production') as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
  
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },
};
