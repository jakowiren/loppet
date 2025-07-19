# Phase 1 External Setup Tasks - Complete Order

These tasks must be completed in the exact order listed below. Each step depends on the previous ones.

## 📋 Overview of Steps

1. **Supabase Database Setup** (5 minutes)
2. **Google OAuth Setup** (10 minutes)
3. **Local Environment Configuration** (3 minutes)
4. **Database Migration** (2 minutes)
5. **Supabase Backend Deployment** (15 minutes)
6. **Vercel Environment Configuration** (5 minutes)
7. **Testing & Verification** (10 minutes)

---

## 🗄️ Step 1: Supabase Database Setup (FIRST)

### 1.1 Create Supabase Project
1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select or create
   - Name: `goodhub` or `goodhub-prod`
   - Database Password: Generate a strong password (save it!)
   - Region: Choose closest to your users
4. **Click "Create new project"**
5. **Wait 2-3 minutes for provisioning**

### 1.2 Get Database Connection String
1. **Go to Project Settings > Database**
2. **Copy the "Connection string" under "Connection parameters"**
3. **Replace `[YOUR-PASSWORD]` with the password you created**
4. **Save this connection string - you'll need it in Step 3**

Example format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔐 Step 2: Google OAuth Setup (SECOND)

### 2.1 Create Google Cloud Project
1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Click "Select a project" dropdown**
3. **Click "New Project"**
4. **Project name:** `GoodHub` or similar
5. **Click "Create"**
6. **Wait for project creation, then select it**

### 2.2 Configure OAuth Consent Screen
1. **Navigate to "APIs & Services" > "OAuth consent screen"**
2. **Select "External" user type**
3. **Click "Create"**
4. **Fill required fields:**
   - App name: `GoodHub`
   - User support email: Your email
   - Developer contact: Your email
5. **Click "Save and Continue"**
6. **Skip "Scopes" section (click "Save and Continue")**
7. **Add test users if needed**
8. **Click "Back to Dashboard"**

### 2.3 Create OAuth Credentials
1. **Go to "APIs & Services" > "Credentials"**
2. **Click "Create Credentials" > "OAuth 2.0 Client IDs"**
3. **Application type:** "Web application"
4. **Name:** `GoodHub Frontend`
5. **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://your-vercel-domain.vercel.app
   ```
   (Replace with your actual Vercel domain)
6. **Click "Create"**
7. **Copy the Client ID and Client Secret**
8. **Save these credentials securely**

---

## 🔑 Step 3: Local Environment Configuration (THIRD)

### 3.1 Backend Environment Setup
1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Edit `backend/.env` with your values:**
   ```env
   # Database (from Step 1.2)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   
   # JWT (from step above)
   JWT_SECRET="your-64-character-hex-string-here"
   
   # Google OAuth (from Step 2.3)
   GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Server
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:5173"
   
   # Admin (replace with your email)
   ADMIN_EMAILS="your-email@gmail.com"
   ```

### 3.2 Frontend Environment Setup
1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Create frontend environment file:**
   ```bash
   touch .env.local
   ```

3. **Edit `.env.local`:**
   ```env
   VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
   VITE_API_URL="http://localhost:3001"
   ```

---

## 🔄 Step 4: Database Migration (FOURTH)

### 4.1 Install Backend Dependencies
```bash
cd backend
npm install
```

### 4.2 Generate Prisma Client
```bash
npm run db:generate
```

### 4.3 Run Database Migrations
```bash
npm run db:migrate
```

**Important:** When prompted for migration name, enter: `init`

### 4.4 Verify Database Setup
1. **Go to Supabase Dashboard > Table Editor**
2. **You should see tables:** `users`, `projects`, `project_members`
3. **Check that enums are created:** `project_category`, `project_status`

---

## 🚀 Step 5: Railway Backend Deployment (FIFTH)

### 5.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 5.2 Deploy Backend to Railway
1. **Login to Railway:**
   ```bash
   railway login
   ```
   This will open your browser for authentication.

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Initialize Railway project:**
   ```bash
   railway init
   ```
   When prompted, choose a project name like `goodhub-backend`.

4. **Set environment variables:**
   ```bash
   # Database connection
   railway variables set DATABASE_URL="postgresql://postgres.tkucrlmrqrcmcuxgthdl:VC2m0lJJPXf90V8g@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require"
   
   # JWT secret (generate new production secret)
   railway variables set JWT_SECRET="your-production-64-char-jwt-secret"
   
   # Google OAuth credentials
   railway variables set GOOGLE_CLIENT_ID="your-google-client-id"
   railway variables set GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Admin configuration
   railway variables set ADMIN_EMAILS="your-email@gmail.com"
   railway variables set NODE_ENV="production"
   ```

5. **Deploy to Railway:**
   ```bash
   railway up
   ```

6. **Get your deployment URL:**
   ```bash
   railway status
   ```
   Save the URL (e.g., `https://goodhub-backend-production.up.railway.app`)

---

## ☁️ Step 6: Vercel Environment Configuration (SIXTH)

### 6.1 Configure Vercel Environment Variables
1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add these variables:**
   
   **For Production:**
   ```
   VITE_GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
   VITE_API_URL = https://your-railway-backend-url.up.railway.app
   ```
   (Replace with your actual Railway deployment URL from Step 5.6)

   **For Preview (optional):**
   Same values as production

### 6.2 Redeploy Frontend
1. **Go to Vercel Dashboard > Deployments**
2. **Click "Redeploy" on latest deployment**
3. **Wait for deployment to complete**

---

## 🧪 Step 7: Testing & Verification (SEVENTH)

### 7.1 Test Local Development
1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend (new terminal):**
   ```bash
   npm run dev
   ```

3. **Test in browser:**
   - Navigate to `http://localhost:5173`
   - Check that projects page loads
   - Verify no console errors

### 7.2 Test Production Deployment
1. **Visit your Vercel domain**
2. **Check browser network tab for API calls**
3. **Verify API calls go to Railway backend URL**

### 7.3 Test Google OAuth (when frontend is implemented)
1. **Click Google Sign-In button**
2. **Complete OAuth flow**
3. **Verify user is created in Supabase database**

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Supabase project created and database accessible
- [ ] Google OAuth credentials configured
- [ ] Local environment files configured
- [ ] Database migrations executed successfully
- [ ] Backend deployed to Railway
- [ ] Vercel environment variables configured
- [ ] Local development environment working
- [ ] Production deployment accessible
- [ ] API calls routing correctly
- [ ] Database connections working

---

## 🚨 Troubleshooting

**Database Connection Issues:**
- Verify DATABASE_URL format matches exactly
- Check Supabase project is not paused
- Ensure password is correct

**Google OAuth Issues:**
- Verify redirect URIs include both localhost and production URLs
- Check OAuth consent screen is published
- Ensure Client ID matches in all environments

**Deployment Issues:**
- Check Supabase Edge Function logs
- Verify all environment variables are set
- Test API endpoints directly

**Need Help?**
- Supabase docs: https://supabase.com/docs
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2

## ✅ Verification Checklist

After completing the above tasks:

- [ ] PostgreSQL database is running and accessible
- [ ] Database migrations have been executed successfully
- [ ] Google OAuth credentials are configured
- [ ] JWT secret is set
- [ ] Admin emails are configured
- [ ] Frontend can communicate with backend
- [ ] Google OAuth login works
- [ ] Project creation and approval workflow functions
- [ ] Database is properly seeded with test data (optional)

## 🧪 Testing the Setup

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Test the key flows**
   - Google OAuth login
   - Create a project
   - Admin project approval
   - Join/leave projects

## 📝 Additional Notes

- **Environment Files**: Never commit `.env` files to version control
- **Database Backups**: Set up regular backups for production
- **SSL Certificates**: Required for production Google OAuth
- **CORS Configuration**: Update allowed origins for production
- **Rate Limiting**: Consider adding rate limiting for production API