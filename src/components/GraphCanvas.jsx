import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

const GraphCanvas = ({ nodes, links, selectedSource, selectedTarget, setSource, setTarget, layoutMode = 'force' }) => {
  const svgRef = useRef();
  const zoomRef = useRef();
  const gRef = useRef();

  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  }, []);

  const handleFitToArea = useCallback(() => {
    if (svgRef.current && zoomRef.current && gRef.current) {
      const svg = d3.select(svgRef.current);
      const g = gRef.current;
      const container = svg.node().parentElement;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;
      
      const bounds = g.node().getBBox();
      if (bounds.width === 0 || bounds.height === 0) return;
      
      const padding = 50;
      const scale = Math.min(
        (width - padding * 2) / bounds.width,
        (height - padding * 2) / bounds.height,
        2 // Max zoom level
      );
      const translateX = (width - bounds.width * scale) / 2 - bounds.x * scale;
      const translateY = (height - bounds.height * scale) / 2 - bounds.y * scale;
      
      svg.transition().duration(500).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );
    }
  }, []);

  useEffect(() => {
    if (!nodes || !links) return;

    const svg = d3.select(svgRef.current);
    const container = svg.node().parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    svg.selectAll("*").remove();

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    zoomRef.current = zoom;
    svg.call(zoom);

    // Create main group for all graph elements (will be transformed by zoom)
    const g = svg.append("g");
    gRef.current = g;

    // Mapping for quick neighbor lookup
    const neighborMap = new Map();
    nodes.forEach(n => neighborMap.set(n.id, new Set()));
    links.forEach(l => {
      neighborMap.get(typeof l.source === 'object' ? l.source.id : l.source).add(typeof l.target === 'object' ? l.target.id : l.target);
      neighborMap.get(typeof l.target === 'object' ? l.target.id : l.target).add(typeof l.source === 'object' ? l.source.id : l.source);
    });

    // Create simulation
    const simulation = d3.forceSimulation(nodes);

    // For circular layout, pre-calculate positions
    if (layoutMode === 'circular') {
      const radius = Math.min(width, height) * 0.35;
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        node.x = width / 2 + radius * Math.cos(angle);
        node.y = height / 2 + radius * Math.sin(angle);
        node.fx = node.x;
        node.fy = node.y;
      });
    } else {
      // Clear fixed positions for force layout
      nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
    }

    // Create DOM elements FIRST
    const link = g.append("g")
      .attr("class", "links")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const node = nodeGroup
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 15)
      .attr("fill", d => {
        if (d.id === selectedSource) return "#6366f1";
        if (d.id === selectedTarget) return "#22d3ee";
        return "#1e293b";
      })
      .attr("stroke", d => {
        if (d.id === selectedSource || d.id === selectedTarget) return "#f8fafc";
        return "#334155";
      })
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!selectedSource || (selectedSource && selectedTarget)) {
          setSource(d.id);
          setTarget(null);
        } else {
          setTarget(d.id);
        }
      })
      .on("mouseenter", (event, d) => {
        const neighbors = neighborMap.get(d.id);
        
        node.style("opacity", n => (n.id === d.id || neighbors.has(n.id)) ? 1 : 0.15);
        link.style("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.05);
        labels.style("opacity", n => (n.id === d.id || neighbors.has(n.id)) ? 1 : 0.15);
        neighborCounts.style("opacity", n => (n.id === d.id || neighbors.has(n.id)) ? 1 : 0.15);
      })
      .on("mouseleave", () => {
        node.style("opacity", 1);
        link.style("opacity", 1);
        labels.style("opacity", 1);
        neighborCounts.style("opacity", 1);
      })
      .call(drag(simulation));

    node.append("title")
      .text(d => d.id);

    // Neighbor count labels inside the nodes
    const neighborCounts = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => neighborMap.get(d.id).size)
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("fill", "#f8fafc")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 3px rgba(0,0,0,0.9)");

    const labels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", 12)
      .attr("font-weight", "500")
      .attr("fill", "#f8fafc")
      .attr("dx", 18)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)");

    // Function to update element positions
    const padding = 20; // Node radius + margin
    function updatePositions() {
      // Clamp node positions to viewport bounds
      nodes.forEach(d => {
        d.x = Math.max(padding, Math.min(width - padding, d.x));
        d.y = Math.max(padding, Math.min(height - padding, d.y));
      });

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);

      neighborCounts
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    }

    // Apply layout
    if (layoutMode === 'circular') {
      // For circular: positions are already set, just update DOM
      // Need to resolve link source/target references first
      links.forEach(l => {
        if (typeof l.source === 'string') {
          l.source = nodes.find(n => n.id === l.source);
        }
        if (typeof l.target === 'string') {
          l.target = nodes.find(n => n.id === l.target);
        }
      });
      updatePositions();
      simulation.stop();
    } else {
      // Force layout: set up forces and let simulation run
      simulation
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(25));

      simulation.on("tick", updatePositions);
      simulation.alpha(1).restart();
    }

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        // In circular mode, keep nodes fixed
        if (layoutMode !== 'circular') {
          event.subject.fx = null;
          event.subject.fy = null;
        }
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => simulation.stop();
  }, [nodes, links, selectedSource, selectedTarget, setSource, setTarget, layoutMode]);


  const zoomButtonStyle = {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#f8fafc',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
        <h2 style={{ margin: 0, opacity: 0.8 }}>Network Simulation</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>Click a node to select Source (Purple), then another for Target (Cyan)</p>
      </div>
      
      {/* Zoom Controls */}
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        <button 
          onClick={handleZoomIn} 
          style={zoomButtonStyle}
          title="Zoom In"
          onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.9)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(30, 41, 59, 0.9)'}
        >
          +
        </button>
        <button 
          onClick={handleZoomOut} 
          style={zoomButtonStyle}
          title="Zoom Out"
          onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.9)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(30, 41, 59, 0.9)'}
        >
          −
        </button>
        <button 
          onClick={handleFitToArea} 
          style={zoomButtonStyle}
          title="Fit to Area"
          onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.9)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(30, 41, 59, 0.9)'}
        >
          ⊡
        </button>
      </div>
    </div>
  );
};

export default GraphCanvas;
