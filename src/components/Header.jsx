import React, { useRef } from 'react';
import { Sun, Moon, Download, Upload, PiggyBank } from 'lucide-react';

export default function Header({ theme, toggleTheme, onExportJSON, onExportCSV, onImportData }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (Array.isArray(data.transactions) || Array.isArray(data.budgets)) {
          onImportData(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format. Ensure the file contains transactions and budgets.');
        }
      } catch (err) {
        alert('Error parsing JSON file. Please upload a valid backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <header className="header-container glass-card">
      <div className="header-brand">
        <div className="header-logo-glow">
          <PiggyBank className="header-logo-icon" size={28} />
        </div>
        <div className="header-brand-text">
          <h1>WealthFlow</h1>
          <p className="header-subtitle">Finance Analytics & Budget Tracker</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Import/Export controls */}
        <div className="data-controls">
          <button className="btn btn-secondary btn-sm" onClick={handleImportClick} title="Import Backup JSON">
            <Upload size={16} />
            <span className="btn-label-desktop">Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <div className="export-dropdown-container">
            <button className="btn btn-secondary btn-sm" onClick={onExportJSON} title="Export Backup JSON">
              <Download size={16} />
              <span className="btn-label-desktop">Backup</span>
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onExportCSV} title="Export CSV for Excel">
            <Download size={16} />
            <span className="btn-label-desktop">CSV</span>
          </button>
        </div>

        {/* Theme toggle */}
        <button 
          className="btn btn-secondary btn-icon-only theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} className="theme-icon-sun" /> : <Moon size={18} className="theme-icon-moon" />}
        </button>
      </div>

      <style>{`
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          margin-bottom: 1.5rem;
          border-radius: var(--radius-md);
        }
        
        .header-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-logo-glow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-sm);
          color: white;
          box-shadow: 0 0 16px var(--color-primary-glow);
          animation: float 4s ease-in-out infinite;
        }

        .header-brand-text h1 {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-top: 0.125rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .data-controls {
          display: flex;
          gap: 0.5rem;
        }

        .btn-label-desktop {
          display: inline;
        }

        .theme-toggle-btn {
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .theme-icon-sun {
          color: #fbbf24;
          animation: spin-slow 8s linear infinite;
        }

        .theme-icon-moon {
          color: #6366f1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .header-container {
            flex-direction: column;
            gap: 1.25rem;
            padding: 1.25rem 1.5rem;
            align-items: stretch;
          }
          
          .header-brand {
            justify-content: center;
          }

          .header-actions {
            justify-content: space-between;
          }

          .data-controls {
            flex-grow: 1;
          }

          .data-controls button {
            flex-grow: 1;
          }

          .btn-label-desktop {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
