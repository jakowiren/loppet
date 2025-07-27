# Loppet Marketplace - Current State

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **Profile**: User accounts with ratings, sales tracking
- **Ad**: Marketplace listings with categories, conditions, race types  
- **Race**: Swedish endurance sports events
- **Conversation/Message**: Buyer-seller messaging
- **Activity**: User activity tracking
- **AdStatistic**: Analytics for ads

---

## Current Issues

### High Priority
1. **Profile Page Data** (`src/pages/Profile.tsx`): Hardcoded profile data instead of fetching from database
2. **Swedish Translation** (`src/components/GoogleSignIn.tsx`): User registration still shows English text
3. **Profile Schema Alignment**: Frontend profile editing needs to match database schema

### Medium Priority  
4. **Video Background**: Red flash on page refresh
5. **Race Data**: Review and populate Swedish races in database

---

## Status

✅ **Working**: Authentication, database connection, protected routes  
🔧 **Needs Work**: Profile data integration, Swedish localization