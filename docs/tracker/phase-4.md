## Phase 4: UI/UX Polish & Refinement

**Overall Goal:** Conduct a comprehensive review of the entire application against the `design_guideline.md` to identify and fix inconsistencies. The goal is to elevate the user interface to a polished, delightful, and cohesive state before a wider launch.

**Lead:** Chloie Biscocho
**Status:** ⏳ **Not Started**

---

### Milestone 4.1: Comprehensive UI Audit

**Goal:** Systematically review every page and component to create a backlog of all required UI fixes and improvements.

| Task ID | Task Description                                                                                                       | Area               | Verification (How to Confirm)                                                                                                                                                             | Status   | Notes/Blockers |
| :------ | :--------------------------------------------------------------------------------------------------------------------- | :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------- |
| P4.1.1  | Review all pages for adherence to the **Color Palette** in `design_guideline.md`. Check text, background, and accent colors. | Visual Design      | All colors used in the app (text, backgrounds, buttons, links) match the defined hex codes for both dark and light themes.                                                                | ⬜ To Do |                |
| P4.1.2  | Review all pages for adherence to the **Typography** scale. Check font families, weights, and sizes for headings and body text. | Visual Design      | `font-heading` (Poppins) and `font-body` (Source Sans Pro) are used correctly. Text sizes (`text-xl`, `text-base`, etc.) match the hierarchy defined in the guidelines.                | ⬜ To Do |                |
| P4.1.3  | Review all pages for adherence to **Spacing & Layout** rules. Check padding, margins, and gaps between elements.         | Layout & Spacing   | Consistent use of spacing utilities (e.g., `p-4`, `gap-6`). Layouts feel balanced and uncluttered.                                                                                        | ⬜ To Do |                |
| P4.1.4  | Review all components for adherence to **Border Radius** standards (`rounded-lg`, `rounded-full`, etc.).                 | Visual Design      | All cards, buttons, inputs, and other elements have consistent corner rounding as specified.                                                                                              | ⬜ To Do |                |
| P4.1.5  | Review all interactive elements for correct **Hover & Focus States**. Ensure they are visible and consistent.            | Interactivity      | All buttons, links, and inputs have clear, visible focus rings and appropriate hover effects that match the design system.                                                              | ⬜ To Do |                |
| P4.1.6  | Review all icons for consistency (e.g., using `lucide-react`) and appropriate sizing.                                    | Visual Design      | Icons are consistently styled (e.g., stroke width) and sized correctly for their context (e.g., `h-4 w-4` in buttons).                                                                    | ⬜ To Do |                |
| P4.1.7  | Review the application on mobile devices or in browser dev tools to identify and list all **Responsiveness** issues.     | Responsive Design  | The layout adapts gracefully to smaller screens. Text is readable, and touch targets are adequately sized. No horizontal overflow.                                                       | ⬜ To Do |                |
| P4.1.8  | Compile all findings from the audit into a prioritized list of actionable tasks in GitHub Issues.                        | Project Management | A set of new GitHub issues is created, each describing a specific UI fix needed, labeled with `ui` and `polish`.                                                                         | ⬜ To Do |                |

---

### Milestone 4.2: Implementation of UI Fixes

**Goal:** Work through the backlog of UI issues identified in the audit, implementing the fixes to bring the application in line with the design guidelines.

| Task ID | Task Description                                                              | Area             | Verification (How to Confirm)                                                              | Status   | Notes/Blockers |
| :------ | :---------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------------------------------------- | :------- | :------------- |
| P4.2.1  | **(Example Task)** Refactor the Stats Dashboard cards to use consistent padding. | Layout & Spacing | The padding inside the "Critic's Corner" and "Great Divide" cards matches the standard `p-6`. | ⬜ To Do |                |
| P4.2.2  | **(Example Task)** Adjust the main page title font weight to `font-bold`.      | Typography       | The `<h1>` on the main library page uses the `font-bold` class as per the guidelines.       | ⬜ To Do |                |
| P4.2.3  | **(Example Task)** Fix mobile layout of the Space Settings page.               | Responsive Design| The two-column layout on the settings page correctly stacks to a single column on mobile. | ⬜ To Do |                |
| P4.2.4  | ... (Add more tasks based on the audit from Milestone 4.1) ...                | ...              | ...                                                                                        | ⬜ To Do |                |

---

### **End of Phase 4 Review:**

- **Has every page been audited against the design guidelines?** ⬜
- **Are all identified UI/UX issues logged and prioritized?** ⬜
- **Have all logged UI/UX issues been resolved?** ⬜
- **Does the application present a polished, cohesive, and delightful user experience?** ⬜
- **Is the application ready for a public launch?** ⬜
