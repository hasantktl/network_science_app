import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

const AttributeCalculationPanel = ({ source, target, results, nodes }) => {
  const sourceNode = nodes?.find(n => n.id === source);
  const targetNode = nodes?.find(n => n.id === target);

  if (!source || !target) {
    return (
      <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-dim)' }}>Select two nodes to calculate Attribute-based Similarity</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>Adamic-Adar Similarity</h3>
      <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '16px' }}>Based on Adamic & Adar's 2003 model for shared user attributes.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.2rem' }}>
          <InlineMath math={`Sim(S, T): ${results.score}`} />
        </div>
      </div>

      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
        Shared Attributes
      </h4>

      {results.sharedAttributes.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', fontSize: '0.9rem' }}>No shared attributes found across categories.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.sharedAttributes.map(attr => (
            <li key={attr.name} style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{attr.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Global Freq: {attr.frequency} nodes</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <InlineMath math={`\\frac{1}{\\log_{10}(${attr.frequency})}`} />
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>+ {attr.contribution.toFixed(4)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '0' }}>
          Node Profiles
        </h4>
        
        {[ { id: source, node: sourceNode, label: 'Source (S)', color: 'var(--primary)' }, 
           { id: target, node: targetNode, label: 'Target (T)', color: 'var(--accent)' } 
         ].map(item => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: item.color, marginBottom: '8px' }}>
              {item.label}: {item.id}
            </div>
            {item.node && Object.keys(item.node.attributes).map(cat => (
              <div key={cat} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{cat}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {item.node.attributes[cat].map(val => (
                    <span key={val} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${item.color}33`, borderRadius: '4px' }}>
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
        <strong>Theory (2003 Paper):</strong>
        <BlockMath math={"A(i, j) = \\sum_{a \\in \\text{Attr}(i) \\cap \\text{Attr}(j)} \\frac{1}{\\log(\\text{Freq}(a))}"} />
        <p style={{ marginTop: '8px', marginBottom: 0 }}>Rare shared attributes provide a stronger similarity signal than common ones.</p>
      </div>
    </div>
  );
};

export default AttributeCalculationPanel;
