# Flicklog: Project Coding Guidelines

This document outlines the coding standards, best practices, and architectural patterns for the Flicklog project. All code contributions, whether human or AI-generated, MUST adhere to these guidelines to ensure a consistent, readable, and high-quality codebase.

## The Golden Rule

**Clarity and Simplicity over cleverness.** The codebase should be easy to understand for a developer new to the project. Default to the simplest solution that effectively solves the problem.

---

## 1. File & Folder Structure

We use the Next.js App Router within a `src/` directory. The structure should be logical and scalable.

- **`src/app/`**: Contains all routes.
- **`src/components/`**: The home for all React components.
  - **`src/components/ui/`**: For base UI components from **ShadCN/ui**.
  - **`src/components/shared/`**: For custom, reusable components used across multiple features.
  - **`src/components/features/`**: For complex components tied to a specific feature.
- **`src/lib/`**: For shared utilities, helpers, and API clients (e.g., `db.ts`, `tmdb-utils.ts`).
- **`src/hooks/`**: For custom React hooks.
- **`src/actions/`**: For all Next.js Server Actions.
- **`prisma/`**: For the Prisma schema, migrations, and setup scripts (`setup.sql`).
- **`tests/`**: For all test files, mirroring the app structure.
- **File Naming:**
  - React Components: **PascalCase** (`MovieCard.tsx`).
  - All other files: **kebab-case** (`user-actions.ts`).
  - Test files: Match the source file with `.test.ts` or `.spec.ts` suffix.

---

## 2. Component Architecture

- **Server Components by Default:** All components MUST be Server Components unless they require client-side interactivity.
- **"use client" at the Leaf:** Apply the `"use client"` directive at the most specific component possible.
- **Props:** Use TypeScript `interface` with a `Props` suffix. No `any`.
- **Composition:** Build complex UI by composing smaller, single-responsibility components.
- **Error Boundaries:** Wrap feature components in error boundaries using `error.tsx` files.

### Component Documentation Standards

Complex components MUST include JSDoc comments:

```typescript
/**
 * A client component form for logging a new movie.
 * Uses React Hook Form for state management and Zod for validation.
 *
 * @param props - The component props
 * @param props.spaceId - The ID of the space to log the movie to
 * @param props.onSuccess - Callback executed on successful submission
 * @param props.initialData - Optional initial form data for editing
 */
interface LogFormProps {
  spaceId: string;
  onSuccess: () => void;
  initialData?: Partial<LogEntry>;
}
```

### Working with Next.js 15+ Async Props

Next.js 15 introduced async props for dynamic APIs like `searchParams`. To access these, components must be declared `async` and the prop must be `await`-ed before use.

**Correct Pattern:**

```typescript
// Note the async function and Promise<> type
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  // Await the promise before accessing its properties
  const { query } = await searchParams;

  return <div>Searching for: {query}</div>;
}
```

---

## 3. Testing Standards

### Testing Philosophy

- **Test User Behavior, Not Implementation:** Focus on what the user experiences, not internal component state.
- **Pragmatic Testing for MVP:** For the initial launch, focus on testing critical paths:
  - Core server actions (create, update, delete operations).
  - Authentication and authorization logic.
  - Key utility functions.
- **Goal for Post-Launch:** As the application matures, we will aim for higher code coverage (80%+) and implement a broader suite of integration and E2E tests.

### Testing Stack

- **Unit/Integration Tests:** Vitest + React Testing Library
- **E2E Tests (Post-MVP):** Playwright

### Test Organization

```typescript
// Example unit test structure for a component
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MovieCard from "./MovieCard";

describe("MovieCard Component", () => {
  const mockMovie = { id: "1", title: "Test Movie", rating: 4.5 /* ... */ };

  it("renders movie title correctly", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("displays rating with proper formatting", () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText("4.5/5")).toBeInTheDocument();
  });
});
```

### Server Action Testing

```typescript
// Example Server Action test with Vitest
import { describe, it, expect, vi } from "vitest";
import { createLogEntry } from "./log-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Mock the supabase client
vi.mock("@/lib/supabase/server");

describe("createLogEntry action", () => {
  it("should return an error if the user is not authenticated", async () => {
    // Mock the case where there is no user session
    vi.mocked(createSupabaseServerClient).mockReturnValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const result = await createLogEntry("space-1", {
      movieId: "m-1",
      rating: 4,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Authentication required");
  });

  // Add more tests for success cases and authorization checks
});
```

---

## 4. Data Fetching & Mutations

- **Server Actions for Mutations:** All CUD operations MUST use Server Actions.
- **Zod for Validation:** Define a Zod schema for every Server Action's input and **always re-validate on the server**.
- **Data Fetching:** Fetch data directly within Server Components using `async/await`.
- **Prisma Client:** Use the singleton instance from `lib/db.ts`.
- **Local DB Migrations:** To run migrations against the local Docker database, use the `pnpm db:migrate:dev --name <migration-name>` command.

### Server Action Documentation

All Server Actions MUST include comprehensive JSDoc:

```typescript
/**
 * Creates a new movie log entry within a specific Space.
 * Validates user membership and input data before creation.
 *
 * @param spaceId - The ID of the space to add the log to
 * @param data - The validated log entry data
 * @returns ActionResult with the created entry or error details
 *
 * @throws Will return error if user is not authenticated
 * @throws Will return error if user is not a space member
 * @throws Will return fieldErrors for invalid input data
 */
export async function createLogEntry(
  spaceId: string,
  data: LogInput
): Promise<ActionResult<LogEntry>> {
  // Implementation...
}
```

---

## 5. State Management

- **Keep State Local:** Default to `useState` and `useReducer`.
- **URL for Global State:** Use URL Search Params for shareable state like filters and sorting.
- **Context for Static Global State:** Use React Context ONLY for static data like theme or user session.
- **Form State:** Use React Hook Form for complex forms with validation.

---

## 6. TypeScript Best Practices

- **No `any`:** The use of `any` is strictly forbidden.
- **Type Inference:** Define data shapes with a **Zod schema first**, then infer the TypeScript type.
- **Types vs. Interfaces:** Use `interface` for object shapes, `type` for unions/intersections.
- **Return Types:** Explicitly define return types for all functions and Server Actions.
- **Strict Mode:** TypeScript strict mode MUST be enabled in `tsconfig.json`.

---

## 7. Styling (Tailwind CSS)

- **Utility-First:** Embrace the utility-first nature of Tailwind.
- **Theming via CSS Variables:** All theme configuration (colors, fonts) is done in `src/app/globals.css` using CSS custom properties (`:root`) and the `@theme` directive, per Tailwind v4 standards.
- **`cn` utility:** Always use the `cn` function for combining class names to prevent style conflicts.
- **Auto-sorting:** Rely on `prettier-plugin-tailwindcss` to sort class names.

---

## 8. Dependency Management

- **Justification Required:** New dependencies MUST be justified in PR description.
- **Bundle Size Impact:** Check bundle size impact using `npm run analyze`.
- **Security Scanning:** Run `npm audit` before adding dependencies.

---

## 9. CI/CD & Deployment

### Vercel Deployment Pipeline

Our deployment process is streamlined through Vercel's Git integration.

1. **Pre-commit Hooks:** Lint, format, and type-check locally.
2. **Pull Request Checks:** When a PR is opened, Vercel automatically runs tests and a build check. The build command is `prisma generate && next build`. A preview deployment is generated for review.
3. **Production Deploy:** Merging a PR to the `main` branch automatically deploys the latest version to production.

### Database Deployment Workflow

Deploying database changes requires a specific, automated process to ensure consistency between local and remote environments.

#### **Local Development (Changing the Schema)**

When making changes to the `prisma/schema.prisma` file, generate a new migration using the dedicated script. This command uses `.env.local` to target your local Docker database.

```bash
# Creates a new migration file based on your schema changes
pnpm db:migrate:dev --name <your-change-description>
```

#### **Remote Deployment (To a New or Existing Environment)**

To apply all pending migrations and set up necessary database functions/triggers, use the automated deploy script. This command uses `.env` to target the remote Supabase database.

```bash
# This is the single command for deploying all DB changes.
pnpm db:deploy
```

This script performs two critical actions in sequence:

1. `pnpm prisma migrate deploy`: Applies all pending migrations from the `prisma/migrations` folder.
2. `dotenv -- bash -c 'psql ...'`: Connects to the same database and runs the `prisma/setup.sql` file, which contains our custom triggers and functions. The `dotenv -- bash -c` wrapper is essential for correctly loading environment variables in the shell context.

---

## 10. Security Best Practices

### Server Action Security Checklist

Every mutating Server Action MUST:

1. **Authenticate:** Check for a valid user session using Supabase helpers.
2. **Authorize:** Verify user permissions for the requested resource (e.g., is the user a member of the Space?).
3. **Validate:** Re-validate all input with Zod schemas on the server.
4. **Sanitize:** Sanitize user-generated content that will be rendered as HTML to prevent XSS (if applicable).

### Data Protection

- **PII Handling:** Never log personally identifiable information in console logs.
- **Data Encryption:** Rely on Supabase's built-in encryption at rest.
- **Row Level Security (RLS):** Implement RLS policies in Supabase to ensure users can only access their own data at the database level.

---

## 11. Git & Version Control

### Branching Strategy

- **`main`:** The production branch. Always deployable.
- **Feature Branches:** `feat/feature-name` for new features.
- **Fix Branches:** `fix/issue-description` for bug fixes.

### Commit Message Standards

Follow Conventional Commits specification: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.

### Pull Request Guidelines

- **Title:** Clear, descriptive title following conventional commits.
- **Description:** Include context, changes made, and how it was tested.
- **Size:** Keep PRs small and focused.
- **Reviews:** Require at least one approval before merging to `main`.
- **Checks:** All automated checks (build, test) must pass.

---

## 12. Code Review Standards

### Author's Responsibilities

- **Self-Review:** Perform a self-review before requesting feedback.
- **Clear Description:** Explain the "what" and "why" of the changes.
- **Guidelines Compliance:** Ensure code follows all guidelines in this document.

### Reviewer's Responsibilities

- **Understand Context:** Read the PR description to understand the purpose.
- **Constructive Feedback:** Frame feedback as suggestions or questions.
- **Holistic Review:** Check architecture, performance, security, and UX implications.
- **Timely Response:** Provide feedback within 24 hours when possible.

---

This document serves as the foundation for maintaining code quality, consistency, and team collaboration throughout the Flicklog project lifecycle.
