import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const SPACING = 12;

function posToVec(gridPos, offset) {
  return new THREE.Vector3(
    gridPos.x * SPACING - offset,
    gridPos.y * SPACING - offset,
    gridPos.z * SPACING - offset
  );
}

function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

const KleinbergCanvas3D = ({ 
  networkData, 
  navigationPath 
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const frameIdRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Scene objects refs
  const latticeRef = useRef(null);
  const shortcutsRef = useRef(null);
  const shortcutPointsRef = useRef(null);
  const pathLineRef = useRef(null);
  const startSphereRef = useRef(null);
  const targetSphereRef = useRef(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera - positioned to see the grid centered at origin
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Trigger initial resize after a short delay
    setTimeout(handleResize, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Update network visualization when networkData changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !networkData) return;

    // Clear old network objects
    [latticeRef, shortcutsRef, shortcutPointsRef, startSphereRef, targetSphereRef].forEach(ref => {
      if (ref.current) {
        scene.remove(ref.current);
        ref.current = null;
      }
    });

    const { latticeLinks, shortcutLinks, gridSize } = networkData;
    const offset = (gridSize - 1) * SPACING / 2;
    const pointTexture = createCircleTexture();

    // Lattice lines (gray, low opacity)
    const latticeCoords = [];
    for (const link of latticeLinks) {
      const v1 = posToVec(link.source, offset);
      const v2 = posToVec(link.target, offset);
      latticeCoords.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    }
    
    if (latticeCoords.length > 0) {
      const latticeGeometry = new THREE.BufferGeometry();
      latticeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(latticeCoords, 3));
      const latticeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x475569, 
        transparent: true, 
        opacity: 0.15 
      });
      const latticeLines = new THREE.LineSegments(latticeGeometry, latticeMaterial);
      scene.add(latticeLines);
      latticeRef.current = latticeLines;
    }

    // Shortcut lines (blue)
    const shortcutCoords = [];
    const activeNodes = new Set();
    for (const link of shortcutLinks) {
      const v1 = posToVec(link.source, offset);
      const v2 = posToVec(link.target, offset);
      shortcutCoords.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      activeNodes.add(`${link.source.x},${link.source.y},${link.source.z}`);
      activeNodes.add(`${link.target.x},${link.target.y},${link.target.z}`);
    }
    
    if (shortcutCoords.length > 0) {
      const shortcutGeometry = new THREE.BufferGeometry();
      shortcutGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shortcutCoords, 3));
      const shortcutMaterial = new THREE.LineBasicMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.6 
      });
      const shortcutLines = new THREE.LineSegments(shortcutGeometry, shortcutMaterial);
      scene.add(shortcutLines);
      shortcutsRef.current = shortcutLines;
    }

    // Shortcut endpoint points (blue dots)
    const pointCoords = [];
    activeNodes.forEach(key => {
      const [px, py, pz] = key.split(',').map(Number);
      const v = posToVec({ x: px, y: py, z: pz }, offset);
      pointCoords.push(v.x, v.y, v.z);
    });
    
    if (pointCoords.length > 0) {
      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointCoords, 3));
      const pointsMaterial = new THREE.PointsMaterial({ 
        color: 0x3b82f6, 
        size: 3, 
        map: pointTexture, 
        transparent: true, 
        alphaTest: 0.5, 
        sizeAttenuation: true 
      });
      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      scene.add(points);
      shortcutPointsRef.current = points;
    }

    // Start sphere (green) at (0,0,0)
    const sphereGeo = new THREE.SphereGeometry(2, 16, 16);
    const startMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x22c55e, 
      emissive: 0x22c55e, 
      emissiveIntensity: 0.6 
    });
    const startSphere = new THREE.Mesh(sphereGeo, startMaterial);
    startSphere.position.copy(posToVec({ x: 0, y: 0, z: 0 }, offset));
    scene.add(startSphere);
    startSphereRef.current = startSphere;

    // Target sphere (red) at (gridSize-1, gridSize-1, gridSize-1)
    const targetMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xef4444, 
      emissive: 0xef4444, 
      emissiveIntensity: 0.6 
    });
    const targetSphere = new THREE.Mesh(sphereGeo, targetMaterial);
    targetSphere.position.copy(posToVec({ x: gridSize - 1, y: gridSize - 1, z: gridSize - 1 }, offset));
    scene.add(targetSphere);
    targetSphereRef.current = targetSphere;

    console.log('3D Network rendered:', {
      latticeLinks: latticeLinks.length,
      shortcutLinks: shortcutLinks.length,
      gridSize,
      offset
    });

  }, [networkData]);

  // Update navigation path
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old path
    if (pathLineRef.current) {
      scene.remove(pathLineRef.current);
      pathLineRef.current = null;
    }

    if (!navigationPath || navigationPath.length === 0 || !networkData) return;

    const offset = (networkData.gridSize - 1) * SPACING / 2;
    const pathPoints = navigationPath.map(node => posToVec(node, offset));
    
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff3333, 
      linewidth: 2,
      depthTest: false,
      transparent: true,
      opacity: 1
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.renderOrder = 999;
    scene.add(pathLine);
    pathLineRef.current = pathLine;

  }, [navigationPath, networkData]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '500px',
        position: 'relative',
        background: '#0f172a',
        borderRadius: '12px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default KleinbergCanvas3D;
