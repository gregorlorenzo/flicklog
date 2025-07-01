# Flicklog: Project Coding Guidelines

This document outlines the coding standards, best practices, and architectural patterns for the Flicklog project. All code contributions, whether human or AI-generated, MUST adhere to these guidelines to ensure a consistent, readable, and high-quality codebase.

## The Golden Rule

**Clarity and Simplicity over cleverness.** The codebase should be easy to understand for a developer new to the project. Default to the simplest solution that effectively solves the problem.

---

## 1. File & Folder Structure

We use the Next.js App Router. The structure should be logical and scalable.

- **`app/`**: Contains all routes.
- **`components/`**: The home for all React components.
  - **`components/ui/`**: For base UI components from **ShadCN/ui**.
  - **`components/shared/`**: For custom, reusable components used across multiple features.
  - **`components/features/`**: For complex components tied to a specific feature.
- **`lib/`**: For shared utilities, helpers, and API clients (e.g., `supabase-client.ts`).
- **`hooks/`**: For custom React hooks.
- **`actions/`**: For all Next.js Server Actions.
- **`prisma/`**: For the Prisma schema and migrations.
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
- **`cn` utility:** Always use the `cn` function for combining class names to prevent style conflicts.
- **Colocation:** All styles should be colocated with their respective components.
- **Auto-sorting:** Rely on `prettier-plugin-tailwindcss` to sort class names.

---

## 8. Dependency Management

- **Justification Required:** New dependencies MUST be justified in PR description.
- **Bundle Size Impact:** Check bundle size impact using `npm run analyze`.
- **Security Scanning:** Run `npm audit` before adding dependencies.

---

## 9. CI/CD & Deployment

### Deployment Pipeline

Our deployment process is streamlined through Vercel's Git integration.

1.  **Pre-commit Hooks:** Lint, format, and type-check locally.
2.  **Pull Request Checks:** When a PR is opened, Vercel automatically runs tests and a build check. A preview deployment is generated for review.
3.  **Production Deploy:** Merging a PR to the `main` branch automatically deploys the latest version to production.

---

## 10. Security Best Practices

### Server Action Security Checklist

Every mutating Server Action MUST:

1.  **Authenticate:** Check for a valid user session using Supabase helpers.
2.  **Authorize:** Verify user permissions for the requested resource (e.g., is the user a member of the Space?).
3.  **Validate:** Re-validate all input with Zod schemas on the server.
4.  **Sanitize:** Sanitize user-generated content that will be rendered as HTML to prevent XSS (if applicable).

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
