import React, { useState } from 'react';
import { PieChart as PieIcon, BarChart2 as BarIcon, HelpCircle } from 'lucide-react';

const CATEGORY_COLORS = {
  'Food & Canteen': '#8b5cf6',
  'Books & Stationery': '#06b6d4',
  'Entertainment': '#ec4899',
  'Shopping': '#f59e0b',
  'Travel': '#f97316',
  'Bills & Subscriptions': '#6366f1',
  'Others': '#64748b'
};

export default function ChartsSection({ transactions = [], budgets = [] }) {
  const [activeSegment, setActiveSegment] = useState(null);
  const [activeBar, setActiveBar] = useState(null);

  // Group transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  // Calculate expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc, curr) => {
    const cat = curr.category || 'Others';
    acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount || 0);
    return acc;
  }, {});

  // Prepare data for donut chart
  const categoriesList = Object.keys(CATEGORY_COLORS);
  const donutData = categoriesList
    .map(cat => ({
      category: cat,
      amount: expensesByCategory[cat] || 0,
      color: CATEGORY_COLORS[cat]
    }))
    .filter(item => item.amount > 0);

  const totalChartExpenses = donutData.reduce((acc, curr) => acc + curr.amount, 0);

  // Donut SVG Math Constants
  const size = 200;
  const center = size / 2;
  const radius = 60;
  const strokeWidth = 14;
  const hoverStrokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~376.99

  let accumulatedPercent = 0;

  // Prepare data for bar chart (Spent vs Budget comparison for categories with limits, or all categories if none set)
  const barData = categoriesList.map(cat => {
    const spent = expensesByCategory[cat] || 0;
    const budgetObj = budgets.find(b => b.category === cat);
    const limit = budgetObj ? parseFloat(budgetObj.limit) : 0;
    return {
      category: cat,
      spent,
      limit,
      color: CATEGORY_COLORS[cat]
    };
  });

  // Find max value to scale the bar chart heights
  const maxBarValue = Math.max(
    ...barData.map(d => Math.max(d.spent, d.limit)),
    100 // fallback floor
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Center display text for Donut Chart
  const getDonutCenterLabel = () => {
    if (activeSegment) {
      const pct = totalChartExpenses > 0 ? ((activeSegment.amount / totalChartExpenses) * 100).toFixed(1) : 0;
      return (
        <>
          <tspan x={center} dy="-10" className="donut-center-title" fill={activeSegment.color}>
            {activeSegment.category}
          </tspan>
          <tspan x={center} dy="24" className="donut-center-value">
            {formatCurrency(activeSegment.amount)}
          </tspan>
          <tspan x={center} dy="18" className="donut-center-pct">
            {pct}% of Total
          </tspan>
        </>
      );
    }

    return (
      <>
        <tspan x={center} dy="-5" className="donut-center-title-muted">
          Total Expenses
        </tspan>
        <tspan x={center} dy="26" className="donut-center-value-total">
          {formatCurrency(totalExpenses)}
        </tspan>
      </>
    );
  };

  return (
    <div className="charts-grid-layout">
      {/* Donut Chart Card */}
      <div className="glass-card chart-card animate-slide-up">
        <div className="chart-card-header">
          <div className="chart-title-wrapper">
            <PieIcon size={18} className="chart-header-icon" />
            <h3 className="chart-title">Expense Breakdown</h3>
          </div>
          <span className="chart-subtitle">Hover slices for details</span>
        </div>

        <div className="chart-body donut-chart-body">
          {totalChartExpenses === 0 ? (
            <div className="empty-chart-state">
              <HelpCircle size={48} className="text-muted" />
              <p>No expenses tracked yet</p>
              <span className="empty-sub">Add a transaction to generate chart</span>
            </div>
          ) : (
            <div className="donut-svg-wrapper">
              <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
                <defs>
                  {/* Drop Shadow Filter for Active Hover Segment */}
                  <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Base circle background track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth={strokeWidth}
                />

                {/* Donut Segments */}
                {donutData.map((item, index) => {
                  const percent = item.amount / totalChartExpenses;
                  const strokeLength = circumference * percent;
                  const strokeOffset = circumference - strokeLength;
                  const rotationAngle = (accumulatedPercent * 360) - 90; // Start at top (12 o'clock)
                  
                  accumulatedPercent += percent;

                  const isActive = activeSegment?.category === item.category;

                  return (
                    <circle
                      key={item.category}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isActive ? hoverStrokeWidth : strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={0}
                      transform={`rotate(${rotationAngle} ${center} ${center})`}
                      className="donut-segment"
                      filter={isActive ? "url(#glow-filter)" : ""}
                      onMouseEnter={() => setActiveSegment(item)}
                      onMouseLeave={() => setActiveSegment(null)}
                      style={{
                        transition: 'stroke-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}

                {/* Center text overlay */}
                <text
                  x={center}
                  y={center}
                  textAnchor="middle"
                  className="donut-center-text"
                >
                  {getDonutCenterLabel()}
                </text>
              </svg>
            </div>
          )}

          {/* Custom Legend */}
          {donutData.length > 0 && (
            <div className="chart-legend">
              {donutData.map(item => (
                <div 
                  key={item.category} 
                  className={`legend-item ${activeSegment?.category === item.category ? 'legend-item-active' : ''}`}
                  onMouseEnter={() => setActiveSegment(item)}
                  onMouseLeave={() => setActiveSegment(null)}
                >
                  <span className="legend-indicator" style={{ backgroundColor: item.color }} />
                  <span className="legend-name">{item.category}</span>
                  <span className="legend-val">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="glass-card chart-card animate-slide-up">
        <div className="chart-card-header">
          <div className="chart-title-wrapper">
            <BarIcon size={18} className="chart-header-icon" />
            <h3 className="chart-title">Spending vs Budget</h3>
          </div>
          <span className="chart-subtitle">Spent vs limit comparators</span>
        </div>

        <div className="chart-body bar-chart-body">
          <div className="bar-chart-container">
            {/* Grid Y Axis Labels */}
            <div className="bar-y-axis">
              <span>{formatCurrency(maxBarValue)}</span>
              <span>{formatCurrency(maxBarValue / 2)}</span>
              <span>$0</span>
            </div>

            <div className="bar-chart-content">
              {/* Grid background lines */}
              <div className="chart-grid-lines">
                <div className="grid-line" style={{ bottom: '100%' }} />
                <div className="grid-line" style={{ bottom: '50%' }} />
                <div className="grid-line" style={{ bottom: '0%' }} />
              </div>

              {/* Columns */}
              <div className="bar-columns-wrapper">
                {barData.map(d => {
                  // Percent height relative to maximum value
                  const spentHeight = (d.spent / maxBarValue) * 100;
                  const limitHeight = (d.limit / maxBarValue) * 100;

                  const isHovered = activeBar === d.category;

                  return (
                    <div 
                      key={d.category}
                      className="bar-column-group"
                      onMouseEnter={() => setActiveBar(d.category)}
                      onMouseLeave={() => setActiveBar(null)}
                    >
                      {/* Bar Visuals container */}
                      <div className="bar-visuals-container">
                        {/* Budget Limit Line Marker */}
                        {d.limit > 0 && (
                          <div 
                            className="budget-limit-marker" 
                            style={{ 
                              bottom: `${limitHeight}%`,
                              borderColor: d.color
                            }}
                            title={`Budget Limit: ${formatCurrency(d.limit)}`}
                          />
                        )}

                        {/* Spent Bar */}
                        <div 
                          className="spent-bar-column"
                          style={{ 
                            height: `${Math.max(spentHeight, d.spent > 0 ? 3 : 0)}%`,
                            background: `linear-gradient(0deg, ${d.color}cc, ${d.color})`,
                            boxShadow: isHovered ? `0 0 12px ${d.color}80` : 'none'
                          }}
                        />
                      </div>

                      {/* Bar label */}
                      <span className="bar-label-text">{d.category.substring(0, 3)}</span>

                      {/* Tooltip Hover Display */}
                      {isHovered && (
                        <div className="bar-tooltip animate-fade-in">
                          <span className="tooltip-cat" style={{ color: d.color }}>{d.category}</span>
                          <div className="tooltip-details">
                            <div>Spent: <strong>{formatCurrency(d.spent)}</strong></div>
                            {d.limit > 0 && <div>Budget: <strong>{formatCurrency(d.limit)}</strong></div>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .charts-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .charts-grid-layout {
            grid-template-columns: 1fr 1fr;
          }
        }

        .chart-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 380px;
        }

        .chart-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .chart-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-header-icon {
          color: var(--color-primary);
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 700;
        }

        .chart-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .chart-body {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .donut-chart-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          align-items: center;
        }

        @media (min-width: 480px) and (max-width: 767px), (min-width: 1100px) {
          .donut-chart-body {
            grid-template-columns: 1.2fr 1fr;
          }
        }

        .donut-svg-wrapper {
          width: 100%;
          max-width: 200px;
          margin: 0 auto;
          position: relative;
        }

        .donut-segment {
          transform-origin: center;
          transition: stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.25s;
        }

        .donut-center-text {
          pointer-events: none;
        }

        .donut-center-title {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .donut-center-title-muted {
          font-size: 0.7rem;
          font-weight: 700;
          fill: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .donut-center-value {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          fill: var(--text-primary);
        }

        .donut-center-value-total {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          fill: var(--text-primary);
        }

        .donut-center-pct {
          font-size: 0.6rem;
          fill: var(--text-secondary);
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition-fast);
          cursor: pointer;
        }

        .legend-item:hover, .legend-item-active {
          background-color: var(--border-color);
        }

        .legend-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .legend-name {
          font-weight: 600;
          color: var(--text-secondary);
          flex-grow: 1;
        }

        .legend-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-chart-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .empty-chart-state p {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .empty-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Bar Chart styles */
        .bar-chart-body {
          align-items: stretch;
        }

        .bar-chart-container {
          display: flex;
          flex-grow: 1;
          gap: 0.75rem;
          height: 250px;
          position: relative;
        }

        .bar-y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          width: 48px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          padding: 0.5rem 0 1.5rem;
        }

        .bar-chart-content {
          flex-grow: 1;
          position: relative;
          border-left: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.5rem; /* make room for X labels */
        }

        .chart-grid-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .grid-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--border-color);
          opacity: 0.5;
        }

        .bar-columns-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          padding: 0 0.5rem;
          z-index: 2;
        }

        .bar-column-group {
          width: 100%;
          max-width: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          position: relative;
          cursor: pointer;
        }

        .bar-visuals-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .spent-bar-column {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: height var(--transition-slow) cubic-bezier(0.19, 1, 0.22, 1);
        }

        .budget-limit-marker {
          position: absolute;
          width: 140%;
          left: -20%;
          border-top: 2px dashed;
          z-index: 3;
          pointer-events: none;
          transition: bottom var(--transition-slow) cubic-bezier(0.19, 1, 0.22, 1);
        }

        .bar-label-text {
          position: absolute;
          bottom: -1.25rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .bar-tooltip {
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: var(--text-primary);
          box-shadow: var(--shadow-md);
          z-index: 10;
          white-space: nowrap;
          pointer-events: none;
        }

        [data-theme="light"] .bar-tooltip {
          background: rgba(255, 255, 255, 0.98);
        }

        .tooltip-cat {
          font-weight: 800;
          display: block;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          font-size: 0.65rem;
          letter-spacing: 0.05em;
        }

        .tooltip-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
      `}</style>
    </div>
  );
}
