import AdamicAdarPanel from './adamic-adar/CalculationPanel';
import { calculateAdamicAdar } from './adamic-adar/logic';
import AdamicAdarSimilarityPanel from './adamic-adar-similarity/CalculationPanel';
import { calculateSimilarity, generateAttributeGraph } from './adamic-adar-similarity/logic';
import WattsStrogatzPanel from './watts-strogatz/CalculationPanel';
import { generateWattsStrogatzGraph } from './watts-strogatz/logic';
import AveragePathLengthPanel from './average-path-length/CalculationPanel';
import { generateRandomGraph as generateAPLGraph } from './average-path-length/logic';

export const simulations = [
  {
    id: 'adamic-adar-index',
    title: 'Adamic-Adar Index',
    description: 'Topology-based: Predict link likelihood based on inverse log-frequency of shared neighbors.',
    calculator: calculateAdamicAdar,
    CalculationPanel: AdamicAdarPanel,
    icon: '🔗'
  },
  {
    id: 'adamic-adar-similarity',
    title: 'Adamic-Adar Similarity',
    description: 'Attribute-based (2003 Paper): Measure similarity based on shared interests, location, dev, and lang.',
    calculator: calculateSimilarity,
    itemGenerator: generateAttributeGraph,
    CalculationPanel: AdamicAdarPanel, // We will update this to the new panel in the host
    ActualPanel: AdamicAdarSimilarityPanel,
    icon: '👥'
  },
  {
    id: 'watts-strogatz',
    title: 'Watts-Strogatz Model',
    description: 'Small-world networks: Explore how random rewiring creates networks with high clustering and short paths.',
    itemGenerator: generateWattsStrogatzGraph,
    CalculationPanel: WattsStrogatzPanel,
    customPanel: true, // Panel manages its own graph generation
    icon: '🌐'
  },
  {
    id: 'average-path-length',
    title: 'Average Path Length',
    description: 'Network efficiency: Measure L ~ log(N), visualize shortest paths and path distribution.',
    itemGenerator: generateAPLGraph,
    CalculationPanel: AveragePathLengthPanel,
    customPanel: true, // Panel manages its own graph generation
    icon: '📏'
  }
];
