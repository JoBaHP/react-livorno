-- This script creates the complete database schema for the production application.
-- It should be run on a new, empty PostgreSQL database.

-- Table for user accounts (admin, waiter)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Stores a hashed password
    role VARCHAR(50) NOT NULL
);

-- Table for all menu items
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2), -- For items with a single price
    sizes JSONB, -- For items with multiple sizes (e.g., [{"name": "Large", "price": 15.00}])
    available BOOLEAN DEFAULT true,
    image_url TEXT
);

-- Table for restaurant tables
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL
);

-- Table for all possible customization options (extras, toppings)
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 -- Price is 0 for free items
);

-- Join table to link which options are available for which menu items
CREATE TABLE menu_item_options (
    menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE,
    option_id INT REFERENCES options(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, option_id)
);

-- Table for customer orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    status VARCHAR(50) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    wait_time INT,
    notes TEXT, -- For customer notes
    payment_method VARCHAR(50), -- 'cash' or 'card'
    feedback_rating INT, -- Star rating (1-5)
    feedback_comment TEXT, -- Customer's text feedback
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for the specific items within an order
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    selected_options JSONB -- Stores the chosen extras/toppings for this item
);

-- Table to store push notification subscriptions for waiters
CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subscription_object JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --- Initial Data Insertion ---

-- Insert a default admin user. 
-- IMPORTANT: You must log in as this admin and use the UI to reset the password to a secure, hashed one.
INSERT INTO users (username, password, role) VALUES
('admin', 'adminpassword', 'admin');

-- Insert restaurant tables
INSERT INTO tables (number) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
(11), (12), (13), (14), (15), (16), (17), (18), (19), (20);

CREATE TABLE streets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 1. Enable the extension for text similarity and searching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Also ensure unaccent is available before using it below
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Add a new column to store the normalized street name
ALTER TABLE streets
ADD COLUMN name_normalized TEXT;

-- 3. Create an index on the new column to make searches fast
CREATE INDEX idx_streets_name_normalized ON streets USING gin (name_normalized gin_trgm_ops);

-- 4. (Optional) Populate the new column for any existing streets in your database
UPDATE streets SET name_normalized = unaccent(name);
