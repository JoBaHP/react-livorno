
CREATE TABLE delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- e.g., "Zone 1", "Extended Area"
    center_lat DOUBLE PRECISION NOT NULL, -- Latitude of the circle's center
    center_lng DOUBLE PRECISION NOT NULL, -- Longitude of the circle's center
    radius_meters INT NOT NULL, -- The radius of the circle in meters
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

ALTER TABLE orders
ADD COLUMN order_type VARCHAR(50) DEFAULT 'table' NOT NULL,
ADD COLUMN customer_name VARCHAR(255),
ADD COLUMN customer_phone VARCHAR(50),
ADD COLUMN customer_address TEXT;
