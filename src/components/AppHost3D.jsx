import React from 'react';

const AppHost3D = ({ app, onBack }) => {
  const CalcPanel = app.ActualPanel || app.CalculationPanel;

  return (
    <div className="sim-host">
      <header className="app-header glass-panel">
        <div className="logo-section">
          <button className="btn btn-outline back-btn" onClick={onBack}>← Gallery</button>
          <div className="logo" style={{ marginLeft: '16px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
              {app.title.split(' ')[0]}
            </span>
            <span style={{ color: 'var(--primary)' }}>
              {app.title.split(' ').slice(1).join(' ')}
            </span>
          </div>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex',
        padding: '0',
        minHeight: 0,
        zIndex: 10
      }}>
        <section className="glass-panel" style={{ 
          flex: 1, 
          overflow: 'hidden',
          padding: '20px'
        }}>
          <CalcPanel />
        </section>
      </main>
    </div>
  );
};

export default AppHost3D;
