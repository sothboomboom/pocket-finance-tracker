# Pocket

A personal expense tracker built with React and Vite. Your data is saved in the browser, so there is no account or server to set up.

The site is live on https://finance-tracker-pocket.netlify.app

## Features

- **Add, edit and delete expenses** (deleting asks you first)
- **Five currencies**: USD, KRW, JPY, CNY and KHR, converted to US dollars with fixed exchange rates
- **Home**: what you spent today, this week or this month, with the latest expenses
- **All expenses**: month by month, filtered by category or by cash / bank
- **Dashboard**: weekly or monthly totals, a spending chart and spending by category
- **Categories**: add, rename and choose an icon; deleting one moves its expenses to "Other"
- **Settings**: the exchange rates, and buttons to load the sample data or delete all data
- Works on phones, tablets and desktop

## Tech stack

- [React 19](https://react.dev)
- [Vite](https://vite.dev)
- Browser `localStorage` to save your data

## Project structure

```text
├── public/               # Favicons and other static files
├── src/
│   ├── components/       # Reusable UI: Layout, Button, Sheet, ExpenseForm, ExpenseList, ...
│   ├── context/          # FinanceContext (all app data) and the useFinance hook
│   ├── data/             # Categories, currencies and exchange rates, sample data
│   ├── pages/            # One page per route: Home, Expenses, Dashboard, Categories, Settings
│   ├── utils/            # Helpers for formatting money and dates
│   ├── App.jsx           # The routes
│   ├── main.jsx          # Entry point: router and FinanceProvider
│   └── index.css         # Global styles and design tokens
├── index.html
├── package.json
├── vite.config.js
└── REPORT.md             # Project report
```

## Getting started

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/sothboomboom/pocket-finance-tracker.git
cd pocket-finance-tracker
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. The app starts empty: add your first expense, or load the sample data in Settings to try it out.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app for development |
| `npm run build` | Builds the app for production into `dist/` |
| `npm run preview` | Serves the production build locally |
