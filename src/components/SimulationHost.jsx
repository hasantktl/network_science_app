import React, { useState, useMemo } from 'react';
import GraphCanvas from './GraphCanvas';
import ControlPanel from './ControlPanel';
import { generateRandomGraph } from '../simulations/adamic-adar/logic'; // Standard generator

const SimulationHost = ({ simulation, onBack }) => {
  const generator = simulation.itemGenerator || generateRandomGraph;
  const [graphData, setGraphData] = useState(() => generator(10, 0.25));
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [nodeCount, setNodeCount] = useState(10);

  const results = useMemo(() => {
    if (selectedSource && selectedTarget) {
      if (simulation.id === 'adamic-adar-similarity') {
          const sourceNode = graphData.nodes.find(n => n.id === selectedSource);
          const targetNode = graphData.nodes.find(n => n.id === selectedTarget);
          return simulation.calculator(sourceNode, targetNode, graphData.nodes);
      }
      return simulation.calculator(graphData.nodes, graphData.links, selectedSource, selectedTarget);
    }
    return { score: 0, neighbors: [], sharedAttributes: [] };
  }, [graphData, selectedSource, selectedTarget, simulation]);

  const handleRandomize = () => {
    setGraphData(generator(nodeCount, 0.25));
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const handleReset = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const CalcPanel = simulation.ActualPanel || simulation.CalculationPanel;

  return (
    <div className="sim-host">
      <header className="app-header glass-panel">
        <div className="logo-section">
          <button className="btn btn-outline back-btn" onClick={onBack}>← Gallery</button>
          <div className="logo" style={{ marginLeft: '16px' }}>
             <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{simulation.title.split(' ')[0]}</span>
             <span style={{ color: 'var(--primary)' }}>{simulation.title.split(' ').slice(1).join(' ')}</span>
          </div>
        </div>
        <ControlPanel 
          onRandomize={handleRandomize} 
          onReset={handleReset} 
          nodeCount={nodeCount}
          setNodeCount={setNodeCount}
        />
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
          />
        </section>
        
        <aside className="details-section">
          <CalcPanel 
            source={selectedSource} 
            target={selectedTarget} 
            results={results}
            nodes={graphData.nodes}
          />
        </aside>
      </main>
    </div>
  );
};

export default SimulationHost;
