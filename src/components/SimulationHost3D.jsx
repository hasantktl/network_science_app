import React from 'react';

const SimulationHost3D = ({ simulation, onBack }) => {
  const CalcPanel = simulation.ActualPanel || simulation.CalculationPanel;

  return (
    <div className="sim-host">
      <header className="app-header glass-panel">
        <div className="logo-section">
          <button className="btn btn-outline back-btn" onClick={onBack}>← Gallery</button>
          <div className="logo" style={{ marginLeft: '16px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
              {simulation.title.split(' ')[0]}
            </span>
            <span style={{ color: 'var(--primary)' }}>
              {simulation.title.split(' ').slice(1).join(' ')}
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

export default SimulationHost3D;
