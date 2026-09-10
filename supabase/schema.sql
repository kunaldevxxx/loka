-- ==============================================================================
-- LOKA CAFE PLATFORM - SUPABASE POSTGRESQL SCHEMA & INITIAL SEED
-- ==============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CAFES TABLE
CREATE TABLE IF NOT EXISTS cafes (
    cafe_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    venue_type VARCHAR(64) DEFAULT 'cafe',
    icon VARCHAR(16) DEFAULT '☕',
    location TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    default_table_id VARCHAR(32) DEFAULT 'table-01',
    specialty_item_ids TEXT[] DEFAULT '{}',
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    item_id VARCHAR(64) PRIMARY KEY,
    cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    category VARCHAR(64) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    image TEXT,
    description TEXT,
    sizes JSONB DEFAULT '[]'::jsonb,
    milk_options TEXT[] DEFAULT '{}',
    add_ons JSONB DEFAULT '[]'::jsonb,
    recommendation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_cafe ON menu_items(cafe_id);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer',
    cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE SET NULL,
    google_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    login_count INT DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    table_id VARCHAR(32) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal INT NOT NULL,
    gst INT NOT NULL,
    loyalty_discount INT DEFAULT 0,
    total INT NOT NULL,
    payment_method VARCHAR(32) DEFAULT 'upi',
    payment_status VARCHAR(32) DEFAULT 'paid',
    kitchen_status VARCHAR(32) DEFAULT 'confirmed',
    points_earned INT DEFAULT 0,
    confirmation_code VARCHAR(16) NOT NULL,
    is_returning BOOLEAN DEFAULT FALSE,
    status_timestamps JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    razorpay_order_id VARCHAR(128)
);
CREATE INDEX IF NOT EXISTS idx_orders_cafe ON orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(kitchen_status);

-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
    table_id VARCHAR(32),
    issue_type VARCHAR(64) NOT NULL,
    item_name VARCHAR(255),
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255)
);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME ON ORDERS FOR CHEF KDS & CUSTOMER TRACKER
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ==============================================================================
-- INITIAL SEED DATA INSERTION
-- ==============================================================================

-- Cafes
INSERT INTO cafes (cafe_id, name, tagline, venue_type, icon, location, phone, default_table_id, specialty_item_ids, theme)
VALUES 
('cafe-001', 'Brew Haven Cafe', 'Where artisanal coffee meets culinary craft', 'cafe', '☕', 'Bandra West, Mumbai', '+91-9820123456', 'table-05', ARRAY['item-001','item-002','item-003'], '{"primary":"#d97706","background":"#faf8f5","foreground":"#1c1917"}'::jsonb),
('cafe-002', 'The Daily Grind Roasters', 'Fresh micro-lot roasts & sourdough bakes', 'roastery', '🫘', 'Koramangala, Bangalore', '+91-9845098765', 'table-02', ARRAY['item-004','item-005'], '{"primary":"#059669","background":"#f6fbf8","foreground":"#123026"}'::jsonb),
('cafe-003', 'Velvet Bean Lounge', 'Evening espresso martinis & specialty desserts', 'lounge', '🍸', 'Jubilee Hills, Hyderabad', '+91-9876543210', 'table-08', ARRAY['item-006'], '{"primary":"#a855f7","background":"#1a1625","foreground":"#f5f3ff"}'::jsonb)
ON CONFLICT (cafe_id) DO NOTHING;

-- Seed Users
INSERT INTO users (id, email, password, name, role, cafe_id)
VALUES
('user-001', 'user@example.com', 'securePassword123', 'John Doe', 'customer', NULL),
('user-mgr-01', 'manager@cafe.com', 'managerPassword123', 'Aarav Sharma', 'manager', 'cafe-001'),
('user-chf-01', 'chef@cafe.com', 'chefPassword123', 'Chef Maria Rossi', 'chef', 'cafe-001'),
('user-sup-01', 'support@cafe.com', 'supportPassword123', 'Dev Support Admin', 'support', NULL)
ON CONFLICT (email) DO NOTHING;
