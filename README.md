# MONTHLY — Your Money Survival OS

A modern Gen Z personal finance survival operating system to manage ₹10,000 across a 30-day budget cycle with an interconnected financial simulation engine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.3.0-purple.svg)

## 📸 Screenshots

> **Note:** Add real screenshots of the application here. To add screenshots:
> 1. Take screenshots of the key screens (Overview, Transactions, What-If Lab, Insights)
> 2. Place them in a `screenshots/` directory in the project root
> 3. Update the image paths below

**Overview Dashboard**
![Overview](screenshots/overview.png)

**What-If Lab**
![What-If Lab](screenshots/whatif-lab.png)

**Financial Insights**
![Insights](screenshots/insights.png)

## 🎯 Problem Statement

Young adults and students often struggle with managing a fixed monthly budget, leading to cash flow crises before month-end. Traditional budgeting apps are either too complex or don't provide real-time feedback on spending decisions. MONTHLY solves this by:

- Providing a **30-day survival simulation** with real-time financial health scoring
- Enabling **what-if scenario testing** before making purchases
- Offering **rule-based financial insights** derived from actual spending patterns
- Maintaining a **clean, modern UI** that appeals to Gen Z users

## ✨ Key Features

- **Budget Planning**: Track daily spending with a ₹10,000 monthly budget
- **Transaction Management**: Add, edit, and categorize expenses with 8 predefined categories
- **Savings Goals**: Set and track savings targets with priority levels
- **Subscription Tracking**: Monitor recurring expenses (monthly, quarterly, annual)
- **What-If Lab**: Simulate financial decisions before spending with real-time impact analysis
- **Financial Insights**: Rule-based recommendations based on spending velocity and patterns
- **Health Scoring**: Transparent 0-100 financial health score with 4 contributing factors
- **Day-by-Day Forecast**: Visual 30-day cash trajectory with projections
- **Commitment Reservations**: Optional feature to reserve upcoming bills from daily allowance
- **Modern UI**: Built with React 19, Tailwind CSS 4, and motion animations

## 🛠 Technology Stack

- **Frontend Framework**: React 19.0.1 with TypeScript 7.0.2
- **Styling**: Tailwind CSS 4.3.3 (Vite plugin)
- **Charts**: Recharts 3.10.1 (lazy-loaded for performance)
- **Animations**: Motion 12.23.24
- **Icons**: Lucide React 0.546.0
- **Build Tool**: Vite 8.3.0
- **State Management**: React Context API with localStorage persistence
- **Financial Engine**: Pure TypeScript calculator functions

## 📁 Project Structure

```
monthly/
├── src/
│   ├── components/
│   │   ├── budget/          # Budget planner components
│   │   ├── common/          # Shared components (modals, toasts, icons)
│   │   ├── insights/        # Financial insights tab
│   │   ├── layout/          # Header, sidebar, mobile navigation
│   │   ├── overview/        # Dashboard overview
│   │   ├── savings/         # Savings goals management
│   │   ├── subscriptions/   # Subscription tracking
│   │   ├── transactions/    # Transaction management
│   │   └── whatif/          # What-If simulation lab
│   ├── context/
│   │   └── FinanceContext.tsx  # Global state management
│   ├── data/
│   │   ├── categories.ts        # Category definitions
│   │   └── initialData.ts       # Demo/initial state
│   ├── engine/
│   │   └── calculator.ts        # Pure financial calculation functions
│   ├── types/
│   │   └── finance.ts           # TypeScript type definitions
│   ├── utils/
│   │   ├── formatters.ts        # Currency and number formatting
│   │   └── validation.ts        # Input validation utilities
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── render.yaml                  # Render deployment configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## 🚀 Installation and Local Development

**Prerequisites:**
- Node.js 18+ (recommended: Node.js 20+)
- npm or bun

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

Create a `.env.local` file in the project root:

```bash
FEATHERLESS_API_KEY="your_featherless_api_key_here"
```

> **Note:** The app currently uses Featherless API for AI features. If you don't have an API key, the app will still function for core financial features.

### Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Step 4: Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Step 5: Preview Production Build

```bash
npm run preview
```

### Step 6: Type Checking

```bash
npm run lint
```

## 📊 Financial Formulas and Assumptions

### Core Calculations

#### 1. Current Cash Balance
```
currentCashBalance = openingBudget + totalIncome - totalExpenses - totalSavedInGoals
```

#### 2. Safe-to-Spend Per Day
```
safeToSpendPerDay = max(0, availableUncommittedCash / remainingDays)
availableUncommittedCash = max(0, currentCashBalance - reservedCommitments)
```

#### 3. Projected Closing Balance
```
projectedClosingBalance = currentCashBalance - (burnRateToDate * remainingDays + upcomingSubscriptions)
```

#### 4. Burn Rate
```
burnRateToDate = totalExpenses / currentDay
targetDailyBudget = openingBudget / cycleTotalDays
```

### Health Score Factors (0-100)

The health score is calculated from 4 transparent factors:

1. **Burn Rate Discipline (Max 30)**
   - 30 points: burn rate ≤ target
   - 24 points: burn rate ≤ 1.25× target
   - 16 points: burn rate ≤ 1.5× target
   - 8 points: burn rate ≤ 2× target
   - 2 points: burn rate > 2× target

2. **Survival Runway (Max 30)**
   - 30 points: runway ≥ remainingDays + 5
   - 26 points: runway ≥ remainingDays
   - 18 points: runway ≥ 75% of remainingDays
   - 10 points: runway ≥ 50% of remainingDays
   - 3 points: runway < 50% of remainingDays

3. **Commitment Coverage (Max 20)**
   - 20 points: no upcoming commitments
   - 20 points: cash ≥ 4× commitments
   - 16 points: cash ≥ 2× commitments
   - 10 points: cash ≥ commitments
   - 4 points: cash < commitments

4. **Budget Discipline (Max 20)**
   - 20 points: 0 categories overspent
   - 15 points: 1 category overspent
   - 10 points: 2 categories overspent
   - 4 points: 3+ categories overspent

### Risk Levels

- **Low Risk (75-100)**: On track to finish month with buffer
- **Moderate Risk (55-74)**: Watch spending, some runway remaining
- **Elevated Risk (40-54)**: Fast depletion, immediate action needed
- **Critical Risk (0-39)**: Runway alert, drastic measures required

## 💾 State Persistence and Simulation Behavior

### Local Storage

The application automatically persists state to localStorage under the key `monthly_survival_os_v1`. This includes:
- All transactions
- Category budgets
- Savings goals
- Subscriptions
- Current cycle day
- Commitment reservation preference

### What-If Simulation

The What-If Lab operates in a **hypothetical sandbox**:
- Simulations do not modify actual state until explicitly applied
- The simulation engine creates a synthetic transaction and recalculates metrics
- Forecast data shows both baseline and simulated trajectories
- Users can apply or discard decisions after reviewing impact

### Day Advancement

The `advanceDay` function allows interactive exploration:
- Changes the `currentDay` without adding time-based transactions
- Useful for testing "what if we're on Day 25" scenarios
- Does not automatically charge subscriptions or add periodic income

## 🌐 Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect the `render.yaml` configuration
6. Add `FEATHERLESS_API_KEY` as an environment variable (optional)
7. Click "Create Web Service"

**render.yaml** is pre-configured with:
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Static site serving from `./dist`

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variable in Vercel dashboard:
- `FEATHERLESS_API_KEY`: Your Featherless API key

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

Then configure GitHub Pages:
1. Go to repository Settings → Pages
2. Set source to GitHub Actions or select branch
3. Configure to serve from `dist` folder

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FEATHERLESS_API_KEY` | No | Featherless API key for AI features (optional) |

## ⚠️ Known Limitations

1. **Single Budget Cycle**: Currently supports only one 30-day cycle. Multiple cycles require manual reset.
2. **No Account Syncing**: State is stored locally in browser. No cloud sync across devices.
3. **Indian Rupee Only**: Currency formatting is hardcoded to INR (₹).
4. **Fixed 30-Day Cycle**: Cannot customize cycle length (always 30 days).
5. **Subscription Frequency**: Only supports monthly, quarterly, and annual (not weekly or bi-weekly).
6. **No Export/Import**: Cannot export data to CSV or import from other apps.
7. **Browser Dependent**: Requires modern browser with localStorage support.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add income transaction
- [ ] Add expense transaction
- [ ] Edit existing transaction
- [ ] Delete transaction
- [ ] Change category budget
- [ ] Create savings goal
- [ ] Contribute to savings goal
- [ ] Withdraw from savings goal
- [ ] Add subscription
- [ ] Cancel subscription
- [ ] Toggle commitment reservation
- [ ] Test What-If simulation
- [ ] Apply What-If decision
- [ ] Advance simulation day
- [ ] Reset to demo data
- [ ] Verify localStorage persistence
- [ ] Test on mobile viewport

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for Gen Z financial literacy
