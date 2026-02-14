# Sunfyre

AI-Powered Pull Request Reviewer

## Overview
Sunfyre automates and augments code review by analyzing GitHub pull requests using an AI model. It fetches PR metadata and diffs, produces a high-level summary, assigns a risk score with explanation, generates inline review comments, and suggests test cases.

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript + Passport (GitHub OAuth)
- Database: MongoDB (Mongoose)
- AI: OpenAI API

## Features
- GitHub OAuth authentication
- Repository synchronization
- Pull request synchronization (metadata + stats)
- AI-based PR analysis (summary, risk, inline comments, tests)
- Risk visualization
- Token-based auth for API calls

## Architecture
```
client/
  src/
    components/
    pages/
    context/
    services/
    config/
server/
  src/
    controllers/
    routes/
    services/
    models/
    middleware/
    config/
```

## Environment Variables
Create `.env` files based on `.env.example` in both `client/` and `server/`.

### Server `.env`
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sunfyre
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
SESSION_SECRET=your_session_secret_here_change_in_production
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_api_key_here
CLIENT_URL=http://localhost:5173
```

### Client `.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

## Setup & Run
### Prerequisites
- Node.js >= 18
- MongoDB running locally or accessible remotely
- GitHub OAuth App (Client ID & Secret)
- OpenAI API key

### Backend
```bash
cd server
npm install
npm run dev
```
Server runs on `http://localhost:5000`.

### Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## GitHub OAuth Setup
1. Create a GitHub OAuth App: https://github.com/settings/developers
2. Set Authorization callback URL to: `http://localhost:5000/api/auth/github/callback`
3. Copy Client ID and Client Secret into server `.env`.

## AI Review Endpoint
Trigger analysis:
```
POST /api/pull-requests/:id/analyze
Authorization: Bearer <token>
```
Returns JSON with:
- summary
- riskScore (1–10)
- riskExplanation
- inlineComments[] (file, line, message, severity)
- suggestedTests[]

## Roadmap / Next Steps
- Store and display diffs directly in the UI
- Add granular permission scopes per repository
- Support additional AI models / fallback strategies
- Add analytics dashboard (risk trends, review velocity)
- Reviewer action tracking (accept/reject inline comments)
- Unit and integration tests
- Production deployment scripts (Docker + CI/CD)

## Scripts
### Server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled server

### Client
- `npm run dev` - Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Security Considerations
- Never log raw access tokens
- Rotate JWT + session secrets in production
- Enforce HTTPS in production deployments
- Validate and sanitize AI-generated outputs before applying automatically

## Testing (Future)
Planned stack: Jest + Supertest (backend), React Testing Library (frontend).

