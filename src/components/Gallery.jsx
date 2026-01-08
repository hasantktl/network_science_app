import React from 'react';
import { apps } from '../apps';

const Gallery = ({ onSelect }) => {
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1><span style={{ color: 'var(--accent)' }}>NApps</span></h1>
        <p>Explainer Apps for Concepts, Metrics, and Models of Network Analysis</p>
      </div>
      
      <div className="gallery-grid">
        {apps.map(app => (
          <div 
            key={app.id} 
            className={`gallery-card glass-panel ${app.placeholder ? 'placeholder' : ''}`}
            onClick={() => !app.placeholder && onSelect(app.id)}
          >
            <div className="card-icon">{app.icon}</div>
            <div className="card-content">
              <h3>{app.title}</h3>
              <p>{app.description}</p>
            </div>
            {!app.placeholder && <button className="btn card-btn">Explore App</button>}
            {app.placeholder && <span className="coming-soon">Upcoming</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;


