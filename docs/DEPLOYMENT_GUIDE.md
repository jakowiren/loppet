# Loppet Project Deployment Guide - Complete Production Setup

## Project Overview
- **Frontend**: React/Vite with TypeScript, shadcn/ui components, Swedish marketplace UI
- **Backend**: Node.js/Express with Prisma ORM, marketplace APIs
- **Database**: PostgreSQL (via Supabase) with Swedish sports equipment schema
- **Authentication**: Google OAuth for Swedish users
- **Domain**: Custom domain via Oderland
- **Current Status**: Updated with marketplace schema, ready for production deployment

## Prerequisites & Account Setup

### Required Accounts
Before starting deployment, create accounts and gather access:

1. **Vercel Account** ([vercel.com](https://vercel.com))
   - Sign up with GitHub for easier integration
   - Verify email and enable 2FA for security

2. **Railway Account** ([railway.app](https://railway.app))
   - Sign up with GitHub
   - Add payment method (Railway requires it for deployments)
   - Get $5 free credit for testing

3. **Supabase Account** ([supabase.com](https://supabase.com))
   - Sign up with GitHub
   - Each project includes free tier: 500MB DB, 2GB bandwidth

4. **Oderland Domain Access**
   - Ensure you have admin access to DNS management
   - Know your domain name (e.g., `loppet.se`)

5. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com))
   - Create new project or use existing
   - Enable Google+ API and OAuth 2.0

### Development Environment Check
Ensure you have these tools installed locally:
```bash
# Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Git for repository management
git --version

# Optional: Prisma CLI for database management
npm install -g prisma
```

---

## Step 1: Setting Up Supabase Database (Updated for Marketplace)

### 1.1 Create Supabase Project
1. **Go to [supabase.com](https://supabase.com)** and click "New Project"
2. **Select Organization** (create one if needed)
3. **Project Configuration:**
   - **Project Name**: `loppet-production`
   - **Database Password**: Generate strong password (save it securely!)
   - **Region**: `Europe North (eu-north-1)` for Swedish users
   - **Pricing Plan**: Start with Free tier

4. **Wait for Setup** (takes 2-3 minutes)
5. **Save Project Details:**
   - Project URL: `https://[your-project-id].supabase.co`
   - Database Password (you'll need this)

### 1.2 Configure Database Schema for Marketplace

**IMPORTANT**: The database schema has been updated to support the Swedish sports equipment marketplace. Use Prisma migrations instead of manual SQL.

#### Option A: Using Prisma Migrate (Recommended)
1. **Update your local .env file:**
   ```bash
   DATABASE_URL="postgresql://postgres:[your-password]@db.[your-project-id].supabase.co:5432/postgres"
   ```

2. **Run Prisma migrations locally first (test):**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Deploy to production:**
   ```bash
   npx prisma migrate deploy
   ```

#### Option B: Manual SQL Setup (Alternative)
If you prefer manual setup, run these commands in Supabase SQL Editor:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for marketplace
CREATE TYPE ad_status AS ENUM ('ACTIVE', 'SOLD', 'PAUSED');
CREATE TYPE ad_condition AS ENUM ('Nytt', 'Som nytt', 'Mycket bra', 'Bra', 'Acceptabelt');
CREATE TYPE ad_category AS ENUM ('Cyklar', 'Kläder', 'Skor', 'Tillbehör', 'Klockor', 'Hjälmar', 'Vätskor & Nutrition', 'Annat');
CREATE TYPE race_type AS ENUM ('Triathlon', 'Vasaloppet', 'Vätternrundan', 'Ironman', 'Cykelrace', 'Löpning', 'Simning', 'Multisport');
CREATE TYPE activity_type AS ENUM ('AD_CREATED', 'AD_SOLD', 'AD_FAVORITED', 'MESSAGE_RECEIVED', 'AD_VIEWED');
CREATE TYPE conversation_status AS ENUM ('ACTIVE', 'CLOSED');

-- Then run the complete schema from database-schema.md
```

### 1.3 Insert Sample Data for Swedish Races
```sql
-- Insert Swedish racing events
INSERT INTO races (name, description, date, location, participants_count, color) VALUES
('Vasaloppet 2025', 'Sveriges största längdskidåkning', '2025-03-02', 'Sälen - Mora', '15,800', '#8B5CF6'),
('Vätternrundan 2025', 'Sveriges största cykellopp', '2025-06-14', 'Motala', '22,000', '#10B981'),
('Ironman Kalmar 2025', 'Triathlon i världsklass', '2025-08-23', 'Kalmar', '2,200', '#F59E0B'),
('Stockholm Marathon 2025', 'Löpning genom Sveriges huvudstad', '2025-06-07', 'Stockholm', '18,000', '#EF4444'),
('Midnattsloppet 2025', 'Stockholms populäraste löpning', '2025-08-16', 'Stockholm', '25,000', '#6366F1');
```

### 1.4 Get Database Connection Details
From Supabase Dashboard:

1. **Go to Settings → Database**
2. **Copy Connection String**: 
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```
3. **Go to Settings → API**
4. **Copy these values:**
   - **Project URL**: `https://[PROJECT-ID].supabase.co`
   - **Anon key**: `eyJ...` (for frontend)
   - **Service role key**: `eyJ...` (for backend admin)

### 1.5 Configure Row Level Security (RLS)
RLS policies are included in the schema, but verify they're enabled:
```sql
-- Check RLS is enabled on key tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'ads', 'favorites', 'conversations', 'messages');
```

---

## Step 2: Deploy Backend to Railway (Updated for Marketplace)

### 2.1 Pre-deployment Backend Checklist

#### A. Verify Package.json Configuration
Your current `package.json` should have these scripts (already configured):
```json
{
  "name": "loppet-backend",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

#### B. Create Production-Ready Build Configuration
1. **Create `railway.json` in backend directory:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm run build && npx prisma migrate deploy && npx prisma generate && npm start",
       "healthcheckPath": "/health",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Create `.railwayignore` file:**
   ```
   node_modules
   .env
   .env.local
   dist
   *.log
   .DS_Store
   ```

#### C. Add Health Check Endpoint
Ensure your Express app has a health check (add to `src/index.ts` if missing):
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected' // Add database ping if needed
  });
});
```

#### D. Update CORS Configuration for Production
Update your CORS settings in `src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, `https://www.${process.env.FRONTEND_URL?.replace('https://', '')}`]
    : ['http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2.2 Deploy to Railway

#### A. Initial Setup
1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** and authorize Railway access

#### B. Configure Service
1. **Service Settings:**
   - **Service Name**: `loppet-backend`
   - **Root Directory**: `/backend` (important!)
   - **Build Command**: Automatically detected from package.json
   - **Start Command**: Automatically detected

2. **Advanced Settings:**
   - **Runtime**: Node.js (auto-detected)
   - **Build Provider**: Nixpacks
   - **Region**: `us-west1` or closest to your users

#### C. Monitor Deployment
1. **Check Build Logs** in Railway dashboard
2. **Verify successful deployment** (should show "Deployed" status)
3. **Test health endpoint**: `https://[your-service-url].railway.app/health`

### 2.3 Configure Environment Variables in Railway

**CRITICAL**: Set these environment variables in Railway dashboard (Variables tab):

#### Production Environment Variables:
```bash
# Database Connection (from Supabase)
DATABASE_URL=postgresql://postgres:[your-supabase-password]@db.[your-project-id].supabase.co:5432/postgres

# JWT Security
JWT_SECRET=super-secure-64-character-random-string-for-production-use

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL (will be updated after Vercel deployment)
FRONTEND_URL=https://your-domain.com

# Optional: Enable detailed logging
DEBUG=false
LOG_LEVEL=info
```

#### How to Set Variables:
1. **Go to your Railway service dashboard**
2. **Click "Variables" tab**
3. **Add each variable individually:**
   - Click "+ New Variable"
   - Enter Variable Name (e.g., `DATABASE_URL`)
   - Enter Variable Value
   - Click "Add"

### 2.4 Database Migration Setup

**Important**: Since we updated the Prisma schema, ensure migrations run correctly:

#### A. Verify Migration Status
Check Railway deployment logs for:
```
✅ Prisma migration completed
✅ Database schema is up to date
```

#### B. Manual Migration (if needed)
If automatic migration fails:
1. **Connect to Railway service via CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway shell
   ```

2. **Run migrations manually:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### 2.5 Verify Backend Deployment

#### A. Test Health Endpoint
```bash
curl https://[your-railway-url].railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### B. Test Database Connection
```bash
curl https://[your-railway-url].railway.app/api/races
# Should return Swedish race data
```

#### C. Check Logs
Monitor Railway logs for any errors:
- Database connection errors
- CORS issues
- Missing environment variables

---

## Step 3: Deploy Frontend to Vercel (Updated for Marketplace)

### 3.1 Pre-deployment Frontend Checklist

#### A. Verify Current Environment Configuration
Check your current `.env` file structure (frontend root):
```bash
# Current development environment
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### B. Create Production Environment Configuration
**Do NOT commit this file** - Vercel will handle environment variables:
```bash
# .env.production (for reference only)
VITE_API_URL=https://your-railway-backend.railway.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### C. Verify Build Configuration
Check `vite.config.ts` is optimized for production:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-dialog']
        }
      }
    }
  },
  preview: {
    port: 8080,
    host: true
  }
}));
```

#### D. Test Local Production Build
```bash
# Test production build locally
npm run build
npm run preview
# Should work at http://localhost:8080
```

### 3.2 Deploy to Vercel

#### A. Initial Vercel Setup
1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New..." → Project**
3. **Import Git Repository:**
   - Find your repository
   - Click "Import"
   - Authorize Vercel access if needed

#### B. Configure Project Settings
1. **Project Settings:**
   - **Project Name**: `loppet-marketplace` (or your preference)
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: `./` (frontend is in root)

2. **Build Settings:**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### C. Advanced Configuration (Optional)
If you need custom settings, create `vercel.json` in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/"
    }
  ]
}
```

### 3.3 Configure Environment Variables in Vercel

**Critical Step**: Set production environment variables:

#### A. Access Environment Variables
1. **Go to Vercel Dashboard** → Your Project
2. **Click "Settings" tab**
3. **Click "Environment Variables" in sidebar**

#### B. Add Production Variables
Add each variable with these exact values:

```bash
# Backend API (from Railway deployment)
VITE_API_URL = https://your-railway-service-name.railway.app

# Google OAuth (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID = 123456789-abcdefghijklmnop.apps.googleusercontent.com

# Supabase Configuration (from Supabase dashboard)
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Environment identifier
VITE_NODE_ENV = production
```

#### C. Environment Variable Settings
For each variable:
- **Environment**: Select `Production`, `Preview`, `Development` (or just Production)
- **Value**: Enter the exact value (no quotes needed)
- **Sensitive**: Check for secrets like SUPABASE_ANON_KEY

### 3.4 Deployment Process

#### A. Initial Deployment
1. **Click "Deploy"** after configuring environment variables
2. **Monitor Build Process** in Vercel dashboard
3. **Check Build Logs** for any errors

#### B. Build Verification
Successful build should show:
```
✅ Building production bundle
✅ Generating static files
✅ Optimizing images and assets
✅ Build completed in [time]
```

#### C. Test Deployment
1. **Click the generated URL** (e.g., `https://loppet-marketplace.vercel.app`)
2. **Verify functionality:**
   - Page loads correctly
   - Swedish text displays properly
   - Navigation works
   - API calls to backend work (check Network tab)

### 3.5 Configure Custom Domain (Prepare for Oderland)

#### A. Add Domain in Vercel
1. **In Vercel Dashboard** → Settings → Domains
2. **Add your domain**: `loppet.se` (or your domain)
3. **Add www subdomain**: `www.loppet.se`

#### B. Note DNS Records
Vercel will provide DNS records like:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**Save these** - you'll configure them in Oderland next.

---

## Step 4: Configure Domain with Oderland

### 4.1 Set Up Custom Domain in Vercel
1. In Vercel dashboard → Settings → Domains
2. Add your Oderland domain (e.g., `loppet.se`)
3. Vercel will provide DNS records to configure

### 4.2 Configure DNS in Oderland
1. Log into your Oderland control panel
2. Go to DNS management for your domain
3. Add the DNS records provided by Vercel:
   - **Type**: CNAME
   - **Name**: www (or @ for root domain)
   - **Value**: cname.vercel-dns.com

### 4.3 Update CORS in Backend
Update your Railway backend environment variables:
```bash
FRONTEND_URL=https://your-domain.com,https://www.your-domain.com
```

And update the CORS configuration in backend:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true
}));
```

---

## Step 5: Configure Google OAuth for Production

### 5.1 Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 client ID
4. Add authorized domains:
   - `https://your-domain.com`
   - `https://www.your-domain.com`
   - `https://your-railway-backend.railway.app`

### 5.2 Update Authorized Redirect URIs
Add these redirect URIs:
- `https://your-domain.com/auth/callback`
- `https://www.your-domain.com/auth/callback`

---

## Step 6: Test End-to-End Functionality

### 6.1 Backend Health Check
1. Visit `https://your-railway-backend.railway.app/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### 6.2 Database Connection Test
1. Check Railway logs for database connection
2. Verify Prisma migrations completed successfully
3. Test a simple API endpoint

### 6.3 Frontend-Backend Communication
1. Open browser developer tools
2. Visit your domain
3. Check Network tab for successful API calls
4. Verify CORS headers are correct

### 6.4 Authentication Flow
1. Test Google login functionality
2. Verify JWT tokens are being set
3. Check that protected routes work
4. Test admin functionality

### 6.5 Database Operations
1. Create a test ad through the frontend
2. Verify it appears in Supabase dashboard
3. Test search and filtering
4. Test user profile updates

---

## Step 7: Production Environment Variables Summary

### Railway Backend Environment Variables:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
JWT_SECRET=production-jwt-secret-very-long-and-secure
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com,https://www.your-domain.com
```

### Vercel Frontend Environment Variables:
```bash
VITE_API_URL=https://your-railway-backend.railway.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Step 8: Security and Performance Optimization

### 8.1 Enable HTTPS Everywhere
- Vercel automatically provides HTTPS
- Railway provides HTTPS by default
- Ensure all internal API calls use HTTPS

### 8.2 Set Up Proper Headers
Add security headers in your backend:
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 8.3 Monitor Performance
- Set up Vercel Analytics
- Monitor Railway application metrics
- Use Supabase dashboard for database performance

---

## Troubleshooting Common Issues

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Check Supabase project is active
- Ensure IP allowlist includes Railway/Vercel IPs

### CORS Errors
- Verify FRONTEND_URL matches your domain exactly
- Check protocol (http vs https)
- Ensure credentials: true is set

### Authentication Problems
- Verify Google OAuth redirect URIs
- Check JWT_SECRET is set consistently
- Ensure cookies are being set properly

### Build Failures
- Check all dependencies are in package.json
- Verify TypeScript compilation succeeds
- Ensure environment variables are available during build

---

## Step 9: Post-Deployment Validation & Testing

### 9.1 Complete End-to-End Testing Checklist

#### A. Frontend Functionality
- [ ] Website loads at your custom domain
- [ ] Swedish language displays correctly (åäö characters)
- [ ] All navigation links work
- [ ] Search functionality works
- [ ] Category filters work properly
- [ ] Swedish race countdown displays current Swedish time

#### B. Backend API Testing
```bash
# Test all marketplace endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/races
curl https://your-domain.com/api/ads
```

#### C. Authentication Flow
- [ ] Google OAuth login works
- [ ] Swedish users can sign up
- [ ] Profile creation works
- [ ] Protected routes work correctly

#### D. Database Operations
- [ ] Can create new ads
- [ ] Can view existing ads
- [ ] Search and filtering work
- [ ] User profiles save correctly

### 9.2 Performance Optimization

#### A. Frontend Performance
```bash
# Test Lighthouse scores
npx lighthouse https://your-domain.com --output=html
# Target scores: Performance 90+, SEO 90+
```

#### B. Backend Performance
- Monitor Railway metrics for response times
- Check Supabase dashboard for query performance
- Set up alerts for high latency

### 9.3 Monitoring Setup

#### A. Error Tracking
Consider adding error tracking to both frontend and backend:
```bash
# Frontend: Sentry or similar
npm install @sentry/react @sentry/tracing

# Backend: Add to Express app
npm install @sentry/node @sentry/tracing
```

#### B. Analytics
Add Swedish-compliant analytics:
```bash
# GDPR-compliant analytics for Swedish users
npm install @analytics/google-analytics
```

---

## Step 10: Maintenance & Updates

### 10.1 Regular Maintenance Tasks

#### A. Database Maintenance
- **Weekly**: Check Supabase usage metrics
- **Monthly**: Review and clean up old ads
- **Quarterly**: Optimize database performance

#### B. Security Updates
- **Weekly**: Update dependencies with security patches
- **Monthly**: Review access logs and security
- **Quarterly**: Rotate JWT secrets and API keys

### 10.2 Scaling Considerations

#### A. Traffic Growth
- **Railway**: Upgrade plan when CPU/memory usage > 80%
- **Supabase**: Monitor database size and connections
- **Vercel**: Enterprise plan for high traffic

#### B. Feature Additions
- **Image Storage**: Consider Cloudinary or AWS S3 for ad images
- **Email Service**: Add SendGrid or Mailgun for notifications
- **Payment Processing**: Integrate Stripe for premium features

---

## Step 11: Emergency Procedures

### 11.1 Rollback Procedures

#### A. Frontend Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

#### B. Backend Rollback (Railway)
1. Go to Railway Dashboard → Deployments
2. Select previous deployment
3. Click "Redeploy"

#### C. Database Rollback (Supabase)
```bash
# If using Prisma migrations
npx prisma migrate reset
npx prisma migrate deploy --schema=./prisma/schema.backup.prisma
```

### 11.2 Disaster Recovery

#### A. Backup Strategy
- **Database**: Supabase automatic backups (7 days free tier)
- **Code**: Git repository backup
- **Environment Variables**: Keep secure backup of all env vars

#### B. Recovery Procedures
1. **Service Down**: Check Railway/Vercel status pages
2. **Database Issues**: Check Supabase status and logs
3. **Domain Issues**: Verify DNS settings in Oderland

---

## Appendix: Configuration Files

### A. Complete .env.example for Backend
```bash
# Database
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secure-64-char-jwt-secret-for-production"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"

# Server
PORT=3001
NODE_ENV=production

# Frontend URL
FRONTEND_URL="https://your-domain.com"

# Optional
DEBUG=false
LOG_LEVEL=info
```

### B. Complete .env.example for Frontend
```bash
# Backend API
VITE_API_URL=https://your-backend.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Supabase
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment
VITE_NODE_ENV=production
```

### C. Complete railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && npx prisma migrate deploy && npx prisma generate && npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### D. Complete vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

This comprehensive deployment guide now includes all necessary steps to deploy the Loppet Swedish sports equipment marketplace to production, including the updated Prisma schema, detailed configuration instructions, troubleshooting, and maintenance procedures.