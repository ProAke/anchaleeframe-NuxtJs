# Anchalee Frame — Nuxt storefront and back office

A Thai-language storefront and order-management workspace for Anchalee Frame. Built with Nuxt 3, Vue, TypeScript, and MariaDB. The storefront uses the company's current logo and a small set of catalog examples and product images referenced from the official Anchalee Frame website.

## Features

- Mobile-first storefront, searchable catalog, product details, cart, streamlined checkout, and order tracking.
- Checkout supports configurable PromptPay QR, bank transfer, cash on delivery, and a merchant-defined manual payment option; payment verification stays manual until a real provider/webhook is integrated.
- Customers can optionally sign in with LINE Login, save delivery details, and reuse them at checkout. LINE credentials are server-side environment variables and are never stored in the storefront settings.
- Customers can choose the store's truck or a private carrier; delivery estimates and the Bangkok/metro free-delivery threshold are configurable.
- MariaDB schema for catalog, customers, LINE accounts/sessions, orders, order items, inventory movements, shipments, settings, and admin sessions. Tables are initialized on the first database-backed request.
- Admin workspace for dashboard metrics, products, inventory adjustments, order/payment statuses, shipment carriers and tracking numbers, customers, reports, and store settings.
- Security headers in production, HTTP-only session cookies, checkout/login/tracking rate limits, and server-authoritative price, stock, shipping, and payment-method validation.
- Development-only in-memory demo mode when no database is configured. It is reset when the server restarts.

## Requirements

- Node.js 22 or later and npm.
- MariaDB 10.6+ (or the included MariaDB 11.4 Docker service) for persistent operation.

## Local development

```sh
npm ci
cp .env.example .env
# Start MariaDB separately, then set the NUXT_DATABASE_* values in .env.
npm run dev
```

The site runs at `http://localhost:3000`. With no database configured, Nuxt development mode enables an in-memory demo catalog and admin so the storefront and back office can be previewed. Demo sign-in:

- Email: `admin@anchaleeframe.com`
- Password: `Frame2026!`

These credentials and demo data are for local development only. Demo state is not persistent; restarting the server resets products, stock, orders, settings, and shipments. Demo access is disabled in production.

## Run with Docker Compose

1. Copy `.env.example` to `.env`.
2. Replace the database and admin passwords with unique secrets.
3. Run:

   ```sh
   docker compose up -d --build
   ```

4. Open `http://localhost:3000`. The app waits for MariaDB to become healthy; database tables and the initial catalog are created automatically on the first database request.

The MariaDB data is stored in the `mariadb_data` Docker volume. Back it up before upgrades or destructive operations. To stop the app without removing data, run `docker compose down`; do not add `-v` unless you intend to delete the database volume.

## Production configuration

Set these environment variables in the deployment environment (not in source control):

| Variable | Description |
| --- | --- |
| `NUXT_DATABASE_HOST` | MariaDB hostname (Compose uses `mariadb`). |
| `NUXT_DATABASE_PORT` | MariaDB port, normally `3306`. |
| `NUXT_DATABASE_NAME` | Database/schema name. Required to enable persistent mode. |
| `NUXT_DATABASE_USER` | Application database user. |
| `NUXT_DATABASE_PASSWORD` | Application database password. |
| `NUXT_ADMIN_EMAIL` | Email for the first administrator. |
| `NUXT_ADMIN_PASSWORD` | Password used to create the first administrator; choose a unique secret. |
| `NUXT_LINE_LOGIN_CHANNEL_ID` | LINE Login channel ID (optional). |
| `NUXT_LINE_LOGIN_CHANNEL_SECRET` | LINE Login channel secret (optional; keep private). |
| `NUXT_LINE_LOGIN_REDIRECT_URI` | Exact callback URL registered with LINE, normally `https://your-domain/api/customer/line/callback`. |

The initial admin user is created only if the configured email does not already exist. Existing admin passwords are not overwritten by changing the environment variable. Create or rotate admin accounts using a secure operational process. Serve the production app behind HTTPS and a reverse proxy, restrict database access to the app network, and keep regular database backups.

## Before accepting live orders

- Verify every seeded product title, SKU, price, promotion, stock count, and image. Several records are representative catalog examples, and initial stock values are demo inventory—not a live stock feed. The product image URLs currently reference the official website; replace them with assets you own or are authorized to use if needed.
- Set the PromptPay ID and/or bank account details in **Admin → Store settings** before enabling those payment options. These identifiers are intentionally shown to customers after checkout. The custom payment method is manual instructions (optionally with an HTTPS link), not a built-in card gateway. No payment is automatically verified; staff must check receipts/statements and update the order payment status.
- Set company-truck and private-carrier rates in **Admin → Store settings**. The default estimate is ฿150 for the store truck and ฿120 for a private carrier; the store-truck estimate becomes free at ฿10,000 for the Bangkok/metro area. Rates are examples, not a carrier quote; confirm oversized or out-of-area deliveries with the customer.
- To enable LINE Login, create a LINE Login channel, configure the callback URL `https://your-domain/api/customer/line/callback` in the LINE Developers console, and set all three `NUXT_LINE_LOGIN_*` variables. Use the exact same HTTPS callback URL in the environment. A persistent MariaDB database is required for customer accounts and sessions. LINE Login cannot be tested until valid channel credentials and an externally reachable callback are configured.
- Admin/customer sessions use HTTP-only cookies; production adds security headers and HTTPS-only cookies. Unsafe browser requests are checked against their Origin, and sensitive public actions have per-process rate limits. The reverse proxy must preserve the public `Host` via `X-Forwarded-Host`, sanitize forwarded IP headers, and enforce HTTPS. Deployments with multiple app instances should put a shared rate limiter at the proxy or use a shared rate-limit store. Restrict database access to the app network.
- Shipment carriers and tracking numbers are recorded by staff in the admin. Carrier API integrations, automated label purchase, customer email/SMS notifications, and returns processing are not included.
- The official Anchalee Frame logo/product image links are hotlinked for the preview. Confirm image-use permissions, availability, and long-term hosting before production.

Run checks before deploying:

```sh
npm run typecheck
npm run build
```
