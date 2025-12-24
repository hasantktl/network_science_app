import React, { useState, useEffect, useMemo } from 'react';
import {
  generateRandomGraph,
  findShortestPath,
  calculateAveragePathLength,
  calculateGraphMetrics
} from './logic';

const AveragePathLengthPanel = ({ 
  source, 
  target, 
  nodes, 
  graphData,
  setGraphData,
  setLayoutMode 
}) => {
  const [nodeCount, setNodeCount] = useState(12);
  const [edgeDensity, setEdgeDensity] = useState(0.25);

  // Auto-generate on first load
  useEffect(() => {
    handleGenerate();
    setLayoutMode?.('force');
  }, []);

  const handleGenerate = () => {
    const newGraph = generateRandomGraph(nodeCount, edgeDensity);
    setGraphData(newGraph);
  };

  // Calculate metrics when graph changes
  const metrics = useMemo(() => {
    if (!graphData?.nodes?.length) return null;
    
    const avgPath = calculateAveragePathLength(graphData.nodes, graphData.links);
    const graphMetrics = calculateGraphMetrics(graphData.nodes, graphData.links);
    
    return { avgPath, graphMetrics };
  }, [graphData]);

  // Calculate path between selected nodes
  const selectedPath = useMemo(() => {
    if (source && target && graphData?.nodes?.length) {
      return findShortestPath(graphData.nodes, graphData.links, source, target);
    }
    return null;
  }, [source, target, graphData]);

  return (
    <div className="calc-panel">
      {/* Network Parameters */}
      <div className="detail-card glass-panel">
        <h4>Network Parameters</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Nodes (N)</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{nodeCount}</span>
            </label>
            <input 
              type="range" 
              min="4" 
              max="25" 
              value={nodeCount} 
              onChange={(e) => setNodeCount(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Edge Density</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{(edgeDensity * 100).toFixed(0)}%</span>
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="0.6" 
              step="0.05"
              value={edgeDensity} 
              onChange={(e) => setEdgeDensity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%' }}>
            Generate New Graph
          </button>
        </div>
      </div>

      {/* Network Metrics */}
      {metrics && (
        <div className="detail-card glass-panel">
          <h4>Network Metrics</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ 
              padding: '12px', 
              background: 'rgba(139, 92, 246, 0.15)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {metrics.avgPath.average === Infinity ? '∞' : metrics.avgPath.average.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Avg Path (L)</div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {metrics.graphMetrics.diameter}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Diameter</div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Path */}
      {source && target && (
        <div className="detail-card glass-panel">
          <h4>Selected Path</h4>
          
          <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
            <strong>{source}</strong> → <strong>{target}</strong>
          </div>
          
          {selectedPath?.distance !== Infinity ? (
            <>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: 'bold', 
                color: '#10b981',
                marginBottom: '8px'
              }}>
                Distance: {selectedPath.distance}
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px',
                alignItems: 'center'
              }}>
                {selectedPath.path.map((nodeId, idx) => (
                  <React.Fragment key={nodeId}>
                    <span style={{ 
                      padding: '2px 8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {nodeId.replace('Node ', '')}
                    </span>
                    {idx < selectedPath.path.length - 1 && (
                      <span style={{ color: '#10b981' }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: '#ef4444' }}>
              No path exists between these nodes
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AveragePathLengthPanel;
