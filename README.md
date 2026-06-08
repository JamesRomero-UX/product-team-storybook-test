# Product Team Storybook

Interactive component library and prototype viewer for the RiskSmart design system.

---

## Prerequisites

Before you start, make sure you have these installed:

- **Node.js** (v18 or later) — https://nodejs.org
- **pnpm** — open Terminal and run: `npm install -g pnpm`
- A local clone of the **risksmart-app** repo (ask a team member for access)

---

## Setup (first time only)

Open Terminal, then follow these steps:

**1. Go into the Storybook folder**
```
cd /path/to/dream-team/product-team-storybook
```

**2. Create your local config file**
```
cp .env.example .env
```

**3. Open `.env` in any text editor and set the path to your risksmart-app clone**
```
RS_APP_PATH=/Users/yourname/Documents/risksmart-app-main 2
```
Replace `/Users/yourname/Documents/risksmart-app-main 2` with wherever you cloned the app repo.

**4. Install dependencies**
```
pnpm install
```

---

## Running Storybook

```
pnpm storybook
```

Then open your browser at **http://localhost:6007**

---

## Notes

- The `.env` file is personal — it only lives on your machine and is not shared.
- If Storybook fails to start, double-check that the path in `.env` is correct and the risksmart-app folder exists at that location.
- Storybook must be running locally to view stories — it can't be shared as a URL. For shareable prototypes, see the `_prototypes/` folder.
