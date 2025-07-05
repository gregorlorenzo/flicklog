## Phase 1: The Core "Personal Space" Experience

**Overall Goal:** Implement the complete end-to-end functionality for a single user. This includes authentication, automatic creation of a personal space, the ability to search for and log a new movie with a rating and comments, and viewing the logged entry in a visual library.

**Status:** ✅ **Completed** (July 5, 2025)

---

### Milestone 1.1: User Authentication & Profile Creation

**Goal:** Implement a complete authentication flow using Supabase Auth. A new user's sign-up must automatically trigger the creation of their associated `Profile` and default `Personal Space`.
**Key Document References:** `database_schema.md`, `project_guideline.md`, `flicklog.md`

| Task ID | Task Description                                                                               | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                                        | Status   | Notes/Blockers                                                                                                                                                                                                                                                               |
| :------ | :--------------------------------------------------------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1.1  | Implement Supabase Server-Side Auth helpers for Next.js.                                       | Backend          | Create `lib/supabase/server.ts` and `lib/supabase/client.ts` as per Supabase docs.                                                                          | ✅ Done  |                                                                                                                                                                                                                                                                          |
| P1.1.2  | Create `login`, `signup`, and `callback` routes as required by `@supabase/ssr`.                | Backend          | The routes exist and handle the OAuth flow correctly.                                                                                                       | ✅ Done  |                                                                                                                                                                                                                                                                          |
| P1.1.3  | Create simple Login and Signup pages.                                                          | Frontend         | The pages render. Styling can be basic for now; focus on functionality.                                                                                     | ✅ Done  | Encountered and fixed breaking change in Next.js 15 where `searchParams` are now async.                                                                                                                                                                            |
| P1.1.4  | **[CRITICAL]** Create a Supabase Database Function (or Trigger) to handle new user sign-ups.   | Backend          | **Verification:** When a new user signs up (a new row appears in `auth.users`), a corresponding row is automatically created in our public `Profile` table. | ✅ Done  | **Major Blocker:** This was the source of many `500` errors. The final SQL is stored in `prisma/setup.sql`. See `error_logbook.md` for full details on the `raw_app_meta_data` and `NOT NULL` constraint bugs. |
| P1.1.5  | Extend the new user trigger to also create a default `Personal` `Space` for the user.          | Backend          | **Verification:** The new user also gets one `Space` with `type: 'PERSONAL'` and `owner_id` set to their new user ID.                                       | ✅ Done  | Included in the final `prisma/setup.sql` script.                                                                                                                                                                                                                       |
| P1.1.6  | Implement a `sign-out` Server Action.                                                          | Backend          | **Test:** A logged-in user can successfully sign out and is redirected to the login page.                                                                   | ✅ Done  |                                                                                                                                                                                                                                                                          |
| P1.1.7  | Create a middleware (`middleware.ts`) to protect all application routes except for auth pages. | Backend          | **Verification:** A logged-out user attempting to access the main app is redirected to the login page.                                                      | ✅ Done  |                                                                                                                                                                                                                                                                          |

---

### Milestone 1.2: TMDB API Service Layer

**Goal:** Create a robust, server-side-only service for interacting with the TMDB API, including caching to respect rate limits.
**Key Document References:** `api_contracts.md`, `tech_stack.md`

| Task ID | Task Description                                                        | Backend/Frontend | Verification (How to Confirm)                                                                 | Status   | Notes/Blockers                                                                                                            |
| :------ | :---------------------------------------------------------------------- | :--------------- | :-------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------ |
| P1.2.1  | Create a TMDB API client service in `lib/tmdb/tmdb-client.ts`.          | Backend          | The file exists and encapsulates all `fetch` logic for TMDB.                                  | ✅ Done  | Refactored to split client-safe utils (`tmdb-utils.ts`) from server-only client to prevent leaking API key to browser. |
| P1.2.2  | Implement the `GET /configuration` endpoint call and cache its results. | Backend          | The function correctly constructs an image URL (e.g., `https://image.tmdb.org/t/p/w500/...`). | ✅ Done  |                                                                                                                           |
| P1.2.3  | Implement the `GET /search/movie` endpoint function.                    | Backend          | Calling the function with a query returns a list of movies matching the expected shape.       | ✅ Done  | Initial implementation failed with `401 Unauthorized` due to incorrect use of `Bearer` token instead of `api_key` query param. |
| P1.2.4  | Implement the `GET /search/tv` endpoint function.                       | Backend          | Calling the function with a query returns a list of TV shows matching the expected shape.     | ✅ Done  |                                                                                                                           |
| P1.2.5  | Implement the `GET /movie/{movie_id}` endpoint function.                | Backend          | Calling the function with a movie ID returns the detailed movie object.                       | ✅ Done  |                                                                                                                           |

---

### Milestone 1.3: The Logging Form

**Goal:** Build the complete client-side form for logging a new entry, using `react-hook-form` and `zod` for state management and validation.
**Key Document References:** `flicklog.md` (Pillar I), `design_guideline.md`, `tech_stack.md`

| Task ID | Task Description                                                                      | Backend/Frontend | Verification (How to Confirm)                                                                                                      | Status   | Notes/Blockers                                                                                              |
| :------ | :------------------------------------------------------------------------------------ | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------- |
| P1.3.1  | Create a new page, e.g., `/log/new`.                                                  | Frontend         | The page is reachable by a logged-in user.                                                                                         | ✅ Done  |                                                                                                             |
| P1.3.2  | Create a Zod schema for the log form data (`rating`, `watchedOn`, `quickTake`, etc.). | Both             | The schema exists and can be used to infer the form's TypeScript type.                                                             | ✅ Done  |                                                                                                             |
| P1.3.3  | Build the TMDB search input component. It should be a client component.               | Frontend         | Typing in the input calls a server action which uses the TMDB client (from M1.2) to fetch and display search results.              | ✅ Done  | Required adding `image.tmdb.org` to `next.config.js` to allow `next/image` optimization.                    |
| P1.3.4  | Build the 5-star rating input component with half-star increments.                    | Frontend         | A user can select ratings like 3.0, 3.5, 4.0, etc.                                                                                 | ✅ Done  | Initial implementation had UX bugs (flickering, incorrect click area) which were subsequently polished. |
| P1.3.5  | Assemble the full form using `react-hook-form` and the Zod resolver.                  | Frontend         | The form renders with all fields: selected movie, rating, watched on (date picker), quick take (text), deeper thoughts (textarea). | ✅ Done  |                                                                                                             |
| P1.3.6  | Implement client-side validation using the Zod schema.                                | Frontend         | Submitting the form with invalid data (e.g., no rating) displays an error message and prevents submission.                         | ✅ Done  |                                                                                                             |

---

### Milestone 1.4: The Logging Server Action

**Goal:** Implement the backend logic to securely process the form submission and create the corresponding records in the database.
**Key Document References:** `project_guideline.md`, `database_schema.md`

| Task ID | Task Description                                                                    | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                             | Status   | Notes/Blockers                                                                                                                                                                                                                                |
| :------ | :---------------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1.4.1  | Create a new Server Action file, e.g., `actions/log-actions.ts`.                    | Backend          | The file is created following the project structure.                                                                                             | ✅ Done  |                                                                                                                                                                                                                                           |
| P1.4.2  | Define the `createLogEntry` server action, accepting the form data.                 | Backend          | **Test:** An unauthenticated user cannot call this action. It returns an auth error.                                                             | ✅ Done  |                                                                                                                                                                                                                                           |
| P1.4.3  | In the action, re-validate the incoming data against the Zod schema from M1.3.      | Backend          | **Test:** Sending malformed data to the action results in a validation error, not a server crash.                                                | ✅ Done  |                                                                                                                                                                                                                                           |
| P1.4.4  | Implement the core database logic within a Prisma transaction.                      | Backend          | **Test:** The action successfully creates a `LogEntry`, a `Rating`, and a `Comment` in the database.                                             | ✅ Done  | Implemented `upsert` for `LogEntry` to prevent duplicates.                                                                                                                                                                                |
| P1.4.5  | Connect the frontend form's `onSubmit` handler to call the `createLogEntry` action. | Both             | **Verification:** Submitting a valid form successfully creates all records in the Supabase DB and redirects the user to their library/dashboard. | ✅ Done  | **Major Blocker:** Initial implementation failed due to the Prisma client connecting to the wrong database (local vs. remote). Solved by creating a singleton Prisma client instance in `lib/db.ts` that correctly uses environment variables. |

---

### Milestone 1.5: The Visual Library

**Goal:** Display the user's logged entries in a visually appealing grid, fetching data from both our database and the TMDB API.
**Key Document References:** `flicklog.md` (Pillar II), `design_guideline.md`, `api_contracts.md`

| Task ID | Task Description                                                                                      | Backend/Frontend | Verification (How to Confirm)                                                                                  | Status   | Notes/Blockers                                                              |
| :------ | :---------------------------------------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------- |
| P1.5.1  | Create the main dashboard page (e.g., the root `/` route for a logged-in user).                       | Frontend         | A logged-in user is directed to this page.                                                                     | ✅ Done  |                                                                             |
| P1.5.2  | In the dashboard page (Server Component), fetch all `LogEntry` records for the user's personal space. | Backend          | The component successfully queries the database for the user's data.                                           | ✅ Done  |                                                                             |
| P1.5.3  | For each `LogEntry`, fetch its metadata (title, poster_path) from the TMDB API client.                | Backend          | The page can merge DB data (rating) with API data (poster).                                                    | ✅ Done  |                                                                             |
| P1.5.4  | Create a `LogEntryCard` component.                                                                    | Frontend         | The component exists and accepts props for title, poster URL, and user rating.                                 | ✅ Done  |                                                                             |
| P1.5.5  | Style the `LogEntryCard` according to `design_guideline.md`.                                          | Frontend         | The card has the correct background color (`#252931`), border radius (`rounded-lg`), shadow, and hover states. | ✅ Done  |                                                                             |
| P1.5.6  | Render the fetched log entries on the dashboard page as a grid of `LogEntryCard` components.          | Frontend         | The dashboard correctly displays all movies the user has logged, each with its poster and star rating.         | ✅ Done  | Build failed initially due to ESLint `no-unescaped-entities` rule. Fixed by replacing `'` with `'`. |

---

### **End of Phase 1 Review:**

- **Is the full authentication loop functional?** ✅
- **Does a new user automatically get a profile and a personal space?** ✅
- **Can a user search for a movie and fill out the log form?** ✅
- **Does submitting the form create all the correct database records?** ✅
- **Can a user see their logged movies in a visual library?** ✅
- **Does the core UI reflect the design guidelines?** ✅
