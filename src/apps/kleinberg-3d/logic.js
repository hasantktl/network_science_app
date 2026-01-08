/**
 * Kleinberg 3D Small-World Navigation Model
 * 3D küp şeklinde grid üzerinde navigasyon simülasyonu
 */

/**
 * 3D Manhattan mesafesi hesapla
 */
export function getManhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
}

/**
 * Grid pozisyonunu 3D koordinata dönüştür
 */
export function positionToVector(gridPos, spacing, offset) {
  return {
    x: gridPos.x * spacing - offset,
    y: gridPos.y * spacing - offset,
    z: gridPos.z * spacing - offset
  };
}

/**
 * Kleinberg 3D ağını oluştur
 * @param {number} gridSize - Grid boyutu (8 = 8x8x8 küp)
 * @param {number} r - Kümelenme üssü (0=geniş, 3=optimal, 6=dar)
 * @returns {Object} { nodes, latticeLinks, shortcutLinks }
 */
export function generateKleinbergGrid(gridSize = 8, r = 3) {
  // 3D grid node'ları oluştur
  const nodes = [];
  const gridNodes = Array.from({ length: gridSize }, () => 
    Array.from({ length: gridSize }, () => 
      Array.from({ length: gridSize }, () => null)
    )
  );

  // Tüm node'ları oluştur
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const node = { 
          x, y, z, 
          adj: [], 
          shortcut: null 
        };
        gridNodes[x][y][z] = node;
        nodes.push(node);
      }
    }
  }

  // Izgara (lattice) bağlantıları oluştur - 6 komşu (±x, ±y, ±z)
  const latticeLinks = [];
  const directions = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const node = gridNodes[x][y][z];
        
        for (const [dx, dy, dz] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          
          if (nx >= 0 && nx < gridSize && 
              ny >= 0 && ny < gridSize && 
              nz >= 0 && nz < gridSize) {
            const neighbor = gridNodes[nx][ny][nz];
            node.adj.push(neighbor);
            
            // Sadece pozitif yönde bağlantı ekle (duplikasyonu önle)
            if (dx > 0 || dy > 0 || dz > 0) {
              latticeLinks.push({ source: node, target: neighbor });
            }
          }
        }
      }
    }
  }

  // Kısayol bağlantıları oluştur (Kleinberg modeli)
  const shortcutLinks = [];
  
  for (const node of nodes) {
    // Her node için bir kısayol seç
    let totalWeight = 0;
    const weights = [];
    
    for (const target of nodes) {
      if (node === target) continue;
      
      const distance = getManhattanDistance(node, target);
      const weight = Math.pow(distance, -r);
      weights.push({ target, weight });
      totalWeight += weight;
    }
    
    // Ağırlıklı rastgele seçim
    let random = Math.random() * totalWeight;
    for (const entry of weights) {
      random -= entry.weight;
      if (random <= 0) {
        node.shortcut = entry.target;
        node.adj.push(entry.target); // Navigasyonda kullanılacak
        shortcutLinks.push({ source: node, target: entry.target });
        break;
      }
    }
  }

  return { 
    nodes, 
    gridNodes, 
    latticeLinks, 
    shortcutLinks,
    gridSize 
  };
}

/**
 * Açgözlü navigasyon algoritması
 * Her adımda hedefe en yakın komşuya git
 * @param {Object} start - Başlangıç node
 * @param {Object} target - Hedef node
 * @returns {Array} Yol node'ları
 */
export function greedyNavigate(start, target) {
  const path = [start];
  let current = start;
  const maxSteps = 500;
  let steps = 0;

  while (getManhattanDistance(current, target) > 0 && steps < maxSteps) {
    steps++;
    
    const neighbors = current.adj;
    if (!neighbors || neighbors.length === 0) {
      break; // Çıkmaz sokak
    }

    // En yakın komşuyu bul
    let best = neighbors[0];
    let minDist = getManhattanDistance(best, target);
    
    for (const neighbor of neighbors) {
      const dist = getManhattanDistance(neighbor, target);
      if (dist < minDist) {
        minDist = dist;
        best = neighbor;
      }
    }

    current = best;
    path.push(current);
  }

  return path;
}

/**
 * Navigasyonu adım adım async generator olarak çalıştır
 * @param {Object} start - Başlangıç node
 * @param {Object} target - Hedef node
 * @param {function} onStep - Her adımda çağrılacak callback
 * @param {number} delay - Adımlar arası gecikme (ms)
 */
export async function animatedNavigate(start, target, onStep, delay = 120) {
  const path = [start];
  let current = start;
  const maxSteps = 300;
  let steps = 0;

  onStep(path, steps, getManhattanDistance(current, target), 'running');

  while (getManhattanDistance(current, target) > 0 && steps < maxSteps) {
    steps++;
    
    const neighbors = current.adj;
    if (!neighbors || neighbors.length === 0) {
      onStep(path, steps, getManhattanDistance(current, target), 'stuck');
      return path;
    }

    // En yakın komşuyu bul
    let best = neighbors[0];
    let minDist = getManhattanDistance(best, target);
    
    for (const neighbor of neighbors) {
      const dist = getManhattanDistance(neighbor, target);
      if (dist < minDist) {
        minDist = dist;
        best = neighbor;
      }
    }

    current = best;
    path.push(current);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    onStep(path, steps, getManhattanDistance(current, target), 'running');
  }

  const finalStatus = getManhattanDistance(current, target) === 0 ? 'success' : 'timeout';
  onStep(path, steps, 0, finalStatus);
  
  return path;
}
