import React, { useState, useEffect, useRef } from 'react';
import { generateKleinbergGrid, animatedNavigate, getManhattanDistance } from './logic';
import KleinbergCanvas3D from './KleinbergCanvas3D';

const GRID_SIZE = 8;

const CalculationPanel = ({ graphData, setGraphData }) => {
  const [rValue, setRValue] = useState(3);
  const [networkData, setNetworkData] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [remainingDist, setRemainingDist] = useState(0);
  const [status, setStatus] = useState('idle');
  const [resultMessage, setResultMessage] = useState('');
  const isSearchingRef = useRef(false);

  // Generate initial network
  useEffect(() => {
    generateNetwork();
  }, []);

  const generateNetwork = () => {
    isSearchingRef.current = false;
    const network = generateKleinbergGrid(GRID_SIZE, rValue);
    setNetworkData(network);
    resetUIStats(network);
  };

  const resetUIStats = (network) => {
    setNavigationPath([]);
    setStepCount(0);
    const target = { x: GRID_SIZE - 1, y: GRID_SIZE - 1, z: GRID_SIZE - 1 };
    const start = { x: 0, y: 0, z: 0 };
    setRemainingDist(getManhattanDistance(start, target));
    setResultMessage('');
    setStatus('idle');
  };

  const startNavigation = async () => {
    if (!networkData || isSearchingRef.current) return;
    
    resetUIStats(networkData);
    isSearchingRef.current = true;
    setStatus('running');
    setResultMessage('Navigating...');

    const start = networkData.gridNodes[0][0][0];
    const target = networkData.gridNodes[GRID_SIZE - 1][GRID_SIZE - 1][GRID_SIZE - 1];

    await animatedNavigate(start, target, (path, steps, dist, navStatus) => {
      if (!isSearchingRef.current) return;
      
      setNavigationPath([...path]);
      setStepCount(steps);
      setRemainingDist(dist);

      if (navStatus === 'success') {
        setResultMessage('🎯 Target Reached!');
        setStatus('success');
        isSearchingRef.current = false;
      } else if (navStatus === 'stuck') {
        setResultMessage('⚠️ Dead End!');
        setStatus('error');
        isSearchingRef.current = false;
      } else if (navStatus === 'timeout') {
        setResultMessage('⚠️ Path Too Long.');
        setStatus('error');
        isSearchingRef.current = false;
      }
    }, 120);
  };

  const clearPath = () => {
    isSearchingRef.current = false;
    if (networkData) {
      resetUIStats(networkData);
    }
  };

  const sliderStyle = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  };

  const buttonStyle = (variant) => ({
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.85rem',
    ...(variant === 'primary' && {
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      color: 'white',
    }),
    ...(variant === 'success' && {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
    }),
    ...(variant === 'secondary' && {
      background: 'rgba(71, 85, 105, 0.8)',
      color: 'white',
    }),
  });

  const metricCardStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return '#3b82f6';
      case 'success': return '#10b981';
      case 'error': return '#f43f5e';
      default: return 'var(--text-dim)';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
      {/* Left: 3D Canvas */}
      <div style={{ flex: 1, minWidth: 0, minHeight: '500px', height: '100%' }}>
        <KleinbergCanvas3D 
          networkData={networkData}
          navigationPath={navigationPath}
        />
      </div>

      {/* Right: Control Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          width: '320px', 
          padding: '20px', 
          overflowY: 'auto',
          flexShrink: 0
        }}
      >
        <h3 style={{ marginTop: 0, color: 'var(--accent)', marginBottom: '4px' }}>
          Small World 3D
        </h3>
        <p style={{ 
          fontSize: '0.65rem', 
          color: 'var(--text-dim)', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '20px'
        }}>
          Greedy Navigation Simulation
        </p>

        {/* R Value Slider */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.85rem' }}>Clustering Exponent (r)</span>
            <span style={{ 
              background: 'rgba(99, 102, 241, 0.2)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              color: 'var(--accent)',
            }}>
              {rValue.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.1"
            value={rValue}
            onChange={(e) => setRValue(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.65rem', 
            color: 'var(--text-dim)',
            marginTop: '4px'
          }}>
            <span>0 (Wide)</span>
            <span>3 (Optimal)</span>
            <span>6 (Narrow)</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <button 
            onClick={generateNetwork} 
            style={buttonStyle('primary')}
          >
            GENERATE NEW NETWORK
          </button>
          <button 
            onClick={startNavigation} 
            style={buttonStyle('success')}
            disabled={status === 'running'}
          >
            START NAVIGATION
          </button>
          <button 
            onClick={clearPath} 
            style={buttonStyle('secondary')}
          >
            CLEAR PATH
          </button>
        </div>

        {/* Stats */}
        <div style={{ 
          borderTop: '1px solid var(--glass-border)', 
          paddingTop: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={metricCardStyle}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Steps
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {stepCount}
              </div>
            </div>
            <div style={metricCardStyle}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Remaining Distance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {remainingDist}
              </div>
            </div>
          </div>
          {resultMessage && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '12px',
              padding: '8px',
              borderRadius: '8px',
              background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 
                         status === 'error' ? 'rgba(244, 63, 94, 0.1)' : 
                         'rgba(59, 130, 246, 0.1)',
              color: getStatusColor(),
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {resultMessage}
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '12px', 
          borderRadius: '8px',
          fontSize: '0.75rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>
            Connection Guide:
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-dim)' }}>
            <li style={{ marginBottom: '4px' }}>
              <span style={{ color: '#475569' }}>―</span> <strong>Local Links:</strong> Grid lattice edges
            </li>
            <li style={{ marginBottom: '4px' }}>
              <span style={{ color: '#3b82f6' }}>―</span> <strong>Shortcuts:</strong> Long-range connections
            </li>
            <li>
              <span style={{ color: '#ff3333' }}>―</span> <strong>Navigation:</strong> Active path (red)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculationPanel;
