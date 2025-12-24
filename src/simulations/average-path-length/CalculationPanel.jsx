import React, { useState, useEffect, useMemo } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
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
  setLayoutMode,
  setSource,
  setTarget
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
    // Clear selection when generating new graph
    setSource?.(null);
    setTarget?.(null);
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

  // Highlight path edges in graph when path is found
  useEffect(() => {
    if (selectedPath?.path?.length > 1 && graphData?.links) {
      const pathEdges = [];
      for (let i = 0; i < selectedPath.path.length - 1; i++) {
        pathEdges.push({
          source: selectedPath.path[i],
          target: selectedPath.path[i + 1]
        });
      }
      
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
    }
  }, [selectedPath]);

  const sliderStyle = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  };

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '0.85rem',
  };

  const valueStyle = {
    background: 'rgba(99, 102, 241, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    color: 'var(--accent)',
  };

  const metricCardStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '12px',
    borderRadius: '8px',
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', marginBottom: '16px' }}>
        Average Path Length
      </h3>

      {/* Formula Info Box */}
      <div style={{ 
        padding: '12px', 
        background: 'rgba(99, 102, 241, 0.1)', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
          Formula
        </div>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <BlockMath math="L = \frac{1}{n(n-1)} \sum_{i \neq j} d(i,j)" />
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          where <InlineMath math="d(i,j)" /> is the shortest path between nodes <InlineMath math="i" /> and <InlineMath math="j" />, 
          and <InlineMath math="n" /> is the number of nodes.
        </div>
      </div>

      {/* Network Parameters */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Network Parameters
        </h4>

        {/* Node Count Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={labelStyle}>
            <span>Nodes (N)</span>
            <span style={valueStyle}>{nodeCount}</span>
          </div>
          <input
            type="range"
            min="4"
            max="25"
            step="1"
            value={nodeCount}
            onChange={(e) => setNodeCount(parseInt(e.target.value))}
            style={sliderStyle}
          />
        </div>

        {/* Edge Density Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={labelStyle}>
            <span>Edge Density</span>
            <span style={valueStyle}>{(edgeDensity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.6"
            step="0.05"
            value={edgeDensity}
            onChange={(e) => setEdgeDensity(parseFloat(e.target.value))}
            style={sliderStyle}
          />
        </div>

        <button
          onClick={handleGenerate}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Generate New Graph
        </button>
      </div>

      {/* Network Metrics */}
      {metrics && (
        <div>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            Network Metrics
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={metricCardStyle}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center' }}>
                {metrics.avgPath.average === Infinity ? '∞' : metrics.avgPath.average.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
                Avg Path (L)
              </div>
            </div>
            
            <div style={metricCardStyle}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent)', textAlign: 'center' }}>
                {metrics.graphMetrics.diameter}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '4px' }}>
                Diameter
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Path */}
      {source && target && (
        <div>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            Selected Path
          </h4>

          <div style={metricCardStyle}>
            <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
              <strong>{source}</strong> → <strong>{target}</strong>
            </div>
            
            {selectedPath?.distance !== Infinity ? (
              <>
                <div style={{ 
                  fontSize: '1.2rem', 
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
                        background: 'rgba(99, 102, 241, 0.2)',
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
        </div>
      )}
    </div>
  );
};

export default AveragePathLengthPanel;
