import React, { useState } from 'react';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Activity, Edit3, Check, X } from 'lucide-react';

export default function SummaryCards({ transactions = [], budgets = [], initialBalance = 0, onSaveInitialBalance }) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editBalanceVal, setEditBalanceVal] = useState('');

  // Calculations
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalExpenses = expenseTransactions.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const netBalance = initialBalance + totalIncome - totalExpenses;

  const totalBudgetLimit = budgets.reduce((acc, curr) => acc + parseFloat(curr.limit || 0), 0);

  // Overall Budget Health Percentage
  let budgetSpentPercent = 0;
  if (totalBudgetLimit > 0) {
    budgetSpentPercent = Math.min((totalExpenses / totalBudgetLimit) * 100, 100);
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleStartEdit = () => {
    setEditBalanceVal(initialBalance.toString());
    setIsEditingBalance(true);
  };

  const handleCancelEdit = () => {
    setIsEditingBalance(false);
  };

  const handleSaveEdit = () => {
    const val = parseFloat(editBalanceVal);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid positive number for your starting net worth.');
      return;
    }
    onSaveInitialBalance(val);
    setIsEditingBalance(false);
  };

  // Class for balance card dynamic styling
  const balanceColorClass = netBalance >= 0 ? 'text-success' : 'text-danger';
  const balanceGlowClass = netBalance >= 0 ? 'balance-positive-glow' : 'balance-negative-glow';

  // Budget spent health coloring
  let healthColor = 'var(--color-income)';
  if (budgetSpentPercent >= 90) {
    healthColor = 'var(--color-expense)';
  } else if (budgetSpentPercent >= 70) {
    healthColor = 'var(--color-warning)';
  }

  return (
    <div className="summary-cards-container">
      {/* Total Balance Card */}
      <div className={`glass-card summary-card ${balanceGlowClass}`}>
        <div className="card-header">
          <span className="card-title">Net Balance / Net Worth</span>
          <div className={`icon-container ${netBalance >= 0 ? 'bg-success-glow' : 'bg-danger-glow'}`}>
            <IndianRupee size={20} className={netBalance >= 0 ? 'text-success' : 'text-danger'} />
          </div>
        </div>
        <div className="card-body">
          <h2 className={`card-value ${balanceColorClass}`}>{formatCurrency(netBalance)}</h2>
          
          {isEditingBalance ? (
            <div className="balance-edit-form animate-fade-in">
              <span className="rupee-prefix">₹</span>
              <input
                type="number"
                className="form-input edit-balance-input"
                value={editBalanceVal}
                onChange={(e) => setEditBalanceVal(e.target.value)}
                placeholder="Starting Cash"
                autoFocus
              />
              <button className="btn btn-secondary btn-icon-only edit-action-btn check-btn" onClick={handleSaveEdit}>
                <Check size={12} className="text-success" />
              </button>
              <button className="btn btn-secondary btn-icon-only edit-action-btn close-btn" onClick={handleCancelEdit}>
                <X size={12} className="text-danger" />
              </button>
            </div>
          ) : (
            <div className="starting-balance-display">
              <span className="card-meta">
                Starting: <strong>{formatCurrency(initialBalance)}</strong>
              </span>
              <button className="inline-edit-balance-btn" onClick={handleStartEdit} title="Modify Starting Cash">
                <Edit3 size={11} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Income Card */}
      <div className="glass-card summary-card income-glow">
        <div className="card-header">
          <span className="card-title">Total Income</span>
          <div className="icon-container bg-success-glow">
            <ArrowUpRight size={20} className="text-success" />
          </div>
        </div>
        <div className="card-body">
          <h2 className="card-value text-success">{formatCurrency(totalIncome)}</h2>
          <p className="card-meta">From {incomeTransactions.length} entries</p>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="glass-card summary-card expense-glow">
        <div className="card-header">
          <span className="card-title">Total Expenses</span>
          <div className="icon-container bg-danger-glow">
            <ArrowDownLeft size={20} className="text-danger" />
          </div>
        </div>
        <div className="card-body">
          <h2 className="card-value text-danger">{formatCurrency(totalExpenses)}</h2>
          <p className="card-meta">From {expenseTransactions.length} entries</p>
        </div>
      </div>

      {/* Budget Health Card */}
      <div className="glass-card summary-card health-glow">
        <div className="card-header">
          <span className="card-title">Budget Health</span>
          <div className="icon-container bg-warning-glow">
            <Activity size={20} className="text-warning" />
          </div>
        </div>
        <div className="card-body budget-health-body">
          <div className="health-details">
            <h2 className="card-value">
              {totalBudgetLimit > 0 ? `${budgetSpentPercent.toFixed(0)}%` : 'N/A'}
            </h2>
            <p className="card-meta">
              {totalBudgetLimit > 0 
                ? `${formatCurrency(totalExpenses)} of ${formatCurrency(totalBudgetLimit)}`
                : 'No budgets set'
              }
            </p>
          </div>
          {totalBudgetLimit > 0 && (
            <div className="gauge-container">
              <svg width="48" height="48" viewBox="0 0 36 36" className="gauge-svg">
                <path
                  className="gauge-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="3.5"
                />
                <path
                  className="gauge-fill"
                  strokeDasharray={`${budgetSpentPercent}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={healthColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .summary-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          width: 100%;
        }

        .summary-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
        }

        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
          pointer-events: none;
        }

        .balance-positive-glow:hover {
          box-shadow: 0 8px 32px var(--color-income-glow);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .balance-negative-glow:hover {
          box-shadow: 0 8px 32px var(--color-expense-glow);
          border-color: rgba(244, 63, 94, 0.3);
        }

        .income-glow:hover {
          box-shadow: 0 8px 32px var(--color-income-glow);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .expense-glow:hover {
          box-shadow: 0 8px 32px var(--color-expense-glow);
          border-color: rgba(244, 63, 94, 0.3);
        }

        .health-glow:hover {
          box-shadow: 0 8px 32px var(--color-warning-glow);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .icon-container {
          width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .card-value {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .card-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .starting-balance-display {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .inline-edit-balance-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.125rem;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .inline-edit-balance-btn:hover {
          color: var(--color-primary);
          background: var(--border-color);
        }

        .balance-edit-form {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          height: 1.75rem;
        }

        .rupee-prefix {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .edit-balance-input {
          width: 90px;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          background: rgba(0, 0, 0, 0.25);
          height: 1.75rem;
        }

        [data-theme="light"] .edit-balance-input {
          background: #ffffff;
        }

        .edit-action-btn {
          width: 1.75rem;
          height: 1.75rem;
          min-width: 1.75rem;
          border-radius: 4px;
        }

        .budget-health-body {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .health-details {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .gauge-container {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gauge-svg {
          transform: rotate(-90deg);
        }

        .gauge-fill {
          transition: stroke-dasharray var(--transition-slow);
        }
      `}</style>
    </div>
  );
}
