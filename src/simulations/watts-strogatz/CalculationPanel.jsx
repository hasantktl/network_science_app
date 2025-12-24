import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { InlineMath, BlockMath } from 'react-katex';
import { generateWattsStrogatzGraph, calculateMetrics } from './logic';

const CalculationPanel = ({ graphData, setGraphData, setLayoutMode }) => {
  const [nodeCount, setNodeCount] = useState(20);
  const [neighborCount, setNeighborCount] = useState(4);
  const [rewiringProb, setRewiringProb] = useState(0);
  const [rewiredCount, setRewiredCount] = useState(0);
  const [totalEdges, setTotalEdges] = useState(0);
  const [showChartModal, setShowChartModal] = useState(false);

  // Set circular layout on mount
  useEffect(() => {
    if (setLayoutMode) setLayoutMode('circular');
  }, [setLayoutMode]);

  // Generate graph when parameters change
  useEffect(() => {
    const result = generateWattsStrogatzGraph(nodeCount, neighborCount, rewiringProb);
    setGraphData({ nodes: result.nodes, links: result.links });
    setRewiredCount(result.rewiredCount);
    setTotalEdges(result.totalEdges);
  }, [nodeCount, neighborCount, rewiringProb, setGraphData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!graphData || !graphData.nodes) return null;
    return calculateMetrics(graphData.nodes, graphData.links, rewiringProb, rewiredCount, totalEdges);
  }, [graphData, rewiringProb, rewiredCount, totalEdges]);

  const handleRegenerate = () => {
    const result = generateWattsStrogatzGraph(nodeCount, neighborCount, rewiringProb);
    setGraphData({ nodes: result.nodes, links: result.links });
    setRewiredCount(result.rewiredCount);
    setTotalEdges(result.totalEdges);
  };

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
    marginBottom: '8px',
  };

  const getRegimeColor = (regime) => {
    switch (regime) {
      case 'Regular Lattice': return '#22d3ee';
      case 'Small World': return '#22c55e';
      case 'Random Graph': return '#f59e0b';
      default: return 'var(--text)';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ marginTop: 0, color: 'var(--accent)', marginBottom: '16px' }}>
        Watts-Strogatz Model
      </h3>

      {/* Regime Indicator */}
      {metrics && (
        <div style={{
          ...metricCardStyle,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${getRegimeColor(metrics.regime)}22, transparent)`,
          border: `1px solid ${getRegimeColor(metrics.regime)}44`,
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
            Network Regime
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getRegimeColor(metrics.regime) }}>
            {metrics.regime}
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Parameters
        </h4>

        {/* Rewiring Probability Slider - Logarithmic scale */}
        <div style={{ marginBottom: '20px' }}>
          <div style={labelStyle}>
            <span>Rewiring Probability (p)</span>
            <span style={valueStyle}>{rewiringProb < 0.001 ? rewiringProb.toExponential(1) : rewiringProb.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={rewiringProb === 0 ? 0 : Math.log10(rewiringProb) * 25 + 100}
            onChange={(e) => {
              const sliderVal = parseFloat(e.target.value);
              // Map 0-100 linear to 0.0001-1 logarithmic (with 0 = exactly 0)
              if (sliderVal === 0) {
                setRewiringProb(0);
              } else {
                const p = Math.pow(10, (sliderVal - 100) / 25);
                setRewiringProb(Math.min(1, Math.max(0.0001, p)));
              }
            }}
            style={sliderStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            <span>0</span>
            <span>0.001</span>
            <span>0.01</span>
            <span>0.1</span>
            <span>1</span>
          </div>
        </div>

        {/* Node Count Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={labelStyle}>
            <span>Nodes (N)</span>
            <span style={valueStyle}>{nodeCount}</span>
          </div>
          <input
            type="range"
            min="6"
            max="500"
            step="1"
            value={nodeCount}
            onChange={(e) => setNodeCount(parseInt(e.target.value))}
            style={sliderStyle}
          />
        </div>

        {/* Neighbor Count Slider */}
        <div style={{ marginBottom: '16px' }}>
          <div style={labelStyle}>
            <span>Neighbors (K)</span>
            <span style={valueStyle}>{neighborCount}</span>
          </div>
          <input
            type="range"
            min="2"
            max="8"
            step="2"
            value={neighborCount}
            onChange={(e) => setNeighborCount(parseInt(e.target.value))}
            style={sliderStyle}
          />
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
            K must be even (connects to K/2 neighbors on each side)
          </div>
        </div>

        <button
          onClick={handleRegenerate}
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
          🔄 Regenerate Graph
        </button>
      </div>

      {/* Metrics Section */}
      {metrics && (
        <div>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
            Network Metrics
          </h4>

          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Clustering Coefficient</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                {metrics.clusteringCoefficient.toFixed(4)}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              <InlineMath math="C = \frac{\text{triangles}}{\text{possible triangles}}" />
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Avg Path Length</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                {metrics.averagePathLength === Infinity ? '∞' : metrics.averagePathLength.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Average shortest path between all node pairs
            </div>
          </div>

          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>Rewired Edges</span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.1rem' }}>
                {metrics.rewiredEdges} / {metrics.totalEdges}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Phase Transition Chart */}
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          Phase Transition
        </h4>
        <div 
          onClick={() => setShowChartModal(true)} 
          style={{ cursor: 'pointer' }}
          title="Click to enlarge"
        >
          <PhaseTransitionChart currentP={rewiringProb} />
        </div>
      </div>

      {/* Chart Modal - rendered at body level via portal */}
      {showChartModal && createPortal(
        <div 
          onClick={() => setShowChartModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--glass-bg, #1e293b)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)' }}>Phase Transition</h3>
              <button 
                onClick={() => setShowChartModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
            <PhaseTransitionChart currentP={rewiringProb} large={true} />
          </div>
        </div>,
        document.body
      )}

      {/* Info Section */}
      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Small-World Phenomenon</div>
        <p style={{ margin: 0, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          With just a few random "shortcuts" (p ≈ 0.1), the network maintains high clustering 
          while dramatically reducing average path length — the hallmark of small-world networks.
        </p>
      </div>
    </div>
  );
};

// Phase Transition Chart Component
const PhaseTransitionChart = ({ currentP, large = false }) => {
  const scale = large ? 2 : 1;
  const width = 280 * scale;
  const height = 180 * scale;
  const margin = { top: 20 * scale, right: 15 * scale, bottom: 35 * scale, left: 40 * scale };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const fontSize = large ? 12 : 8;
  const strokeWidth = large ? 3.5 : 2.5;

  // Generate theoretical curves for L/L₀ and C/C₀
  // These are approximations of the Watts-Strogatz phase transition
  const generateCurvePoints = () => {
    const points = [];
    // Use logarithmic sampling
    for (let i = -4; i <= 0; i += 0.1) {
      const p = Math.pow(10, i);
      // C/C₀ ≈ (1 - p)³ for small-world model (approximation)
      const cNorm = Math.pow(1 - p, 3);
      // L/L₀ drops sharply around p ≈ 0.01 (approximation using sigmoid-like curve)
      const lNorm = 1 / (1 + 10 * Math.pow(p, 0.5));
      points.push({ p, cNorm, lNorm });
    }
    return points;
  };

  const curvePoints = generateCurvePoints();

  // Logarithmic scale for x-axis (p from 0.0001 to 1)
  const logScale = (p) => {
    if (p <= 0.0001) return 0;
    const minLog = -4; // 0.0001
    const maxLog = 0;  // 1
    return ((Math.log10(Math.max(p, 0.0001)) - minLog) / (maxLog - minLog)) * innerWidth;
  };

  // Linear scale for y-axis (0 to 1)
  const yScale = (val) => innerHeight - (val * innerHeight);

  // Generate path for L curve (red/brown)
  const lPath = curvePoints.map((pt, i) => 
    `${i === 0 ? 'M' : 'L'} ${logScale(pt.p)} ${yScale(pt.lNorm)}`
  ).join(' ');

  // Generate path for C curve (teal/dashed)
  const cPath = curvePoints.map((pt, i) => 
    `${i === 0 ? 'M' : 'L'} ${logScale(pt.p)} ${yScale(pt.cNorm)}`
  ).join(' ');

  // Current position
  const currentX = logScale(currentP || 0.0001);

  // Small world region (matches logic: p > 0.01 && p <= 0.5)
  const smallWorldLeft = logScale(0.01);
  const smallWorldRight = logScale(0.5);

  return (
    <svg width={width} height={height} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: large ? '12px' : '8px' }}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* Small World Region Highlight */}
        <rect 
          x={smallWorldLeft} 
          y={0} 
          width={smallWorldRight - smallWorldLeft} 
          height={innerHeight} 
          fill="rgba(34, 197, 94, 0.15)"
        />
        <text 
          x={(smallWorldLeft + smallWorldRight) / 2} 
          y={innerHeight / 2} 
          textAnchor="middle" 
          fill="rgba(34, 197, 94, 0.6)" 
          fontSize={fontSize * 1.1}
          transform={`rotate(-90, ${(smallWorldLeft + smallWorldRight) / 2}, ${innerHeight / 2})`}
        >
          Small World
        </text>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(val => (
          <line 
            key={val}
            x1={0} 
            y1={yScale(val)} 
            x2={innerWidth} 
            y2={yScale(val)} 
            stroke="rgba(255,255,255,0.1)" 
            strokeDasharray="2,2"
          />
        ))}

        {/* L/L₀ curve (red/brown - solid) */}
        <path d={lPath} fill="none" stroke="#c0392b" strokeWidth={strokeWidth} />
        
        {/* C/C₀ curve (teal - dashed) */}
        <path d={cPath} fill="none" stroke="#0d9488" strokeWidth={strokeWidth} strokeDasharray={large ? "10,5" : "6,3"} />

        {/* Current position indicator */}
        <line 
          x1={currentX} 
          y1={0} 
          x2={currentX} 
          y2={innerHeight} 
          stroke="#f59e0b" 
          strokeWidth={large ? 3 : 2}
          strokeDasharray={large ? "6,3" : "4,2"}
        />
        <circle cx={currentX} cy={5 * scale} r={4 * scale} fill="#f59e0b" />

        {/* X-axis */}
        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="rgba(255,255,255,0.3)" />
        
        {/* X-axis labels */}
        {[0.0001, 0.001, 0.01, 0.1, 1].map((val, i) => (
          <text 
            key={val}
            x={logScale(val)} 
            y={innerHeight + 12 * scale} 
            textAnchor="middle" 
            fill="rgba(255,255,255,0.6)" 
            fontSize={fontSize}
          >
            {val < 0.01 ? val.toExponential(0) : val}
          </text>
        ))}
        <text 
          x={innerWidth / 2} 
          y={innerHeight + 26 * scale} 
          textAnchor="middle" 
          fill="rgba(255,255,255,0.5)" 
          fontSize={fontSize * 1.1}
        >
          Rewiring Probability (p)
        </text>

        {/* Y-axis */}
        <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="rgba(255,255,255,0.3)" />
        
        {/* Y-axis labels */}
        {[0, 0.5, 1].map(val => (
          <text 
            key={val}
            x={-5 * scale} 
            y={yScale(val) + 3 * scale} 
            textAnchor="end" 
            fill="rgba(255,255,255,0.6)" 
            fontSize={fontSize}
          >
            {val}
          </text>
        ))}

        {/* Legend */}
        <g transform={`translate(${innerWidth - 55 * scale}, 5 * scale)`}>
          <line x1={0} y1={0} x2={15 * scale} y2={0} stroke="#c0392b" strokeWidth={strokeWidth * 0.8} />
          <text x={18 * scale} y={3 * scale} fill="#c0392b" fontSize={fontSize}>L/L₀</text>
          
          <line x1={0} y1={12 * scale} x2={15 * scale} y2={12 * scale} stroke="#0d9488" strokeWidth={strokeWidth * 0.8} strokeDasharray="4,2" />
          <text x={18 * scale} y={15 * scale} fill="#0d9488" fontSize={fontSize}>C/C₀</text>
        </g>
      </g>
    </svg>
  );
};

export default CalculationPanel;
