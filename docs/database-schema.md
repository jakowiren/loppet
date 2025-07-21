# Loppet Database Schema - Supabase SQL

## Overview

This document outlines the complete database schema for **Loppet**, a Swedish sports equipment marketplace focused on endurance sports like Triathlon, Vasaloppet, Vätternrundan, and other Swedish races.

## Core Entities

### 1. Users (profiles)
Stores user account information and profile data.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sales INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT rating_range CHECK (rating >= 0.0 AND rating <= 5.0)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Race Categories
Stores information about Swedish races and events.

```sql
CREATE TABLE public.races (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  date DATE,
  location TEXT,
  participants_count TEXT,
  registration_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

-- RLS Policy (public read)
CREATE POLICY "Races are viewable by everyone" ON races
  FOR SELECT USING (true);

-- Insert default Swedish races
INSERT INTO races (name, description, date, location, participants_count, color) VALUES
('Vasaloppet 2025', 'Sveriges största längdskidåkning', '2025-03-02', 'Sälen - Mora', '15,800', '#8B5CF6'),
('Vätternrundan 2025', 'Sveriges största cykellopp', '2025-06-14', 'Motala', '22,000', '#10B981'),
('Ironman Kalmar 2025', 'Triathlon i världsklass', '2025-08-23', 'Kalmar', '2,200', '#F59E0B'),
('Stockholm Marathon 2025', 'Löpning genom Sveriges huvudstad', '2025-06-07', 'Stockholm', '18,000', '#EF4444'),
('Midnattsloppet 2025', 'Stockholms populäraste löpning', '2025-08-16', 'Stockholm', '25,000', '#6366F1');
```

### 3. Ads/Listings
Core marketplace listings for sports equipment.

```sql
-- Create ENUM types
CREATE TYPE ad_status AS ENUM ('ACTIVE', 'SOLD', 'PAUSED');
CREATE TYPE ad_condition AS ENUM ('Nytt', 'Som nytt', 'Mycket bra', 'Bra', 'Acceptabelt');
CREATE TYPE ad_category AS ENUM ('Cyklar', 'Kläder', 'Skor', 'Tillbehör', 'Klockor', 'Hjälmar', 'Vätskor & Nutrition', 'Annat');
CREATE TYPE race_type AS ENUM ('Triathlon', 'Vasaloppet', 'Vätternrundan', 'Ironman', 'Cykelrace', 'Löpning', 'Simning', 'Multisport');

CREATE TABLE public.ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category ad_category NOT NULL,
  race_type race_type NOT NULL,
  condition ad_condition NOT NULL,
  location TEXT NOT NULL,
  status ad_status DEFAULT 'ACTIVE',
  images TEXT[] DEFAULT '{}',
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  sold_price INTEGER,
  
  CONSTRAINT price_positive CHECK (price > 0),
  CONSTRAINT max_images CHECK (array_length(images, 1) <= 5)
);

-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Ads are viewable by everyone" ON ads
  FOR SELECT USING (true);

CREATE POLICY "Users can create ads" ON ads
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own ads" ON ads
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own ads" ON ads
  FOR DELETE USING (auth.uid() = seller_id);

-- Indexes for performance
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_category ON ads(category);
CREATE INDEX idx_ads_race_type ON ads(race_type);
CREATE INDEX idx_ads_location ON ads(location);
CREATE INDEX idx_ads_price ON ads(price);
CREATE INDEX idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX idx_ads_seller_id ON ads(seller_id);
```

### 4. Favorites
User's favorite ads for quick access.

```sql
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, ad_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_ad_id ON favorites(ad_id);
```

### 5. User Activity History
Track user actions for dashboard and analytics.

```sql
CREATE TYPE activity_type AS ENUM ('AD_CREATED', 'AD_SOLD', 'AD_FAVORITED', 'MESSAGE_RECEIVED', 'AD_VIEWED');

CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type activity_type NOT NULL,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  ad_title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

### 6. Conversations & Messages
Direct messaging between buyers and sellers.

```sql
CREATE TYPE conversation_status AS ENUM ('ACTIVE', 'CLOSED');

CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status conversation_status DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(ad_id, buyer_id, seller_id)
);

CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Indexes
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_ad_id ON conversations(ad_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
```

### 7. Ad Statistics
Daily statistics for ads (views, favorites, etc.).

```sql
CREATE TABLE public.ad_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  contact_attempts INTEGER DEFAULT 0,
  
  UNIQUE(ad_id, date)
);

-- Enable RLS
ALTER TABLE ad_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Ad statistics viewable by ad owner" ON ad_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ads 
      WHERE id = ad_id AND seller_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_ad_statistics_ad_id ON ad_statistics(ad_id);
CREATE INDEX idx_ad_statistics_date ON ad_statistics(date DESC);
```

## Functions and Triggers

### 1. Update Favorites Count
Automatically update the favorites count when favorites are added/removed.

```sql
-- Function to update favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ads SET favorites_count = favorites_count + 1 WHERE id = NEW.ad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ads SET favorites_count = favorites_count - 1 WHERE id = OLD.ad_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER favorites_count_trigger
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();
```

### 2. Update Last Message Time
Update conversation's last_message_at when new message is sent.

```sql
-- Function to update last message time
CREATE OR REPLACE FUNCTION update_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.sent_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER last_message_time_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_last_message_time();
```

### 3. Create Activity on Ad Creation
Automatically create activity when user creates an ad.

```sql
-- Function to create activity
CREATE OR REPLACE FUNCTION create_ad_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, ad_id, ad_title)
  VALUES (NEW.seller_id, 'AD_CREATED', NEW.id, NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER ad_created_activity_trigger
  AFTER INSERT ON ads
  FOR EACH ROW EXECUTE FUNCTION create_ad_activity();
```

### 4. Update Updated At Timestamp
Automatically update the updated_at field when records are modified.

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for various tables
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at 
  BEFORE UPDATE ON ads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

### Sample Ads
```sql
-- Sample ads for testing (replace seller_id with actual UUIDs)
INSERT INTO ads (title, description, price, category, race_type, condition, location, seller_id, images) VALUES
(
  'Trek Speed Concept - Timetrial cykel',
  'Professionell timetrial cykel i utmärkt skick. Perfekt för triathlon och tempo-race. Kolfiber ram, aero hjul ingår.',
  45000,
  'Cyklar',
  'Triathlon',
  'Mycket bra',
  'Stockholm',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  ARRAY['/images/trek-speed-1.jpg', '/images/trek-speed-2.jpg']
),
(
  'Zone3 Wetsuit - Herr Medium',
  'Knappt använd våtdräkt från Zone3. Storlek M. Perfekt för öppet vatten. Inga skador eller reparationer.',
  2800,
  'Kläder',
  'Triathlon',
  'Som nytt',
  'Göteborg',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  ARRAY['/images/wetsuit-1.jpg']
),
(
  'Garmin Forerunner 945 - GPS Klocka',
  'Komplett triathlon-klocka med alla funktioner. Inklusive originalladdare och bruksanvisning.',
  6500,
  'Klockor',
  'Triathlon',
  'Mycket bra',
  'Uppsala',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  ARRAY['/images/garmin-945-1.jpg', '/images/garmin-945-2.jpg']
);
```

## Views for Common Queries

### User Dashboard Data
```sql
-- View for user dashboard statistics
CREATE VIEW user_dashboard_stats AS
SELECT 
  p.id as user_id,
  COUNT(a.id) as total_ads,
  COUNT(CASE WHEN a.status = 'ACTIVE' THEN 1 END) as active_ads,
  COUNT(CASE WHEN a.status = 'SOLD' THEN 1 END) as sold_ads,
  COALESCE(SUM(a.views), 0) as total_views,
  COALESCE(SUM(CASE WHEN a.status = 'SOLD' THEN a.sold_price ELSE 0 END), 0) as total_earnings
FROM profiles p
LEFT JOIN ads a ON p.id = a.seller_id
GROUP BY p.id;
```

### Popular Ads View
```sql
-- View for trending/popular ads
CREATE VIEW popular_ads AS
SELECT 
  a.*,
  p.display_name as seller_name,
  p.rating as seller_rating
FROM ads a
JOIN profiles p ON a.seller_id = p.id
WHERE a.status = 'ACTIVE'
ORDER BY a.views DESC, a.favorites_count DESC, a.created_at DESC;
```

## Search and Filter Optimization

### Full-text search setup
```sql
-- Add search vector column for full-text search
ALTER TABLE ads ADD COLUMN search_vector tsvector;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_ads_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('swedish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('swedish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('swedish', COALESCE(NEW.category::text, '')), 'C') ||
    setweight(to_tsvector('swedish', COALESCE(NEW.race_type::text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector
CREATE TRIGGER ads_search_vector_trigger
  BEFORE INSERT OR UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION update_ads_search_vector();

-- Update existing rows
UPDATE ads SET title = title;

-- Index for search
CREATE INDEX idx_ads_search_vector ON ads USING GIN(search_vector);
```

## Security and Performance

### Additional Indexes
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_ads_status_category ON ads(status, category);
CREATE INDEX idx_ads_status_race_type ON ads(status, race_type);
CREATE INDEX idx_ads_status_created_at ON ads(status, created_at DESC);
CREATE INDEX idx_ads_seller_status ON ads(seller_id, status);
```

### RLS Helper Functions
```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND display_name = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This schema provides a robust foundation for the Loppet marketplace with proper security, performance optimization, and Swedish localization support. All tables include Row Level Security (RLS) policies to ensure data privacy and security.