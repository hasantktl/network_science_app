import React, { useState, useEffect, useMemo } from 'react';
import {
  generateRandomGraph,
  findShortestPath,
  calculateAveragePathLength,
  getPathLengthDistribution,
  calculateGraphMetrics,
  buildAdjacencyMap
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
  const [highlightPath, setHighlightPath] = useState([]);
  const [highlightedPair, setHighlightedPair] = useState(null);

  // Auto-generate on first load
  useEffect(() => {
    handleGenerate();
    setLayoutMode?.('force');
  }, []);

  const handleGenerate = () => {
    const newGraph = generateRandomGraph(nodeCount, edgeDensity);
    setGraphData(newGraph);
    setHighlightPath([]);
    setHighlightedPair(null);
  };

  // Calculate metrics when graph changes
  const metrics = useMemo(() => {
    if (!graphData?.nodes?.length) return null;
    
    const avgPath = calculateAveragePathLength(graphData.nodes, graphData.links);
    const distribution = getPathLengthDistribution(graphData.nodes, graphData.links);
    const graphMetrics = calculateGraphMetrics(graphData.nodes, graphData.links);
    
    return { avgPath, distribution, graphMetrics };
  }, [graphData]);

  // Calculate path between selected nodes
  const selectedPath = useMemo(() => {
    if (source && target && graphData?.nodes?.length) {
      return findShortestPath(graphData.nodes, graphData.links, source, target);
    }
    return null;
  }, [source, target, graphData]);

  // Highlight path edges in graph when path is found
  useEffect(() => {
    if (selectedPath?.path?.length > 1) {
      // Create highlighted links
      const pathEdges = [];
      for (let i = 0; i < selectedPath.path.length - 1; i++) {
        pathEdges.push({
          source: selectedPath.path[i],
          target: selectedPath.path[i + 1]
        });
      }
      
      // Update graph with highlighted edges
      const updatedLinks = graphData.links.map(link => {
        const linkSource = typeof link.source === 'object' ? link.source.id : link.source;
        const linkTarget = typeof link.target === 'object' ? link.target.id : link.target;
        
        const isOnPath = pathEdges.some(pe => 
          (pe.source === linkSource && pe.target === linkTarget) ||
          (pe.source === linkTarget && pe.target === linkSource)
        );
        
        return { ...link, highlighted: isOnPath };
      });
      
      setGraphData({ ...graphData, links: updatedLinks });
      setHighlightPath(selectedPath.path);
    }
  }, [selectedPath]);

  const maxCount = metrics?.distribution?.length > 0 
    ? Math.max(...metrics.distribution.map(d => d.count)) 
    : 1;

  return (
    <div className="calc-panel" style={{ gap: '16px' }}>
      {/* Title Section */}
      <div className="detail-card glass-panel" style={{ 
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <h3 style={{ 
          margin: 0, 
          background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.3rem'
        }}>
          📏 Average Path Length (L)
        </h3>
        <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
          Measures global network efficiency - how fast information spreads
        </p>
      </div>

      {/* Controls */}
      <div className="detail-card glass-panel">
        <h4 style={{ margin: '0 0 12px', color: 'var(--accent)' }}>⚙️ Network Parameters</h4>
        
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
            🔄 Generate New Graph
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      {metrics && (
        <div className="detail-card glass-panel" style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))'
        }}>
          <h4 style={{ margin: '0 0 12px', color: 'var(--accent)' }}>📊 Network Metrics</h4>
          
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
            
            <div style={{ 
              padding: '12px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#10b981' }}>
                {metrics.graphMetrics.radius}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Radius</div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {metrics.avgPath.pathCount}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Path Pairs</div>
            </div>
          </div>
          
          {/* Small World Indicator */}
          <div style={{ 
            marginTop: '12px',
            padding: '8px 12px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🌐</span>
            <span>In small-world networks: <strong style={{ color: '#8b5cf6' }}>L ~ log(N)</strong></span>
            <span style={{ marginLeft: 'auto', color: '#8b5cf6' }}>
              log({graphData.nodes.length}) ≈ {Math.log(graphData.nodes.length).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Path Distribution Histogram */}
      {metrics?.distribution?.length > 0 && (
        <div className="detail-card glass-panel">
          <h4 style={{ margin: '0 0 12px', color: 'var(--accent)' }}>📈 Path Length Distribution</h4>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
            {metrics.distribution.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div 
                  style={{ 
                    width: '100%',
                    height: `${(item.count / maxCount) * 60}px`,
                    background: `linear-gradient(180deg, #8b5cf6, #3b82f6)`,
                    borderRadius: '4px 4px 0 0',
                    minHeight: item.count > 0 ? '4px' : '0',
                    transition: 'height 0.3s ease'
                  }}
                />
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {metrics.distribution.map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  fontSize: '0.7rem',
                  opacity: 0.7
                }}
              >
                {item.length}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>
            Path Length →
          </div>
        </div>
      )}

      {/* Selected Path Info */}
      {source && target && (
        <div className="detail-card glass-panel" style={{
          border: selectedPath?.distance !== Infinity 
            ? '1px solid rgba(16, 185, 129, 0.5)' 
            : '1px solid rgba(239, 68, 68, 0.5)',
          background: selectedPath?.distance !== Infinity 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 8px', color: 'var(--accent)' }}>🛤️ Selected Path</h4>
          
          <div style={{ fontSize: '0.9rem' }}>
            <strong>{source}</strong> → <strong>{target}</strong>
          </div>
          
          {selectedPath?.distance !== Infinity ? (
            <>
              <div style={{ 
                fontSize: '1.4rem', 
                fontWeight: 'bold', 
                color: '#10b981',
                margin: '8px 0'
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
            <div style={{ color: '#ef4444', marginTop: '8px' }}>
              ⚠️ No path exists between these nodes
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!source && !target && (
        <div className="detail-card glass-panel" style={{ 
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px dashed rgba(59, 130, 246, 0.3)'
        }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem' }}>
            💡 <strong>Click two nodes</strong> to see the shortest path between them highlighted on the graph.
          </p>
        </div>
      )}

      {/* Theory Card */}
      <div className="detail-card glass-panel" style={{ opacity: 0.9 }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--accent)' }}>📖 About Average Path Length</h4>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', lineHeight: 1.6 }}>
          <li><strong>Definition:</strong> Mean shortest path between all node pairs</li>
          <li><strong>Diameter:</strong> Maximum shortest path (graph's width)</li>
          <li><strong>Radius:</strong> Minimum eccentricity (center tightness)</li>
          <li><strong>Small World:</strong> L grows as log(N), not linearly</li>
        </ul>
      </div>
    </div>
  );
};

export default AveragePathLengthPanel;
