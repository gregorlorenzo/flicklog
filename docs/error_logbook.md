# Flicklog: Bug & Incident Handling Guidelines

This document outlines the process for identifying, tracking, and resolving bugs and incidents in the Flicklog project. Our goal is to create a transparent, low-friction process that helps us improve the codebase and learn from our mistakes.

## Guiding Philosophy

**Track in one place.** Instead of a separate logbook, we use **GitHub Issues** as the single source of truth for all bug reports and technical incidents. This keeps the context, discussion, and resolution directly linked to our codebase and pull requests.

## The Bug Triage Process

1.  **Identify & Confirm:** When a potential bug is found (either by a developer, through user feedback, or via logs), the first step is to confirm it is reproducible.
2.  **Create a GitHub Issue:** If the bug is confirmed, create a new issue in the Flicklog GitHub repository using the "Bug Report" template.
3.  **Label the Issue:** Apply appropriate labels to the issue for categorization and prioritization. This is our primary method for organization.
4.  **Prioritize:** The team will assess the bug's severity and prioritize it for an upcoming work cycle.

## Creating a Good Bug Report

A well-written bug report is the fastest path to a fix. When creating a new GitHub Issue for a bug, please include:

1.  **A Clear, Descriptive Title:** e.g., "Movie poster not loading on Firefox for shared space entries"
2.  **Environment:** Where did you see the bug? (e.g., Local dev, Vercel Preview URL, Production)
3.  **Steps to Reproduce:**
    - 1. Go to '...'
    - 2. Click on '....'
    - 3. Observe the error
4.  **Observed Behavior:** What is actually happening?
5.  **Expected Behavior:** What should have happened instead?
6.  **Screenshots or Logs:** Include any relevant visual aids or console output.

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

1.  **What was the impact?** (Who was affected and for how long?)
2.  **What was the root cause?** (What technical or process failure led to this?)
3.  **How can we prevent this in the future?** (What action items can we take? e.g., add a new test, improve validation, update a RLS policy).

## Future of Monitoring (Post-Launch)

As Flicklog grows and acquires real users, we will implement a more robust observability stack.

- **Error Tracking:** We plan to integrate **Sentry** to automatically capture, triage, and alert on production errors.
- **Performance Monitoring:** We will leverage Vercel Analytics and may add further tooling to monitor database and API performance.
- **Alerting:** Once we have a monitoring tool, we will establish clear alerting thresholds for error rates and response times.

For the MVP, we will rely on Vercel's built-in function logs and user-reported issues.
