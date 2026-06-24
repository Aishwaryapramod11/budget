import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Trash2, Edit, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Food & Canteen',
  'Books & Stationery',
  'Entertainment',
  'Shopping',
  'Travel',
  'Bills & Subscriptions',
  'Pocket Money',
  'Scholarship',
  'Part-time Job',
  'Others'
];

const CATEGORY_COLORS = {
  'Food & Canteen': 'var(--color-primary-glow)',
  'Books & Stationery': 'var(--color-secondary-glow)',
  Entertainment: 'rgba(236, 72, 153, 0.1)',
  Shopping: 'var(--color-warning-glow)',
  Travel: 'rgba(249, 115, 22, 0.1)',
  'Bills & Subscriptions': 'rgba(99, 102, 241, 0.1)',
  'Pocket Money': 'rgba(16, 185, 129, 0.15)',
  Scholarship: 'rgba(16, 185, 129, 0.15)',
  'Part-time Job': 'rgba(6, 182, 212, 0.15)',
  Others: 'var(--border-color)'
};

const CATEGORY_TEXT_COLORS = {
  'Food & Canteen': 'var(--color-primary)',
  'Books & Stationery': 'var(--color-secondary)',
  Entertainment: '#ec4899',
  Shopping: 'var(--color-warning)',
  Travel: '#f97316',
  'Bills & Subscriptions': '#6366f1',
  'Pocket Money': 'var(--color-income)',
  Scholarship: 'var(--color-income)',
  'Part-time Job': 'var(--color-secondary)',
  Others: 'var(--text-secondary)'
};

export default function TransactionList({ transactions = [], onEditTransaction, onDeleteTransaction, onAddClick }) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Sort state
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const handleFilterCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // default to descending for new sorting
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' ? true : t.type === filterType;
    const matchesCategory = filterCategory === 'All' ? true : t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'amount') {
      comparison = parseFloat(a.amount) - parseFloat(b.amount);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate transactions
  const totalItems = sortedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="transaction-list-card glass-card animate-slide-up">
      {/* Header */}
      <div className="list-card-header">
        <div className="header-meta">
          <h3 className="section-title">Transactions</h3>
          <p className="section-subtitle">Record and audit your financial logs</p>
        </div>
        <button className="btn btn-primary btn-sm add-entry-btn" onClick={onAddClick}>
          <Plus size={16} />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Filters and Search toolbar */}
      <div className="toolbar-container">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search details or notes..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters Group */}
        <div className="filters-wrapper">
          {/* Type Segmented Buttons */}
          <div className="type-filter-buttons">
            <button
              className={`type-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterTypeChange('all')}
            >
              All
            </button>
            <button
              className={`type-filter-btn ${filterType === 'income' ? 'active' : ''}`}
              onClick={() => handleFilterTypeChange('income')}
            >
              In
            </button>
            <button
              className={`type-filter-btn ${filterType === 'expense' ? 'active' : ''}`}
              onClick={() => handleFilterTypeChange('expense')}
            >
              Out
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="category-filter-wrapper">
            <select
              className="form-select category-filter-select"
              value={filterCategory}
              onChange={handleFilterCategoryChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="table-responsive">
        {currentItems.length === 0 ? (
          <div className="empty-table-state">
            <p>No transactions found matching the filters.</p>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('date')} className="sortable-th">
                  <div className="th-content">
                    Date
                    <ArrowUpDown size={12} className={`sort-icon ${sortBy === 'date' ? 'active' : ''}`} />
                  </div>
                </th>
                <th>Description</th>
                <th>Category</th>
                <th onClick={() => toggleSort('amount')} className="sortable-th text-right">
                  <div className="th-content justify-end">
                    Amount
                    <ArrowUpDown size={12} className={`sort-icon ${sortBy === 'amount' ? 'active' : ''}`} />
                  </div>
                </th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(t => {
                const badgeBg = CATEGORY_COLORS[t.category] || 'var(--border-color)';
                const badgeColor = CATEGORY_TEXT_COLORS[t.category] || 'var(--text-secondary)';

                return (
                  <tr key={t.id} className="transaction-row animate-fade-in">
                    <td className="date-cell">{formatDate(t.date)}</td>
                    <td className="desc-cell">
                      <span className="desc-text">{t.description}</span>
                      {t.notes && <span className="notes-preview" title={t.notes}>{t.notes}</span>}
                    </td>
                    <td>
                      <span 
                        className="badge category-badge" 
                        style={{ backgroundColor: badgeBg, color: badgeColor }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className={`amount-cell text-right ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? `+${formatCurrency(t.amount)}` : `-${formatCurrency(t.amount)}`}
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button 
                          className="btn btn-secondary btn-icon-only list-action-btn edit-btn" 
                          onClick={() => onEditTransaction(t)}
                          title="Edit Entry"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon-only list-action-btn delete-btn" 
                          onClick={() => onDeleteTransaction(t.id)}
                          title="Delete Entry"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="btn btn-secondary btn-icon-only page-btn" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="pagination-text">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button 
            className="btn btn-secondary btn-icon-only page-btn" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <style>{`
        .transaction-list-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .list-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .add-entry-btn {
          height: 2.25rem;
          border-radius: var(--radius-sm);
        }

        /* Toolbar styles */
        .toolbar-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
        }

        @media (min-width: 768px) {
          .toolbar-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .search-wrapper {
          position: relative;
          flex-grow: 1;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .search-wrapper {
            max-width: 320px;
          }
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          padding-left: 2.25rem;
          height: 2.25rem;
          font-size: 0.85rem;
        }

        .filters-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          justify-content: space-between;
        }

        @media (min-width: 768px) {
          .filters-wrapper {
            width: auto;
            justify-content: flex-end;
          }
        }

        .type-filter-buttons {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 2px;
          height: 2.25rem;
          align-items: center;
        }

        [data-theme="light"] .type-filter-buttons {
          background: rgba(15, 23, 42, 0.05);
        }

        .type-filter-btn {
          padding: 0 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          height: calc(100% - 2px);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 4px;
          transition: all var(--transition-fast);
        }

        .type-filter-btn.active {
          background-color: var(--color-primary);
          color: white;
        }

        .category-filter-wrapper {
          height: 2.25rem;
        }

        .category-filter-select {
          padding: 0 2rem 0 0.75rem;
          height: 100%;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Table styles */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }

        .transactions-table th {
          padding: 0.75rem 1rem;
          font-weight: 700;
          color: var(--text-secondary);
          border-bottom: 2px solid var(--border-color);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .sortable-th {
          cursor: pointer;
          user-select: none;
        }

        .sortable-th:hover {
          color: var(--text-primary);
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .justify-end {
          justify-content: flex-end;
        }

        .sort-icon {
          opacity: 0.3;
          transition: opacity var(--transition-fast);
        }

        .sort-icon.active {
          opacity: 1;
          color: var(--color-primary);
        }

        .transactions-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .transaction-row {
          transition: background-color var(--transition-fast);
        }

        .transaction-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        [data-theme="light"] .transaction-row:hover {
          background-color: rgba(15, 23, 42, 0.01);
        }

        .date-cell {
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .desc-cell {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          max-width: 250px;
        }

        .desc-text {
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notes-preview {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
        }

        .category-badge {
          white-space: nowrap;
          font-size: 0.7rem;
        }

        .amount-cell {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .text-right {
          text-align: right;
        }

        .action-buttons-cell {
          display: flex;
          justify-content: center;
          gap: 0.375rem;
        }

        .list-action-btn {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 4px;
        }

        .list-action-btn:hover {
          background-color: var(--border-color-hover);
        }

        .edit-btn:hover {
          color: var(--color-secondary);
        }

        .delete-btn:hover {
          color: var(--color-expense);
        }

        .empty-table-state {
          text-align: center;
          padding: 2.5rem 1rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Pagination styles */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .pagination-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .page-btn {
          width: 2rem;
          height: 2rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
