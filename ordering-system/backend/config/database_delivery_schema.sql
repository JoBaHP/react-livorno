
CREATE TABLE IF NOT EXISTS delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- e.g., "Zone 1", "Extended Area"
    center_lat DOUBLE PRECISION NOT NULL, -- Latitude of the circle's center
    center_lng DOUBLE PRECISION NOT NULL, -- Longitude of the circle's center
    radius_meters INT NOT NULL, -- The radius of the circle in meters
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- Make column additions idempotent and avoid errors if base schema isn't present yet
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'table' NOT NULL;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_external_id TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS customer_avatar TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0;
