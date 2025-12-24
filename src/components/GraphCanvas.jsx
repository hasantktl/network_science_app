import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphCanvas = ({ nodes, links, selectedSource, selectedTarget, setSource, setTarget }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!nodes || !links) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node().getBoundingClientRect().width;
    const height = svg.node().getBoundingClientRect().height;

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
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
      .call(drag(simulation));

    node.append("title")
      .text(d => d.id);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.id)
      .attr("font-size", 12)
      .attr("fill", "#f8fafc")
      .attr("dx", 18)
      .attr("dy", 4)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
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
    });

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
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => simulation.stop();
  }, [nodes, links, selectedSource, selectedTarget, setSource, setTarget]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
        <h2 style={{ margin: 0, opacity: 0.8 }}>Network Simulation</h2>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>Click a node to select Source (Purple), then another for Target (Cyan)</p>
      </div>
    </div>
  );
};

export default GraphCanvas;
