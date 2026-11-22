# 🍕 Pizzeria Bella — Production-Grade Pizza Delivery & Inventory Platform

> Built with the **MERN Stack** (React.js, Node.js + Express.js, MongoDB), **Razorpay** (Test Mode), **Socket.IO** (Real-time WebSockets), **Nodemailer** (Automated Email Alerts & Verification), and **Node-Cron** (Automated Stock Monitoring).

---

## 🌟 Feature Checklist & Implementation Status

### 👤 User Side
- [x] **User registration with email verification**: Generates secure SHA-256 hashed verification tokens, sends HTML email verification via Nodemailer, with an instant verification button for local preview.
- [x] **User login with JWT-based authorisation**: Validates credentials and checks email verification status before issuing signed JWTs with 7-day expiration.
- [x] **Forgot password flow (email reset link)**: Secure 60-minute expiring tokens, Nodemailer reset instructions email, and dedicated reset password page.
- [x] **Dashboard displaying available pizza varieties**: Rich menu catalog showcasing Neapolitan chef specialties (Margherita, Farmhouse, Peri Peri, Truffle Mushroom, etc.) with ingredient breakdowns, prices, and direct "Customize" CTA.
- [x] **Custom pizza builder flow**:
  - [x] **Step 1: Choose a pizza base** (5 freshly-kneaded options: *Hand Tossed Thin Crust, Deep Dish Pan, Cheese Burst, Gluten-Free Cauliflower, Whole Wheat Sourdough*).
  - [x] **Step 2: Choose a sauce** (5 simmered options: *Classic San Marzano Tomato, Creamy Garlic Alfredo, Spicy Peri Peri Marinara, Basil Pesto Genovese, Smoky Chipotle BBQ*).
  - [x] **Step 3: Choose a cheese type** (*Fior di Latte Mozzarella, Sharp Aged Cheddar, Whipped Ricotta, Vegan Mozzarella, Smoked Provolone & Gouda*).
  - [x] **Step 4: Choose vegetables (multiple select)** (*Tricolor Bell Peppers, Kalamata Olives, Caramelized Onions, Pickled Jalapeños, Button Mushrooms, Cherry Tomatoes, Sweet Corn, Baby Spinach*).
  - [x] **Live Interactive Pizza Canvas Visualizer**: Real-time visual representation updating crust colors, sauce textures, cheese melts, and scattered toppings as they are chosen.
- [x] **Order summary page before payment**: Complete itemized breakdown (crust, sauce, cheese, toppings), pricing computation (subtotal, 5% GST, free delivery above ₹500), and delivery address input.
- [x] **Razorpay checkout integration (test mode)**: Razorpay SDK integration with test keys, test gateway dialog, and "Success" confirmation button that confirms payment and triggers atomic stock decrement.
- [x] **Real-time order status display on user dashboard**: Dynamic timeline stepper tracking **`Order Received` → `In Kitchen` → `Sent to Delivery` → `Delivered`** with live Socket.IO events, timestamped status history, and fallback auto-polling.

---

### 🛡️ Admin Side
- [x] **Separate admin login**: Distinct admin portal route (`/admin/login`) with separate authentication endpoint (`/api/auth/admin/login`) inaccessible from the public user registration flow.
- [x] **Inventory dashboard showing current stock of**: Pizza bases, sauces, cheeses, and vegetables with categorization, stock levels, safety thresholds, and visual badges (*In Stock*, *Low Stock*, *Out of Stock*).
- [x] **Stock automatically decremented after each order**: Atomic inventory updates decrement crusts, sauces, cheeses, and all selected vegetable units immediately upon payment verification.
- [x] **Manual stock update capability for each inventory item**: Fast adjust buttons (`+10`, `+1`, `-1`, `-5`) and a comprehensive modal to edit item name, price, stock quantity, and safety threshold.
- [x] **Automated email notification to admin when stock falls below configurable threshold**: Implemented using **`node-cron`** scheduled jobs and **`nodemailer`**. Includes a "Run Stock Check & Notify" button to trigger the check on demand and view the generated email.
- [x] **Order management panel**: Real-time panel displaying all incoming customer orders with complete customer details, itemized pizza recipes, and one-click status transition buttons (`Order Received`, `In Kitchen`, `Sent to Delivery`, `Delivered`).
- [x] **Status change reflected in real-time on user dashboard**: Updating any order status emits an immediate Socket.IO event to the customer's room (`order_<id>`), flipping the stepper in real time without refreshing.

---

## 🚀 Quick Start & Live Access

The backend, frontend, and MongoDB services are running:

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pizzadelivery.com` | `Admin@123456` | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) |
| **Verified Customer** | `user@example.com` | `User@123456` | [http://localhost:5173/login](http://localhost:5173/login) |

*(Both login screens include convenient "Auto-Fill" buttons for instant 1-click evaluation.)*

---

## 🧪 Automated End-to-End Test Suite

An end-to-end integration test suite is located at `backend/test-suite.js`. It exercises all 23 core requirements:

```bash
cd backend
node test-suite.js
```

**Results:**
```
========================================
🎉 TEST SUMMARY: 23 PASSED, 0 FAILED
========================================
```

---

## 🏗️ Architecture & Tech Stack

```
d:\PizzaDelivery\
├── backend/
│   ├── src/
│   │   ├── config/db.js               # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, Verify, Login, AdminLogin, ForgotPassword
│   │   │   ├── inventoryController.js  # Stock levels, Manual updates, Low-stock alerts
│   │   │   ├── orderController.js      # Razorpay order, Payment verification, Stock decrement
│   │   │   └── pizzaController.js      # Signature pizza varieties catalog
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # JWT Protect and AdminOnly authorization
│   │   ├── models/
│   │   │   ├── InventoryItem.js        # Bases, Sauces, Cheeses, Veggies with threshold
│   │   │   ├── Order.js                # Order items, Pricing, Status history, Razorpay details
│   │   │   ├── PizzaVariety.js         # Predefined pizza catalog
│   │   │   └── User.js                 # Users & Admins with verification and reset tokens
│   │   ├── routes/                     # Express API routers
│   │   ├── services/
│   │   │   └── stockAlertService.js    # Node-Cron scheduled inventory scanner & email dispatcher
│   │   ├── utils/
│   │   │   └── mailer.js               # Nodemailer transporter & HTML email templates
│   │   ├── seed.js                     # Master database seeder
│   │   └── server.js                   # Express HTTP + Socket.IO server setup
│   └── test-suite.js                   # Automated verification test script
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js                # Axios instance with JWT interceptors
    │   │   └── socket.js               # Socket.IO client instance
    │   ├── components/
    │   │   ├── Navbar.jsx              # Responsive header with cart & role badges
    │   │   ├── Footer.jsx              # Footer with admin portal links
    │   │   └── PizzaPlateVisualizer.jsx# Dynamic 2D pizza canvas visualizer
    │   ├── context/
    │   │   ├── AuthContext.jsx         # User & Admin authentication state
    │   │   └── CartContext.jsx         # Cart items, pricing, and persistence
    │   └── pages/
    │       ├── Home.jsx                # Signature menu showcase & active order banner
    │       ├── CustomBuilder.jsx       # 4-step custom pizza builder
    │       ├── CartSummary.jsx         # Order review & Razorpay test checkout
    │       ├── OrderDetails.jsx        # Real-time WebSocket order tracker
    │       ├── MyOrders.jsx            # Customer order history
    │       ├── Login.jsx / Register.jsx# Customer authentication & verification
    │       ├── ForgotPassword.jsx      # Password reset flow
    │       └── admin/
    │           ├── AdminLogin.jsx      # Dedicated admin portal login
    │           ├── AdminLayout.jsx     # Admin navigation tabs & access guard
    │           ├── AdminInventory.jsx  # Inventory dashboard & manual editor
    │           ├── AdminOrders.jsx     # Live kitchen dispatch & status updater
    │           └── AdminEmails.jsx     # Nodemailer log & Ethereal preview links
```

---

## 📦 Scheduled Jobs & Email Alerts

- **Node-Cron**: Runs periodically according to `CRON_SCHEDULE` (default: every 15 minutes `*/15 * * * *`). It scans all active inventory items where `stockQuantity < threshold`.
- When triggered, it compiles an alert report and dispatches an HTML email to the admin with a summary table of depleted ingredients.
- On-Demand Trigger: Admins can click **"Run Stock Check & Notify"** in the Admin Inventory or Email Audit tab to run the check immediately.
- Ethereal Email: By default, the system automatically spins up a Nodemailer test account and outputs web preview URLs (`https://ethereal.email/...`), enabling inspection of verification emails, reset tokens, and stock warnings directly in any browser.

