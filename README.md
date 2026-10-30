# LocalConnect — MERN + AI/ML Starter

A beginner-friendly starter for a local-services marketplace connecting customers with plumbers, electricians, carpenters, painters and other professionals.

## Included
- React + Vite frontend starter
- Express + MongoDB backend
- JWT authentication and bcrypt password hashing
- Provider service listings with admin approval
- Public search for approved listings
- Python FastAPI ML service with a small sentiment-analysis demo
- `.env.example` files and setup instructions

This is a starter project, not a production-ready marketplace. Before production, add comprehensive tests, rate limiting, email verification, secure cookie/token strategy, provider identity checks, robust booking conflict prevention, upload validation and monitoring.

## Prerequisites
- Node.js 20+ and npm
- MongoDB local install or MongoDB Atlas connection string
- Python 3.10+

## 1. Configure environment files
Copy:
- `server/.env.example` to `server/.env`
- `ml-service/.env.example` to `ml-service/.env` (optional for this demo)

Set a strong `JWT_SECRET` and your MongoDB URI in `server/.env`.

## 2. Start the backend
```bash
cd server
npm install
npm run dev
```
Default API: `http://localhost:5000`

## 3. Start the frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## 4. Start the ML service (optional)
In another terminal:
```bash
cd ml-service
python -m venv venv
```
Windows:
```bash
venv\Scripts\activate
```
macOS/Linux:
```bash
source venv/bin/activate
```
Then:
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
ML API docs: `http://localhost:8000/docs`

## Demo workflow
1. Register an account with role `provider`.
2. Log in, then use the provider form to submit a service listing.
3. New listings are `pending` and are not shown in public search.
4. Promote a separate account to admin by setting its `role` to `admin` in MongoDB, then log in as that account.
5. Use the admin page to approve listings.
6. Search approved listings from the homepage.

Never use a publicly accessible admin-registration option in a real deployment. This starter intentionally does not allow users to self-register as admin.

## API overview
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/services` (provider)
- `GET /api/services` (public approved listings)
- `GET /api/services/mine` (provider)
- `PATCH /api/services/:id` (listing owner)
- `PATCH /api/admin/services/:id/approval` (admin)
- `POST /api/ml/analyze-review` (Express proxy to Python ML service)

## AI/ML learning roadmap
1. Start with the included sentiment demo; understand the limitations of its tiny demonstration dataset.
2. Replace the sample data with a larger, properly labeled dataset.
3. Evaluate using a train/test split, classification report and confusion matrix.
4. Build service recommendations from category, area, availability, rating and historical interaction data.
5. Only build demand forecasting once you have sufficient genuine time-stamped booking history.
