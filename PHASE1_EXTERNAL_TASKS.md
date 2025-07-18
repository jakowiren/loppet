# Phase 1 External Setup Tasks

These tasks require manual setup outside of the codebase and cannot be automated:

## 🗄️ Database Setup

### PostgreSQL Database
1. **Set up PostgreSQL server**
   - Install PostgreSQL locally or use a cloud service (Railway, Neon, Supabase, etc.)
   - Create a new database named `goodhub`
   - Create a database user with appropriate permissions

2. **Configure environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Format: `postgresql://username:password@localhost:5432/goodhub?schema=public`

3. **Run database migrations**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:generate
   ```

## 🔐 Google OAuth Setup

### Google Cloud Console Configuration
1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure consent screen if prompted
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - Your production frontend URL

4. **Update environment variables**
   - Copy the Client ID and Client Secret
   - Update `backend/.env`:
     ```
     GOOGLE_CLIENT_ID="your-google-client-id"
     GOOGLE_CLIENT_SECRET="your-google-client-secret"
     ```
   - Create `frontend/.env.local`:
     ```
     VITE_GOOGLE_CLIENT_ID="your-google-client-id"
     VITE_API_URL="http://localhost:3001"
     ```

## 🔑 JWT Configuration

### Generate JWT Secret
1. **Generate a secure secret**
   ```bash
   # Option 1: Using Node.js
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Option 2: Using OpenSSL
   openssl rand -hex 64
   ```

2. **Update environment variables**
   - Add to `backend/.env`:
     ```
     JWT_SECRET="your-generated-secret-here"
     ```

## 👑 Admin Configuration

### Set Admin Emails
1. **Configure admin users**
   - Update `backend/.env`:
     ```
     ADMIN_EMAILS="admin1@example.com,admin2@example.com"
     ```
   - Only users with these emails will have admin access

## 🚀 Deployment Setup (Optional for MVP)

### Frontend Deployment (Vercel)
1. **Connect to Vercel**
   - Push code to GitHub
   - Connect repository to Vercel
   - Configure environment variables in Vercel dashboard

### Backend Deployment (Railway)
1. **Connect to Railway**
   - Push code to GitHub
   - Connect repository to Railway
   - Configure environment variables in Railway dashboard
   - Railway will automatically provision PostgreSQL

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