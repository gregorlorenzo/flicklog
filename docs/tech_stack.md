# Flicklog: Technical Stack

This document is the single source of truth for the technologies, libraries, and services used to build and run Flicklog. Its purpose is to ensure uniformity, aid in onboarding new contributors, and provide a clear reference for debugging and maintenance.

All technologies chosen prioritize being **free and open-source**, **scalable**, and providing an **excellent developer experience with strong type safety**.

---

## Core Platform

This is the foundation of the application.

| Technology     | Version / Spec      | Role & Purpose                | Reason for Choice                                                                                                                           | Alternatives Considered              |
| :------------- | :------------------ | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------- |
| **Next.js**    | `^15.0.0`           | Full-stack React Framework    | The heart of our app. Provides Server Components, Server Actions, file-based routing, and a seamless development workflow.                  | Remix, Vite + React Router, T3 Stack |
| **React**      | `^19.0.0`           | UI Library                    | The foundational library for building user interfaces. Version 19 is used by Next.js 15, bringing performance gains.                        | Vue.js, Svelte, Angular              |
| **TypeScript** | `^5.4.5`            | **Programming Language**      | Enforces static typing across the entire codebase, reducing bugs and improving code quality and maintainability.                            | JavaScript (plain), Flow             |
| **Vercel**     | Managed by Provider | Deployment & Hosting Platform | Created by the Next.js team for zero-configuration, globally distributed, and scalable deployments. The free tier is perfect for our needs. | Netlify, Railway, Cloudflare Pages   |

### Version Compatibility Matrix

| Next.js | React | TypeScript | Node.js | Status                            |
| ------- | ----- | ---------- | ------- | --------------------------------- |
| 15.0.x  | 19.x  | 5.4.x      | 18.x+   | ✅ Current                        |
| 15.0.x  | 18.x  | 5.4.x      | 18.x+   | ⚠️ Compatible but not recommended |
| 14.x    | 18.x  | 5.x        | 18.x+   | 🔄 Previous stable                |

## UI & Styling

How the application looks and feels.

| Technology       | Version / Spec  | Role & Purpose              | Reason for Choice                                                                                                                              | Alternatives Considered                 |
| :--------------- | :-------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **ShadCN/ui**    | `CLI-based`     | Component Library           | Provides unstyled, accessible, and highly composable components. We copy components into our codebase for full control. The `shadcn@latest` CLI is used. | Mantine, Chakra UI, Headless UI         |
| **Tailwind CSS** | `^4.0.0-alpha`  | Utility-First CSS Framework | A config-less, high-performance engine that works perfectly with our component-based architecture. All theming is done via CSS variables in `globals.css`. | CSS Modules, Styled Components, Emotion |
| **Lucide React** | `^0.395.0`      | Icon Library                | Simple and beautiful open-source icons, a common choice for ShadCN/ui projects.                                                                | React Icons, Heroicons, Phosphor Icons  |

## Backend & Data

The "brains" of the operation, handling data, logic, and authentication.

| Technology            | Version / Spec        | Role & Purpose                          | Reason for Choice                                                                                                                                            | Alternatives Considered       |
| :-------------------- | :-------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
| **Supabase**          | Managed by Provider   | Backend-as-a-Service (BaaS)             | Our primary backend. Provides an integrated suite of open-source tools, including database, authentication, and storage, dramatically simplifying our stack. | Firebase, PlanetScale, Neon   |
| **Supabase Auth**     | Managed by Provider   | Authentication Service                  | Tightly integrated with the database, enabling powerful Row Level Security (RLS). Simplifies user management and secure data access out-of-the-box.          | Auth.js, Clerk, Firebase Auth |
| **Supabase Realtime** | Managed by Provider   | Real-time Push Notifications            | Natively integrated with our Supabase backend. The ideal choice for powering features like the "Pending Ratings" notifications with WebSocket subscriptions. | Pusher, Socket.io, Ably       |
| **PostgreSQL**        | `16.x` (via Supabase) | Relational Database                     | The industry-standard, robust, and scalable open-source database. Supabase provisions and manages our instance.                                              | MySQL, SQLite, MongoDB        |
| **Prisma**            | `^5.14.0`             | Next-gen ORM (Object-Relational Mapper) | Connects our Next.js app to the PostgreSQL database with end-to-end type safety. Generates a type-safe client for all database queries. **Configuration Note:** Due to network issues with Supabase's direct connection, we use the `directUrl` feature in `schema.prisma`. `url` points to the Transaction Pooler (port `6543`), while `directUrl` points to the Session Pooler (port `5432`) for migrations. | Drizzle, TypeORM, Kysely      |
| **TMDB API**          | `v3` (REST API)       | External Data Source                    | The free and comprehensive API for all movie, TV show, season, and episode metadata, including posters, ratings, and synopses.                               | OMDb API, JustWatch API       |

### Database Schema Versioning

| Prisma Version | Schema Version | Migration Status | Notes                                              |
| -------------- | -------------- | ---------------- | -------------------------------------------------- |
| 5.14.x         | 1.0.0          | ✅ Current       | Initial schema with user profiles, movies, ratings |
| 5.13.x         | 0.9.x          | 🔄 Legacy        | Pre-production schema                              |

## Forms & Validation

Handling user input reliably and safely.

| Technology          | Version   | Role & Purpose                  | Reason for Choice                                                                                                             | Alternatives Considered  |
| :------------------ | :-------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| **React Hook Form** | `^7.51.5` | Form State Management           | Highly performant and easy-to-use library for managing complex form states with minimal re-renders.                           | Formik, React Final Form |
| **Zod**             | `^3.23.8` | Schema Declaration & Validation | Define a single schema for form data that is used for TypeScript type inference, frontend validation, and backend validation. | Yup, Joi, Superstruct    |

## Development Tooling & Code Quality

Tools that ensure our code is consistent, clean, and bug-free.

| Technology                    | Version   | Role & Purpose              | Reason for Choice                                                                                                         | Alternatives Considered   |
| :---------------------------- | :-------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :------------------------ |
| **Prettier**                  | `^3.3.2`  | Opinionated Code Formatter  | Enforces a consistent code style across the entire project, eliminating debates over formatting.                          | Rome (deprecated), dprint |
| **ESLint**                    | `^9.5.0`  | Code Linter                 | Statically analyzes code to find and fix problems. Uses the modern "flat config" (`eslint.config.mjs`) standard.        | TSLint (deprecated), Rome |
| `eslint-config-prettier`      | `^9.1.0`  | Prettier/ESLint Integration | Disables ESLint rules that conflict with Prettier, allowing them to work together without fighting.                       | Built-in configs          |
| `prettier-plugin-tailwindcss` | `^0.6.5`  | Prettier Plugin             | Automatically sorts Tailwind CSS classes in a consistent order, improving readability.                                    | Manual sorting            |
| `dotenv-cli`                  | `^7.4.2`  | Env File Loader for Scripts | Allows safely running scripts (like local DB migrations) against different `.env` files. Used for `pnpm db:migrate:dev`. | Manual env management     |

## Testing & Quality Assurance

Ensuring code reliability and user experience quality.

| Technology          | Version   | Role & Purpose          | Reason for Choice                                                                            | Alternatives Considered |
| :------------------ | :-------- | :---------------------- | :------------------------------------------------------------------------------------------- | :---------------------- |
| **Vitest**          | `^1.6.0`  | Unit Testing Framework  | Fast, modern testing framework with excellent TypeScript support and a Jest-compatible API.  | Jest, Node Test Runner  |
| **Testing Library** | `^14.0.0` | React Testing Utilities | Best practices for testing React components with focus on user behavior over implementation. | Enzyme (deprecated)     |
| **Playwright**      | `^1.44.0` | End-to-End Testing      | Reliable cross-browser testing for critical user journeys. To be implemented post-MVP.       | Cypress, Puppeteer      |
| **MSW**             | `^2.3.0`  | API Mocking             | Mock Service Worker for testing API interactions without hitting real endpoints.             | Nock, JSON Server       |

### Testing Coverage Targets (Post-MVP)

| Test Type         | Coverage Target     | Current Status |
| ----------------- | ------------------- | -------------- |
| Unit Tests        | 80%+                | 🎯 Target      |
| Integration Tests | 70%+                | 🎯 Target      |
| E2E Tests         | Critical paths only | 🎯 Target      |

## Observability & Monitoring

Tools for monitoring application health and performance.

| Technology           | Version / Spec      | Role & Purpose              | Reason for Choice                                                                                   | Alternatives Considered     |
| :------------------- | :------------------ | :-------------------------- | :-------------------------------------------------------------------------------------------------- | :-------------------------- |
| **Vercel Analytics** | Managed by Provider | Web Analytics & Performance | Built-in with Vercel deployment, provides Core Web Vitals and user analytics sufficient for launch. | Google Analytics, Plausible |

## Environment Differences

### Development Environment

- Local PostgreSQL via Docker Compose
- Hot reload enabled
- Detailed error messages
- All logging levels enabled

### Production Environment

- Supabase managed PostgreSQL
- Optimized builds
- Error boundaries with user-friendly messages
- Basic logging via Vercel Functions

---

## Installation Commands

### Initial Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd flicklog
pnpm install

# Environment setup
# Create a .env.local file from the example for local development
cp .env.example .env.local
# Create a .env file for production secrets (used by Prisma migrate)
cp .env.example .env
# Configure environment variables in both files

# Database setup against local Docker container
pnpm db:migrate:dev --name initial-schema

# ShadCN/ui initialization (if not already done)
npx shadcn@latest init
```

### Main Dependencies

```bash
pnpm add next@^15.0.0 react@^19.0.0 react-dom@^19.0.0 zod@^3.23.8 @prisma/client@^5.14.0 @supabase/ssr @supabase/supabase-js @hookform/resolvers react-hook-form tailwind-merge lucide-react clsx
```

### Development Dependencies

```bash
pnpm add -D typescript@^5.4.5 tailwindcss@^4.0.0-alpha @tailwindcss/postcss postcss prisma@^5.14.0 prettier@^3.3.2 eslint@^9.5.0 eslint-config-prettier@^9.1.0 prettier-plugin-tailwindcss@^0.6.5 dotenv-cli@^7.4.2 vitest@^1.6.0 @testing-library/react@^14.0.0 @playwright/test@^1.44.0 msw@^2.3.0
```

---

## Decision Records

### Architecture Decision Record (ADR) Summary

| Decision                       | Date    | Rationale                                                           | Status    |
| ------------------------------ | ------- | ------------------------------------------------------------------- | --------- |
| Next.js over Remix             | 2024-12 | Better ecosystem, Vercel integration                                | ✅ Active |
| Supabase over Firebase         | 2024-12 | Open source, PostgreSQL, better DX                                  | ✅ Active |
| Prisma over Drizzle            | 2024-12 | Mature ecosystem, better VS Code support                            | ✅ Active |
| **Supabase Auth over Auth.js** | 2024-12 | Tighter integration (RLS), less complexity, single backend provider | ✅ Active |

### Future Considerations

- **Advanced Error Tracking:** As user traffic grows, integrate **Sentry** for real-time error monitoring and alerting.
- **Caching & Rate Limiting:** When TMDB API usage or database load becomes a bottleneck, implement **Upstash Redis** for caching expensive queries and rate-limiting actions.
- **Edge Runtime**: Evaluate for specific API routes when traffic grows.
- **E2E Testing:** Implement a full suite of **Playwright** tests for critical user journeys before scaling to a wider audience.
- **CDN Strategy**: Consider Cloudflare for global image optimization.

---

## Glossary

**BaaS**: Backend-as-a-Service - Cloud platforms providing backend services  
**ORM**: Object-Relational Mapping - Database abstraction layer  
**SSR**: Server-Side Rendering - Rendering pages on the server  
**RLS**: Row Level Security - Fine-grained access control in PostgreSQL
**DX**: Developer Experience - How pleasant and productive development feels
**ADR**: Architecture Decision Record - Documentation of technical decisions

---

_Last Updated: July 2025_  
_Next Review: August 2025_  
_Document Owner: Development Team_
