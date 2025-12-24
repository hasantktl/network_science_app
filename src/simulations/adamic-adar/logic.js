/**
 * Calculates the Adamic-Adar index between two nodes in a graph.
 * @param {Array} nodes - Array of nodes {id: string}
 * @param {Array} links - Array of links {source: string, target: string}
 * @param {string} sourceId - ID of the first node
 * @param {string} targetId - ID of the second node
 * @returns {Object} { score: number, neighbors: Array }
 */
export function calculateAdamicAdar(nodes, links, sourceId, targetId) {
    if (sourceId === targetId) return { score: 0, neighbors: [] };

    // Get neighbors of each node
    const getNeighbors = (nodeId) => {
        const neighbors = new Set();
        links.forEach(link => {
            const sId = typeof link.source === 'object' ? link.source.id : link.source;
            const tId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (sId === nodeId) neighbors.add(tId);
            else if (tId === nodeId) neighbors.add(sId);
        });
        return neighbors;
    };

    const sourceNeighbors = getNeighbors(sourceId);
    const targetNeighbors = getNeighbors(targetId);

    // Find common neighbors
    const commonNeighbors = [...sourceNeighbors].filter(nodeId => targetNeighbors.has(nodeId));

    // Get degree of each node
    const getDegree = (nodeId) => {
        return links.filter(link => {
            const sId = typeof link.source === 'object' ? link.source.id : link.source;
            const tId = typeof link.target === 'object' ? link.target.id : link.target;
            return sId === nodeId || tId === nodeId;
        }).length;
    };

    let score = 0;
    const neighborDetails = commonNeighbors.map(id => {
        const degree = getDegree(id);
        const contribution = degree > 1 ? 1 / Math.log10(degree) : 0; // Using log10 as often used in Adamic-Adar
        score += contribution;
        return { id, degree, contribution };
    });

    return {
        score: parseFloat(score.toFixed(4)),
        neighbors: neighborDetails
    };
}

/**
 * Generates a random graph for simulation
 */
export function generateRandomGraph(nodeCount = 8, linkProbability = 0.3) {
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({ id: `Node ${i + 1}` });
    }

    const links = [];
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() < linkProbability) {
                links.push({ source: nodes[i].id, target: nodes[j].id });
            }
        }
    }

    return { nodes, links };
}
