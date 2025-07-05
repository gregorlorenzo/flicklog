# Flicklog: Bug & Incident Handling Guidelines

This document outlines the process for identifying, tracking, and resolving bugs and incidents in the Flicklog project. Our goal is to create a transparent, low-friction process that helps us improve the codebase and learn from our mistakes.

## Guiding Philosophy

**Track in one place.** Instead of a separate logbook, we use **GitHub Issues** as the single source of truth for all bug reports and technical incidents. This keeps the context, discussion, and resolution directly linked to our codebase and pull requests.

## The Bug Triage Process

1. **Identify & Confirm:** When a potential bug is found (either by a developer, through user feedback, or via logs), the first step is to confirm it is reproducible.
2. **Create a GitHub Issue:** If the bug is confirmed, create a new issue in the Flicklog GitHub repository using the "Bug Report" template.
3. **Label the Issue:** Apply appropriate labels to the issue for categorization and prioritization. This is our primary method for organization.
4. **Prioritize:** The team will assess the bug's severity and prioritize it for an upcoming work cycle.

## Creating a Good Bug Report

A well-written bug report is the fastest path to a fix. When creating a new GitHub Issue for a bug, please include:

1. **A Clear, Descriptive Title:** e.g., "Movie poster not loading on Firefox for shared space entries"
2. **Environment:** Where did you see the bug? (e.g., Local dev, Vercel Preview URL, Production)
3. **Steps to Reproduce:**
    - 1. Go to '...'
    - 2. Click on '....'
    - 3. Observe the error
4. **Observed Behavior:** What is actually happening?
5. **Expected Behavior:** What should have happened instead?
6. **Screenshots or Logs:** Include any relevant visual aids or console output.

## Issue Labels for Triage

Using labels helps us organize and prioritize work. All bug reports should have at least one of each of the following:

#### **Severity Labels**

- `severity:critical`: System down, data loss, security vulnerability. Requires immediate attention.
- `severity:high`: Major feature is broken or unusable for many users.
- `severity:medium`: Minor feature has a bug or a poor user experience.
- `severity:low`: Cosmetic issue, typo, or edge-case bug.

#### **Status Labels**

- `status:needs-triage`: A new issue that needs review.
- `status:in-progress`: A developer is actively working on a fix.
- `status:blocked`: Progress is blocked by an external factor.
- `status:in-review`: A pull request has been opened and is awaiting review.

#### **Category Labels**

- `bug`
- `auth`
- `ui`
- `database`
- `server-action`
- `performance`
- `documentation`

## Post-Mortem & Learning (For Critical Incidents)

For any `severity:critical` incidents, once the issue is resolved, we will conduct a brief, blameless post-mortem. The findings will be attached to the original GitHub issue. The goal is to answer three questions:

1. **What was the impact?** (Who was affected and for how long?)
2. **What was the root cause?** (What technical or process failure led to this?)
3. **How can we prevent this in the future?** (What action items can we take? e.g., add a new test, improve validation, update a RLS policy).

## Incident: Initial Auth & DB Setup Failure (July 2025)

### 1. Impact

- **Description:** The core user signup and profile creation flow was non-functional for an extended period, blocking all subsequent feature development.
- **Duration:** Approximately 1-2 development days.
- **Services Affected:** Supabase Auth, Supabase DB (PostgreSQL), Prisma, Next.js application layer.

### 2. Root Causes (A Cascade of Interrelated Failures)

The failure was not due to a single bug, but a chain reaction of five distinct issues across the stack:

1. **Framework-level Breaking Change:** The initial UI code attempted synchronous access of `searchParams` in a Next.js 15 page component (`LoginPage`, `SignupPage`), which is now an async prop, causing a render-blocking error.
2. **Database Schema Definition:** Multiple fields in `prisma/schema.prisma` were defined in a way that did not create the correct database-level constraints and defaults.
    - `user_id` was `String` instead of `String @db.Uuid`.
    - Primary keys used `@default(uuid())` (a Prisma-level function) instead of `@default(dbgenerated("gen_random_uuid()"))` (a database-level function).
    - Timestamp fields used `@updatedAt` (Prisma-level) without a database-level `DEFAULT` or `ON UPDATE` trigger.
3. **Database Connection & Networking:** The local development environment (WSL2) had an IPv6 routing issue, preventing Prisma from connecting to the Supabase direct database host. Attempts to use the connection pooler for migrations failed due to incorrect credentials and the pooler's inherent limitations for schema-altering commands.
4. **SQL Trigger Logic:** The `handle_new_user` SQL function contained several bugs, including attempting to read from `raw_user_meta_data` instead of the correct `raw_app_meta_data`, and failing to provide values for `NOT NULL` columns like `updated_at`.
5. **Deployment Scripting:** The initial `db:deploy` script in `package.json` did not correctly handle shell variable expansion within the `pnpm` context, causing the `psql` command to fail silently by ignoring the `$DATABASE_URL`.

### 3. Resolution & Key Learnings

The resolution involved a full "nuke and pave" of both the local and remote databases, followed by the implementation of a robust, automated deployment script and corrected code.

- **Definitive Solution:**
    1. The `prisma.schema` was corrected to use native database types (`@db.Uuid`) and database-level default functions (`@default(dbgenerated(...))`).
    2. The `directUrl` feature was added to the Prisma schema's `datasource` block, allowing migrations to use the Session Pooler (port `5432`) while the application uses the Transaction Pooler (port `6543`).
    3. A `prisma/setup.sql` file was created to act as the single source of truth for all raw SQL functions and triggers.
    4. A `db:deploy` script was created using the `dotenv -- bash -c '...'` pattern to reliably run migrations and then apply the `setup.sql` file.
    5. UI components were updated to handle async props correctly (`async function Page({ searchParams }) { const { q } = await searchParams; ... }`).

- **Future Prevention:**
  - All raw SQL logic MUST be stored in version-controlled `.sql` files.
  - Database-related deployment steps MUST be automated in `package.json` scripts.
  - When working with Prisma and external systems (like Supabase Triggers), always prefer database-level defaults (`@db.Uuid`, `@default(dbgenerated(...))`) over Prisma-Client-only directives (`@default(uuid())`, `@updatedAt`).
  - Any `500: unexpected_failure` from a Supabase API call should immediately lead to checking the project's **Database Logs**, not just the API logs.

## Future of Monitoring (Post-Launch)

As Flicklog grows and acquires real users, we will implement a more robust observability stack.

- **Error Tracking:** We plan to integrate **Sentry** to automatically capture, triage, and alert on production errors.
- **Performance Monitoring:** We will leverage Vercel Analytics and may add further tooling to monitor database and API performance.
- **Alerting:** Once we have a monitoring tool, we will establish clear alerting thresholds for error rates and response times.

For the MVP, we will rely on Vercel's built-in function logs and user-reported issues.
