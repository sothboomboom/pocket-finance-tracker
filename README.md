# Pocket

A personal expense tracker built with React and Vite. Your data is saved in the browser, so there is no account or server to set up.

## Features

- **Add, edit and delete expenses**, with an Undo button after deleting
- **Five currencies**: USD, KRW, JPY, CNY and KHR, converted to US dollars with the day's exchange rate
- **Home**: what you spent today, this week or this month, with the latest expenses
- **All expenses**: month by month, with search and category / cash or bank filters
- **Dashboard**: totals, a spending chart, a category breakdown and your top categories, by day, week or month
- **Categories**: add, rename, recolor and choose an icon; deleting one moves its expenses to "Other"
- **Settings**: today's exchange rates, and a button to reset to the sample data
- Works on phones, tablets and desktop

## Getting started

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/sothboomboom/pocket-finance-tracker.git
cd pocket-finance-tracker
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. The first time, the app loads sample data so you have something to look at.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app for development |
| `npm run build` | Builds the app for production into `dist/` |
| `npm run preview` | Serves the production build locally |
