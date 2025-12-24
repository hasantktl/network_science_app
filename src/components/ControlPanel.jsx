import React from 'react';

const ControlPanel = ({ onRandomize, onReset, nodeCount, setNodeCount }) => {
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
      <button className="btn" onClick={onRandomize}>Randomize Graph</button>
      <button className="btn btn-outline" onClick={onReset} style={{ color: 'white' }}>Clear Selection</button>
    </div>
  );
};

export default ControlPanel;
