# BakeBoard Demo

An interactive frontend demo for bakery production and customer order tracking. BakeBoard helps bakery owners and staff organize orders received elsewhere and the production work behind them; it does not take orders or payments. Built with Next.js, React, TypeScript, and Lucide icons.

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
- Demo role and Starter/Plus plan previews

Demo changes are saved in the current browser's local storage. **Reset Demo** restores the sample workspace. There is no backend, real authentication, email delivery, payment processing, or live subscription enforcement. Role restrictions are a frontend simulation and must not be treated as secure authorization.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:production
npm run build
```

The planned Starter plan is $3.99/month or $39/year with a 14-day free trial at launch. Plus is $7.99/month or $79/year. Each subscription is planned for one bakery workspace; individual staff accounts may later belong to multiple bakeries. Plans and billing are previews only and cannot be purchased in the demo.
