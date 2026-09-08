# VoteSmart — Election Education Platform

An interactive full-stack civic-tech web application with 10 educational modules about elections, policy-making, media literacy, and critical thinking.

##  Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React.js (Vite) + Tailwind CSS   |
| Backend     | Node.js + Express.js             |
| Database    | MongoDB (Mongoose)               |
| Charts      | Chart.js (react-chartjs-2)       |
| Auth        | JWT (jsonwebtoken + bcryptjs)    |
| Animations  | Framer Motion                    |
| Icons       | Lucide React                     |

##  Getting Started (Local Development)

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally on port 27017 (or update `.env` with Atlas URI)

### 1. Install All Dependencies
```bash
npm run install-all
```

### 2. Start Backend
```bash
npm run dev:backend
```
Server runs on http://localhost:5000

### 3. Start Frontend
```bash
npm run dev:frontend
```
App runs on http://localhost:5173

##  Deployment (Render.com)

### Option 1: One-Click Deploy
1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New > Blueprint** and connect your GitHub repo
4. Render reads `render.yaml` and auto-configures everything
5. Set `MONGODB_URI` in Render's environment variables (get a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Option 2: Manual Deploy on Render
1. Create a **New Web Service** on Render
2. Connect your GitHub repo
3. Configure:
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables:
   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | Your Render app URL (e.g. `https://votesmart.onrender.com`) |

### Option 3: Deploy Anywhere
```bash
# 1. Build the frontend
npm run build

# 2. Start the production server
npm start
```
The backend serves the built React app from `frontend/dist`. Set environment variables as shown in `backend/.env.example`.

##  Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Build Your Party | Create a party with budget sliders, see approval/economic scores |
| 2 | Constituency Simulator | Allocate campaign focus across regions, win seats |
| 3 | Law Impact Visualizer | See cost/benefit of policies with charts |
| 4 | Debate Simulator | 3-round AI debate with scoring |
| 5 | Spot the Manipulation | Identify propaganda tactics in campaign messages |
| 6 | Time Travel Voting | Vote in historical elections, see consequences |
| 7 | Social Media Feed | Navigate misinformation in a simulated feed |
| 8 | Seat Prediction | Parliament-style seat distribution chart |
| 9 | Voter Report | Personalized voter profile with radar chart |
| 10 | Story Mode | Guided first-time voter experience |

##  Project Structure

```
votesmart/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/               # Mongoose models (User, Party, Constituency)
│   ├── routes/               # 11 API route files
│   ├── data/                 # JSON data for simulations
│   ├── server.js             # Express server entry point
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Footer
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # 14 page components
│   │   ├── utils/api.js      # Axios API client
│   │   └── App.jsx           # Router + protected routes
│   └── vite.config.js        # Vite + proxy config
├── render.yaml               # Render deployment blueprint
└── package.json              # Root scripts
```

##  Disclaimer
This app is for educational purposes only. It does not represent any real political party, candidate, or election outcome.
