# ATS Resume Generator - Project Specification

## Overview

A web application that generates ATS-optimized resumes by translating the user's real experience into language that matches a target job description. The system preserves authentic experiences while adapting tech stack terminology to align with JD requirements.

## Core Concept

- User provides their real resume and a target job description
- AI generates an "overfitting" version: same experiences, but tech stacks rewritten to mirror JD language
- User controls a slider (0-100%) determining how literally the resume claims the JD's tech stack
- Gap analysis identifies what the user should learn before interviewing

### Slider Behavior Example

For a user with React experience applying to a Vue job:

| Slider | Output |
|--------|--------|
| 0% | "Built a React application..." (original) |
| 50% | "Built a modern SPA using component-based architecture..." (generalized) |
| 100% | "Built a Vue application..." (fully fitted to JD) |

## User Flow

1. **Upload Phase**
   - User uploads their resume (PDF or text)
   - User uploads/pastes job description

2. **Generation Phase**
   - System parses resume and JD
   - AI generates overfitting resume (100% fitted version)
   - AI performs gap analysis

3. **Adjustment Phase**
   - User views rendered resume
   - User adjusts fitting slider (0-100%)
   - Resume regenerates based on slider position
   - User can manually edit sections

4. **Gap Review**
   - Tool gaps displayed: "You have X, JD wants Y (similar category)"
   - True gaps displayed: "JD requires Z, no equivalent experience found"

5. **Export Phase**
   - User downloads as PDF or TEX
   - Resume and JD archived for future reference

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (or SQLite for MVP)
- **AI**: Claude API for resume generation and analysis
- **LaTeX**: Jake's Resume template for output
- **PDF Generation**: Server-side pdflatex compilation

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  createdAt: Date;
}
```

### Resume (User's Original)
```typescript
interface Resume {
  id: string;
  userId: string;
  rawText: string;
  parsedData: ParsedResume;
  uploadedAt: Date;
}

interface ParsedResume {
  contactInfo: ContactInfo;
  summary?: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: string[];
}

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
  techStack: string[];
}

interface Project {
  name: string;
  description: string;
  bullets: string[];
  techStack: string[];
  url?: string;
}
```

### JobDescription
```typescript
interface JobDescription {
  id: string;
  userId: string;
  rawText: string;
  parsedData: ParsedJD;
  uploadedAt: Date;
}

interface ParsedJD {
  title: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  rawRequirements: string[];
}
```

### GeneratedResume
```typescript
interface GeneratedResume {
  id: string;
  userId: string;
  resumeId: string;
  jobDescriptionId: string;
  fittingLevel: number; // 0-100
  latexContent: string;
  gapAnalysis: GapAnalysis;
  createdAt: Date;
}
```

### GapAnalysis
```typescript
interface GapAnalysis {
  toolGaps: ToolGap[];
  trueGaps: TrueGap[];
}

interface ToolGap {
  userHas: string;        // e.g., "React"
  jdWants: string;        // e.g., "Vue"
  category: string;       // e.g., "Frontend Framework"
  recommendation: string; // e.g., "Review Vue composition API and reactivity model"
}

interface TrueGap {
  jdRequires: string;     // e.g., "Kubernetes"
  category: string;       // e.g., "Container Orchestration"
  isRequired: boolean;    // true if in required skills, false if preferred
  recommendation: string; // e.g., "Consider completing K8s basics course"
}
```

## API Endpoints

### Resume Management
- `POST /api/resumes` - Upload and parse user resume
- `GET /api/resumes` - List user's archived resumes
- `GET /api/resumes/:id` - Get specific resume

### Job Description Management
- `POST /api/job-descriptions` - Upload and parse JD
- `GET /api/job-descriptions` - List user's archived JDs
- `GET /api/job-descriptions/:id` - Get specific JD

### Generation
- `POST /api/generate` - Generate fitted resume
  - Body: `{ resumeId, jobDescriptionId, fittingLevel }`
  - Returns: Generated resume + gap analysis

- `POST /api/generate/preview` - Quick preview without saving
  - Body: `{ resumeId, jobDescriptionId, fittingLevel }`

### Export
- `GET /api/generated/:id/pdf` - Download as PDF
- `GET /api/generated/:id/tex` - Download as TEX file

### Gap Analysis
- `GET /api/generated/:id/gaps` - Get gap analysis for a generated resume

## LaTeX Generation

Use Jake's Resume template: https://github.com/jakegut/resume

Key considerations:
- Server must have pdflatex installed
- Template sections: Header, Education, Experience, Projects, Skills
- Escape special LaTeX characters in user content
- Support for links (GitHub, LinkedIn, portfolio)

## AI Prompt Strategy

### Resume Parsing Prompt
Extract structured data from raw resume text. Identify tech stacks per experience/project.

### JD Parsing Prompt
Extract required skills, preferred skills, and key technologies. Categorize by domain (frontend, backend, database, devops, etc.).

### Tech Stack Mapping Prompt
For each user tech → JD tech pair, determine:
1. Are they equivalent? (React ↔ React)
2. Are they same category? (React ↔ Vue, PostgreSQL ↔ MySQL)
3. Are they generalizeable? (React → "component-based frontend")
4. Is there no relation? (Gap)

### Resume Generation Prompt
Given:
- Parsed resume
- Parsed JD
- Tech stack mappings
- Fitting level (0-100)

Generate LaTeX content using Jake's template with appropriate tech stack substitutions.

## File Structure

```
/
├── SPEC.md
├── CLAUDE.md
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/       # API calls
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── ai/         # Claude API integration
│   │   │   ├── latex/      # LaTeX generation
│   │   │   └── parser/     # Resume/JD parsing
│   │   ├── models/
│   │   ├── db/
│   │   └── index.ts
│   ├── templates/          # LaTeX templates
│   │   └── jake-resume.tex
│   ├── package.json
│   └── tsconfig.json
└── shared/                 # Shared TypeScript types
    └── types/
```

## Implementation Slices

### Slice 1: Basic Upload & Display
- File upload UI for resume and JD
- Store in database
- Display uploaded content back to user

### Slice 2: Parsing
- AI parses resume into structured format
- AI parses JD into structured format
- Display parsed data for verification

### Slice 3: Overfitting Generation
- Generate 100% fitted resume
- Display rendered preview (HTML first, before LaTeX)

### Slice 4: Gap Analysis
- Identify tool gaps and true gaps
- Display gap analysis with recommendations

### Slice 5: Slider & Blending
- Implement fitting level slider
- Regenerate resume at different fitting levels
- Show what changes at each level

### Slice 6: LaTeX & Export
- Integrate Jake's Resume template
- Generate LaTeX from fitted resume
- Compile to PDF server-side
- Download as PDF or TEX

### Slice 7: Archive & History
- List past generations
- Re-open and adjust previous work
- Delete archived items

## Edge Cases to Handle

- Resume with no clear tech stack (soft skills focused)
- JD with vague requirements ("modern tech stack")
- User tech stack that has no JD equivalent
- Very long resumes (need to fit single page)
- Special characters in company/project names (LaTeX escaping)
- Non-English resumes/JDs (MVP: English only)