# MONTHLY — Your Money Survival OS

A modern Gen Z personal finance survival operating system to manage ₹10,000 across a 30-day budget cycle with an interconnected financial simulation engine.

## Features

- **Budget Planning**: Track daily spending with a ₹10,000 monthly budget
- **Transaction Management**: Add, edit, and categorize expenses
- **Savings Goals**: Set and track savings targets
- **Subscription Tracking**: Monitor recurring expenses
- **What-If Lab**: Simulate financial scenarios
- **Insights**: Get AI-powered financial insights using Featherless API
- **Modern UI**: Built with React, Tailwind CSS, and motion animations

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Animations**: Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **AI**: Featherless API

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file:
   ```bash
   FEATHERLESS_API_KEY="your_featherless_api_key_here"
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the `render.yaml` configuration
6. Add `FEATHERLESS_API_KEY` as an environment variable
7. Click "Create Web Service"

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to GitHub Pages

```bash
npm run build
```
Then configure GitHub Pages to serve from the `dist` folder.

## Project Structure

```
monthly/
├── src/
│   ├── components/     # React components
│   ├── context/        # React context providers
│   ├── data/          # Initial data and categories
│   ├── engine/        # Financial calculator
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
└── index.html         # Entry HTML
```

## License

MIT
