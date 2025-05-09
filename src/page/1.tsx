import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import gsap from 'gsap';

declare global {
  interface Document {
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen(): Promise<void>;
  }
  interface HTMLCanvasElement {
    webkitRequestFullscreen(): Promise<void>;
  }
}

const textures = {
  door: {
    alpha: '/assets/lessons/11/alpha.jpg',
    height: '/assets/lessons/11/height.jpg',
    normal: '/assets/lessons/11/normal.jpg',
    color: '/assets/lessons/11/color.jpg',
    ambientOcclusion: '/assets/lessons/11/ambientOcclusion.jpg',
    metalness: '/assets/lessons/11/metalness.jpg',
    roughness: '/assets/lessons/11/roughness.jpg',
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Texture setup
    // const image = new Image();
    // const texture = new THREE.Texture(image);
    // image.addEventListener('load', () => {
    //   texture.needsUpdate = true;
    // });
    // image.src = '/assets/lessons/11/color.jpg';

    // const textureLoader = new THREE.TextureLoader();
    // const texture = textureLoader.load(
    //   textures.door,
    //   () => {
    //     console.log('loaded');
    //   },
    //   () => {
    //     console.log('loading...');
    //   },
    //   () => {
    //     console.log('error');
    //   }
    // );

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onStart = () => {
      console.log('loading started');
    }
    loadingManager.onLoad = () => {
      console.log('loading finished');
    }
    loadingManager.onProgress = () => {
      console.log('loading progress');
    }
    loadingManager.onError = () => {
      console.log('loading error');
    }
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const colorTexture = textureLoader.load(textures.door.color);
    // colorTexture.repeat.set(2, 3);
    // colorTexture.offset.set(0.5, 0.5);
    colorTexture.rotation = Math.PI * 0.25;
    colorTexture.center.set(0.5, 0.5);
    // colorTexture.wrapS = THREE.RepeatWrapping;
    // colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.wrapS = THREE.MirroredRepeatWrapping;
    colorTexture.wrapT = THREE.MirroredRepeatWrapping;
    colorTexture.minFilter = THREE.NearestFilter;
    colorTexture.generateMipmaps = false;
    // Mesh setup
    const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    // const geometry = new THREE.SphereGeometry(1, 32, 32);
    // const geometry = new THREE.ConeGeometry(1, 1, 32);
    // const geometry = new THREE.TorusGeometry(1, 0.35, 32, 100);
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const material = new THREE.MeshBasicMaterial({ map: colorTexture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 3;
    scene.add(camera);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls setup
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // GUI setup
    const parameters = {
      color: 0xff0000,
      spin: () => gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
    };

    const gui = new dat.GUI({ width: 400 });
    gui.add(mesh.position, 'y', -3, 3, 0.01).name('elevation');
    gui.add(mesh, 'visible');
    gui.add(material, 'wireframe');
    gui.addColor(parameters, 'color').onChange(() => {
      material.color.set(parameters.color);
    });
    gui.add(parameters, 'spin');

    // Animation loop
    let animationFrameId: number;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(tick);
    };
    tick();

    // Event handlers
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const handleFullscreen = () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (!fullscreenElement) {
        if (canvasRef.current?.requestFullscreen) {
          canvasRef.current.requestFullscreen();
        } else if (canvasRef.current?.webkitRequestFullscreen) {
          canvasRef.current.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('dblclick', handleFullscreen);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dblclick', handleFullscreen);
      window.cancelAnimationFrame(animationFrameId);
      gui.destroy();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgl" ref={canvasRef}></canvas>;
}

export default App;
