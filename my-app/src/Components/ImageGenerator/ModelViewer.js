import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const resolveModelPath = (modelPath) => {
  if (!modelPath) return modelPath;
  if (modelPath.startsWith('blob:') || modelPath.startsWith('data:') || modelPath.startsWith('http://') || modelPath.startsWith('https://')) {
    return modelPath;
  }

  const apiBase = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  if (modelPath.startsWith('/') && apiBase) {
    return `${apiBase}${modelPath}`;
  }

  return modelPath;
};

const fitCameraToObject = (camera, controls, object, offset = 1.35) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const fitHeightDistance = maxSize / (2 * Math.tan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = new THREE.Vector3(1, 0.55, 1).normalize();
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = Math.max(distance * 20, 100);
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.minDistance = distance * 0.45;
  controls.maxDistance = distance * 4;
  controls.update();

  return { center, size, distance };
};

const applyModelMaterials = (model) => {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material) {
      child.material.side = THREE.DoubleSide;
      child.material.needsUpdate = true;
    }
  });
};

const ModelViewer = ({
  modelPath,
  interactive = true,
  autoRotate = false,
  showGround = true,
  className = '',
  style = {}
}) => {
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [loadState, setLoadState] = useState({ loading: true, error: null });

  useEffect(() => {
    if (!containerRef.current || !modelPath) return undefined;

    const resolvedModelPath = resolveModelPath(modelPath);
    setLoadState({ loading: true, error: null });

    const container = containerRef.current;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);
    scene.fog = new THREE.Fog(0x141414, 12, 28);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    camera.position.set(2.5, 1.8, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xe7f1ff, 0x1d1d1d, 1.2);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    let ground = null;
    if (showGround) {
      const groundGeometry = new THREE.CircleGeometry(6, 64);
      const groundMaterial = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.25 });
      ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.001;
      ground.receiveShadow = true;
      scene.add(ground);
    }

    const grid = new THREE.GridHelper(8, 8, 0x2f2f2f, 0x242424);
    grid.position.y = -0.002;
    grid.material.opacity = 0.28;
    grid.material.transparent = true;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.3;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.9;
    controls.enabled = interactive;
    if (!interactive) {
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enableDamping = false;
    }

    const loader = new GLTFLoader();
    let mounted = true;

    loader.load(
      resolvedModelPath,
      (gltf) => {
        if (!mounted) return;
        const model = gltf.scene;
        applyModelMaterials(model);
        scene.add(model);

        const { center, size } = fitCameraToObject(camera, controls, model, interactive ? 1.45 : 1.25);

        if (showGround && ground) {
          ground.position.y = center.y - size.y / 2 - 0.01;
          grid.position.y = ground.position.y;
        }

        setLoadState({ loading: false, error: null });
      },
      undefined,
      (error) => {
        console.error('❌ Error loading model:', error);
        if (!mounted) return;
        setLoadState({
          loading: false,
          error: 'Model preview failed to load.'
        });
      }
    );

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const nextWidth = Math.max(containerRef.current.clientWidth, 1);
      const nextHeight = Math.max(containerRef.current.clientHeight, 1);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material?.dispose?.());
        } else {
          object.material?.dispose?.();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, interactive, autoRotate, showGround]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '10px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #171717 0%, #0f0f0f 100%)',
        ...style
      }}
    >
      {loadState.loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4d4d4',
            fontSize: '13px',
            letterSpacing: '0.02em',
            background: 'linear-gradient(180deg, rgba(22,22,22,0.92) 0%, rgba(12,12,12,0.92) 100%)',
            zIndex: 2
          }}
        >
          Loading 3D preview...
        </div>
      )}
      {loadState.error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f5f5f5',
            fontSize: '13px',
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(180deg, rgba(30,30,30,0.94) 0%, rgba(14,14,14,0.94) 100%)',
            zIndex: 2
          }}
        >
          {loadState.error}
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
