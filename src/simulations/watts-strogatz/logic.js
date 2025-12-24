/**
 * Watts-Strogatz Small-World Network Model
 * Generates networks that interpolate between regular lattices and random graphs.
 */

/**
 * Generates a Watts-Strogatz small-world graph.
 * @param {number} n - Number of nodes (default 20)
 * @param {number} k - Each node connects to k nearest neighbors (default 3, must be even for symmetry)
 * @param {number} p - Rewiring probability (0 = regular lattice, 1 = random)
 * @returns {Object} { nodes, links, rewiredCount }
 */
export function generateWattsStrogatzGraph(n = 20, k = 3, p = 0) {
  // Ensure k is even for symmetric ring lattice
  const halfK = Math.floor(k / 2);
  const actualK = halfK * 2;
  
  // Create nodes
  const nodes = [];
  for (let i = 0; i < n; i++) {
    nodes.push({ id: `Node ${i + 1}` });
  }

  // Create regular ring lattice: each node connected to k/2 neighbors on each side
  const links = [];
  const linkSet = new Set(); // Track existing links to avoid duplicates
  
  const addLink = (i, j) => {
    const source = nodes[i].id;
    const target = nodes[j].id;
    const key = [source, target].sort().join('-');
    if (!linkSet.has(key) && i !== j) {
      linkSet.add(key);
      links.push({ source, target, rewired: false });
      return true;
    }
    return false;
  };

  // Build initial ring lattice
  for (let i = 0; i < n; i++) {
    for (let offset = 1; offset <= halfK; offset++) {
      const j = (i + offset) % n;
      addLink(i, j);
    }
  }

  // Rewiring process
  let rewiredCount = 0;
  for (let linkIdx = 0; linkIdx < links.length; linkIdx++) {
    if (Math.random() < p) {
      const link = links[linkIdx];
      const sourceIdx = parseInt(link.source.split(' ')[1]) - 1;
      
      // Find a new target that's not already connected and not self
      let attempts = 0;
      while (attempts < n * 2) {
        const newTargetIdx = Math.floor(Math.random() * n);
        const newTarget = nodes[newTargetIdx].id;
        const newKey = [link.source, newTarget].sort().join('-');
        
        if (newTargetIdx !== sourceIdx && !linkSet.has(newKey)) {
          // Remove old link from set
          const oldKey = [link.source, link.target].sort().join('-');
          linkSet.delete(oldKey);
          
          // Update link
          link.target = newTarget;
          link.rewired = true;
          linkSet.add(newKey);
          rewiredCount++;
          break;
        }
        attempts++;
      }
    }
  }

  return { nodes, links, rewiredCount, totalEdges: links.length };
}

/**
 * Calculate the clustering coefficient for each node.
 * C(v) = 2 * T(v) / (k(v) * (k(v) - 1))
 * where T(v) is triangles through v, k(v) is degree of v
 */
export function calculateClusteringCoefficient(nodes, links) {
  // Build adjacency map
  const neighbors = new Map();
  nodes.forEach(n => neighbors.set(n.id, new Set()));
  
  links.forEach(l => {
    const source = typeof l.source === 'object' ? l.source.id : l.source;
    const target = typeof l.target === 'object' ? l.target.id : l.target;
    neighbors.get(source).add(target);
    neighbors.get(target).add(source);
  });

  let totalClustering = 0;
  let validNodes = 0;

  nodes.forEach(node => {
    const nodeNeighbors = Array.from(neighbors.get(node.id));
    const k = nodeNeighbors.length;
    
    if (k < 2) return; // Need at least 2 neighbors for clustering
    
    // Count edges between neighbors (triangles)
    let triangles = 0;
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        if (neighbors.get(nodeNeighbors[i]).has(nodeNeighbors[j])) {
          triangles++;
        }
      }
    }
    
    const possibleTriangles = (k * (k - 1)) / 2;
    const localClustering = triangles / possibleTriangles;
    totalClustering += localClustering;
    validNodes++;
  });

  return validNodes > 0 ? totalClustering / validNodes : 0;
}

/**
 * Calculate average shortest path length using BFS.
 */
export function calculateAveragePathLength(nodes, links) {
  if (nodes.length < 2) return 0;
  
  // Build adjacency map
  const neighbors = new Map();
  nodes.forEach(n => neighbors.set(n.id, new Set()));
  
  links.forEach(l => {
    const source = typeof l.source === 'object' ? l.source.id : l.source;
    const target = typeof l.target === 'object' ? l.target.id : l.target;
    neighbors.get(source).add(target);
    neighbors.get(target).add(source);
  });

  let totalPathLength = 0;
  let pathCount = 0;

  // BFS from each node
  nodes.forEach(startNode => {
    const distances = new Map();
    distances.set(startNode.id, 0);
    const queue = [startNode.id];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentDist = distances.get(current);
      
      neighbors.get(current).forEach(neighbor => {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      });
    }
    
    // Sum distances to all reachable nodes
    distances.forEach((dist, nodeId) => {
      if (nodeId !== startNode.id && dist > 0) {
        totalPathLength += dist;
        pathCount++;
      }
    });
  });

  // Divide by 2 since we count each pair twice
  return pathCount > 0 ? totalPathLength / pathCount : Infinity;
}

/**
 * Calculate comprehensive network metrics.
 */
export function calculateMetrics(nodes, links, p, rewiredCount, totalEdges) {
  const clusteringCoeff = calculateClusteringCoefficient(nodes, links);
  const avgPathLength = calculateAveragePathLength(nodes, links);
  
  // Determine network regime
  let regime = 'Regular Lattice';
  if (p > 0.5) {
    regime = 'Random Graph';
  } else if (p > 0.01) {
    regime = 'Small World';
  }
  
  return {
    clusteringCoefficient: clusteringCoeff,
    averagePathLength: avgPathLength,
    rewiredEdges: rewiredCount,
    totalEdges: totalEdges,
    regime: regime,
    rewiringProbability: p
  };
}
