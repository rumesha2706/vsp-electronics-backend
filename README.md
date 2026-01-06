# VSP Electronics Backend API

Express.js backend API for VSP Electronics e-commerce platform.

## Prerequisites

- Node.js 18.0.0+
- PostgreSQL 12+
- npm or yarn

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=vsp_electronics

# API
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_key

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your_recaptcha_key
```

## Running the API

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Database Commands

Initialize database:
```bash
npm run db:init
```

Import data:
```bash
npm run db:import
```

Setup categories:
```bash
npm run categories:setup
```

## API Documentation

Once running, Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
backend/
├── server/              # Core API server
│   ├── db/             # Database configuration
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── swagger.js      # Swagger setup
├── scripts/            # Database and utility scripts
├── server-api.js       # Main entry point
└── package.json        # Dependencies
```

## Vercel Deployment

1. Create a new Vercel project linked to your GitHub backend repository
2. Configure environment variables in Vercel dashboard
3. Deploy:
```bash
vercel deploy
```

## GitHub Setup

Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit: Backend API"
git remote add origin https://github.com/yourusername/vsp-electronics-backend.git
git push -u origin main
```
