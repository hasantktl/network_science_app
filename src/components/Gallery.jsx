import React, { useState } from 'react';
import { simulations, categories } from '../simulations';

const Gallery = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredSimulations = activeCategory === 'all'
    ? simulations
    : simulations.filter(sim => sim.category === activeCategory);

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>Network Analysis <span style={{ color: 'var(--accent)' }}>Simulation Gallery</span></h1>
        <p>Explore different algorithms for network structure and link prediction.</p>
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
        {filteredSimulations.map(sim => (
          <div 
            key={sim.id} 
            className={`gallery-card glass-panel ${sim.placeholder ? 'placeholder' : ''}`}
            onClick={() => !sim.placeholder && onSelect(sim.id)}
          >
            <div className="card-icon">{sim.icon}</div>
            <div className="card-content">
              <h3>{sim.title}</h3>
              <p>{sim.description}</p>
            </div>
            {!sim.placeholder && <button className="btn card-btn">Explore Simulation</button>}
            {sim.placeholder && <span className="coming-soon">Upcoming</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

