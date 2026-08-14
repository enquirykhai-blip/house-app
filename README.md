# House App

Private household app for 2 people (Khai + Wife). Mobile-first, real-time
synced via Firebase Firestore. No public signup — only 2 accounts, ever.

Tabs: **Dashboard**, **Tarikh Penting** (important dates), **Senarai Runcit**
(groceries), **Tugasan Rumah** (house tasks).

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Firebase Authentication (Email/Password) + Firestore
- Firebase Hosting (Spark / free plan — no billing needed)

## Setup

### 1. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. Stay on the **Spark (free)** plan.
3. In the project, enable:
   - **Authentication** → Sign-in method → **Email/Password**
   - **Firestore Database** → Create database (start in **production mode**)

### 2. Configure the app

1. In Firebase console → Project settings → Your apps → **Add app (Web)**.
2. Copy the config values into a local `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. from the
   Firebase config snippet.

3. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

### 3. Bootstrap the 2 accounts (one-time)

`firestore.rules` locks every collection to whoever's UID is stored in the
`household/config` doc — but that doc doesn't exist until someone signs up.
So bootstrap in two phases:

1. **Deploy the temporary setup rules** (only lets a signed-in user read/write
   the single `household/config` doc, nothing else):

   ```bash
   firebase deploy --only firestore:rules --project <your-project-id> \
     # first, temporarily point firebase.json's "rules" at firestore.rules.setup
   ```

   Or just paste the contents of `firestore.rules.setup` into the Firestore
   Rules tab in the console and **Publish**.

2. Open the app → you'll land on **Setup House App** (the signup screen,
   only shown while fewer than 2 accounts exist). Sign up the first account,
   choosing "Khai" or "Wife". Log out, sign up the second account with the
   other role. After both exist, the signup route auto-redirects to login.

3. **Deploy the real rules** (make sure `firebase.json` points at
   `firestore.rules`, the default — no editing needed, it reads the
   whitelist straight from `household/config`):

   ```bash
   firebase deploy --only firestore:rules --project <your-project-id>
   ```

From this point on, the app is fully locked to those 2 accounts — signup is
closed, and Firestore rejects any other UID.

### 4. Deploy hosting (optional)

```bash
npm run build
firebase deploy --only hosting --project <your-project-id>
```

Or skip this and just run `npm run dev` on your own devices — hosting isn't
required for the app to work for just the two of you.

## Data model

- `important_dates/{id}` — title, date, category (bil/anniversary/lain),
  repeat (none/monthly/yearly), notes, createdBy, createdAt. Passed
  repeating dates auto-roll forward to their next occurrence.
- `groceries/{id}` — item, category (dapur/mandian/lain), quantity,
  isBought, addedBy, createdAt, boughtAt.
- `tasks/{id}` — title, assignedTo (khai/wife/both), dueDate, isDone,
  createdBy, createdAt, completedAt.
- `household/config` — single doc: khaiName, wifeName, khaiUid, wifeUid.

All three collections sync in real time (`onSnapshot`) between both
accounts — no refresh needed.
