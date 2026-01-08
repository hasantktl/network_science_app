import React, { useState } from 'react';
import { apps, categories } from '../apps';

const Gallery = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredApps = activeCategory === 'all'
    ? apps
    : apps.filter(app => app.category === activeCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1><span style={{ color: 'var(--accent)' }}>NApps</span></h1>
        <p>Explainer Apps for Concepts, Metrics, and Models of Network Analysis</p>
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="filter-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
      
      <div className="gallery-grid">
        {filteredApps.map(app => (
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

