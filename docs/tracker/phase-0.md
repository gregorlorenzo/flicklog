# **Flicklog: Development Plan**

**Developer:** Gregor Lorenzo
**Approach:** Server-First, focusing on establishing a solid backend, data layer, and development environment before building complex UI features.
**Local Environment:** WSL2 with Docker for a containerized PostgreSQL database, mirroring the Supabase production environment.

## Phase 0: Foundation & Core Infrastructure

**Overall Goal:** Establish a secure, stable, and correctly configured Next.js project. Set up the complete development toolchain, connect to Supabase, implement the full database schema, and deploy a "hello world" version to Vercel to prove the CI/CD pipeline is functional.

**Status:** ⏳ **Not Started**

---

### Milestone 0.1: Local Development Environment Setup

**Goal:** Configure a consistent and isolated development environment using WSL2 and Docker. This ensures the project can be run by any developer without "it works on my machine" issues.
**Key Document References:** `tech_stack.md`

| Task ID | Task Description                                                                        | Backend/Frontend | Verification (How to Confirm)                                                                                        | Status   | Notes/Blockers                                 |
| :------ | :-------------------------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------- | :------- | :--------------------------------------------- |
| P0.1.1  | Install and configure WSL2 on Windows.                                                  | Backend          | `wsl --version` command runs successfully in PowerShell.                                                             | ⬜ To Do |                                                |
| P0.1.2  | Install Docker Desktop for Windows and ensure WSL2 integration is enabled.              | Backend          | Docker Desktop dashboard is running and shows WSL2 integration as active.                                            | ⬜ To Do |                                                |
| P0.1.3  | Create a `docker-compose.yml` file at the project root to run a PostgreSQL container.   | Backend          | `docker-compose up -d` starts the Postgres container without errors. `docker ps` shows it's running.                 | ⬜ To Do | Use `postgres:16` image to match Supabase.     |
| P0.1.4  | Create an `.env.example` file with the connection string for the local Docker database. | Backend          | The file exists and contains a placeholder like `DATABASE_URL="postgresql://user:password@localhost:5432/flicklog"`. | ⬜ To Do |                                                |
| P0.1.5  | Install Node.js (v18+) and `pnpm` (or `npm`/`yarn`) within the WSL2 environment.        | Backend          | `node -v` and `pnpm -v` show the correct versions.                                                                   | ⬜ To Do | `pnpm` is generally faster and more efficient. |

---

### Milestone 0.2: Project Initialization & Tooling

**Goal:** Create the Next.js application, initialize version control, and configure the code quality toolchain for consistency and maintainability.
**Key Document References:** `tech_stack.md`, `project_guideline.md`

| Task ID | Task Description                                                                   | Backend/Frontend | Verification (How to Confirm)                                                             | Status   | Notes/Blockers                                                          |
| :------ | :--------------------------------------------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------- | :------- | :---------------------------------------------------------------------- |
| P0.2.1  | Initialize a new Next.js project using `npx create-next-app@latest`.               | Both             | The app runs locally with `pnpm dev` and is accessible in the browser.                    | ⬜ To Do | Choose options: TypeScript, ESLint, Tailwind CSS, App Router.           |
| P0.2.2  | Initialize a Git repository, create a `main` branch, and make the initial commit.  | Both             | `git status` is clean. The commit history shows the initial project setup.                | ⬜ To Do |                                                                         |
| P0.2.3  | Create a new repository on GitHub and push the initial commit.                     | Both             | The code is visible on the remote GitHub repository.                                      | ⬜ To Do |                                                                         |
| P0.2.4  | Install and configure Prettier with the Tailwind CSS plugin.                       | Frontend         | Create `.prettierrc` file. Running `pnpm prettier --write .` formats all files correctly. | ⬜ To Do | Per `tech_stack.md`, install `prettier`, `prettier-plugin-tailwindcss`. |
| P0.2.5  | Configure ESLint to work with Prettier.                                            | Both             | `pnpm lint` runs without errors and does not conflict with Prettier's formatting.         | ⬜ To Do | Install `eslint-config-prettier`.                                       |
| P0.2.6  | Create the core directory structure (`components/shared`, `lib`, `actions`, etc.). | Both             | The folders outlined in `project_guideline.md` exist in the project root.                 | ⬜ To Do | Add `.gitkeep` files to empty directories to commit them.               |

---

### Milestone 0.3: Backend & Database Integration

**Goal:** Connect the Next.js application to the Supabase backend for both database and authentication services.
**Key Document References:** `tech_stack.md`, `database_schema.md`

| Task ID | Task Description                                                                 | Backend/Frontend | Verification (How to Confirm)                                                             | Status   | Notes/Blockers                                                                                                                             |
| :------ | :------------------------------------------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| P0.3.1  | Create a new project in the Supabase dashboard.                                  | Backend          | The project exists and you have access to the dashboard and API settings.                 | ⬜ To Do | Save the Project URL and `anon` key.                                                                                                       |
| P0.3.2  | Create a `.env.local` file and add all necessary Supabase environment variables. | Backend          | The file is present and populated with keys.                                              | ⬜ To Do | This file is gitignored. Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.              |
| P0.3.3  | Install Prisma (`prisma`, `@prisma/client`).                                     | Backend          | Dependencies are added to `package.json`.                                                 | ⬜ To Do |                                                                                                                                            |
| P0.3.4  | Initialize Prisma with `npx prisma init`.                                        | Backend          | `prisma/schema.prisma` file is created and the `datasource` provider is `postgresql`.     | ⬜ To Do |                                                                                                                                            |
| P0.3.5  | Update the `.env` file with the `DATABASE_URL` for the production Supabase DB.   | Backend          | Prisma needs the direct DB connection string from Supabase settings (Connection Pooling). | ⬜ To Do | This URL is different from the local Docker one. Use the local URL for `pnpm dev`, but the Supabase URL for migrations against production. |
| P0.3.6  | Install Supabase helper libraries (`@supabase/ssr`, `@supabase/supabase-js`).    | Both             | Dependencies are added to `package.json`.                                                 | ⬜ To Do |                                                                                                                                            |

---

### Milestone 0.4: Core Schema Implementation

**Goal:** Translate the entire `database_schema.md` into a working Prisma schema and apply it to the database.
**Key Document References:** `database_schema.md`

| Task ID | Task Description                                                                     | Backend/Frontend | Verification (How to Confirm)                                                                                    | Status   | Notes/Blockers                                                         |
| :------ | :----------------------------------------------------------------------------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------- |
| P0.4.1  | Define all enums (`SpaceType`, `SpaceMemberRole`, `CommentType`) in `schema.prisma`. | Backend          | The schema is valid according to `npx prisma format`.                                                            | ⬜ To Do |                                                                        |
| P0.4.2  | Define the `Profile`, `Space`, and `SpaceMember` models in `schema.prisma`.          | Backend          | The schema is valid. Correctly define relations and the composite key for `SpaceMember`.                         | ⬜ To Do | `Profile` has a one-to-one with `auth.users`.                          |
| P0.4.3  | Define the `LogEntry`, `Rating`, and `Comment` models in `schema.prisma`.            | Backend          | The schema is valid. Ensure foreign keys and relations are correct.                                              | ⬜ To Do |                                                                        |
| P0.4.4  | Define the `PendingRating` model with its composite key in `schema.prisma`.          | Backend          | The schema is valid.                                                                                             | ⬜ To Do | `@@id([log_entry_id, user_id])`                                        |
| P0.4.5  | Run `npx prisma migrate dev --name initial-schema` against the **local Docker DB**.  | Backend          | A migration file is created in `prisma/migrations` and the schema is successfully applied to the local DB.       | ⬜ To Do | This confirms the schema is syntactically correct and logically sound. |
| P0.4.6  | Run `npx prisma generate` to create the type-safe Prisma Client.                     | Backend          | The `@prisma/client` in `node_modules` is updated with types for all our models (e.g., `prisma.space.findMany`). | ⬜ To Do |                                                                        |

---

### Milestone 0.5: UI Foundation & Core Layout

**Goal:** Set up the foundational UI components and styles based on the design system, ensuring the app reflects the brand's look and feel from the start.
**Key Document References:** `design_guideline.md`, `tech_stack.md`

| Task ID | Task Description                                                                                        | Backend/Frontend | Verification (How to Confirm)                                                      | Status   | Notes/Blockers                               |
| :------ | :------------------------------------------------------------------------------------------------------ | :--------------- | :--------------------------------------------------------------------------------- | :------- | :------------------------------------------- |
| P0.5.1  | Initialize `ShadCN/ui` in the project using `npx shadcn-ui@latest init`.                                | Frontend         | `components/ui` directory is created and `tailwind.config.js` is updated.          | ⬜ To Do |                                              |
| P0.5.2  | Update `tailwind.config.js` with the custom color palette and font families from `design_guideline.md`. | Frontend         | The `flicklog` color object and `fontFamily` extensions are present in the config. | ⬜ To Do | `bg-flicklog-bg-dark` should work.           |
| P0.5.3  | Configure `next/font` in the root `layout.tsx` for `Poppins` and `Source Sans Pro`.                     | Frontend         | Running the app shows the correct fonts loaded for headings and body text.         | ⬜ To Do |                                              |
| P0.5.4  | Style the root `layout.tsx` to apply the default background color (`#1A1D23`).                          | Frontend         | The app's default background is the correct dark charcoal color.                   | ⬜ To Do | This provides the "Night Mode" base.         |
| P0.5.5  | Install `lucide-react` for iconography.                                                                 | Frontend         | The dependency is added to `package.json`.                                         | ⬜ To Do |                                              |
| P0.5.6  | Install the ShadCN `button` component (`npx shadcn-ui@latest add button`).                              | Frontend         | The `button.tsx` file appears in `components/ui`.                                  | ⬜ To Do | We will use this to test the CI/CD pipeline. |

---

### Milestone 0.6: CI/CD & Initial Deployment

**Goal:** Establish a functioning deployment pipeline by connecting the project to Vercel and successfully deploying the foundational app.
**Key Document References:** `tech_stack.md`, `project_guideline.md`

| Task ID | Task Description                                                                      | Backend/Frontend | Verification (How to Confirm)                                                | Status   | Notes/Blockers                                                                  |
| :------ | :------------------------------------------------------------------------------------ | :--------------- | :--------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------ |
| P0.6.1  | Create a new project on Vercel and link it to the GitHub repository.                  | Backend          | Vercel dashboard shows the project linked to the correct repo.               | ⬜ To Do |                                                                                 |
| P0.6.2  | Configure all environment variables from `.env.local` in the Vercel project settings. | Backend          | All Supabase keys and the production `DATABASE_URL` are set in Vercel.       | ⬜ To Do | This is a critical step. Use the production DB connection string here.          |
| P0.6.3  | Configure the Vercel build command to include Prisma steps.                           | Backend          | The Vercel build log shows `prisma generate` running successfully.           | ⬜ To Do | Update `package.json` build script: `"build": "prisma generate && next build"`. |
| P0.6.4  | Add a simple test page that displays a ShadCN button to verify the UI pipeline.       | Both             | A page exists that renders a button component.                               | ⬜ To Do | Example: a simple "Hello Flicklog" page.                                        |
| P0.6.5  | Push changes to a new branch (e.g., `feat/initial-setup`) and open a Pull Request.    | Both             | A Vercel preview deployment is automatically created for the PR.             | ⬜ To Do |                                                                                 |
| P0.6.6  | Verify the preview deployment URL loads correctly and shows the test page and button. | Both             | The preview site works, proving the entire pipeline is configured correctly. | ⬜ To Do |                                                                                 |
| P0.6.7  | Merge the PR into the `main` branch.                                                  | Both             | The changes are deployed to the main production URL on Vercel.               | ⬜ To Do |                                                                                 |

---

### **End of Phase 0 Review:**

- **Local development environment is fully containerized and functional?** ⬜
- **Project structure and tooling are in place?** ⬜
- **Database schema is implemented and migrated?** ⬜
- **Next.js app is connected to Supabase?** ⬜
- **Core UI theme and fonts are configured?** ⬜
- **CI/CD pipeline to Vercel is proven to work?** ⬜