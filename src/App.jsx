import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ChartsSection from './components/ChartsSection';
import BudgetTracker from './components/BudgetTracker';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import './App.css';

// Generate dynamic dates based on current month/year for fresh mock data
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

const MOCK_TRANSACTIONS = [
  { id: 1, description: 'Monthly Allowance from Parents', amount: 8000, type: 'income', category: 'Pocket Money', date: `${currentYear}-${currentMonth}-01`, notes: 'Pocket money allowance' },
  { id: 2, description: 'Semester Books & Stationery', amount: 1200, type: 'expense', category: 'Books & Stationery', date: `${currentYear}-${currentMonth}-02`, notes: 'Notebooks, reference books, pens' },
  { id: 3, description: 'College Canteen Lunch', amount: 180, type: 'expense', category: 'Food & Canteen', date: `${currentYear}-${currentMonth}-04`, notes: 'Samosas and biryani' },
  { id: 4, description: 'Spotify Student Premium', amount: 59, type: 'expense', category: 'Bills & Subscriptions', date: `${currentYear}-${currentMonth}-06`, notes: 'Monthly student discount plan' },
  { id: 5, description: 'Tutor Pay (Freelance Maths Class)', amount: 3500, type: 'income', category: 'Part-time Job', date: `${currentYear}-${currentMonth}-10`, notes: 'Taught trigonometry to high schooler' },
  { id: 6, description: 'Zara Denim Jacket (Discount)', amount: 1800, type: 'expense', category: 'Shopping', date: `${currentYear}-${currentMonth}-12`, notes: 'Bought jacket from winter sale' },
  { id: 7, description: 'Local Bus & Auto Fares', amount: 250, type: 'expense', category: 'Travel', date: `${currentYear}-${currentMonth}-14`, notes: 'Weekly local travel' },
  { id: 8, description: 'Marvel Movie with Friends', amount: 450, type: 'expense', category: 'Entertainment', date: `${currentYear}-${currentMonth}-18`, notes: 'PVR IMAX movie ticket + Pepsi' },
  { id: 9, description: 'Photocopying Reference Slides', amount: 65, type: 'expense', category: 'Others', date: `${currentYear}-${currentMonth}-20`, notes: 'Xerox shop printouts' },
  { id: 10, description: 'College Merit Scholarship', amount: 5000, type: 'income', category: 'Scholarship', date: `${currentYear}-${currentMonth}-22`, notes: 'Academic scholarship award' }
];

const MOCK_BUDGETS = [
  { category: 'Food & Canteen', limit: 3000 },
  { category: 'Books & Stationery', limit: 1500 },
  { category: 'Entertainment', limit: 1500 },
  { category: 'Shopping', limit: 2000 },
  { category: 'Travel', limit: 1000 },
  { category: 'Bills & Subscriptions', limit: 500 }
];

export default function App() {
  // --- States ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealthflow_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('wealthflow_budgets');
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wealthflow_theme');
    return saved || 'dark'; // Dark theme first
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('wealthflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('wealthflow_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // --- Handlers ---
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
      // Edit mode
      setTransactions(prev => prev.map(t => t.id === transactionData.id ? transactionData : t));
    } else {
      // Add mode
      setTransactions(prev => [transactionData, ...prev]);
    }
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction entry?')) {
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

  // --- Import / Export Handlers ---
  const handleExportJSON = () => {
    const backupData = {
      transactions,
      budgets
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    let csvContent = 'Date,Description,Type,Category,Amount,Notes\n';
    
    // Sort transactions by date descending for report layout
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
    a.download = `wealthflow_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (importedData) => {
    if (importedData.transactions) {
      setTransactions(importedData.transactions);
    }
    if (importedData.budgets) {
      setBudgets(importedData.budgets);
    }
  };

  return (
    <div className="container animate-fade-in">
      {/* Header section */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
        onImportData={handleImportData}
      />

      {/* Overview stats layout */}
      <SummaryCards transactions={transactions} budgets={budgets} />

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
