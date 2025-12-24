import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

const CalculationPanel = ({ source, target, results }) => {
  if (!source || !target) {
    return (
      <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>Select two nodes to calculate the Adamic-Adar Index</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Adamic-Adar Calculation</h3>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
          Predicting link between <strong>{source}</strong> and <strong>{target}</strong>
        </p>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.1rem' }}>
          Score: <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{results.score}</span>
        </div>
      </div>

      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
        Common Neighbors <InlineMath math={`N(${source}) \\cap N(${target})`} />
      </h4>

      {results.neighbors.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', fontSize: '0.9rem' }}>No common neighbors found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.neighbors.map(n => (
            <li key={n.id} style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500' }}>{n.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Degree |N(u)| = {n.degree}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <InlineMath math={`\\frac{1}{\\log_{10}(${n.degree})}`} />
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ {n.contribution.toFixed(4)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
        <strong>Formula:</strong>
        <BlockMath math={"A(x,y) = \\sum_{u \\in N(x) \\cap N(y)} \\frac{1}{\\log(|N(u)|)}"} />
      </div>
    </div>
  );
};

export default CalculationPanel;
