/**
 * Average Path Length (L) Simulation
 * Measures the average shortest path between all node pairs in a network.
 * L ~ log(N) in small-world networks.
 */

/**
 * Generate a random connected graph for demonstration.
 */
export function generateRandomGraph(n = 12, edgeProbability = 0.3) {
  const nodes = [];
  for (let i = 0; i < n; i++) {
    nodes.push({ id: `Node ${i + 1}` });
  }

  const links = [];
  const linkSet = new Set();

  // First, create a spanning tree to ensure connectivity
  for (let i = 1; i < n; i++) {
    const j = Math.floor(Math.random() * i);
    const key = [`Node ${i + 1}`, `Node ${j + 1}`].sort().join('-');
    linkSet.add(key);
    links.push({ source: `Node ${i + 1}`, target: `Node ${j + 1}` });
  }

  // Add additional random edges
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const key = [`Node ${i + 1}`, `Node ${j + 1}`].sort().join('-');
      if (!linkSet.has(key) && Math.random() < edgeProbability) {
        linkSet.add(key);
        links.push({ source: `Node ${i + 1}`, target: `Node ${j + 1}` });
      }
    }
  }

  return { nodes, links };
}

/**
 * Build adjacency map from nodes and links.
 */
export function buildAdjacencyMap(nodes, links) {
  const neighbors = new Map();
  nodes.forEach(n => neighbors.set(n.id, new Set()));
  
  links.forEach(l => {
    const source = typeof l.source === 'object' ? l.source.id : l.source;
    const target = typeof l.target === 'object' ? l.target.id : l.target;
    neighbors.get(source)?.add(target);
    neighbors.get(target)?.add(source);
  });

  return neighbors;
}

/**
 * BFS to find shortest path between two nodes.
 * Returns { distance, path } where path is array of node IDs.
 */
export function findShortestPath(nodes, links, sourceId, targetId) {
  if (sourceId === targetId) {
    return { distance: 0, path: [sourceId] };
  }

  const neighbors = buildAdjacencyMap(nodes, links);
  
  const visited = new Set([sourceId]);
  const queue = [{ node: sourceId, path: [sourceId] }];
  
  while (queue.length > 0) {
    const { node, path } = queue.shift();
    
    for (const neighbor of neighbors.get(node) || []) {
      if (neighbor === targetId) {
        return { distance: path.length, path: [...path, neighbor] };
      }
      
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }
  
  return { distance: Infinity, path: [] }; // No path exists
}

/**
 * Calculate all shortest paths from a source using BFS.
 * Returns Map of nodeId -> { distance, path }
 */
export function findAllShortestPaths(nodes, links, sourceId) {
  const neighbors = buildAdjacencyMap(nodes, links);
  
  const results = new Map();
  results.set(sourceId, { distance: 0, path: [sourceId] });
  
  const queue = [{ node: sourceId, path: [sourceId] }];
  
  while (queue.length > 0) {
    const { node, path } = queue.shift();
    
    for (const neighbor of neighbors.get(node) || []) {
      if (!results.has(neighbor)) {
        const newPath = [...path, neighbor];
        results.set(neighbor, { distance: newPath.length - 1, path: newPath });
        queue.push({ node: neighbor, path: newPath });
      }
    }
  }
  
  return results;
}

/**
 * Calculate average path length for the entire graph.
 */
export function calculateAveragePathLength(nodes, links) {
  if (nodes.length < 2) return { average: 0, pathCount: 0, disconnected: false };
  
  let totalDistance = 0;
  let pathCount = 0;
  let unreachablePairs = 0;
  
  for (let i = 0; i < nodes.length; i++) {
    const allPaths = findAllShortestPaths(nodes, links, nodes[i].id);
    
    for (let j = i + 1; j < nodes.length; j++) {
      const pathInfo = allPaths.get(nodes[j].id);
      if (pathInfo && pathInfo.distance !== Infinity) {
        totalDistance += pathInfo.distance;
        pathCount++;
      } else {
        unreachablePairs++;
      }
    }
  }
  
  return {
    average: pathCount > 0 ? totalDistance / pathCount : Infinity,
    pathCount,
    unreachablePairs,
    disconnected: unreachablePairs > 0,
    totalPossiblePairs: (nodes.length * (nodes.length - 1)) / 2
  };
}

/**
 * Get path length distribution (histogram data).
 */
export function getPathLengthDistribution(nodes, links) {
  const distribution = new Map();
  
  for (let i = 0; i < nodes.length; i++) {
    const allPaths = findAllShortestPaths(nodes, links, nodes[i].id);
    
    for (let j = i + 1; j < nodes.length; j++) {
      const pathInfo = allPaths.get(nodes[j].id);
      if (pathInfo && pathInfo.distance !== Infinity) {
        const dist = pathInfo.distance;
        distribution.set(dist, (distribution.get(dist) || 0) + 1);
      }
    }
  }
  
  // Convert to array sorted by path length
  const result = [];
  const maxDist = Math.max(...distribution.keys());
  for (let d = 1; d <= maxDist; d++) {
    result.push({ length: d, count: distribution.get(d) || 0 });
  }
  
  return result;
}

/**
 * Calculate eccentricity, radius, and diameter.
 */
export function calculateGraphMetrics(nodes, links) {
  const eccentricities = new Map();
  
  nodes.forEach(node => {
    const allPaths = findAllShortestPaths(nodes, links, node.id);
    let maxDist = 0;
    
    allPaths.forEach((info, id) => {
      if (id !== node.id && info.distance !== Infinity) {
        maxDist = Math.max(maxDist, info.distance);
      }
    });
    
    eccentricities.set(node.id, maxDist);
  });
  
  const eccentricityValues = Array.from(eccentricities.values());
  const radius = Math.min(...eccentricityValues);
  const diameter = Math.max(...eccentricityValues);
  
  // Find central nodes (eccentricity = radius)
  const centralNodes = nodes.filter(n => eccentricities.get(n.id) === radius).map(n => n.id);
  
  // Find peripheral nodes (eccentricity = diameter)
  const peripheralNodes = nodes.filter(n => eccentricities.get(n.id) === diameter).map(n => n.id);
  
  return {
    eccentricities,
    radius,
    diameter,
    centralNodes,
    peripheralNodes
  };
}
