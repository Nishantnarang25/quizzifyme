# 🎮 Quizzify Me — Real-Time Multiplayer Quiz Platform  

**Quizzify Me** is an interactive, real-time multiplayer quiz web application designed for students, friends, teams, and streamers who love to challenge each other and battle their knowledge.  

---

## ✨ Features  
- **Create Custom Quiz Rooms**: Write questions, set answers, and name your battleground.  
- **Real-Time Battles**: Host or join live quizzes with instant scoring.  
- **Rewards System**: Earn coins and XP to climb the leaderboard.  
- **Google Login**: Seamless sign-in with OAuth.  
- **Mobile-Friendly**: Responsive design for all devices.  

---

## 🛠️ Tech Stack  
| **Frontend**       | **Backend**       | **Database**   |  
|---------------------|-------------------|----------------|  
| React.js            | Node.js/Express   | PostgreSQL     |  
| Framer Motion (UI)  | REST APIs         | Supabase       |  
| Vite (Build Tool)   | WebSocket (WIP)   | Prisma ORM     |  

---

## 🚀 Quick Start  
1. **Clone the repo**:  
   ```bash
   git clone https://github.com/your-repo/quizzify-me.git

2. Install dependencies
   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install

3. Configure environment variables
     
   Create these files with the following content:
   
   client/.env
   ```bash 
  
   VITE_CLIENT_ID=
   VITE_CLIENT_SECRET=
   VITE_SERVER_URL=

   ```

  server/.env
  ```bash
  DATABASE_URL=your-postgres-url
  JWT_SECRET=your-secret-key

  ```
