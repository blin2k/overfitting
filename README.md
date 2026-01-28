# ATS Resume Generator

A web application that generates ATS-optimized resumes by translating user experience into language that matches target job descriptions. The system preserves authentic experiences while adapting tech stack terminology to align with JD requirements.

## Features

- **Resume Parsing**: AI-powered extraction of experience, projects, and skills
- **JD Analysis**: Intelligent parsing of job descriptions and requirements
- **Tech Stack Mapping**: Automatic mapping between user skills and JD requirements
- **Fitting Level Slider**: Control how literally the resume claims the JD's tech stack (0-100%)
- **Gap Analysis**: Identify what you should learn before interviewing
- **LaTeX Export**: Professional PDF output using Jake's Resume template

## Tech Stack

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Express + TypeScript
- **AI**: Claude API (Anthropic)
- **Output**: LaTeX (Jake's Resume template) → PDF

## Prerequisites

- Node.js 18+
- npm or yarn
- pdflatex (for PDF generation)
  - macOS: `brew install --cask mactex` or `brew install basictex`
  - Ubuntu: `sudo apt-get install texlive-latex-base`

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd overfitting
```

### 2. Install dependencies

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env and add your ANTHROPIC_API_KEY

# Client
cp client/.env.example client/.env
```

### 4. Start development servers

```bash
# Terminal 1 - Start server
cd server && npm run dev

# Terminal 2 - Start client
cd client && npm run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:3001`.

## Project Structure

```
/
├── SPEC.md              # Full project specification
├── CLAUDE.md            # Development guidelines
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   └── types/       # TypeScript types
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   │   ├── ai/      # Claude API integration
│   │   │   ├── latex/   # LaTeX generation
│   │   │   └── parser/  # Resume/JD parsing
│   │   ├── models/      # Data models
│   │   └── db/          # Database layer
│   ├── templates/       # LaTeX templates
│   └── package.json
└── shared/              # Shared TypeScript types
    └── types/
```

## Commands

```bash
# Install dependencies
cd client && npm install
cd server && npm install

# Development
cd client && npm run dev
cd server && npm run dev

# Build
cd client && npm run build
cd server && npm run build

# Test
cd client && npm test
cd server && npm test
```

## Environment Variables

### Server (.env)

```
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=sqlite:./data/dev.db
ANTHROPIC_API_KEY=sk-ant-...
```

### Client (.env)

```
VITE_API_URL=http://localhost:3001
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/resumes` | POST | Upload and parse resume |
| `/api/resumes` | GET | List user's resumes |
| `/api/resumes/:id` | GET | Get specific resume |
| `/api/job-descriptions` | POST | Upload and parse JD |
| `/api/job-descriptions` | GET | List user's JDs |
| `/api/job-descriptions/:id` | GET | Get specific JD |
| `/api/generate` | POST | Generate fitted resume |
| `/api/generate/preview` | POST | Preview without saving |
| `/api/generated/:id/pdf` | GET | Download as PDF |
| `/api/generated/:id/tex` | GET | Download as TEX |
| `/api/generated/:id/gaps` | GET | Get gap analysis |

## License

ISC
