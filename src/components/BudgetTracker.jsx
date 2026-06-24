import React, { useState } from 'react';
import { Edit3, Check, X, ShieldAlert } from 'lucide-react';

// Default categories
const DEFAULT_CATEGORIES = [
  'Food & Canteen',
  'Books & Stationery',
  'Entertainment',
  'Shopping',
  'Travel',
  'Bills & Subscriptions',
  'Others'
];

export default function BudgetTracker({ transactions = [], budgets = [], onSaveBudget }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      const cat = curr.category || 'Others';
      acc[cat] = (acc[cat] || 0) + parseFloat(curr.amount || 0);
      return acc;
    }, {});

  // Find budget limit for a category
  const getBudgetLimit = (category) => {
    const b = budgets.find(item => item.category === category);
    return b ? parseFloat(b.limit || 0) : 0;
  };

  const startEditing = (category) => {
    const limit = getBudgetLimit(category);
    setEditingCategory(category);
    setEditLimit(limit > 0 ? limit.toString() : '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditLimit('');
  };

  const saveEditing = (category) => {
    const parsedLimit = parseFloat(editLimit);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      alert('Please enter a valid positive number for the budget limit.');
      return;
    }
    onSaveBudget(category, parsedLimit);
    setEditingCategory(null);
    setEditLimit('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="budget-tracker-card glass-card animate-slide-up">
      <div className="tracker-header">
        <h3 className="section-title">Category Budgets</h3>
        <p className="section-subtitle">Set monthly limits and track spending</p>
      </div>

      <div className="tracker-list">
        {DEFAULT_CATEGORIES.map(category => {
          const spent = expensesByCategory[category] || 0;
          const limit = getBudgetLimit(category);
          const isEditing = editingCategory === category;

          let percent = 0;
          if (limit > 0) {
            percent = Math.min((spent / limit) * 100, 100);
          }

          // Progress bar color based on percent spent
          let progressColor = 'var(--color-income)'; // Green
          let bgGlow = 'rgba(16, 185, 129, 0.1)';
          if (percent >= 90) {
            progressColor = 'var(--color-expense)'; // Red
            bgGlow = 'rgba(244, 63, 94, 0.1)';
          } else if (percent >= 70) {
            progressColor = 'var(--color-warning)'; // Yellow
            bgGlow = 'rgba(245, 158, 11, 0.1)';
          }

          const isOverBudget = limit > 0 && spent > limit;

          return (
            <div key={category} className={`tracker-row ${isOverBudget ? 'over-budget-row' : ''}`}>
              <div className="row-info">
                <div className="category-meta">
                  <span className="category-name">{category}</span>
                  {isOverBudget && (
                    <span className="over-budget-badge text-danger" title="Spent exceeded budget limit!">
                      <ShieldAlert size={14} />
                      Over Limit
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="edit-form animate-fade-in">
                    <span className="currency-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input edit-input"
                      value={editLimit}
                      onChange={(e) => setEditLimit(e.target.value)}
                      placeholder="Limit"
                      autoFocus
                    />
                    <button className="btn btn-secondary btn-icon-only edit-action-btn check-btn" onClick={() => saveEditing(category)}>
                      <Check size={14} className="text-success" />
                    </button>
                    <button className="btn btn-secondary btn-icon-only edit-action-btn close-btn" onClick={cancelEditing}>
                      <X size={14} className="text-danger" />
                    </button>
                  </div>
                ) : (
                  <div className="value-display">
                    <span className="spent-text">{formatCurrency(spent)}</span>
                    <span className="divider">/</span>
                    <span className="limit-text">{limit > 0 ? formatCurrency(limit) : 'Set Limit'}</span>
                    <button className="inline-edit-btn" onClick={() => startEditing(category)} title="Edit Limit">
                      <Edit3 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar container */}
              <div className="progress-container">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${limit > 0 ? percent : 0}%`, 
                      backgroundColor: progressColor,
                      boxShadow: `0 0 8px ${progressColor}`
                    }}
                  />
                </div>
                {limit > 0 && (
                  <span className="progress-percent" style={{ color: progressColor }}>
                    {percent.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .budget-tracker-card {
          padding: 1.5rem;
          height: 100%;
        }

        .tracker-header {
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .tracker-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tracker-row {
          padding: 0.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          transition: background var(--transition-fast);
          border-radius: var(--radius-sm);
        }

        .row-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 1.75rem;
        }

        .category-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .category-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .over-budget-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          background: rgba(244, 63, 94, 0.1);
        }

        .value-display {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
        }

        .spent-text {
          font-weight: 700;
          color: var(--text-primary);
        }

        .divider {
          margin: 0 0.25rem;
          color: var(--text-muted);
        }

        .limit-text {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .inline-edit-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          margin-left: 0.375rem;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .inline-edit-btn:hover {
          color: var(--color-primary);
          background: var(--border-color);
        }

        .edit-form {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .currency-prefix {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .edit-input {
          width: 80px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          background: rgba(0,0,0,0.25);
          height: 1.75rem;
        }

        [data-theme="light"] .edit-input {
          background: #ffffff;
        }

        .edit-action-btn {
          width: 1.75rem;
          height: 1.75rem;
          min-width: 1.75rem;
          border-radius: 4px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .progress-bar-bg {
          flex-grow: 1;
          height: 6px;
          background-color: var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow) ease-out, background-color var(--transition-slow);
        }

        .progress-percent {
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 2.25rem;
          text-align: right;
        }

        .over-budget-row {
          animation: pulse-danger-border 2s infinite alternate;
        }
      `}</style>
    </div>
  );
}
