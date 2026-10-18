# টঙ্গী বাসা ভাড়া — Tongi Rental Marketplace

Production-style rental marketplace for Tongi City, Gazipur, Bangladesh.

## Stack

- **Frontend:** Next.js App Router, Tailwind CSS v4, next-themes, Framer Motion, Leaflet, jsPDF
- **Backend:** Express (MVC) on `PORT=8000`, namespaced at `BASE_URL=/backend-api/v1`
- **Data:** MongoDB Atlas + Mongoose (2dsphere + text indexes)

## Run locally

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
npm run seed
npm run dev
```

- Web: http://localhost:3000
- API health: http://localhost:8000/backend-api/v1/health

## Demo accounts (after seed)

| Role | Email | Password |
| --- | --- | --- |
| Tenant | tenant@tongirental.bd | Password123! |
| Landlord | landlord@tongirental.bd | Password123! |
| Admin | admin@tongirental.bd | Password123! |

Environment lives in the repo-root `.env` (loaded by `backend/config/env.js`) and `frontend/.env.local` for public API URL.
