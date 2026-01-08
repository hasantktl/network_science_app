import React, { useState } from 'react';
import Gallery from './components/Gallery';
import AppHost from './components/AppHost';
import AppHost3D from './components/AppHost3D';
import { apps } from './apps';
import './App.css';

function App() {
  const [currentAppId, setCurrentAppId] = useState(null);

  const activeApp = apps.find(a => a.id === currentAppId);

  return (
    <div className="app-container">
      {!currentAppId ? (
        <Gallery onSelect={setCurrentAppId} />
      ) : activeApp.is3D ? (
        <AppHost3D 
          app={activeApp} 
          onBack={() => setCurrentAppId(null)} 
        />
      ) : (
        <AppHost 
          app={activeApp} 
          onBack={() => setCurrentAppId(null)} 
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
