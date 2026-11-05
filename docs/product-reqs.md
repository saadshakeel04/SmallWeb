# THE SMALL WEB — PRODUCT REQUIREMENTS DOCUMENT

**Project:** The Small Web  
**Project Type:** Full Stack Technical Assessment  
**Frontend:** Next.js + React + TypeScript  
**Backend:** NestJS + TypeScript  
**Database:** MongoDB + Mongoose  
**Architecture:** Monorepo  
**Status:** Implementation Specification

---

# 1. PROJECT OVERVIEW

The Small Web is a self-contained web ecosystem containing approximately 10 websites stored in MongoDB.

Users can browse these websites through a browser-like application, navigate between them, search their content, view browsing history, and publish their own HTML websites.

The application consists of two major parts:

1. The Small Web — websites, addresses, authors, HTML content, and browsing records.
2. The Browser — address bar, page viewer, links, Back, Forward, History, Search, and Publish.

This is NOT a real internet browser.

All websites exist inside the application's MongoDB database. Users must not be able to browse real external websites.

# 2. REQUIRED TECHNOLOGY STACK

The following technology stack is mandatory.

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios
- Zustand
- React Hook Form
- Zod
- Lucide React
- Sonner
- date-fns

## Backend

- NestJS
- TypeScript
- MongoDB
- Mongoose
- @nestjs/config
- class-validator
- class-transformer
- sanitize-html
- Helmet
- @nestjs/throttler
- nestjs-pino
- pino-http

## Testing

- Jest (NestJS generated testing setup)
- Vitest
- React Testing Library
- Playwright

Do not replace the required technology stack.

Do not install unnecessary dependencies.

Use compatible stable versions of all packages.

# 3. PROJECT ARCHITECTURE

Use a monorepo architecture with separate frontend and backend applications.

Required structure:

small-web/
│
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── browser/
│   │   │   │   ├── history/
│   │   │   │   ├── search/
│   │   │   │   ├── publish/
│   │   │   │   └── people/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── backend/
│       ├── src/
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   ├── modules/
│       │   │   ├── people/
│       │   │   ├── sites/
│       │   │   ├── visits/
│       │   │   ├── search/
│       │   │   └── seed/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/
│       └── package.json
│
├── docs/
│   └── PRD.md
│
├── package.json
├── .gitignore
└── README.md

Maintain proper separation of responsibilities.

Do not put the entire backend into one service or the entire frontend into one component.

# 4. PRODUCT SCOPE

## 4.1 Mandatory Features

The application must support:

1. Selecting a visitor from a predefined list of people.
2. Selecting a publisher from the same predefined list.
3. Entering a website address.
4. Browsing websites stored in MongoDB.
5. Following internal links.
6. Handling nonexistent addresses.
7. Back navigation.
8. Forward navigation.
9. Correct forward-stack truncation.
10. Restoring previously visited pages.
11. Restoring previous scroll positions.
12. Persistent browsing history.
13. Separate browsing history for each person.
14. Navigating directly from history entries.
15. Searching website content.
16. Publishing a new website using HTML.
17. Deterministic database seed data.

## 4.2 Features That Must NOT Be Implemented

The assignment explicitly excludes:

- Authentication
- Login and registration
- Passwords
- User accounts
- Roles and permissions
- Bookmarks
- Multiple browser tabs
- Extensions
- Downloads
- Image or asset hosting
- Real external website browsing
- Electron or desktop applications
- Complex CMS functionality

Do not waste development time implementing these features.

# 5. DOMAIN MODELS

The system has four important concepts.

## 5.1 Person

A predefined person who can browse or publish websites.

## 5.2 Site

A single HTML website published at a unique address.

Example:

- tidepool.zz
- paperboats.zz
- quietforest.zz
- bluehour.zz

Each site contains:

- Unique address
- Title
- HTML content
- Author
- Creation date

## 5.3 Link

A link inside one website that points to another website address.

Links can point to existing or nonexistent addresses.

## 5.4 Visit

A record representing a person visiting a particular website at a particular time.

A visit must contain:

- Person reference
- Site reference
- Address
- Timestamp
- Navigation source

# 6. DATABASE DESIGN

Use MongoDB with Mongoose.

## 6.1 Person Schema

Fields:

- _id
- name
- createdAt

## 6.2 Site Schema

Fields:

- _id
- address
- title
- html
- plainText
- authorId
- createdAt
- updatedAt

Important rules:

- Address must be unique.
- Address must be normalized.
- HTML must be sanitized before storage.
- plainText must contain searchable text extracted from sanitized HTML.
- authorId must reference an existing Person.

Create a unique MongoDB index on address.

Create a text index on title and plainText.

## 6.3 Visit Schema

Fields:

- _id
- personId
- siteId
- address
- visitedAt
- source

Possible navigation sources:

- typed
- link
- history
- search
- publish

Create an index on:

personId + visitedAt

History must be retrieved separately for each person.

## 6.4 Browser Navigation State

The browser navigation stack is frontend application state.

Example:

[
  {
    address: "tidepool.zz",
    siteId: "...",
    title: "Tidepool",
    scrollY: 0
  },
  {
    address: "paperboats.zz",
    siteId: "...",
    title: "Paper Boats",
    scrollY: 350
  }
]

Maintain:

- Navigation entries
- Current navigation index
- Scroll positions

IMPORTANT:

The browser navigation stack and persistent visit history are different things.

Do not combine them.

# 7. FUNCTIONAL REQUIREMENTS

## FR-01: Person Selection

- Display available people from the backend.
- Fetch people using an API request.
- Allow selecting a visitor.
- The selected visitor determines whose history is displayed.
- Allow selecting a publisher when publishing a site.
- Changing visitors must load the correct history.
- Never mix histories between people.

There is no authentication.

## FR-02: Address Bar

- Provide a browser-style address bar.
- Allow entering a website address.
- Pressing Enter must navigate to that address.
- Normalize addresses before searching.
- Display loading states.
- Display the requested website when it exists.
- Display a proper not-found page when it does not exist.
- Do not navigate to external websites.

## FR-03: Internal Links

- Links inside websites must navigate within the application.
- Intercept internal anchor clicks.
- Send the destination address to the browser navigation controller.
- Support links between seeded websites.
- Handle broken links gracefully.
- Never allow a published page to navigate the parent application to an arbitrary external URL.

## FR-04: Back Navigation

Back must behave like a real browser.

Example:

A → B → C → D

Press Back:

A → B → C

Press Back again:

A → B

Rules:

- Move to the previous navigation entry.
- Do not create another visit.
- Disable Back when no previous entry exists.
- Restore the previously visited page.
- Restore its saved scroll position.

## FR-05: Forward Navigation

Forward must move to the next existing navigation entry.

Example:

A → B → C → D

Press Back twice:

A → B

Press Forward:

A → B → C

Rules:

- Do not create another visit.
- Disable Forward when no next entry exists.
- Restore the correct page and scroll position.

## FR-06: Forward Stack Truncation

This is a critical requirement.

Example:

1. Visit A.
2. Visit B.
3. Visit C.
4. Visit D.
5. Press Back twice.
6. Current page becomes B.
7. Navigate to E.

The resulting navigation stack must be:

A → B → E

C and D must be removed from the active forward navigation stack.

Forward must be disabled after visiting E.

Do not implement this incorrectly.

## FR-07: Restore on Return

This is mandatory.

When navigating away from a page:

- Save its scroll position.
- Preserve the navigation entry.
- Do not lose its previous state.

When returning using Back or Forward:

- Display the correct website.
- Restore its previous scroll position.
- Do not record another visit.
- Do not unnecessarily reload the website if the implementation supports restoring the existing entry.

Test this carefully.

## FR-08: Persistent Browsing History

- Save successful visits in MongoDB.
- Associate every visit with a person.
- Store the website address.
- Store the timestamp.
- Store the navigation source.
- Display history in chronological order, newest first.
- Make history scrollable.
- Allow selecting a history entry.
- Navigate to the selected website.
- Preserve repeated visits as separate records.
- Support pagination or bounded loading.

History must survive page refreshes.

## FR-09: Full-Text Search

Search must work across all published websites.

IMPORTANT:

Search must inspect actual website content.

Searching only titles is NOT acceptable.

Example:

Website title: "The Garden"

Website content:

"The quiet forest is home to several unusual birds."

Searching for "unusual birds" must find this website.

Requirements:

- Use MongoDB text indexing.
- Search title and plainText.
- Return title.
- Return address.
- Return a relevant text excerpt.
- Support empty results.
- Support loading states.
- Support error states.
- Clicking a result must navigate to that website.

Do not download every website into the frontend to perform searching.

Search must happen in the backend.

## FR-10: Publish Website

Provide a publishing form.

Required fields:

- Website address
- Website title
- HTML content
- Publisher/person

Rules:

- Validate all fields.
- Validate address format.
- Verify publisher exists.
- Sanitize HTML on the backend.
- Generate plainText from sanitized HTML.
- Save the website in MongoDB.
- Enforce unique addresses.
- Show a useful duplicate-address error.
- Never silently overwrite an existing website.
- Show success confirmation.
- Allow visiting the newly published website.

Do not implement website editing unless explicitly approved as an additional feature.

## FR-11: Not Found

When a website does not exist:

- Display a clear not-found state.
- Preserve the attempted address.
- Allow the user to enter another address.
- Provide a way to return to the previous page.
- Do not crash the application.
- Do not record a successful visit.

Broken links are expected and must be handled.

# 8. HTML SECURITY REQUIREMENTS

THIS IS ONE OF THE MOST IMPORTANT PARTS OF THE PROJECT.

Users can publish arbitrary HTML.

Assume that every published page could contain malicious code.

Never render untrusted HTML directly into the parent React application using dangerouslySetInnerHTML.

Mandatory security measures:

1. Sanitize HTML on the backend.
2. Use sanitize-html.
3. Define an explicit allowlist of safe HTML elements.
4. Remove script tags.
5. Remove inline JavaScript event handlers.
6. Remove dangerous URL schemes.
7. Remove unsafe embedded content.
8. Prevent arbitrary external scripts.
9. Prevent external images and stylesheets.
10. Render published content inside a sandboxed iframe.
11. Do not enable JavaScript execution inside the iframe.
12. Apply restrictive Content Security Policy.
13. Prevent published pages from accessing the parent application.
14. Prevent access to parent localStorage and cookies.
15. Intercept internal links safely.
16. Reject javascript: URLs.
17. Reject unsafe data: URLs.
18. Do not permit external network requests.

The iframe must not receive allow-scripts.

The published page must not be able to execute JavaScript or manipulate the browser application.

Test these security boundaries with malicious HTML examples.

# 9. ADDRESS VALIDATION

Use a fictional address format.

Valid examples:

- tidepool.zz
- paperboats.zz
- quietforest.zz
- bluehour.zz

Rules:

- Trim whitespace.
- Normalize case.
- Reject empty addresses.
- Reject malformed addresses.
- Reject external URLs.
- Reject unsafe characters.
- Reject path traversal.
- Use consistent normalization everywhere.

Apply the same validation during:

- Publishing
- Direct navigation
- Internal link navigation
- Search result navigation

# 10. BACKEND API DESIGN

Use:

/api/v1

Required endpoints:

GET /api/v1/people

Purpose:
Return all predefined people.

GET /api/v1/sites/:address

Purpose:
Retrieve a website by address.

POST /api/v1/sites

Purpose:
Publish a website.

GET /api/v1/sites/search?q=keyword

Purpose:
Search website content.

POST /api/v1/visits

Purpose:
Record a successful visit.

GET /api/v1/visits?personId=...

Purpose:
Retrieve browsing history for a person.

Backend rules:

- Use NestJS controllers and services.
- Keep controllers thin.
- Put business logic in services.
- Use DTOs.
- Validate all request bodies.
- Validate query parameters.
- Use consistent response structures.
- Return proper HTTP status codes.
- Return 404 for nonexistent websites.
- Return 409 for duplicate addresses.
- Return 400 for invalid requests.
- Do not expose internal stack traces.
- Verify referenced people exist.
- Support history pagination.

# 11. FRONTEND REQUIREMENTS

Build a clean, polished, responsive browser interface.

The application should look like a small browser rather than a generic admin dashboard.

Main UI components:

1. Application header.
2. Person selector.
3. Browser toolbar.
4. Back button.
5. Forward button.
6. Address bar.
7. Main website viewing area.
8. Search interface.
9. Search results.
10. History panel.
11. Publish form.
12. Loading indicators.
13. Error and empty states.

## Frontend states

Implement:

- Initial state.
- Person not selected.
- Loading website.
- Website loaded.
- Website not found.
- Network error.
- Empty history.
- Search loading.
- Search results.
- Search empty state.
- Publish validation error.
- Publish success.

## Frontend state management

Use Zustand where appropriate.

Keep these states separate:

- Selected person.
- Navigation stack.
- Current navigation index.
- Current website.
- Search query/results.
- Persistent history data.
- Publishing form state.

Do not create multiple conflicting sources of truth.

Do not use full-page reloads for internal website navigation.

# 12. DETERMINISTIC SEED DATA

Create a dedicated seed command.

The seed must provide:

## Websites

Approximately 10 websites.

Each website must have:

- Meaningful prose.
- A unique address.
- A title.
- HTML content.
- An author.
- Links to other websites.

Create enough internal links that users can browse several websites consecutively.

Include links to nonexistent addresses.

## People

Create a handful of predefined people.

At least two people must have authored multiple websites.

## Browsing History

Create approximately one hour of browsing history.

Requirements:

- Multiple people.
- Repeated visits.
- A long browsing trail.
- At least one person who has visited nearly every seeded website.

## Repeatability

Seed data must be deterministic.

Running the seed command twice must not duplicate records.

Use:

- Stable identifiers.
- Deterministic addresses.
- Fixed timestamps.
- Upserts.

Do not generate random people, websites, or timestamps on every run.

# 13. IMPLEMENTATION PHASES

Follow these phases IN ORDER.

Do not attempt to build everything simultaneously.

## PHASE 0 — Repository Setup

- Inspect repository.
- Verify Node.js and npm.
- Create monorepo structure.
- Scaffold Next.js.
- Scaffold NestJS.
- Configure TypeScript.
- Configure environment variables.
- Configure .gitignore.
- Confirm both applications run.

Completion criteria:

Both applications run independently.

## PHASE 1 — Backend Foundation

- Configure NestJS.
- Configure MongoDB.
- Configure Mongoose.
- Configure environment variables.
- Configure CORS.
- Configure Helmet.
- Configure validation.
- Configure API prefix.
- Add health endpoint.

Completion criteria:

Backend successfully connects to MongoDB.

## PHASE 2 — Database Models

- Implement Person schema.
- Implement Site schema.
- Implement Visit schema.
- Add indexes.
- Implement People module.
- Implement Sites module.
- Implement Visits module.
- Add DTOs and validation.

Completion criteria:

Backend can retrieve people and websites.

## PHASE 3 — Seed Data

- Create approximately 10 websites.
- Create predefined people.
- Connect websites through links.
- Include broken links.
- Create browsing histories.
- Add repeated visits.
- Implement deterministic upserts.
- Add seed command.

Completion criteria:

Running the seed command twice does not create duplicates.

## PHASE 4 — Frontend Foundation

- Configure frontend.
- Create application layout.
- Build browser toolbar.
- Build address bar.
- Build person selector.
- Configure Axios.
- Connect frontend with backend.
- Add loading and error states.

Completion criteria:

Frontend can retrieve people and websites.

## PHASE 5 — HTML Security

- Implement backend HTML sanitization.
- Generate searchable plain text.
- Implement sandboxed iframe.
- Configure restrictive CSP.
- Implement safe internal link interception.
- Add malicious HTML tests.

Completion criteria:

HTML renders safely without executing arbitrary scripts.

## PHASE 6 — Browser Navigation

- Implement navigation stack.
- Implement current index.
- Implement direct navigation.
- Implement link navigation.
- Implement Back.
- Implement Forward.
- Implement forward-stack truncation.
- Save scroll positions.
- Restore scroll positions.
- Prevent duplicate visit records during restoration.

Completion criteria:

Browser navigation works correctly in all scenarios.

## PHASE 7 — Persistent History

- Record successful visits.
- Associate visits with people.
- Implement history API.
- Build scrollable history UI.
- Implement history navigation.
- Add pagination.
- Test identity separation.

Completion criteria:

History persists after refresh and remains person-specific.

## PHASE 8 — Search

- Generate plain text from HTML.
- Create MongoDB text index.
- Implement search endpoint.
- Search titles and body content.
- Return excerpts.
- Build search UI.
- Add empty and error states.
- Implement result navigation.

Completion criteria:

Search finds content that appears only in the website body.

## PHASE 9 — Publishing

- Build publishing form.
- Validate address.
- Validate title.
- Validate HTML.
- Verify publisher.
- Sanitize HTML.
- Save website.
- Generate searchable text.
- Handle duplicate addresses.
- Show success state.
- Allow visiting the published website.

Completion criteria:

Users can publish and browse their own websites.

## PHASE 10 — Testing and Finalization

- Write frontend tests.
- Write backend tests.
- Test navigation logic.
- Test Back and Forward.
- Test forward-stack truncation.
- Test scroll restoration.
- Test history persistence.
- Test search.
- Test publishing.
- Test malicious HTML.
- Test seed idempotency.
- Test responsive design.
- Fix lint errors.
- Fix TypeScript errors.
- Build frontend.
- Build backend.
- Complete README.
- Review Git commit history.

Completion criteria:

All mandatory requirements pass.

# 14. ACCEPTANCE TESTS

Before marking the project complete, verify the following.

## Browsing

[ ] Select a person.

[ ] Enter a valid address.

[ ] Display the correct website.

[ ] Follow an internal link.

[ ] Enter a nonexistent address.

[ ] Display a proper not-found state.

## Navigation

[ ] Visit A → B → C → D.

[ ] Press Back twice.

[ ] Verify B is displayed.

[ ] Press Forward.

[ ] Verify C is displayed.

[ ] Go back to B.

[ ] Navigate to E.

[ ] Verify C and D are removed from the forward stack.

[ ] Verify Forward is disabled.

[ ] Verify Back and Forward do not create duplicate visits.

[ ] Verify scroll position restoration.

## History

[ ] Visit multiple websites.

[ ] Refresh application.

[ ] Verify history persists.

[ ] Select a history entry.

[ ] Verify navigation works.

[ ] Change selected person.

[ ] Verify history changes accordingly.

[ ] Verify repeated visits are preserved.

## Search

[ ] Search for text present only in page body.

[ ] Verify the correct website appears.

[ ] Open a search result.

[ ] Search for nonexistent content.

[ ] Verify empty state.

## Publishing

[ ] Publish a valid website.

[ ] Browse to the new website.

[ ] Search its body content.

[ ] Attempt duplicate address.

[ ] Verify conflict error.

[ ] Attempt malicious HTML.

[ ] Verify sanitization.

## Security

[ ] Test script tags.

[ ] Test inline event handlers.

[ ] Test javascript: URLs.

[ ] Test external images.

[ ] Test external stylesheets.

[ ] Verify scripts cannot execute.

[ ] Verify parent browser application remains isolated.

## Seed

[ ] Run seed once.

[ ] Run seed again.

[ ] Verify no duplicates.

[ ] Verify deterministic addresses.

[ ] Verify people and history exist.

# 15. GIT WORKFLOW

Use meaningful commits.

Suggested commits:

1. chore: scaffold frontend and backend
2. chore: configure environment and database
3. feat: implement people and site modules
4. feat: implement deterministic seed data
5. feat: build browser interface
6. feat: implement safe HTML rendering
7. feat: implement browser navigation
8. feat: add persistent browsing history
9. feat: implement full-text search
10. feat: implement website publishing
11. test: add navigation and security tests
12. docs: add project documentation

Do not put the entire project in one commit.

Commit after completing meaningful working features.

# 16. README REQUIREMENTS

The final README must explain:

- Project overview.
- Technology stack.
- Prerequisites.
- Installation commands.
- Environment configuration.
- MongoDB setup.
- Frontend startup.
- Backend startup.
- Database seed command.
- Testing commands.
- Project structure.
- Main features.
- Known limitations.

A developer must be able to clone the repository, follow the README, and run the application.

# 17. SUBMISSION REQUIREMENTS

The final submission must include:

1. Git repository with meaningful commit history.
2. Complete frontend source code.
3. Complete backend source code.
4. Deterministic seed command.
5. README with exact run commands.
6. Narrated screen recording of approximately 4–5 minutes.

The recording must demonstrate:

- A browsing trail at least four pages deep.
- Back and Forward navigation.
- Returning to search results.
- Searching website content.
- Publishing a new website.
- Visiting a nonexistent address.

Explain during the recording:

- Your database model.
- How Back and Forward work.
- How scroll restoration works.
- How untrusted HTML is contained.
- What features you intentionally excluded.

A silent recording is not sufficient.

# 18. STRICT RULES FOR THE CODING AGENT

The following rules must be followed throughout the project.

1. Read this entire PRD before implementing anything.
2. Treat this PRD as the single source of truth.
3. Use Next.js, NestJS, MongoDB, and TypeScript.
4. Do not replace the specified technology stack.
5. Do not implement excluded features.
6. Follow implementation phases in order.
7. Inspect existing code before modifying files.
8. Preserve working code.
9. Use clean architecture.
10. Use strict TypeScript.
11. Avoid unnecessary use of any.
12. Keep controllers thin.
13. Put business logic in services.
14. Validate all incoming requests.
15. Never hardcode credentials.
16. Never commit environment files.
17. Never render untrusted HTML directly into the parent React DOM.
18. Never enable scripts inside published-page iframes.
19. Never permit arbitrary external network resources.
20. Never record failed navigation as a successful visit.
21. Never create duplicate visits during Back/Forward restoration.
22. Keep browser navigation state separate from persistent history.
23. Implement correct forward-stack truncation.
24. Implement scroll restoration.
25. Make seed data deterministic and repeatable.
26. Search actual page body content.
27. Enforce unique site addresses in MongoDB.
28. Write tests for critical business logic.
29. Run relevant tests after each implementation phase.
30. Never claim a feature is complete without verifying it.
31. Update README when commands or architecture change.
32. Avoid unnecessary dependencies.
33. Avoid giant components and services.
34. Use reusable frontend components.
35. Keep API contracts consistent.
36. Document important architecture decisions.
37. Ask for clarification when a decision materially changes the requirements.
38. Do not silently skip requirements.
39. Fix TypeScript, lint, and build errors before proceeding.
40. Do not move to the next phase until the current phase is verified.

# 19. DEFINITION OF DONE

The project is complete only when:

- Next.js frontend runs successfully.
- NestJS backend runs successfully.
- MongoDB connection works.
- Seed data is deterministic.
- Approximately 10 websites are available.
- Multiple people are available.
- Browse functionality works.
- Internal links work.
- Broken links are handled.
- Back navigation works.
- Forward navigation works.
- Forward-stack truncation works.
- Scroll restoration works.
- Persistent history works.
- History is separated by person.
- Search finds actual website body content.
- Publishing works.
- Duplicate addresses are rejected.
- Untrusted HTML is safely contained.
- Tests pass.
- README is complete.
- Git history contains meaningful commits.
- Narrated walkthrough demonstrates the required features.

---

# FINAL DEVELOPMENT PRINCIPLE

Prioritize correctness over unnecessary visual complexity.

The most important parts of this assessment are:

1. Correct browser navigation.
2. Correct Back and Forward behavior.
3. Correct restoration of previously visited pages.
4. Persistent, person-specific browsing history.
5. Safe rendering of untrusted HTML.
6. Full-text search across website content.
7. Deterministic seed data.
8. Reliable website publishing.

Build the application systematically, verify every phase, and do not sacrifice required functionality for decorative UI features.


## Testing Requirements

- Backend testing must use Jest.
- Frontend unit and component testing must use Vitest and React Testing Library.
- Use jest-dom for DOM assertions.
- Use user-event for simulating user interactions.
- Use jsdom as the frontend test environment.
- End-to-end testing must use Playwright.
- Test all critical application workflows.
- Do not consider a feature complete until its relevant tests pass.