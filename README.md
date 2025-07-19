# GoodHub - Social Impact Development Platform

GoodHub connects developers with open-source projects that create positive social impact. Whether you're passionate about environmental causes, education, accessibility, or community building, GoodHub helps you find meaningful projects to contribute to.

## 🌟 Current Features

### ✅ Fully Implemented
- **🔐 Google OAuth Authentication** - Secure login with profile management
- **📋 Project Discovery** - Browse and search approved projects by category and tech stack
- **👥 Project Participation** - Join and leave projects with team member tracking
- **⚡ Real-time Project Details** - Comprehensive project information and team visibility
- **🎨 Modern UI/UX** - Dark theme with responsive design using Tailwind CSS + shadcn/ui
- **🚀 Dockerized Development** - Full-stack development environment with Docker Compose
- **🔒 Admin Panel Backend** - Complete admin API for project moderation
- **💾 PostgreSQL Database** - Robust data persistence with Prisma ORM

### 🚧 Backend Complete, Frontend Pending
- **📝 Project Creation** - API ready, form interface needed
- **📊 User Dashboard** - API ready, UI needed
- **⚖️ Admin Moderation** - API ready, admin interface needed
- **👤 Profile Management** - API ready, editing interface needed

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast development and building
- **Tailwind CSS** + **shadcn/ui** - Modern, accessible components
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client with auth interceptors

### Backend
- **Node.js** with **Express** and TypeScript
- **Prisma ORM** with PostgreSQL
- **Google OAuth 2.0** authentication
- **JWT** tokens for session management
- **Zod** for runtime validation

### DevOps
- **Docker Compose** - Local development environment
- **PostgreSQL** - Database (containerized for development)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Google OAuth credentials (see setup below)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd contribution-board-echo
```

### 2. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database (will be provided by Docker Compose)
DATABASE_URL="postgresql://postgres:password@localhost:5432/goodhub"

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="your-64-character-secret-here"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:8080"

# Admin emails (comma-separated)
ADMIN_EMAILS="your-email@example.com"
```

#### Frontend Environment
```bash
# In project root
touch .env.local
```

Edit `.env.local`:
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
VITE_API_URL="http://localhost:3001"
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080` (development)
   - Your production domain (when deploying)

### 4. Start Development Environment
```bash
# Start both frontend and backend with database
docker-compose up

# Or start in background
docker-compose up -d
```

This will start:
- Frontend at http://localhost:8080
- Backend API at http://localhost:3001
- PostgreSQL database at localhost:5432

### 5. Database Setup
```bash
# In a new terminal, run migrations
cd backend
npm run db:migrate
npm run db:generate
```

## 📁 Project Structure

```
contribution-board-echo/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth middleware
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── src/                    # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── contexts/         # React contexts (auth, etc.)
│   ├── lib/              # Utilities (API client, etc.)
│   └── hooks/            # Custom React hooks
├── docs/                 # Project documentation
├── docker-compose.yml    # Development environment
└── package.json          # Frontend dependencies
```

## 🎯 Development Status

### Phase 1: Core Platform ✅ (90% Complete)
- [x] Full-stack authentication with Google OAuth
- [x] Project listing and discovery
- [x] Project detail views and team management
- [x] Admin backend APIs for moderation
- [x] Responsive UI with modern design
- [ ] Project creation form UI
- [ ] Admin panel UI
- [ ] User dashboard UI

### Phase 2: Enhanced Features (Planned)
- [ ] Advanced search and filtering
- [ ] GitHub integration for project sync
- [ ] Real-time notifications
- [ ] Enhanced project collaboration tools
- [ ] Mobile app consideration

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify JWT token

### Projects
- `GET /api/projects` - List approved projects (with filters)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project (auth required)
- `POST /api/projects/:id/join` - Join project (auth required)
- `DELETE /api/projects/:id/leave` - Leave project (auth required)
- `GET /api/projects/categories` - Get available categories

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile (auth required)
- `GET /api/users/dashboard` - Get dashboard data (auth required)

### Admin (Admin Only)
- `GET /api/admin/projects/pending` - Get pending projects
- `POST /api/admin/projects/:id/approve` - Approve project
- `POST /api/admin/projects/:id/reject` - Reject project
- `GET /api/admin/dashboard` - Get admin statistics
- `GET /api/admin/projects` - Get all projects

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Docker
```bash
docker-compose up         # Start all services
docker-compose down       # Stop all services
docker-compose logs       # View logs
docker-compose build      # Rebuild containers
```

## 🤝 Contributing

1. **For Backend**: API is largely complete, focus on optimizations and new features
2. **For Frontend**: Priority areas are:
   - Project creation form (`src/pages/CreateProject.tsx`)
   - Admin panel interface (`src/pages/Admin.tsx`)
   - User dashboard (`src/pages/Dashboard.tsx`)
   - Profile editing functionality

## 📚 Additional Documentation

- [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md) - Detailed implementation status
- [`docs/DevelopmentPlan.md`](docs/DevelopmentPlan.md) - Long-term development strategy
- [`docs/PHASE1_IMPLEMENTATION.md`](docs/PHASE1_IMPLEMENTATION.md) - Phase 1 completion details

## 🐛 Known Issues

- Frontend forms need completion (create project, profile editing)
- Admin panel UI needs implementation
- Email notifications not yet implemented
- Mobile responsiveness could be improved

## 📄 License

This project is open source. Please see the LICENSE file for details.

---

**Ready to make a difference?** 🌍 Start the development environment and begin contributing to projects that matter!
