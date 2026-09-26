# StrayCare Goa — Setup Guide

A web app connecting NGOs and pet owners: a community feed, a map + heatmap
of stray animal / rabies reports, a breeding & sell marketplace, and a demo
pet shop.

## Folder structure

```
stray-animal-app/
├── backend/                 ← Node.js + Express + MongoDB API
│   ├── server.js            ← entry point, run this to start the API
│   ├── seed.js               ← run once to fill the shop with sample products
│   ├── package.json
│   ├── .env.example          ← copy to .env and fill in your own values
│   ├── config/
│   │   └── db.js             ← connects to MongoDB
│   ├── models/                ← one file per database "table"
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── AnimalPin.js
│   │   ├── Product.js
│   │   └── BreedingListing.js
│   ├── middleware/
│   │   ├── auth.js            ← login/role checks
│   │   └── upload.js          ← handles photo uploads
│   ├── routes/                 ← one file per feature/API section
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── animalRoutes.js
│   │   ├── shopRoutes.js
│   │   └── breedingRoutes.js
│   └── uploads/                 ← uploaded photos get saved here automatically
│
└── frontend/                  ← plain HTML/CSS/JS, one page per feature
    ├── index.html              ← login page
    ├── signup.html
    ├── feed.html                ← community feed + report a stray/rabies case
    ├── map.html                 ← map + heatmap
    ├── breeding.html             ← breeding/sell marketplace
    ├── shop.html                  ← pet shop
    ├── css/
    │   ├── style.css              ← SHARED styles (navbar, buttons, cards)
    │   ├── auth.css                ← only index.html + signup.html
    │   ├── feed.css                ← only feed.html
    │   ├── map.css                  ← only map.html
    │   ├── breeding.css              ← only breeding.html
    │   └── shop.css                  ← only shop.html
    └── js/
        ├── api.js                    ← SHARED: all backend requests go through here
        ├── nav.js                     ← SHARED: builds the navbar on every page
        ├── auth.js                     ← only index.html + signup.html
        ├── feed.js                      ← only feed.html
        ├── map.js                        ← only map.html
        ├── breeding.js                    ← only breeding.html
        └── shop.js                         ← only shop.html
```

**Why it's split this way:** every page has its OWN `.css` and `.js` file.
If you want to redesign the Shop page tomorrow, you only touch `shop.html`,
`shop.css`, and `shop.js` — nothing else breaks. Only `style.css`, `api.js`
and `nav.js` are shared on purpose (navbar + backend connection + colors
should look the same everywhere).

## Step 1 — Install these tools first

1. **Node.js** (includes npm) — download the LTS version from https://nodejs.org
   Check it worked: open a terminal and run `node -v`
2. **VS Code** (or any code editor) — https://code.visualstudio.com
3. **VS Code extension: "Live Server"** (by Ritwick Dey) — lets you open the
   frontend HTML files with auto-reload, instead of double-clicking the file.
4. **MongoDB Atlas account** (free, cloud database, no local install needed)
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free cluster
   - Click "Connect" → "Drivers" → copy the connection string
     (looks like `mongodb+srv://username:password@cluster0...`)
   - Under "Network Access", allow access from anywhere (0.0.0.0/0) for now

## Step 2 — Set up the backend

Open a terminal inside the `backend` folder and run:

```bash
cd backend
npm install
```

This downloads all the packages listed in `package.json` (Express, Mongoose,
bcryptjs, jsonwebtoken, multer, cors, dotenv) into a `node_modules` folder.

Then:

```bash
cp .env.example .env
```

Open the new `.env` file and paste in:
- `MONGO_URI` → your MongoDB Atlas connection string from Step 1
  (replace `<password>` in it with your real database user password)
- `JWT_SECRET` → any long random string you make up, e.g. `myGoaStrayApp2026Secret!`
- `PORT` → leave as `5000` unless that port is already used on your computer

Now seed the shop with sample products (run once):

```bash
node seed.js
```

Start the backend:

```bash
npm run dev
```

You should see `MongoDB connected successfully` and
`Server running on http://localhost:5000` in the terminal. Leave this
terminal running.

(`npm run dev` uses `nodemon`, which restarts the server automatically
whenever you edit a backend file. If you don't have nodemon, run
`npm install -g nodemon` once, or just use `npm start` instead.)

## Step 3 — Run the frontend

The frontend needs NO installation — it's plain HTML/CSS/JS.

- In VS Code, right-click `frontend/index.html` → "Open with Live Server"
- This opens the login page in your browser (usually at `http://127.0.0.1:5500`)

Make sure the backend (Step 2) is still running in its own terminal —
the frontend talks to it at `http://localhost:5000`.

## Step 4 — Try it out

1. Go to the Sign Up page → create one "Pet Owner" account and one "NGO" account
2. Log in as the Pet Owner → go to Feed → submit a "Report a stray animal",
   allow location access when your browser asks
3. Go to the Map & Heatmap page → you should see your report as a pin,
   and as a yellow (or red, for rabies) blob in Heatmap view
4. Log in as the NGO account → open the same pin on the map → change its
   status to "In Progress" or "Resolved"
5. Try the Shop page → add items with +/-, click "View Bill" → see the
   auto-calculated total → "Pay Now" is intentionally a demo button

## Notes on what's simplified (good next steps once this works)

- **Real-time map updates** currently use polling (refetch every 15 seconds).
  A future upgrade would be Socket.io for instant push updates.
- **Payments** are not implemented anywhere — the Shop's "Pay Now" button is
  a placeholder on purpose.
- **Image storage** currently saves photos on the same server's disk. If you
  deploy this online later (e.g. Render, Railway), you'd switch to a cloud
  storage service like Cloudinary, since most hosts don't keep uploaded
  files permanently.
- **Breeding matching logic** (e.g. suggesting compatible pets) isn't built —
  right now it's just a listing board, which is a good v1.
