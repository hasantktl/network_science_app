import { calculateAdamicAdar } from '../src/utils/adamicAdar';

const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
const links = [
    { source: 'A', target: 'C' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'D' }
];

// Calculation for A and B:
// Common neighbor: C
// Degree of C: 3 (connected to A, B, D)
// Expected score: 1 / log10(3) ≈ 1 / 0.4771 ≈ 2.0959

const result = calculateAdamicAdar(nodes, links, 'A', 'B');
console.log('Test Result (A-B):', result);

if (Math.abs(result.score - 2.0959) < 0.001) {
    console.log('✅ Adamic-Adar logic test passed!');
} else {
    console.error('❌ Adamic-Adar logic test failed. Expected ~2.0959, got', result.score);
}
