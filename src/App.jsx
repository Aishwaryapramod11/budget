import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ChartsSection from './components/ChartsSection';
import BudgetTracker from './components/BudgetTracker';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import { PiggyBank, User, Wallet, ArrowRight, LogOut } from 'lucide-react';
import './App.css';

const DEFAULT_BUDGETS = [
  { category: 'Food & Canteen', limit: 3000 },
  { category: 'Books & Stationery', limit: 1500 },
  { category: 'Entertainment', limit: 1500 },
  { category: 'Shopping', limit: 2000 },
  { category: 'Travel', limit: 1000 },
  { category: 'Bills & Subscriptions', limit: 500 }
];

export default function App() {
  // --- Onboarding / Login States ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wealthflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => {
    const saved = localStorage.getItem('wealthflow_setup_complete');
    return saved === 'true';
  });

  // --- Financial States ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealthflow_transactions');
    return saved ? JSON.parse(saved) : []; // Empty slate for student to add from scratch
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [initialBalance, setInitialBalance] = useState(() => {
    const saved = localStorage.getItem('wealthflow_initial_balance');
    return saved ? parseFloat(saved) : 0;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wealthflow_theme');
    return saved || 'dark';
  });

  // --- Form & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // --- Login & Setup Input States ---
  const [usernameInput, setUsernameInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('wealthflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('wealthflow_initial_balance', initialBalance.toString());
  }, [initialBalance]);

  useEffect(() => {
    localStorage.setItem('wealthflow_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      alert('Please enter a username to proceed.');
      return;
    }
    const newUser = { name: usernameInput.trim() };
    setUser(newUser);
    localStorage.setItem('wealthflow_user', JSON.stringify(newUser));
  };

  const handleCompleteSetup = (e) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balanceInput);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      alert('Please enter a valid starting balance (e.g. 0 or higher).');
      return;
    }
    setTransactions([]); // Clear any old cached mock data to ensure a clean slate
    setInitialBalance(parsedBalance);
    setHasCompletedSetup(true);
    localStorage.setItem('wealthflow_setup_complete', 'true');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? This resets active login state (your logs remain saved locally).')) {
      setUser(null);
      setHasCompletedSetup(false);
      setUsernameInput('');
      setBalanceInput('');
      localStorage.removeItem('wealthflow_user');
      localStorage.removeItem('wealthflow_setup_complete');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('WARNING: This will clear ALL transactions, budgets, starting balance, and user details. Proceed?')) {
      localStorage.clear();
      setUser(null);
      setHasCompletedSetup(false);
      setTransactions([]);
      setBudgets(DEFAULT_BUDGETS);
      setInitialBalance(0);
      setUsernameInput('');
      setBalanceInput('');
      setTheme('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenAddModal = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (transactionData) => {
    if (transactionToEdit) {
      setTransactions(prev => prev.map(t => t.id === transactionData.id ? transactionData : t));
    } else {
      setTransactions(prev => [transactionData, ...prev]);
    }
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSaveBudget = (category, limit) => {
    setBudgets(prev => {
      const exists = prev.some(b => b.category === category);
      if (exists) {
        return prev.map(b => b.category === category ? { ...b, limit } : b);
      } else {
        return [...prev, { category, limit }];
      }
    });
  };

  // --- JSON / CSV Backup utilities ---
  const handleExportJSON = () => {
    const backupData = { transactions, budgets, initialBalance, user };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthflow_student_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csvContent = 'Date,Description,Type,Category,Amount,Notes\n';
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    sorted.forEach(t => {
      const desc = t.description.replace(/"/g, '""');
      const notes = (t.notes || '').replace(/"/g, '""');
      csvContent += `"${t.date}","${desc}","${t.type}","${t.category}",${t.amount},"${notes}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthflow_student_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (importedData) => {
    if (importedData.transactions) setTransactions(importedData.transactions);
    if (importedData.budgets) setBudgets(importedData.budgets);
    if (typeof importedData.initialBalance === 'number') setInitialBalance(importedData.initialBalance);
    if (importedData.user) {
      setUser(importedData.user);
      setHasCompletedSetup(true);
      localStorage.setItem('wealthflow_setup_complete', 'true');
    }
  };

  // ================= RENDER STEPS =================

  // STEP 1: LOGIN VIEW
  if (!user) {
    return (
      <div className="onboarding-container animate-fade-in">
        <div className="onboarding-card glass-card">
          <div className="onboarding-logo-glow">
            <PiggyBank size={48} className="logo-pulse" />
          </div>
          <h1 className="onboarding-title">WealthFlow</h1>
          <p className="onboarding-subtitle">
            Smart budgeting & expense tracking made simple for college students.
          </p>

          <form onSubmit={handleLogin} className="onboarding-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Enter your Student Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  className="form-input onboarding-input"
                  placeholder="e.g. Aishwarya Nair"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  maxLength={25}
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block onboarding-btn">
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP 2: STARTING BALANCE SETUP VIEW
  if (!hasCompletedSetup) {
    return (
      <div className="onboarding-container animate-fade-in">
        <div className="onboarding-card glass-card">
          <div className="onboarding-logo-glow">
            <Wallet size={48} className="logo-pulse" />
          </div>
          <h2 className="onboarding-title font-small">Setup your Wallet</h2>
          <p className="onboarding-subtitle">
            Hey <strong>{user.name}</strong>! Let's set up your starting balance/net worth. How much money do you currently have?
          </p>

          <form onSubmit={handleCompleteSetup} className="onboarding-form">
            <div className="form-group">
              <label className="form-label" htmlFor="balance">Starting Balance (Rupees)</label>
              <div className="input-with-icon">
                <span className="rupee-text-prefix">₹</span>
                <input
                  type="number"
                  id="balance"
                  className="form-input onboarding-input padding-left-rupee"
                  placeholder="e.g. 5000"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  min="0"
                  required
                  autoFocus
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block onboarding-btn">
              <span>Create Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: MAIN APP VIEW
  return (
    <div className="container animate-fade-in">
      {/* Header section with personalized name & logout */}
      <div className="dashboard-meta-header">
        <div className="user-greeting">
          <span>Welcome, <strong>{user.name}</strong> 👋</span>
        </div>
        <div className="dashboard-util-buttons">
          <button className="btn btn-secondary btn-sm logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
          <button className="btn btn-danger btn-sm reset-btn" onClick={handleResetAll} title="Reset All Data">
            <span>Reset App</span>
          </button>
        </div>
      </div>

      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
        onImportData={handleImportData}
      />

      {/* Overview stats layout */}
      <SummaryCards
        transactions={transactions}
        budgets={budgets}
        initialBalance={initialBalance}
        onSaveInitialBalance={setInitialBalance}
      />

      {/* Main dashboard grid */}
      <div className="dashboard-grid">
        {/* Left Column: Visual Analytics & Transactions list */}
        <div className="dashboard-col-left">
          <ChartsSection transactions={transactions} budgets={budgets} />
          
          <TransactionList
            transactions={transactions}
            onEditTransaction={handleOpenEditModal}
            onDeleteTransaction={handleDeleteTransaction}
            onAddClick={handleOpenAddModal}
          />
        </div>

        {/* Right Column: Budgets progress meters */}
        <div className="dashboard-col-right">
          <BudgetTracker
            transactions={transactions}
            budgets={budgets}
            onSaveBudget={handleSaveBudget}
          />
        </div>
      </div>

      {/* Dialog pop-up for Adding/Editing entries */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />
    </div>
  );
}
