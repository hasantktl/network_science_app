import React from 'react';

const ControlPanel = ({ onRandomize, onReset, nodeCount, setNodeCount, layoutMode, setLayoutMode }) => {
  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Node Count:</label>
        <input 
          type="number" 
          value={nodeCount} 
          onChange={(e) => setNodeCount(Math.max(3, Math.min(20, parseInt(e.target.value) || 3)))}
          style={{ width: '50px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'white', padding: '4px', borderRadius: '4px' }}
        />
      </div>
      <div className="btn-group" style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <button 
          className={`btn ${layoutMode === 'force' ? '' : 'btn-outline'}`} 
          onClick={() => setLayoutMode('force')}
          style={{ borderRadius: 0, fontSize: '0.75rem', padding: '6px 12px' }}
        >
          Force
        </button>
        <button 
          className={`btn ${layoutMode === 'circular' ? '' : 'btn-outline'}`} 
          onClick={() => setLayoutMode('circular')}
          style={{ borderRadius: 0, fontSize: '0.75rem', padding: '6px 12px', color: layoutMode === 'circular' ? 'white' : 'var(--text-dim)' }}
        >
          Circular
        </button>
      </div>
      <button className="btn" onClick={onRandomize}>Randomize Graph</button>
      <button className="btn btn-outline" onClick={onReset} style={{ color: 'white' }}>Clear Selection</button>
    </div>
  );
};

export default ControlPanel;
