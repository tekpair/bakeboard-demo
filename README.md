# BakeBoard Demo

An interactive frontend demo for bakery production and staff management. Built with Next.js, React, TypeScript, and Lucide icons.

## Visit the public demo

[Open BakeBoard](https://tekpair.github.io/bakeboard-demo/) to explore the site and sample workspace. No installation or account is needed. Each visitor's demo changes stay in their own browser.

## Local development

Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To use another port: `npm run dev -- -p 3001`.

## What's included

- Marketing pages and a public Help Center
- Workspace Overview, Production Board, Calendar, and My Tasks
- Production Library for products, categories, and checklist templates
- Staff Management and Workspace Settings
- Demo role and Free/Plus plan previews

Demo changes are saved in the current browser's local storage. **Reset Demo** restores the sample workspace. There is no backend, real authentication, email delivery, payment processing, or live subscription enforcement. Role restrictions are a frontend simulation and must not be treated as secure authorization.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
```

The site is not an online ordering or checkout system. It helps bakeries organize production work and coordinate staff.
