import React, { useState } from 'react';
import Gallery from './components/Gallery';
import SimulationHost from './components/SimulationHost';
import { simulations } from './simulations';
import './App.css';

function App() {
  const [currentSimId, setCurrentSimId] = useState(null);

  const activeSimulation = simulations.find(s => s.id === currentSimId);

  return (
    <div className="app-container">
      {!currentSimId ? (
        <Gallery onSelect={setCurrentSimId} />
      ) : (
        <SimulationHost 
          simulation={activeSimulation} 
          onBack={() => setCurrentSimId(null)} 
        />
      )}

      <div className="bg-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
}

export default App;
