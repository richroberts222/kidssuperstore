# Kids Super Store

A playful, lemonade-stand-style mock ecommerce site (cookies, jewelry, crafts, etc.) with a **React** frontend and an **Express** backend.

Everything is mocked (no real payments). The full flow works end-to-end:
- Browse products → add to cart → checkout → order confirmation
- Sign up / sign in
- Email verification is simulated by the backend printing a clickable verification link (token)
- A simple dashboard lets you add products (including image URLs or pasted data-URLs)

## Prereqs
- Node.js 20+ (you have it)

## Install
From the repo root:

```bash
npm install
```

## Run (two shells)

### Shell 1: backend
```bash
npm run dev:backend
```
Backend runs on `http://localhost:4000`.

### Shell 2: frontend
```bash
npm run dev:frontend
```
Frontend runs on `http://localhost:5173`.

## Run (single command)
```bash
npm run dev
```

## Email verification simulation
When you sign up, the backend prints a `VERIFY:` link in the backend terminal. Click it (or paste it into a browser) to verify the account.

## Notes
- Data is stored in memory only; restarting the backend clears everything.
