# Pizzeria Livorno - Full Stack Website & Ordering System

This is a full-stack web application for "Pizzeria Livorno," featuring a complete online ordering system and a promotional marketing website. The project is designed to handle both customer-facing delivery orders and internal staff-facing order management.

![Pizzeria Livorno](https://user-images.githubusercontent.com/10152125/110191834-31a5d780-7e3b-11eb-913d-13a52c1e7a0e.png)

---

## Key Features

### Customer-Facing
- **Promotional Website:** A beautiful, static homepage built with React to attract customers.
- **Online Delivery Menu:** A full menu where customers can browse items and place orders for delivery.
- **Item Customization:** Customers can customize their orders with both paid (e.g., extra cheese) and free (e.g., no onions) options, including specifying quantities for paid extras.
- **Real-Time Order Tracking:** After placing an order, customers can see live status updates as the staff accepts, prepares, and sends the order for delivery.
- **Address Search:** An integrated address search helps customers easily find and validate their street for delivery.

### Staff-Facing Ordering System
- **Admin & Waiter Dashboard:** A secure, role-based system for staff to manage all incoming orders.
- **Real-Time Order Notifications:** New orders appear on the dashboard in real-time with an audible notification, ensuring no order is missed.
- **Complete Order Management:** Staff can accept, decline, and update the status of any order (e.g., "Preparing," "Ready for Delivery").
- **Administrative Controls:** The admin panel allows for full management of:
    - Menu Items & Customization Options
    - Restaurant Tables
    - Delivery Zones & Fees
    - Street names for the delivery area

---

## Tech Stack

- **Frontend (Main Website & Ordering System):**
    - React
    - React Router for navigation
    - Socket.IO Client for real-time communication
    - Tailwind CSS for styling

- **Backend:**
    - Node.js with Express
    - PostgreSQL for the database
    - Socket.IO for real-time WebSocket communication

---

## Project Structure

The project is a monorepo containing three main parts:

```
/
├── ordering-system/
│   ├── backend/      # Node.js API and WebSocket server
│   └── frontend/     # React app for the Staff Dashboard
│
└── src/              # React app for the main public-facing website
```

---

## Setup and Installation

To get this project running locally, follow these steps.

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd ordering-system/backend

# Install dependencies
npm install

# Create a .env file and configure your database connection
# (See .env.example for required variables)
cp .env.example .env

# Connect to PostgreSQL and run the schema to create tables
# You can use the file: /ordering-system/backend/config/database_schema.sql
```

### 2. Staff Frontend Setup

```bash
# Navigate to the staff frontend directory
cd ordering-system/frontend

# Install dependencies
npm install

# Create a .env file to link to the backend API URL
echo "REACT_APP_API_URL=http://localhost:5000" > .env
```

### 3. Main Website Setup

```bash
# Navigate to the project root
cd ../..

# Install dependencies
npm install

# Create a .env file to link to the backend API URL for the delivery system
echo "REACT_APP_API_URL=http://localhost:5000" > .env
```

---

## How to Run the Application

1.  **Start the Backend Server:**
    ```bash
    cd ordering-system/backend
    npm start
    ```

2.  **Start the Staff Ordering System Frontend:**
    ```bash
    cd ordering-system/frontend
    npm start
    ```

3.  **Start the Main Public Website:**
    ```bash
    # From the root directory
    npm start
    ```

You will now have the main website running (usually on `localhost:3000`) and the staff dashboard running on another port (e.g., `localhost:3001`).
