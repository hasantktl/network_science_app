import AdamicAdarPanel from './adamic-adar/CalculationPanel';
import { calculateAdamicAdar } from './adamic-adar/logic';
import AdamicAdarSimilarityPanel from './adamic-adar-similarity/CalculationPanel';
import { calculateSimilarity, generateAttributeGraph } from './adamic-adar-similarity/logic';

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
  }
];
