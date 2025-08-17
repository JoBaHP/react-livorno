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
    available BOOLEAN DEFAULT true
);

CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    number INT NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    table_id INT REFERENCES tables(id),
    status VARCHAR(50) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    wait_time INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(100),
    quantity INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

-- Insert sample data after creating tables
INSERT INTO users (username, password, role) VALUES
('admin', 'adminpassword', 'admin'),
('waiter1', 'waiterpassword', 'waiter');

INSERT INTO tables (number) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
(11), (12), (13), (14), (15), (16), (17), (18), (19), (20);

INSERT INTO menu_items (name, category, description, available, sizes) VALUES
('Margherita Pizza', 'Pizzas', 'Classic cheese and tomato', true, '[{"name": "Medium", "price": 12.50}, {"name": "Large", "price": 15.00}]'),
('Pepperoni Pizza', 'Pizzas', 'Spicy pepperoni slices', true, '[{"name": "Medium", "price": 14.00}, {"name": "Large", "price": 16.50}]');

INSERT INTO menu_items (name, category, description, available, price) VALUES
('Carbonara', 'Pasta', 'Creamy sauce with bacon', true, 11.00),
('Spaghetti Bolognese', 'Pasta', 'Rich meat sauce', false, 10.50),
('Caesar Salad', 'Salads', 'Fresh lettuce with Caesar dressing', true, 9.00),
('Tiramisu', 'Desserts', 'Coffee-flavoured Italian dessert', true, 6.50),
('Coca-Cola', 'Drinks', '330ml can', true, 2.50),
('Still Water', 'Drinks', '500ml bottle', true, 2.00);
