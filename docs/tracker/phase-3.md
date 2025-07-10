## Phase 3: Polish, Onboarding & Social Integration

**Overall Goal:** Elevate the Flicklog experience from a utility to a delightful product. This involves implementing the "Backlog Blitz" onboarding, building the data-rich stats dashboard, and adding the first external integration (Discord) to encourage sharing and community growth.

**Status:** ⏳ **In Progress**

---

### Milestone 3.1: The "Backlog Blitz" Onboarding Experience

**Goal:** Implement the guided, three-step onboarding flow to combat the "empty app" problem and immediately demonstrate the app's value.
**Key Document References:** `flicklog.md` (Section 5)

| Task ID | Task Description                                                                                                                            | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                            | Status   | Notes/Blockers                                                                                                                                                                                                        |
| :------ | :------------------------------------------------------------------------------------------------------------------------------------------ | :--------------- | :------------------------------------------------------------------------------------------------------------------------------ | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3.1.1  | Create a new user flag `has_completed_onboarding` in the `Profile` table.                                                                   | Backend          | The migration is created and applied. The column defaults to `false`.                                                           | ✅ Done  | **Major Blocker:** This required a complete reset and baselining of the Prisma migration history to work with the existing Supabase `auth` schema. The definitive solution is now documented in the project logs. |
| P3.1.2  | Create a multi-step wizard component for the onboarding flow.                                                                               | Frontend         | The component manages state for 3 steps: "Loved", "Okay", "Not for You".                                                        | ✅ Done  | Implemented in `onboarding-wizard.tsx` using a simple `useState` hook for the step counter.                                                                                                                           |
| P3.1.3  | Create a middleware or a check in the root layout to redirect new users (`has_completed_onboarding` is `false`) to the `/onboarding` route. | Both             | **Verification:** A newly signed-up user is forced into the onboarding flow before they can access the main app.                | ✅ Done  | Added logic to the existing `updateSession` middleware.                                                                                                                                                               |
| P3.1.4  | Implement the "Loved" step UI, including the TMDB search from Phase 1.                                                                      | Frontend         | The UI prompts the user to find a movie they loved and forces a high rating (e.g., 4.5-5 stars).                                | ✅ Done  | Created `OnboardingTmdbSearch` and `OnboardingStarRating` components to support the wizard's state management.                                                                                                        |
| P3.1.5  | Implement the "Okay" and "Not for You" steps.                                                                                               | Frontend         | The UI prompts for movies and constrains the rating to the appropriate range (e.g., 2.5-3.5 for "Okay", 1-2 for "Not for You"). | ✅ Done  | Reused the same components, passing different `min`/`max` props to the star rating component for each step.                                                                                                           |
| P3.1.6  | Create an `onboardLogEntry` Server Action.                                                                                                  | Backend          | This action takes a `tmdb_id` and a `rating` and creates a `LogEntry` in the user's personal space.                             | ✅ Done  | Consolidated into the `completeOnboarding` action.                                                                                                                                                                    |
| P3.1.7  | Create a final Server Action `completeOnboarding`.                                                                                          | Backend          | **Verification:** This action sets the `has_completed_onboarding` flag on the user's profile to `true`.                         | ✅ Done  | Implemented in `onboarding-actions.ts`. It handles all three log entries and the profile update in a single transaction.                                                                                              |
| P3.1.8  | After `completeOnboarding` is successful, redirect the user to their main dashboard.                                                        | Frontend         | The user exits the wizard and lands on their now-populated library page.                                                        | ✅ Done  | Handled via a `redirect('/')` in the server action.                                                                                                                                                                   |

---

### Milestone 3.2: The Stats Dashboard

**Goal:** Create a fun and insightful dashboard that visualizes a user's or a group's viewing habits, including the "Critic's Corner" and "Great Divide" features.
**Key Document References:** `flicklog.md` (Pillar II)

| Task ID | Task Description                                                            | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                          | Status   | Notes/Blockers                                                                      |
| :------ | :-------------------------------------------------------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---------------------------------------------------------------------------------- |
| P3.2.1  | Create a new page `/spaces/[spaceId]/stats`.                                | Frontend         | The page is reachable from a space's navigation.                                                                                              | ⬜ To Do |                                                                                     |
| P3.2.2  | Create a Server Component to fetch all necessary data for the stats page.   | Backend          | The component fetches all `LogEntry`, `Rating`, and `SpaceMember` data for the given space.                                                   | ⬜ To Do | This will be a complex Prisma query.                                                |
| P3.2.3  | **Data Logic:** Calculate the "Toughest Critic" and "Most Generous" member. | Backend          | **Test:** A function correctly processes the rating data to find the users with the lowest and highest average ratings.                       | ⬜ To Do | This logic should live in a helper function or service.                             |
| P3.2.4  | **Data Logic:** Identify "The Great Divide" films.                          | Backend          | **Test:** A function correctly finds films with the largest standard deviation or max-min difference in ratings among members.                | ⬜ To Do | This requires comparing ratings within each `LogEntry`.                             |
| P3.2.5  | **Data Logic:** Identify "Perfect Harmony" films.                           | Backend          | **Test:** A function correctly finds films where all members gave the same high rating (e.g., >= 4 stars).                                    | ⬜ To Do |                                                                                     |
| P3.2.6  | Implement the UI for the "Critic's Corner".                                 | Frontend         | The UI displays the avatars and names of the toughest/most generous critics with their average rating.                                        | ⬜ To Do |                                                                                     |
| P3.2.7  | Implement the UI for "The Great Divide" and "Perfect Harmony".              | Frontend         | The UI displays a list of movie posters for each category, showing the different ratings for "Great Divide" films.                            | ⬜ To Do |                                                                                     |
| P3.2.8  | Implement the "Flicklog Rewind" feature.                                    | Backend          | **Verification:** On the main dashboard, a small section queries for log entries where `watched_on` is the same day/month in a previous year. | ⬜ To Do | `WHERE EXTRACT(MONTH FROM watched_on) = ... AND EXTRACT(DAY FROM watched_on) = ...` |

---

### Milestone 3.3: Discord Integration

**Goal:** Allow users to connect a shared space to a Discord channel, automatically posting new reviews as rich embeds.
**Key Document References:** `flicklog.md` (Pillar III)

| Task ID | Task Description                                                                    | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                                                      | Status   | Notes/Blockers                                                                           |
| :------ | :---------------------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------- | :--------------------------------------------------------------------------------------- |
| P3.3.1  | Add a `discord_webhook_url` field to the `Space` table.                             | Backend          | The migration is created and applied. The field should be nullable and encrypted.                                                                                         | ⬜ To Do | Use Supabase Vault or similar for encryption.                                            |
| P3.3.2  | Update the "Space Settings" page with a form to add/update the Discord Webhook URL. | Frontend         | An input field allows an `ADMIN` to paste and save a webhook URL.                                                                                                         | ⬜ To Do |                                                                                          |
| P3.3.3  | Create a `saveDiscordWebhook` Server Action.                                        | Backend          | **Test:** The action verifies the user is an `ADMIN` of the space. It validates the URL format.                                                                           | ⬜ To Do | The URL should be stored encrypted in the database.                                      |
| P3.3.4  | Create a service/helper function `postToDiscord(logEntry, rating)`.                 | Backend          | This function constructs a rich embed object according to the Discord API specification.                                                                                  | ⬜ To Do | The embed should contain the movie poster, title, user's rating, and their "Quick Take". |
| P3.3.5  | Refactor the `createLogEntry` Server Action.                                        | Backend          | **Verification:** After a log entry is successfully created in a space with a configured webhook, the `postToDiscord` function is called.                                 | ⬜ To Do |                                                                                          |
| P3.3.6  | Refactor the `submitPendingRating` Server Action.                                   | Backend          | **Verification:** After a pending rating is successfully submitted in a space with a configured webhook, the `postToDiscord` function is called with the new rating data. | ⬜ To Do |                                                                                          |
| P3.3.7  | Add clear instructions in the UI on how to create a Discord Webhook.                | Frontend         | A small help text or link to a guide explains the process for the user.                                                                                                   | ⬜ To Do |                                                                                          |

---

### Milestone 3.4: Final Polish & Error Handling

**Goal:** Ensure the application is robust and user-friendly by adding comprehensive loading states, error boundaries, and refining the overall UI.
**Key Document References:** `design_guideline.md`, `error_logbook.md`

| Task ID | Task Description                                                                      | Backend/Frontend | TDD Focus (Key Tests) / Verification                                                                                                            | Status   | Notes/Blockers                                            |
| :------ | :------------------------------------------------------------------------------------ | :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------- |
| P3.4.1  | Implement skeleton loaders for data-heavy pages like the library and stats dashboard. | Frontend         | While server components are fetching data, users see a polished loading state instead of a blank page or layout shifts.                         | ⬜ To Do | Use `Suspense` boundaries.                                |
| P3.4.2  | Create custom `error.tsx` files for key routes.                                       | Frontend         | If a server component or action fails, the user sees a friendly error message ("Oops, something went wrong!") instead of a crashed application. | ⬜ To Do | Implement for `/spaces/[spaceId]` and the main dashboard. |
| P3.4.3  | Add pending/loading states to all forms.                                              | Frontend         | When a form is submitted, the submit button is disabled and shows a spinner to prevent double submissions.                                      | ⬜ To Do | Use `useFormState` for this.                              |
| P3.4.4  | Conduct a full UI review against the `design_guideline.md`.                           | Frontend         | Check all spacing, colors, typography, and border radii for consistency across the entire application.                                          | ⬜ To Do |                                                           |
| P3.4.5  | Write a comprehensive `README.md` for the project.                                    | Both             | The README explains what Flicklog is, how to set it up locally, and how to run it.                                                              | ⬜ To Do |                                                           |
| P3.4.6  | Establish the bug tracking process in GitHub Issues.                                  | Both             | Create the "Bug Report" issue template as described in `error_logbook.md`.                                                                      | ⬜ To Do |                                                           |

---

### **End of Phase 3 & MVP Review:**

- **Is the onboarding flow fully functional and effective?** ⬜
- **Does the stats dashboard provide fun and accurate insights?** ⬜
- **Is the Discord integration working for both new logs and pending ratings?** ⬜
- **Is the application polished, with proper loading and error states?** ⬜
- **Does the final product feel like a cohesive and delightful experience?** ⬜
- **Is the project ready for a soft launch to early adopters?** ⬜
