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
    image_url TEXT -- NEW: Column to store the image URL
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
-- IMPORTANT: The password 'adminpassword' should be changed immediately by the admin.
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$f.73.1mJpA8.A.Y.b8d.d.a9s8d7f6g5h4j3k2l1i0o9p8q7r6t5', 'admin'); -- This is a placeholder hash, you must reset it

-- Insert restaurant tables
INSERT INTO tables (number) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
(11), (12), (13), (14), (15), (16), (17), (18), (19), (20);

-- Insert sample menu items
INSERT INTO menu_items (name, category, description, available, sizes, image_url) VALUES
('Margherita Pizza', 'Pizzas', 'Classic cheese and tomato', true, '[{"name": "Medium", "price": 12.50}, {"name": "Large", "price": 15.00}]', 'https://placehold.co/600x400/F5A623/FFFFFF?text=Pizza'),
('Pepperoni Pizza', 'Pizzas', 'Spicy pepperoni slices', true, '[{"name": "Medium", "price": 14.00}, {"name": "Large", "price": 16.50}]', 'https://placehold.co/600x400/D0021B/FFFFFF?text=Pizza');

INSERT INTO menu_items (name, category, description, available, price, image_url) VALUES
('Carbonara', 'Pasta', 'Creamy sauce with bacon', true, 11.00, 'https://placehold.co/600x400/F8E71C/FFFFFF?text=Pasta'),
('Spaghetti Bolognese', 'Pasta', 'Rich meat sauce', false, 10.50, 'https://placehold.co/600x400/BD10E0/FFFFFF?text=Pasta'),
('Caesar Salad', 'Salads', 'Fresh lettuce with Caesar dressing', true, 9.00, 'https://placehold.co/600x400/7ED321/FFFFFF?text=Salad'),
('Tiramisu', 'Desserts', 'Coffee-flavoured Italian dessert', true, 6.50, 'https://placehold.co/600x400/4A90E2/FFFFFF?text=Dessert'),
('Coca-Cola', 'Drinks', '330ml can', true, 2.50, NULL),
('Still Water', 'Drinks', '500ml bottle', true, 2.00, NULL);

-- Insert sample options
INSERT INTO options (name, price) VALUES
('Extra Cheese', 1.50),
('Extra Meat', 2.00),
('Ketchup', 0.00),
('Mayonnaise', 0.00);
