# Full Stack Development – Programming Exercise
**Student:** Nikhil Ladwani | **Roll No.:** 25  
**Programme:** B.E. (AI & DS), Semester V  
**Project:** Clinic Queue Management

This repository contains five separately runnable programs matching the assignment sheet.

## Requirements
- Node.js 18 or newer and npm
- MongoDB Community Server or MongoDB Atlas connection string (Programs 4 and 5)
- Modern browser
- Optional: Postman / Thunder Client

## Programs
| Program | Folder | Main technologies |
|---|---|---|
| 1 | `program-1-browser/` | HTML, CSS, JavaScript, DOM, Fetch API |
| 2 | `program-2-react/` | React, JSX, hooks, React Router |
| 3 | `program-3-node-utility/` | Node.js, fs, path, streams, EventEmitter, HTTP |
| 4 | `program-4-express-api/` | Express, MongoDB/Mongoose, JWT, bcrypt |
| 5 | `program-5-integrated-app/` | React + Express + MongoDB |

## Run Program 1
Open `program-1-browser/index.html` in a browser. It works in local demo mode using `localStorage`. To connect it to Program 4, start the API and change `API_BASE` in `app.js` to `http://localhost:5000/api`.

## Run Program 2
```bash
cd program-2-react
npm install
npm run dev
```
Open the local Vite URL shown in the terminal.

## Run Program 3
```bash
cd program-3-node-utility
npm install
npm start
```
Open `http://localhost:3001` or use the `/api/records` endpoint.

## Run Program 4
Create a `.env` file from `.env.example`, set `MONGO_URI` and a long random `JWT_SECRET`, then:
```bash
cd program-4-express-api
npm install
npm run dev
```
The API runs on port 5000. Register a user at `POST /api/auth/register`, log in at `POST /api/auth/login`, and use the returned token as `Authorization: Bearer <token>` for protected patient routes.

## Run Program 5
Create `.env` from `.env.example`, set MongoDB and JWT values, then:
```bash
cd program-5-integrated-app
npm install
npm run dev
```
In a second terminal:
```bash
cd program-5-integrated-app/client
npm install
npm run dev
```
The Vite development server proxies `/api` requests to the Express server at port 5001.

## API summary (Programs 4 and 5)
- `POST /api/auth/register` – create an account
- `POST /api/auth/login` – authenticate and return a JWT
- `GET /api/patients` – list patients (JWT required)
- `POST /api/patients` – add a patient (JWT required)
- `PUT /api/patients/:id` – update a patient (JWT required)
- `DELETE /api/patients/:id` – delete a patient (JWT required)
- `GET /api/health` – health check

## Notes
- Programs 4 and 5 use MongoDB. They do not silently substitute an in-memory database.
- Passwords are hashed with bcrypt; JWT secrets belong in `.env` and must never be committed.
- CORS is configured for the local frontend origin. For deployment, set the allowed origin to the deployed frontend URL.
- Deployment providers and accounts are not created by this repository. Deploy the backend and frontend separately and add the required environment variables in the provider dashboard.
