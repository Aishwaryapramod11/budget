import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save } from 'lucide-react';

const TRANSACTION_CATEGORIES = [
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

export default function TransactionForm({ isOpen, onClose, onSave, transactionToEdit = null }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // Synchronize form values when transactionToEdit changes
  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description || '');
      setAmount(transactionToEdit.amount || '');
      setType(transactionToEdit.type || 'expense');
      setCategory(transactionToEdit.category || 'Others');
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setNotes(transactionToEdit.notes || '');
    } else {
      // Clear form for new transaction
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Food & Canteen');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [transactionToEdit, isOpen]);

  // Automatically adjust category if type switches
  useEffect(() => {
    if (!transactionToEdit) {
      if (type === 'income') {
        setCategory('Pocket Money');
      } else {
        setCategory('Food & Canteen');
      }
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      alert('Please select a date.');
      return;
    }

    const transactionData = {
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      notes: notes.trim(),
      id: transactionToEdit ? transactionToEdit.id : Date.now()
    };

    onSave(transactionData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card form-modal-card">
        <div className="modal-header">
          <h3 className="modal-title">
            {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button className="btn btn-secondary btn-icon-only close-modal-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Transaction Type Selector (Custom Segmented Control) */}
          <div className="form-group">
            <span className="form-label">Transaction Type</span>
            <div className="type-toggle-control">
              <button
                type="button"
                className={`type-toggle-btn income-btn ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
              <button
                type="button"
                className={`type-toggle-btn expense-btn ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly Groceries"
              required
            />
          </div>

          {/* Amount & Date (Row) */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {TRANSACTION_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add additional details..."
              rows="2"
            />
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {transactionToEdit ? (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Add Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-modal-card {
          max-width: 480px;
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .modal-title {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .close-modal-btn {
          border-radius: 4px;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
        }

        /* Segmented control for Income/Expense */
        .type-toggle-control {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.25rem;
        }

        [data-theme="light"] .type-toggle-control {
          background: rgba(15, 23, 42, 0.05);
        }

        .type-toggle-btn {
          padding: 0.5rem;
          font-weight: 700;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .income-btn.active {
          background-color: var(--color-income);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        .expense-btn.active {
          background-color: var(--color-expense);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
