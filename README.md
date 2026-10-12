# Formcraft

Formcraft is a Next.js form builder with account signup/login, published public forms, and a creator dashboard for reviewing submissions.

## Requirements

- Node.js 20.9 or newer
- npm
- A MongoDB database (MongoDB Atlas is suitable for deployment)

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the MongoDB connection string and two separate, random JWT secrets. Generate each secret with:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Do not commit `.env` or expose these values in client-side variables.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000>.

## Deploy

The app can be hosted on Vercel or another Node.js host that supports Next.js 16.

### Vercel

1. Push this project to a Git provider and import the repository in Vercel. Vercel should detect Next.js automatically; use `npm run build` as the build command.
2. In the Vercel project settings, add these environment variables for **Production** (and Preview if desired):
   - `DB_URL` — the MongoDB URI for the production database.
   - `ACCESS_TOKEN_SECRET` — a unique random secret.
   - `REFRESH_TOKEN_SECRET` — a different unique random secret.
3. In MongoDB Atlas, create a database user with access only to the app database, and allow connections from the hosting provider. Atlas network rules must permit the deployed app to reach the cluster.
4. Redeploy after setting environment variables. Test signup/login, create a form, publish it, and submit through its `/respond/<formId>` link.

### Other Node.js hosts

Configure the same three environment variables in the hosting provider, install dependencies from `package-lock.json`, run `npm run build`, and start with `npm run start`. Use a Node.js runtime version of 20.9 or newer. The host must support the Next.js Node.js server runtime; a static-only host/export is not supported because the app uses API routes and MongoDB.

## Form sharing

Only forms with the `published` status are available to customers. In the dashboard, use the QR-code action next to a published form to display its scannable code, copy its respondent URL, or download the QR code as an SVG. The QR code points to `/respond/<formId>` on the current site domain. Draft and archived forms are intentionally not public. Responses are anonymous.

When sharing a locally generated link such as `http://localhost:3000/respond/<formId>`, it only works on the computer running the app. For customers to scan and open it on their own devices, deploy the app first and use the QR code from your deployed dashboard.

## Help and settings

The dashboard sidebar links to the Help Center (`/help`) for form publishing, response collection, QR sharing, and common questions. Settings (`/settings`) lets signed-in users select light, dark, or system appearance and view their account details.
