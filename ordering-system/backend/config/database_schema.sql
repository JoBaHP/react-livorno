CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    sizes JSONB,
    available BOOLEAN DEFAULT true,
    image_url TEXT
);

CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL
);

CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE menu_item_options (
    menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE,
    option_id INT REFERENCES options(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, option_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    status VARCHAR(50) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    wait_time INT,
    notes TEXT,
    payment_method VARCHAR(50),
    feedback_rating INT,
    feedback_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Delivery-specific fields
    order_type VARCHAR(50) NOT NULL DEFAULT 'table',
    customer_name VARCHAR(255),
    customer_phone VARCHAR(255),
    customer_address TEXT
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    selected_options JSONB
);

CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subscription_object JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE streets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Enable text similarity searching for street names
CREATE EXTENSION IF NOT EXISTS pg_trgm;
ALTER TABLE streets ADD COLUMN name_normalized TEXT;
CREATE INDEX idx_streets_name_normalized ON streets USING gin (name_normalized gin_trgm_ops);
UPDATE streets SET name_normalized = unaccent(name);


-- --- Initial Data ---
INSERT INTO users (username, password, role) VALUES
('admin', 'adminpassword', 'admin');

INSERT INTO tables (number) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
(11), (12), (13), (14), (15), (16), (17), (18), (19), (20);