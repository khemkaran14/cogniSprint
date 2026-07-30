# AI Career Shield

A membership-gated interview-prep platform for AI tools (Claude, GitHub Copilot,
Cursor, Google Antigravity, OpenAI, Gemini, and more). Free users get every
Easy question; Pro and Premium subscribers unlock Medium and Hard answers via
Razorpay-billed subscriptions. Includes a full admin panel for managing users,
subscriptions, payments, and content.

```
server/   Express + MongoDB (Mongoose) API, JWT auth, Razorpay subscriptions
client/   React + Vite frontend (public site + admin dashboard)
```

## 1. Local development

Requirements: Node.js 18+, a MongoDB instance (local `mongod` or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster), and a
[Razorpay](https://dashboard.razorpay.com) test account.

```bash
# Backend
cd server
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET, RAZORPAY_* keys
npm install
npm run seed                # creates sample tools/categories/questions + admin user
npm run dev                  # http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
npm run dev                  # http://localhost:5173, proxies /api to :5000
```

Log in with the admin credentials from `server/.env` (`ADMIN_EMAIL` /
`ADMIN_PASSWORD`) and visit `/admin` to manage content, users, subscriptions,
and payments.

## 2. Environment variables (`server/.env`)

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign session tokens |
| `CLIENT_URL` | Origin of the deployed frontend, for CORS |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Set when you configure the webhook below |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `npm run seed` to create the first admin |

## 3. Razorpay setup

1. Create a Razorpay account and generate API keys (test mode first).
2. In **Settings → Webhooks**, add `https://yourdomain.com/api/payments/webhook`
   subscribed to the `payment.captured` event, and copy its signing secret into
   `RAZORPAY_WEBHOOK_SECRET`. This is a safety net that activates a
   subscription even if the customer's browser closes right after paying,
   before the client-side verification call completes.
3. Go live by switching to live API keys once you're ready to accept real
   payments.

## 4. Deploying to a Hostinger VPS

This app runs as a **single Node.js process** that serves both the API and the
built React app, which keeps a VPS deployment simple. This requires a
**Hostinger VPS or Cloud Hosting plan** (shared/Business hosting cannot run a
persistent Node process) — check what tier you're on before starting.

```bash
# On the VPS
sudo apt update && sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

git clone <your-repo-url> ai-career-shield
cd ai-career-shield/server
cp .env.example .env        # edit with production values, NODE_ENV=production
npm install
npm run seed                 # first deploy only

cd ../client
npm install
npm run build                # outputs client/dist, served by the API in production

cd ../server
pm2 start src/index.js --name ai-career-shield
pm2 save
pm2 startup                  # then run the printed command so PM2 survives reboots
```

Point Nginx at the Node process (default port 5000) as a reverse proxy, and
issue a free TLS certificate with certbot:

```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo certbot --nginx -d yourdomain.com
```

If you'd rather use MongoDB Atlas instead of installing MongoDB on the VPS
(simpler, has a free tier, and separates your database from the app server),
just point `MONGO_URI` at the Atlas connection string — no other changes
needed.

### Redeploying after code changes

```bash
git pull
cd server && npm install && cd ../client && npm install && npm run build
pm2 restart ai-career-shield
```

## 5. Content model

- **Tool** — an AI product (Claude, Cursor, …), grouped as `assistants`,
  `agentic`, or `foundation` for the home page tabs.
- **Category** — a feature area within a tool (e.g. Claude → "Claude Code").
- **Question** — belongs to a tool + category, has a `difficulty` of
  `easy` / `medium` / `hard`, which maps directly to the plan required to
  read its answer (`free` / `pro` / `premium` — see
  `server/src/utils/plans.js`).

The seed script (`server/src/seed/seed.js`) populates a realistic tool/category
structure with clearly-marked placeholder questions (except for "Claude Code",
which has real hand-written sample content) — replace them via
**Admin → Content — Questions** before launch.
