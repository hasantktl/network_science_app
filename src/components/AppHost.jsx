import React, { useState, useMemo } from 'react';
import GraphCanvas from './GraphCanvas';
import ControlPanel from './ControlPanel';
import { generateRandomGraph } from '../apps/adamic-adar/logic'; // Standard generator

const AppHost = ({ app, onBack }) => {
  const generator = app.itemGenerator || generateRandomGraph;
  const isCustomPanel = app.customPanel === true;
  
  // Custom panels manage their own graph, use empty initial state
  const [graphData, setGraphData] = useState(() => 
    isCustomPanel ? { nodes: [], links: [] } : generator(10, 0.25)
  );
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [nodeCount, setNodeCount] = useState(10);

  // Default to circular layout for custom panels (like Watts-Strogatz ring topology)
  const [layoutMode, setLayoutMode] = useState(isCustomPanel ? 'circular' : 'force');

  const results = useMemo(() => {
    if (selectedSource && selectedTarget && app.calculator) {
      if (app.id === 'adamic-adar-similarity') {
          const sourceNode = graphData.nodes.find(n => n.id === selectedSource);
          const targetNode = graphData.nodes.find(n => n.id === selectedTarget);
          return app.calculator(sourceNode, targetNode, graphData.nodes);
      }
      return app.calculator(graphData.nodes, graphData.links, selectedSource, selectedTarget);
    }
    return { score: 0, neighbors: [], sharedAttributes: [] };
  }, [graphData, selectedSource, selectedTarget, app]);

  const handleRandomize = () => {
    setGraphData(generator(nodeCount, 0.25));
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const handleReset = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const CalcPanel = app.ActualPanel || app.CalculationPanel;

  return (
    <div className="sim-host">
      <header className="app-header glass-panel">
        <div className="logo-section">
          <button className="btn btn-outline back-btn" onClick={onBack}>← Gallery</button>
          <div className="logo" style={{ marginLeft: '16px' }}>
             <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{app.title.split(' ')[0]}</span>
             <span style={{ color: 'var(--primary)' }}>{app.title.split(' ').slice(1).join(' ')}</span>
          </div>
        </div>
        {!isCustomPanel && (
          <ControlPanel 
            onRandomize={handleRandomize} 
            onReset={handleReset} 
            nodeCount={nodeCount}
            setNodeCount={setNodeCount}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
          />
        )}
      </header>

      <main className="app-main">
        <section className="graph-section glass-panel">
          <GraphCanvas 
            nodes={graphData.nodes} 
            links={graphData.links} 
            selectedSource={selectedSource} 
            selectedTarget={selectedTarget}
            setSource={setSelectedSource}
            setTarget={setSelectedTarget}
            layoutMode={layoutMode}
          />
        </section>
        
        <aside className="details-section">
          <CalcPanel 
            source={selectedSource} 
            target={selectedTarget} 
            results={results}
            nodes={graphData.nodes}
            graphData={graphData}
            setGraphData={setGraphData}
            setLayoutMode={setLayoutMode}
            setSource={setSelectedSource}
            setTarget={setSelectedTarget}
          />
        </aside>
      </main>
    </div>
  );
};

export default AppHost;
