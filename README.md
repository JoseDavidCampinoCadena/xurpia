# Xurpia - Deployment Guide

## 🚀 Quick Deploy

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free tier) OR Render account (free tier)

### 1. Database Setup (Railway/Neon)

#### Option A: Railway (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select this repository
5. Add PostgreSQL service
6. Copy the DATABASE_URL from Railway

#### Option B: Neon (Alternative)
1. Go to [Neon.tech](https://neon.tech)
2. Create free account
3. Create new database
4. Copy connection string

### 2. Backend Deploy (Railway/Render)

#### Railway (Recommended)
1. Add a new service to your Railway project
2. Connect your GitHub repo
3. Set root directory to `backend/`
4. Add environment variables:
   ```
   DATABASE_URL=your-railway-postgres-url
   JWT_SECRET=your-super-secret-key-change-in-production
   PORT=3001
   EMAIL_USER=xurpia.co@gmail.com
   EMAIL_PASS=your-email-app-password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   HF_TOKEN=your-huggingface-token
   OPENROUTER_API_KEY=your-openrouter-api-key
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Deploy!

#### Render (Alternative)
1. Go to [Render.com](https://render.com)
2. Connect GitHub repo
3. Create Web Service
4. Root directory: `backend`
5. Build command: `npm install && npm run build`
6. Start command: `npm run start:prod`
7. Add same environment variables as above

### 3. Frontend Deploy (Vercel)

1. Go to [Vercel.com](https://vercel.com)
2. Import project from GitHub
3. Set root directory to `frontend/`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   OPENROUTER_API_KEY=your-openrouter-api-key
   RESEND_API_KEY=your-resend-api-key
   ```
5. Deploy!

### 4. Update CORS

After deployment, update the `FRONTEND_URL` environment variable in your backend with your actual Vercel domain.

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-key"
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
HF_TOKEN=your-huggingface-token
OPENROUTER_API_KEY=your-openrouter-api-key
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
OPENROUTER_API_KEY=your-openrouter-api-key
RESEND_API_KEY=your-resend-api-key
```

## 🗄️ Database

This project uses PostgreSQL with Prisma ORM. The database will be automatically set up when you deploy to Railway or when you connect to Neon.

## 🌟 Features

- **AI-powered task assignment**
- **Skill assessment system**
- **Project collaboration**
- **Real-time updates**
- **Email notifications**
- **Task management**

## 📧 Support

For deployment issues, check the logs in your hosting platforms or open an issue in this repository.
