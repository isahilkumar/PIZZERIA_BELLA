# 🚀 Pizzeria Bella - Render Deployment Guide

This guide explains how to deploy the Pizzeria Bella application to **Render** with **MongoDB Atlas**.

---

## 🍃 1. MongoDB Atlas Setup (One-time, 2 minutes)

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com) using your credentials:
   - **Email**: `mailsahil1008@gmail.com`
   - **Password**: `@Sahil4518`
2. **Network Access (Whitelist IP)**:
   - Go to **Network Access** in the left sidebar under *Security*.
   - Click **+ Add IP Address** $\rightarrow$ select **Allow Access from Anywhere** (`0.0.0.0/0`) $\rightarrow$ click **Confirm**.
   *(This allows Render's cloud servers to connect to your database).*
3. **Get Your Connection String**:
   - Go to **Database** $\rightarrow$ Click **Connect** on your cluster.
   - Choose **Drivers (Node.js)**.
   - Copy the URI, which looks like:
     ```
     mongodb+srv://mailsahil1008%40gmail.com:%40Sahil4518@cluster0.xxxxxx.mongodb.net/pizza_delivery?retryWrites=true&w=majority
     ```
     *(Note: Special character `@` in username and password is URL-encoded as `%40`).*

---

## 📦 2. Deploying on Render (Free & Fast)

### Option A: Two Services (Recommended)
Deploy Backend as a **Web Service** and Frontend as a **Static Site**.

#### Service 1: Backend (Web Service)
1. On [render.com](https://dashboard.render.com), click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Name**: `pizzeria-bella-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://mailsahil1008%40gmail.com:%40Sahil4518@cluster0.xxxxxx.mongodb.net/pizza_delivery?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `supersecretpizzadeliverysigningkey2026!@#` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `ADMIN_EMAIL` | `kumarsahil4447@gmail.com` |
   | `CLIENT_URL` | `https://your-frontend-service.onrender.com` *(or `*`)* |
   | `EMAIL_SERVICE` | `gmail` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `465` |
   | `SMTP_USER` | `kumarsahil4447@gmail.com` |
   | `SMTP_PASS` | `tgcjdooqhxnsrthn` |
   | `SMTP_FROM` | `Pizzeria Bella <kumarsahil4447@gmail.com>` |
5. Click **Create Web Service**.

#### Service 2: Frontend (Static Site)
1. On [render.com](https://dashboard.render.com), click **New +** $\rightarrow$ **Static Site**.
2. Connect your GitHub repository.
3. Configure:
   - **Name**: `pizzeria-bella`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://pizzeria-bella-api.onrender.com` *(your backend Render URL)* |
5. Under **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
   *(This ensures client-side routing like `/custom-builder` works on refresh).*

---

## 🍕 3. Seeding Your Atlas Database

To populate all 5 artisanal sourdough crusts, 5 crafted sauces, 4 premium cheeses, 9 fresh toppings, 8 signature pizzas, and the admin account into MongoDB Atlas:

From your local machine or terminal:
```bash
cd backend
# Put your Atlas URI in backend/.env under MONGO_URI
node src/seed.js
```
All data will be loaded into MongoDB Atlas in seconds!
