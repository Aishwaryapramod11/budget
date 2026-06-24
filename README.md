# WealthFlow | Premium College Student Budgeting Dashboard

**WealthFlow** is a responsive React.js budgeting application designed to help college students track, analyze, and optimize their pocket money, part-time earnings, and expenditures. Built with clean, premium vanilla CSS with a glassmorphism aesthetic.

---

## 🌟 Key Features

- **College-Tailored Categories**: Avoids complex items like housing/transit, offering student-friendly groups:
  - *Food & Canteen*
  - *Books & Stationery*
  - *Entertainment & Outings*
  - *Shopping & Clothes*
  - *Travel & Commute*
  - *Bills & Subscriptions*
  - *Others*
- **Indian Rupee (₹) Formatting**: Display values in the `en-IN` format with the standard `₹` symbol.
- **Interactive SVG Charts**: Custom-designed animated donut chart (expense breakdown) and comparative column bar chart (spent vs budget) with mouse hover tooltips and dynamic color indicators.
- **Dynamic Progress Meters**: Set monthly budgets for each category inline and monitor spending levels with color-coded progress bars (green/yellow/red warnings).
- **Theme Customizer**: Dark/Light mode toggle persisted in `localStorage`.
- **Data Portability**: Easily download reports as a standard CSV or backup JSON, and restore previous states using the upload feature.

---

## 🛠️ Development Setup

Install dependencies and start the development server:

```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Compile production bundle
npm run build
```
