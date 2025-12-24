import AdamicAdarPanel from './adamic-adar/CalculationPanel';
import { calculateAdamicAdar } from './adamic-adar/logic';
import AdamicAdarSimilarityPanel from './adamic-adar-similarity/CalculationPanel';
import { calculateSimilarity, generateAttributeGraph } from './adamic-adar-similarity/logic';
import WattsStrogatzPanel from './watts-strogatz/CalculationPanel';
import { generateWattsStrogatzGraph } from './watts-strogatz/logic';
import AveragePathLengthPanel from './average-path-length/CalculationPanel';
import { generateRandomGraph as generateAPLGraph } from './average-path-length/logic';
import KleinbergPanel from './kleinberg-3d/CalculationPanel';

export const categories = [
  { id: 'all', label: 'All', icon: '🎯' },
  { id: 'link-prediction', label: 'Link Prediction', icon: '🔗' },
  { id: 'small-world', label: 'Small-World Networks', icon: '🌐' },
  { id: 'graph-metrics', label: 'Graph Metrics', icon: '📊' }
];

export const simulations = [
  {
    id: 'adamic-adar-index',
    title: 'Adamic-Adar Index',
    category: 'link-prediction',
    description: 'Topology-based: Predict link likelihood based on inverse log-frequency of shared neighbors.',
    calculator: calculateAdamicAdar,
    CalculationPanel: AdamicAdarPanel,
    icon: '🔗'
  },
  {
    id: 'adamic-adar-similarity',
    title: 'Adamic-Adar Similarity',
    category: 'link-prediction',
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
    category: 'small-world',
    description: 'Small-world networks: Explore how random rewiring creates networks with high clustering and short paths.',
    itemGenerator: generateWattsStrogatzGraph,
    CalculationPanel: WattsStrogatzPanel,
    customPanel: true, // Panel manages its own graph generation
    icon: '🌐'
  },
  {
    id: 'average-path-length',
    title: 'Average Path Length',
    category: 'graph-metrics',
    description: 'Network efficiency: Measure L ~ log(N), visualize shortest paths and path distribution.',
    itemGenerator: generateAPLGraph,
    CalculationPanel: AveragePathLengthPanel,
    customPanel: true, // Panel manages its own graph generation
    icon: '📏'
  },
  {
    id: 'kleinberg-3d',
    title: '3D Kleinberg Navigation',
    category: 'small-world',
    description: 'Small-world navigation in 3D: Explore greedy routing with shortcuts in a 3D lattice.',
    CalculationPanel: KleinbergPanel,
    customPanel: true,
    is3D: true,
    icon: '🧊'
  }
];
