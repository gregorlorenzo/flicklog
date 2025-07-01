## Phase 1: The Core "Personal Space" Experience

**Overall Goal:** Implement the complete end-to-end functionality for a single user. This includes authentication, automatic creation of a personal space, the ability to search for and log a new movie with a rating and comments, and viewing the logged entry in a visual library.

**Status:** ⏳ **Not Started**

---

### Milestone 1.1: User Authentication & Profile Creation

**Goal:** Implement a complete authentication flow using Supabase Auth. A new user's sign-up must automatically trigger the creation of their associated `Profile` and default `Personal Space`.
**Key Document References:** `database_schema.md`, `project_guideline.md`, `flicklog.md`

| Task ID | Task Description                                                                               | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                                        | Status   | Notes/Blockers                                      |
| :------ | :--------------------------------------------------------------------------------------------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------- |
| P1.1.1  | Implement Supabase Server-Side Auth helpers for Next.js.                                       | Backend          | Create `lib/supabase/server.ts` and `lib/supabase/client.ts` as per Supabase docs.                                                                          | ⬜ To Do | This is the core of our auth strategy.              |
| P1.1.2  | Create `login`, `signup`, and `callback` routes as required by `@supabase/ssr`.                | Backend          | The routes exist and handle the OAuth flow correctly.                                                                                                       | ⬜ To Do |                                                     |
| P1.1.3  | Create simple Login and Signup pages.                                                          | Frontend         | The pages render. Styling can be basic for now; focus on functionality.                                                                                     | ⬜ To Do |                                                     |
| P1.1.4  | **[CRITICAL]** Create a Supabase Database Function (or Trigger) to handle new user sign-ups.   | Backend          | **Verification:** When a new user signs up (a new row appears in `auth.users`), a corresponding row is automatically created in our public `Profile` table. | ⬜ To Do | This connects the `auth` and `public` schemas.      |
| P1.1.5  | Extend the new user trigger to also create a default `Personal` `Space` for the user.          | Backend          | **Verification:** The new user also gets one `Space` with `type: 'PERSONAL'` and `owner_id` set to their new user ID.                                       | ⬜ To Do | References `Space` model from `database_schema.md`. |
| P1.1.6  | Implement a `sign-out` Server Action.                                                          | Backend          | **Test:** A logged-in user can successfully sign out and is redirected to the login page.                                                                   | ⬜ To Do |                                                     |
| P1.1.7  | Create a middleware (`middleware.ts`) to protect all application routes except for auth pages. | Backend          | **Verification:** A logged-out user attempting to access the main app is redirected to the login page.                                                      | ⬜ To Do |                                                     |

---

### Milestone 1.2: TMDB API Service Layer

**Goal:** Create a robust, server-side-only service for interacting with the TMDB API, including caching to respect rate limits.
**Key Document References:** `api_contracts.md`, `tech_stack.md`

| Task ID | Task Description                                                        | Backend/Frontend | Verification (How to Confirm)                                                                 | Status   | Notes/Blockers                                                                                  |
| :------ | :---------------------------------------------------------------------- | :--------------- | :-------------------------------------------------------------------------------------------- | :------- | :---------------------------------------------------------------------------------------------- |
| P1.2.1  | Create a TMDB API client service in `lib/tmdb-client.ts`.               | Backend          | The file exists and encapsulates all `fetch` logic for TMDB.                                  | ⬜ To Do | The `TMDB_API_KEY` should be a server-side environment variable.                                |
| P1.2.2  | Implement the `GET /configuration` endpoint call and cache its results. | Backend          | The function correctly constructs an image URL (e.g., `https://image.tmdb.org/t/p/w500/...`). | ⬜ To Do | Per `api_contracts.md`, this is a critical first step. Use Next.js `unstable_cache` or similar. |
| P1.2.3  | Implement the `GET /search/movie` endpoint function.                    | Backend          | Calling the function with a query returns a list of movies matching the expected shape.       | ⬜ To Do |                                                                                                 |
| P1.2.4  | Implement the `GET /search/tv` endpoint function.                       | Backend          | Calling the function with a query returns a list of TV shows matching the expected shape.     | ⬜ To Do |                                                                                                 |
| P1.2.5  | Implement the `GET /movie/{movie_id}` endpoint function.                | Backend          | Calling the function with a movie ID returns the detailed movie object.                       | ⬜ To Do |                                                                                                 |

---

### Milestone 1.3: The Logging Form

**Goal:** Build the complete client-side form for logging a new entry, using `react-hook-form` and `zod` for state management and validation.
**Key Document References:** `flicklog.md` (Pillar I), `design_guideline.md`, `tech_stack.md`

| Task ID | Task Description                                                                      | Backend/Frontend | Verification (How to Confirm)                                                                                                      | Status   | Notes/Blockers                                                  |
| :------ | :------------------------------------------------------------------------------------ | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------- |
| P1.3.1  | Create a new page, e.g., `/log/new`.                                                  | Frontend         | The page is reachable by a logged-in user.                                                                                         | ⬜ To Do |                                                                 |
| P1.3.2  | Create a Zod schema for the log form data (`rating`, `watchedOn`, `quickTake`, etc.). | Both             | The schema exists and can be used to infer the form's TypeScript type.                                                             | ⬜ To Do | This schema will be reused in the Server Action for validation. |
| P1.3.3  | Build the TMDB search input component. It should be a client component.               | Frontend         | Typing in the input calls a server action which uses the TMDB client (from M1.2) to fetch and display search results.              | ⬜ To Do | Implement debouncing to prevent excessive API calls.            |
| P1.3.4  | Build the 5-star rating input component with half-star increments.                    | Frontend         | A user can select ratings like 3.0, 3.5, 4.0, etc.                                                                                 | ⬜ To Do | As per `flicklog.md`.                                           |
| P1.3.5  | Assemble the full form using `react-hook-form` and the Zod resolver.                  | Frontend         | The form renders with all fields: selected movie, rating, watched on (date picker), quick take (text), deeper thoughts (textarea). | ⬜ To Do | Use `shadcn/ui` components for inputs, date picker, etc.        |
| P1.3.6  | Implement client-side validation using the Zod schema.                                | Frontend         | Submitting the form with invalid data (e.g., no rating) displays an error message and prevents submission.                         | ⬜ To Do |                                                                 |

---

### Milestone 1.4: The Logging Server Action

**Goal:** Implement the backend logic to securely process the form submission and create the corresponding records in the database.
**Key Document References:** `project_guideline.md`, `database_schema.md`

| Task ID | Task Description                                                                    | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                             | Status   | Notes/Blockers                                                                                                                                                 |
| :------ | :---------------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.4.1  | Create a new Server Action file, e.g., `actions/log-actions.ts`.                    | Backend          | The file is created following the project structure.                                                                                             | ⬜ To Do |                                                                                                                                                                |
| P1.4.2  | Define the `createLogEntry` server action, accepting the form data.                 | Backend          | **Test:** An unauthenticated user cannot call this action. It returns an auth error.                                                             | ⬜ To Do | This is the security checklist from `project_guideline.md`.                                                                                                    |
| P1.4.3  | In the action, re-validate the incoming data against the Zod schema from M1.3.      | Backend          | **Test:** Sending malformed data to the action results in a validation error, not a server crash.                                                | ⬜ To Do | Never trust the client.                                                                                                                                        |
| P1.4.4  | Implement the core database logic within a Prisma transaction.                      | Backend          | **Test:** The action successfully creates a `LogEntry`, a `Rating`, and a `Comment` in the database.                                             | ⬜ To Do | 1. Find the user's personal space. 2. Create `LogEntry`. 3. Create `Rating` linked to the user and the new entry. 4. Create `Comment`(s) linked to the rating. |
| P1.4.5  | Connect the frontend form's `onSubmit` handler to call the `createLogEntry` action. | Both             | **Verification:** Submitting a valid form successfully creates all records in the Supabase DB and redirects the user to their library/dashboard. | ⬜ To Do | Use `useFormState` or similar for pending/error UI states.                                                                                                     |

---

### Milestone 1.5: The Visual Library

**Goal:** Display the user's logged entries in a visually appealing grid, fetching data from both our database and the TMDB API.
**Key Document References:** `flicklog.md` (Pillar II), `design_guideline.md`, `api_contracts.md`

| Task ID | Task Description                                                                                      | Backend/Frontend | Verification (How to Confirm)                                                                                  | Status   | Notes/Blockers                                                      |
| :------ | :---------------------------------------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------ |
| P1.5.1  | Create the main dashboard page (e.g., the root `/` route for a logged-in user).                       | Frontend         | A logged-in user is directed to this page.                                                                     | ⬜ To Do |                                                                     |
| P1.5.2  | In the dashboard page (Server Component), fetch all `LogEntry` records for the user's personal space. | Backend          | The component successfully queries the database for the user's data.                                           | ⬜ To Do | This will involve a Prisma query with several `include` statements. |
| P1.5.3  | For each `LogEntry`, fetch its metadata (title, poster_path) from the TMDB API client.                | Backend          | The page can merge DB data (rating) with API data (poster).                                                    | ⬜ To Do | Use `Promise.all` to fetch data for all entries in parallel.        |
| P1.5.4  | Create a `LogEntryCard` component.                                                                    | Frontend         | The component exists and accepts props for title, poster URL, and user rating.                                 | ⬜ To Do |                                                                     |
| P1.5.5  | Style the `LogEntryCard` according to `design_guideline.md`.                                          | Frontend         | The card has the correct background color (`#252931`), border radius (`rounded-lg`), shadow, and hover states. | ⬜ To Do |                                                                     |
| P1.5.6  | Render the fetched log entries on the dashboard page as a grid of `LogEntryCard` components.          | Frontend         | The dashboard correctly displays all movies the user has logged, each with its poster and star rating.         | ⬜ To Do |                                                                     |

---

### **End of Phase 1 Review:**

- **Is the full authentication loop functional?** ⬜
- **Does a new user automatically get a profile and a personal space?** ⬜
- **Can a user search for a movie and fill out the log form?** ⬜
- **Does submitting the form create all the correct database records?** ⬜
- **Can a user see their logged movies in a visual library?** ⬜
- **Does the core UI reflect the design guidelines?** ⬜
