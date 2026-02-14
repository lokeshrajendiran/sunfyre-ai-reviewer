# SunFyre 🐉

**AI-Powered Pull Request Reviewer**

SunFyre automates code review by analyzing GitHub pull requests using Google Gemini. It fetches PR metadata and diffs, produces a high-level summary, assigns a risk score (1–10) with explanation, generates inline review comments, and suggests test cases.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS |
| Backend | Express 5 · TypeScript · Passport (GitHub OAuth) |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Auth | GitHub OAuth + JWT |

## Features

- 🔐 GitHub OAuth authentication
- 📦 Repository synchronization from GitHub
- 🔄 Pull request synchronization (metadata + stats)
- 🤖 AI-based PR analysis (summary, risk score, inline comments, suggested tests)
- 📊 Risk score visualization with color-coded badges
- 🌙 Dark mode support
- 🔑 JWT-based API authentication

## Architecture

```
client/                          server/
  src/                             src/
    components/                      controllers/
      ui/          (shadcn/ui)         authController
    pages/                             repositoryController
      DashboardPage                    pullRequestController
      PullRequestDetailPage          routes/
      RepositoryPullRequestsPage       auth, repositories, pullRequests
      LoginPage                      services/
      SettingsPage                     githubClient    (GitHub API)
    context/                           aiEngine        (Gemini AI)
      AuthContext                    models/
      AppContext                       User, Repository, PullRequest
    services/                          AIReview, ReviewerAction
      api            (Axios)         middleware/
    config/                            auth, errorHandler
                                     config/
                                       database, passport
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or accessible remotely
- GitHub OAuth App ([create one here](https://github.com/settings/developers))
- Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### 1. Clone the repository

```bash
git clone https://github.com/lokeshrajendiran/sunfyre-ai-reviewer.git
cd sunfyre-ai-reviewer
```

### 2. Configure environment variables

Copy the example files and fill in your credentials:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server `.env`**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sunfyre
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

**Client `.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### 3. Start the backend

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### 4. Start the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**
2. Set **Authorization callback URL** to: `http://localhost:5000/api/auth/github/callback`
3. Copy the **Client ID** and **Client Secret** into both `server/.env` and `client/.env`

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/github` | Initiate GitHub OAuth |
| `GET` | `/api/auth/github/callback` | OAuth callback |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Logout |

### Repositories *(requires auth)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/repositories/sync` | Sync repos from GitHub |
| `GET` | `/api/repositories` | List repositories |
| `GET` | `/api/repositories/:id` | Get single repository |
| `PATCH` | `/api/repositories/:id/toggle` | Toggle active status |

### Pull Requests *(requires auth)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pull-requests/repository/:repositoryId/sync` | Sync PRs for a repo |
| `GET` | `/api/pull-requests/repository/:repositoryId` | List PRs for a repo |
| `GET` | `/api/pull-requests/:id` | Get PR with latest AI review |
| `POST` | `/api/pull-requests/:id/analyze` | Trigger AI analysis |
| `GET` | `/api/pull-requests/:id/reviews` | Get all AI reviews |

### AI Analysis Response

```json
{
  "summary": "High-level description of changes",
  "riskScore": 4,
  "riskExplanation": "Why this score was assigned",
  "inlineComments": [
    { "file": "src/index.ts", "line": 42, "message": "...", "severity": "warning" }
  ],
  "suggestedTests": ["Test case descriptions"],
  "filesAnalyzed": ["src/index.ts"]
}
```

## Scripts

### Server
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |

### Client
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview production build |

## Security

- `.env` files are gitignored — secrets are never committed
- Rotate JWT and session secrets in production
- Enforce HTTPS in production deployments
- Validate and sanitize AI-generated outputs before applying

## Roadmap

- [ ] Store and display diffs directly in the UI
- [ ] Granular permission scopes per repository
- [ ] Support additional AI models / fallback strategies
- [ ] Analytics dashboard (risk trends, review velocity)
- [ ] Reviewer action tracking (accept/reject inline comments)
- [ ] Unit and integration tests (Jest + Supertest, React Testing Library)
- [ ] Production deployment (Docker + CI/CD)

## License

ISC

