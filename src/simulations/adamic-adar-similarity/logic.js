/**
 * Logic for Attribute-based Adamic-Adar Similarity
 * Based on Adamic & Adar (2003) "Friends and Neighbors on the Web"
 */

const CATEGORIES = {
  Interests: ['Music', 'Sports', 'Cooking', 'Coding', 'Gaming', 'Reading', 'Art', 'Travel'],
  Location: ['New York', 'London', 'Tokyo', 'Vegas', 'Istanbul', 'Paris', 'Berlin', 'Seoul'],
  Language: ['English', 'Spanish', 'Turkish', 'Japanese', 'French', 'German', 'Chinese', 'Russian'],
  Device: ['iPhone', 'Android', 'Windows', 'MacOS', 'Linux', 'iPad', 'ChromeOS', 'XBox']
};

/**
 * Generates nodes with random attributes
 */
export function generateAttributeGraph(nodeCount = 10) {
  const nodes = [];
  const attributesPopulation = [];

  for (let i = 0; i < nodeCount; i++) {
    const nodeAttrs = {};
    Object.keys(CATEGORIES).forEach(cat => {
      // Each node gets 1-2 random attributes per category to ensure some overlap
      const options = CATEGORIES[cat];
      const count = Math.random() < 0.3 ? 2 : 1;
      const selected = [];
      const shuffled = [...options].sort(() => 0.5 - Math.random());
      for (let j = 0; j < count; j++) {
        selected.push(shuffled[j]);
        attributesPopulation.push(`${cat}:${shuffled[j]}`);
      }
      nodeAttrs[cat] = selected;
    });
    nodes.push({ id: `Node ${i + 1}`, attributes: nodeAttrs });
  }

  // Links are just for visualization in this simulation (showing "potential" connections)
  // We'll generate links based on similarity > 0.5 to make the graph look connected
  const links = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const sim = calculateSimilarity(nodes[i], nodes[j], nodes).score;
      if (sim > 0.8) {
        links.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }
  }

  return { nodes, links };
}

/**
 * Calculates attribute-based Adamic-Adar similarity
 */
export function calculateSimilarity(sourceNode, targetNode, allNodes) {
  if (!sourceNode || !targetNode || sourceNode.id === targetNode.id) {
    return { score: 0, sharedAttributes: [] };
  }

  const sourceAttrs = flattenAttributes(sourceNode.attributes);
  const targetAttrs = flattenAttributes(targetNode.attributes);
  const shared = sourceAttrs.filter(a => targetAttrs.includes(a));

  if (shared.length === 0) return { score: 0, sharedAttributes: [] };

  // Calculate frequencies
  const frequencies = {};
  allNodes.forEach(node => {
    const attrs = flattenAttributes(node.attributes);
    attrs.forEach(a => {
      frequencies[a] = (frequencies[a] || 0) + 1;
    });
  });

  let score = 0;
  const sharedDetails = shared.map(attrName => {
    const freq = frequencies[attrName];
    // Adamic-Adar similarity uses 1/log(frequency)
    // Note: If frequency is 1, log(1) is 0, which is undefined. 
    // Usually a small offset or assuming min frequency > 1 is handled.
    // In actual Adamic-Adar on web pages, frequency is the number of users with that attribute.
    const contribution = freq > 1 ? 1 / Math.log10(freq) : (1 / Math.log10(1.1)); 
    score += contribution;
    return { name: attrName, frequency: freq, contribution };
  });

  return {
    score: parseFloat(score.toFixed(4)),
    sharedAttributes: sharedDetails
  };
}

function flattenAttributes(attrMap) {
  const flat = [];
  Object.keys(attrMap).forEach(cat => {
    attrMap[cat].forEach(val => flat.push(`${cat}:${val}`));
  });
  return flat;
}
