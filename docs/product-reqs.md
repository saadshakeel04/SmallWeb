# The Small Web — Product Requirements

**Project type:** Full-stack technical assessment
**Product:** The Small Web
**Architecture:** Monorepo with separate frontend and backend applications
**Status:** Product and assessment specification

This document defines the product scope, required behavior, user-facing
experience, technical constraints, and expected assessment deliverables for The
Small Web. It is intended for project implementers and reviewers.

## 1. Project overview and objectives

### 1.1 Overview

The Small Web is a self-contained collection of approximately ten fictional
websites stored in MongoDB. Visitors use a browser-like web application to
explore those sites, follow links between them, search their content, review
browsing history, and publish new HTML sites.

The product has two connected parts:

1. **The Small Web:** predefined people, published sites, HTML content, links,
   search data, and visit records.
2. **The browser application:** visitor selection, address bar, site viewer,
   browser navigation, history, search, and publishing interfaces.

This product is not a real internet browser. Sites are available only within
the application, using fictional `.zz` addresses. The application must not
provide a way to browse real external websites.

### 1.2 Objectives

The application must:

- Provide a cohesive browser-like experience for browsing a small, linked
  collection of sites.
- Demonstrate correct browser navigation, including Back, Forward, forward
  history truncation, and scroll restoration.
- Persist successful visits and keep history separate for each selected
  visitor.
- Search actual website content, including text found only in page bodies.
- Let a selected predefined person publish a new HTML site safely.
- Contain untrusted published HTML so it cannot execute code or control the
  browser application.
- Provide deterministic sample people, sites, and history so the assessment
  can be reproduced.

### 1.3 Product boundaries

The following are explicitly out of scope:

- Authentication, login, registration, passwords, accounts, roles, or
  permissions.
- Bookmarks, multiple browser tabs, extensions, or downloads.
- External website browsing or arbitrary network access from published pages.
- Image, font, or other asset hosting.
- Desktop or Electron applications.
- Editing or deleting published sites, or complex CMS features.

Visitor and publisher selection uses predefined people and is not an
authentication or authorization system.

## 2. Functional requirements

### 2.1 People and identity selection

- The application must retrieve a predefined list of people from the backend.
- A visitor can be selected before browsing.
- The selected visitor determines which persistent browsing history is shown
  and which person is associated with new visits.
- A publisher must be selectable from the same predefined people when
  publishing.
- Changing the visitor must load that person's history without mixing it with
  another person's history.
- The application has no login or authenticated identity.

### 2.2 Addresses and site browsing

- The browser must provide an address bar that accepts fictional `.zz`
  addresses.
- Addresses must be trimmed and normalized consistently, including
  case-normalization, before lookup or storage.
- Valid address labels use letters and digits separated by optional single
  hyphens, followed by `.zz` (for example, `tidepool.zz` or
  `quiet-forest.zz`).
- Empty or malformed addresses, external URLs, unsafe characters, and path
  traversal attempts must be rejected.
- Address validation must be applied to typed navigation, published sites,
  internal links, and search-result navigation.
- A successful lookup displays the requested site and its title.
- The initial Home/directory view must remain reachable from a visited site.
- Loading, network-error, invalid-address, and not-found states must be handled
  without crashing the application.
- Failed navigation must not be recorded as a successful visit.

### 2.3 Internal links and navigation

- Links between valid `.zz` sites must be intercepted and handled by the
  application without a full-page reload.
- Broken internal links must produce a clear not-found state.
- Published content must not navigate the parent application to arbitrary
  external URLs.
- Back and Forward must operate on a frontend navigation stack, not by creating
  new visit records.
- Back and Forward controls must be disabled when there is no corresponding
  entry.
- Navigating to a new site after going Back must remove the old forward entries.
- Before leaving a page, the browser must save that entry's scroll position.
  Returning with Back or Forward must restore the correct page and position.
- Returning to an existing navigation entry must not create another visit.
- Browser navigation state and persistent visit history are separate concepts.
- Home returns to the directory/start view without recording a visit. The
  selected visitor remains selected.

Example forward-stack behavior:

1. Visit A, B, C, and D.
2. Go Back twice to B.
3. Visit E.
4. The active stack is A → B → E. C and D are no longer available through
   Forward.

### 2.4 Persistent browsing history

- Every successful navigation that represents a new visit must be stored in
  MongoDB with its visitor, site, address, timestamp, and navigation source.
- Supported visit sources are `typed`, `link`, `history`, `search`, and
  `publish`.
- Repeated visits to the same site must remain separate history records.
- History must be retrieved for one person at a time, newest first.
- The history interface must support bounded loading or pagination.
- Selecting a history entry navigates to its site and records a new visit with
  source `history`.
- Back, Forward, and Home must not create visits.
- History must remain available after refreshing the application.

### 2.5 Website search

- Search is performed by the backend across all published sites.
- Search must inspect both site titles and searchable text extracted from site
  HTML; searching titles alone does not meet the requirement.
- The backend must use MongoDB text indexing rather than sending all sites to
  the frontend for client-side searching.
- Results must include the site title, address, and a relevant text excerpt.
- The interface must provide loading, error, results, and no-results states.
- Selecting a result opens that site and records a visit with source `search`.

### 2.6 Website publishing

The publishing form must collect:

- Site address.
- Site title.
- HTML content.
- Publisher selected from the predefined people.

Publishing behavior:

- Validate all fields and validate the address format.
- Verify that the selected publisher exists.
- Sanitize submitted HTML on the backend before storage.
- Derive searchable plain text from the sanitized HTML.
- Enforce address uniqueness in MongoDB.
- Return a useful conflict response for duplicate addresses. Never overwrite an
  existing site.
- Show validation errors and publishing failures clearly.
- On success, confirm the new address and provide a way to visit the new site.
- Do not add editing or deletion of published sites.

### 2.7 Not-found behavior

- A nonexistent address must show a clear not-found state that preserves the
  attempted address.
- The user must be able to enter another address or return to an earlier
  navigation entry.
- Nonexistent sites must not create successful visit records.
- Broken links are expected and must be handled gracefully.

### 2.8 Deterministic sample data

The project must provide a dedicated seed command that creates or updates:

- Approximately ten sites with unique addresses, meaningful prose, titles,
  HTML, authors, and links to other sites.
- Enough valid internal links to browse a multi-page trail, plus links to at
  least one nonexistent address.
- A handful of predefined people. At least two people must have authored
  multiple sites.
- Approximately one hour of sample browsing history for multiple people,
  including repeated visits and a long trail in which at least one person has
  visited nearly every seeded site.

Seed data must use stable identifiers, deterministic addresses, fixed
timestamps, and upserts. Running the seed command repeatedly must not create
duplicate records or change the dataset unpredictably.

### 2.9 Backend API

All endpoints use the `/api/v1` prefix.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Check API and database health |
| `GET` | `/api/v1/people` | Return predefined people |
| `GET` | `/api/v1/sites` | Return sites for the directory |
| `GET` | `/api/v1/sites/:address` | Retrieve a site by address |
| `POST` | `/api/v1/sites` | Publish a site |
| `GET` | `/api/v1/sites/search?q=keyword` | Search site titles and content |
| `POST` | `/api/v1/visits` | Record a successful visit |
| `GET` | `/api/v1/visits?personId=...` | Retrieve paginated history for a person |

Backend behavior:

- Use NestJS controllers and services, with controllers responsible for HTTP
  concerns and services for application behavior.
- Validate request bodies and query parameters using DTOs.
- Verify referenced people exist.
- Return appropriate HTTP status codes, including `400` for invalid requests,
  `404` for missing sites, and `409` for duplicate addresses.
- Support pagination for history.
- Return useful error responses without exposing internal stack traces.

## 3. User stories and acceptance criteria

The following criteria define observable behavior and are intended to be
verified during assessment.

### Story 1: Choose a visitor and browse a site

**As a visitor,** I want to choose who is browsing and open a Small Web address
so that I can explore the site collection.

- [ ] The people selector displays people retrieved from the backend.
- [ ] Selecting a person updates the visitor shown in the interface.
- [ ] Entering a valid seeded address displays the matching site.
- [ ] Address matching is case-insensitive after normalization.
- [ ] Selecting a site from the directory opens it.
- [ ] A nonexistent address shows a not-found state and preserves the attempted
      address.
- [ ] A failed lookup does not appear as a successful visit.

### Story 2: Follow links and navigate between pages

**As a visitor,** I want internal links and browser controls to behave
predictably so that I can explore and return through a browsing trail.

- [ ] An internal link opens the destination inside the application without a
      full-page reload.
- [ ] A broken internal link shows the not-found state.
- [ ] For A → B → C → D, going Back twice displays B.
- [ ] From B, going Forward displays C.
- [ ] After going Back to B and opening E, C and D are removed from the
      forward stack and Forward is disabled.
- [ ] Back and Forward do not append duplicate visits to persistent history.
- [ ] Home returns to the directory while retaining the selected visitor.

### Story 3: Return to a page at its previous position

**As a visitor,** I want a page's scroll position restored when I return to it.

- [ ] Scrolling a site and navigating away saves that entry's scroll position.
- [ ] Returning through Back or Forward displays the correct site at the saved
      position.
- [ ] Restoring an entry does not create another visit.

### Story 4: Review person-specific history

**As a visitor,** I want to see and use my browsing history without seeing
another person's visits.

- [ ] A successful visit is associated with the selected person and stores the
      address, timestamp, and source.
- [ ] History is ordered newest first and supports pagination or bounded
      loading.
- [ ] Repeated visits are displayed as distinct entries.
- [ ] Selecting an entry opens its site and records a new `history` visit.
- [ ] Refreshing the application does not remove server-side history.
- [ ] Changing the selected person shows that person's history only.

### Story 5: Find a site by its content

**As a visitor,** I want to search site text so that I can find pages even when
the query is not in the title.

- [ ] A search term present only in a site's body content returns that site.
- [ ] Results include title, address, and a relevant excerpt.
- [ ] Search runs through the backend and MongoDB text index.
- [ ] Selecting a result opens the matching site and records a `search` visit.
- [ ] Loading, error, and empty-result states are clear and usable.

### Story 6: Publish a safe new site

**As a publisher,** I want to publish a site under a unique fictional address
and then browse it.

- [ ] The form requires an address, title, HTML, and publisher.
- [ ] Invalid fields and invalid addresses produce clear errors.
- [ ] A valid publisher is verified by the backend.
- [ ] The backend sanitizes the HTML and generates searchable plain text.
- [ ] A valid site is saved and can be visited.
- [ ] Publishing to an existing address returns a conflict and leaves the
      existing site unchanged.
- [ ] Publishing success is confirmed and the new site can be opened.

### Story 7: Keep published pages isolated

**As a visitor,** I want pages written by publishers to be displayed without
running their scripts or controlling the browser application.

- [ ] Script elements and inline event handlers are removed or neutralized.
- [ ] `javascript:` and unsafe `data:` URLs are rejected or neutralized.
- [ ] External images, stylesheets, scripts, and other network resources are
      blocked.
- [ ] Published content is never rendered directly into the parent React DOM
      as untrusted HTML.
- [ ] Content is displayed in a sandboxed iframe with no `allow-scripts`
      permission and a restrictive Content Security Policy.
- [ ] Published content cannot manipulate the parent application or access its
      storage and cookies.
- [ ] Safe internal links continue to work through the browser's link
      interception.

### Story 8: Reproduce the sample dataset

**As an assessor,** I want repeatable sample data so that I can run the
application and verify its features consistently.

- [ ] The seed command creates the documented people, sites, and visits.
- [ ] Running the seed command twice does not duplicate records.
- [ ] Seed identifiers, addresses, and timestamps are deterministic.
- [ ] The seeded collection includes a multi-page browsing trail and a broken
      link.

## 4. UI/UX requirements

### 4.1 Overall experience

- The interface should feel like a small, welcoming browser rather than a
  generic administration dashboard.
- The layout must be polished, coherent, and responsive across desktop, tablet,
  and mobile viewport sizes.
- Browser navigation and primary actions should be easy to discover and use.
- Internal navigation must not trigger full-page reloads.

### 4.2 Required interface areas

The application must provide:

1. Application header and visitor selector.
2. Browser toolbar with Back, Forward, Home, and address entry.
3. Main site viewing area and directory/start view.
4. History panel with visit details and pagination or bounded loading.
5. Search interface with results and excerpts.
6. Publishing form with publisher selection.
7. Loading indicators, validation feedback, error messages, and empty states.

### 4.3 Required interaction states

The interface must account for:

- Initial application and directory state.
- Visitor not selected.
- Loading people, sites, history, or search results.
- Site displayed successfully.
- Invalid address, missing site, or network error.
- Empty history and empty search results.
- Search results and search failure.
- Publishing validation error, duplicate address, network error, and success.
- Disabled Back and Forward controls when navigation is unavailable.

### 4.4 Usability and accessibility

- Controls must have clear labels and appropriate keyboard interaction.
- Loading and error states should be perceivable without relying on color alone.
- Forms must associate labels with their fields and identify invalid input.
- Modal publishing UI must provide a clear close/cancel action and support
  keyboard dismissal.
- Content must remain usable at narrow viewport widths without requiring
  horizontal scrolling for the main application layout.

## 5. Technical requirements and constraints

### 5.1 Required technology stack

The assessment implementation must use the following stack; it must not be
replaced with an unrelated framework or database.

**Frontend**

- Next.js App Router, React, and TypeScript.
- Tailwind CSS.
- Axios for API requests.
- Zustand for appropriate application state.
- React Hook Form and Zod for form handling and validation.
- Lucide React for icons, Sonner for notifications, and date-fns for date
  formatting.

**Backend**

- NestJS and TypeScript.
- MongoDB with Mongoose.
- `@nestjs/config` for configuration.
- `class-validator` and `class-transformer` for request validation.
- `sanitize-html` for server-side HTML sanitization.
- Helmet for HTTP security headers.
- `@nestjs/throttler`, `nestjs-pino`, and `pino-http` for throttling and
  structured logging.

**Testing**

- Jest for backend tests.
- Vitest and React Testing Library for frontend unit and component tests.
- Playwright for end-to-end testing.

Use compatible stable versions and avoid unnecessary dependencies.

### 5.2 Application architecture

- Use a monorepo with separate frontend and backend applications.
- Keep user-interface concerns, API communication, domain behavior, and
  persistence responsibilities appropriately separated.
- Organize backend functionality into people, sites/search, visits, database,
  and seed areas rather than concentrating all behavior in one service.
- Keep browser navigation state on the frontend and persistent visit history in
  the backend/database. Do not treat them as the same state.
- Use a consistent API base prefix of `/api/v1`.
- Configure environment-specific values outside source code.

### 5.3 Data model and indexes

Use MongoDB and Mongoose for these domain records:

**Person**

- `_id`
- `name`
- `createdAt`

**Site**

- `_id`
- `address`
- `title`
- `html`
- `plainText`
- `authorId`
- `createdAt`
- `updatedAt`

Site constraints:

- Address is normalized and unique, enforced by a MongoDB unique index.
- HTML is sanitized before storage.
- `plainText` is generated from sanitized HTML and used for searching.
- `authorId` references an existing person.
- A MongoDB text index covers `title` and `plainText`.

**Visit**

- `_id`
- `personId`
- `siteId`
- `address`
- `visitedAt`
- `source`

Create an index on `personId` and `visitedAt` to support person-specific,
chronological history queries.

**Frontend navigation entry**

- Unique entry identifier.
- Address and site identifier.
- Site title and site data needed to restore the entry.
- Navigation source.
- Saved scroll position.
- Current navigation index maintained separately.

### 5.4 Address rules

- The canonical address is a lowercase `.zz` domain after trimming whitespace.
- The label consists of alphanumeric segments separated by single hyphens.
- Reject external URLs, paths, traversal, unsafe URL schemes, empty addresses,
  and malformed labels.
- Apply the same rules consistently to publishing, direct navigation, internal
  links, and search navigation.

### 5.5 HTML and network security

Published HTML is untrusted input. The implementation must:

- Sanitize HTML on the backend with `sanitize-html` and an explicit allowlist
  of safe elements and attributes.
- Remove scripts, inline event handlers, unsafe URL schemes, embedded content,
  and external resource references.
- Generate searchable text from the sanitized HTML.
- Never render untrusted HTML directly into the parent React application.
- Display published content in a sandboxed iframe without `allow-scripts`.
- Apply a restrictive Content Security Policy and block external network
  requests, including images, stylesheets, scripts, fonts, media, and frames.
- Intercept allowed internal links safely and reject unsafe or external
  destinations.
- Prevent page content from accessing or manipulating the parent application,
  its cookies, or local storage.
- Include tests using malicious HTML examples.

### 5.6 Quality and verification

- Validate API inputs and return appropriate HTTP status codes.
- Do not record failed navigation as successful history.
- Do not create duplicate history visits when restoring Back/Forward entries.
- Include automated tests for critical navigation, history, search, publishing,
  sanitization, and seed behavior.
- Verify responsive behavior and production builds before submission.

## 6. Expected deliverables

The completed assessment submission must include:

1. **Frontend source code** implementing the browser, directory, visitor
   selection, navigation, history, search, and publishing experiences.
2. **Backend source code** implementing the API, database models, validation,
   sanitization, search, history, and health check.
3. **MongoDB data model and indexes** for people, sites, and visits.
4. **A deterministic seed command** that creates repeatable people, sites, and
   browsing history.
5. **Automated tests** covering backend behavior, frontend behavior, and
   critical end-to-end workflows, including security boundaries.
6. **A complete README** with prerequisites, installation, environment
   configuration, MongoDB setup, exact frontend/backend startup commands,
   seed instructions, test commands, project structure, features, and known
   limitations. A developer must be able to follow it to run the application.
7. **A narrated screen recording of approximately 4–5 minutes** demonstrating:
   - A browsing trail at least four pages deep.
   - Back and Forward behavior, including returning to search results.
   - Searching for content present in a site's body.
   - Publishing and visiting a new site.
   - Visiting a nonexistent address.
   - An explanation of the data model, navigation and scroll restoration,
     untrusted HTML containment, and intentionally excluded features.

The submission is considered complete when the frontend and backend run, the
database connects, seed data is repeatable, all mandatory user stories and
acceptance criteria are verified, critical tests pass, and the README and
narrated demonstration are provided.
