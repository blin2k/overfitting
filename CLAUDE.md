# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ATS Resume Generator - a web app that translates user resumes to match job descriptions while preserving real experiences. See SPEC.md for full specification.

## Quick Reference

- **Stack**: React + Express, both TypeScript
- **Output**: LaTeX (Jake's Resume template) → PDF
- **AI**: Claude API for parsing and generation

## Code Conventions

### TypeScript

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use explicit return types on functions
- No `any` - use `unknown` and narrow types

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// Avoid
type User = { id: any; name: any };
```

### File Naming

- React components: `PascalCase.tsx` (e.g., `ResumeUploader.tsx`)
- Utilities/services: `camelCase.ts` (e.g., `parseResume.ts`)
- Types: `camelCase.types.ts` or in `/types` directory

### React Patterns

- Functional components only
- Custom hooks for shared logic (prefix with `use`)
- Colocate component-specific styles
- Props interface named `{ComponentName}Props`

```typescript
interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
}

export function ResumeUploader({ onUpload, isLoading = false }: ResumeUploaderProps) {
  // ...
}
```

### Express Patterns

- Route handlers in `/routes`, business logic in `/services`
- Use async/await with proper error handling
- Validate request bodies with zod or similar

```typescript
// routes/resumes.ts
router.post('/', async (req, res, next) => {
  try {
    const result = await resumeService.create(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
```

### Error Handling

- Custom error classes for domain errors
- Express error middleware for consistent responses
- Never expose internal errors to client

```typescript
class NotFoundError extends Error {
  statusCode = 404;
}

class ValidationError extends Error {
  statusCode = 400;
}
```

## AI Integration Guidelines

### Prompt Structure

Keep prompts in separate files under `/server/src/services/ai/prompts/`:

```
prompts/
├── parseResume.ts
├── parseJobDescription.ts
├── mapTechStack.ts
└── generateResume.ts
```

Each prompt file exports:
```typescript
export const PARSE_RESUME_PROMPT = `...`;
export function buildParseResumePrompt(resumeText: string): string {
  // ...
}
```

### AI Response Parsing

- Always expect JSON from Claude
- Define zod schemas for expected responses
- Handle parsing failures gracefully

```typescript
const ResumeParseResultSchema = z.object({
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  // ...
});

const result = ResumeParseResultSchema.safeParse(aiResponse);
if (!result.success) {
  // Handle or retry
}
```

## LaTeX Guidelines

### Template Location

Jake's Resume template at `/server/templates/jake-resume.tex`

### Escaping

Always escape user content for LaTeX:

```typescript
function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}
```

### Compilation

Use `pdflatex` with timeout and temp directory:

```typescript
const { execSync } = require('child_process');
execSync(`pdflatex -output-directory=${tempDir} ${texFile}`, {
  timeout: 30000,
});
```

## Testing Approach

- Unit tests for parsing logic and LaTeX escaping
- Integration tests for API endpoints
- Manual testing for AI prompt quality (iterate on prompts based on output)

## Common Pitfalls

1. **LaTeX special characters** - User content WILL contain `&`, `%`, `$`, etc. Always escape.

2. **AI response format** - Claude may add markdown formatting or explanation text. Parse carefully.

3. **Fitting level edge cases** - 0% should be exactly the original, 100% should never show original tech. Test boundaries.

4. **Resume length** - Jake's template is designed for one page. May need to truncate or warn user.

5. **Tech stack detection** - "React" might appear as "React.js", "ReactJS", "react". Normalize before comparing.

## Development Workflow

1. Read SPEC.md for context on any feature
2. Check this file for conventions
3. Implement in vertical slices (full stack per feature)
4. Test the slice works end-to-end before moving on

## Environment Variables

```
# Server
PORT=3001
DATABASE_URL=postgres://...
ANTHROPIC_API_KEY=sk-ant-...

# Client
VITE_API_URL=http://localhost:3001
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
