# AI Career Shield

A membership-gated interview-prep platform for AI tools (Claude, GitHub Copilot,
Cursor, Google Antigravity, OpenAI, Gemini, and more). Free users get every
Easy question; Pro and Premium subscribers unlock Medium and Hard answers via
Razorpay-billed subscriptions (monthly or yearly). Includes a full admin panel
for managing users, subscriptions, payments, and content, plus search,
bookmarks/progress tracking, and basic SEO (per-page meta tags, sitemap,
robots.txt).

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

## 6. Since the initial build

- **Security**: `helmet` on every response; rate limiting on auth (login/
  register) and payment endpoints, plus a lighter cap across the whole API.
- **Plan expiry**: a daily job (`server/src/jobs/planExpiry.js`) downgrades
  lapsed Pro/Premium users back to Free. Answer-gating never trusts the stored
  `plan` field alone — `getEffectivePlan()` in `utils/plans.js` checks
  `planExpiresAt` directly, so a lapsed subscription is never honored even in
  the window before that job next runs.
- **Search**: `GET /api/content/search?q=` searches question text across
  every tool, respecting the same answer gating as everywhere else. There's a
  search box in the navbar and a `/search` results page.
- **Bookmarks & progress**: signed-in users can save a question for later or
  mark it practiced (icons on every question card); both show up on the
  Dashboard, along with a practiced/total count.
- **Yearly billing**: Pro and Premium can be billed monthly or yearly (about
  17% off) — toggle on the Pricing page. `User.billingPeriod` is stored
  alongside `plan` so MRR in the admin overview correctly treats a yearly
  subscriber as a monthly-equivalent amount rather than double-counting a
  year's revenue in one month.
- **SEO**: `/sitemap.xml` and `/robots.txt` are generated server-side from the
  live tools/categories; the client sets a per-page `<title>` and meta
  description on Home, Tool pages, Pricing, and Search.
