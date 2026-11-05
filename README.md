# Anchalee Frame — Nuxt storefront and back office

A Thai-language storefront and order-management workspace for Anchalee Frame. Built with Nuxt 3, Vue, TypeScript, and MariaDB. The storefront uses the company's current logo and a small set of catalog examples and product images referenced from the official Anchalee Frame website.

## Features

- Responsive storefront, searchable catalog, product details, cart, checkout, and order tracking.
- MariaDB schema for catalog, customers, orders, order items, inventory movements, shipments, settings, and admin sessions. Tables are initialized on the first database-backed request.
- Admin workspace for dashboard metrics, products, inventory adjustments, order/payment statuses, shipment carriers and tracking numbers, customers, reports, and store settings.
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

The initial admin user is created only if the configured email does not already exist. Existing admin passwords are not overwritten by changing the environment variable. Create or rotate admin accounts using a secure operational process. Serve the production app behind HTTPS and a reverse proxy, restrict database access to the app network, and keep regular database backups.

## Before accepting live orders

- Verify every seeded product title, SKU, price, promotion, stock count, and image. Several records are representative catalog examples, and initial stock values are demo inventory—not a live stock feed. The product image URLs currently reference the official website; replace them with assets you own or are authorized to use if needed.
- The cart's shipping fee is an estimate. The official site's published terms describe free shipping for qualifying orders of at least ฿10,000 in Bangkok and nearby areas, while other destinations are quoted by region and package size. The checkout does not automatically determine destination eligibility; confirm the final shipping amount with the customer before dispatch.
- COD and bank transfer are recorded as order methods, but there is no payment-gateway or bank-statement integration. Add and verify the business's payment instructions before offering online transfer.
- Shipment carriers and tracking numbers are recorded by staff in the admin. Carrier API integrations, automated label purchase, customer email/SMS notifications, and returns processing are not included.
- The official Anchalee Frame logo/product image links are hotlinked for the preview. Confirm image-use permissions, availability, and long-term hosting before production.

Run checks before deploying:

```sh
npm run typecheck
npm run build
```
