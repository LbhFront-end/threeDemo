import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import typefaceFont from '/fonts/helvetiker_regular.typeface.json?url';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

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
    alpha: '/door/alpha.jpg',
    height: '/door/height.jpg',
    normal: '/door/normal.jpg',
    color: '/door/color.jpg',
    ambientOcclusion: '/door/ambientOcclusion.jpg',
    metalness: '/door/metalness.jpg',
    roughness: '/door/roughness.jpg',
  },
  gradient: ['/gradients/3.jpg', '/gradients/5.jpg'],
  matcaps: ['/matcaps/1.png', '/matcaps/2.png', '/matcaps/3.png', '/matcaps/4.png', '/matcaps/5.png', '/matcaps/6.png', '/matcaps/7.png', '/matcaps/8.png'],
  environmentMaps: [
    ['/environmentMap/0/nx.jpg', '/environmentMap/0/ny.jpg', '/environmentMap/0/nz.jpg', '/environmentMap/0/px.jpg', '/environmentMap/0/py.jpg', '/environmentMap/0/pz.jpg'],
    ['/environmentMap/1/nx.jpg', '/environmentMap/1/ny.jpg', '/environmentMap/1/nz.jpg', '/environmentMap/1/px.jpg', '/environmentMap/1/py.jpg', '/environmentMap/1/pz.jpg'],
    ['/environmentMap/2/nx.jpg', '/environmentMap/2/ny.jpg', '/environmentMap/2/nz.jpg', '/environmentMap/2/px.jpg', '/environmentMap/2/py.jpg', '/environmentMap/2/pz.jpg'],
    ['/environmentMap/3/nx.jpg', '/environmentMap/3/ny.jpg', '/environmentMap/3/nz.jpg', '/environmentMap/3/px.jpg', '/environmentMap/3/py.jpg', '/environmentMap/3/pz.jpg'],

  ]
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // GUI setup
    const gui = new dat.GUI({ width: 400 });

    // Scene setup
    const scene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Materials
    const textureLoader = new THREE.TextureLoader();
    const matcapTexture = textureLoader.load(textures.matcaps[7]);

    const randomNumber = () => (Math.random() - 0.5) * 10;

    // Fonts
    const fontLoader = new FontLoader();
    fontLoader.load(typefaceFont, (font) => {
      const textGeometry = new TextGeometry('Hello Three.js', {
        font,
        size: 0.5,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      })
      textGeometry.center();
      const material  = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
      const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
      // ToolFunctions
      const generateTorus = () => {
        for (let i = 0; i < 100; i++) {
          const donut = new THREE.Mesh(donutGeometry, material);
          donut.position.set(randomNumber(), randomNumber(), randomNumber());
          donut.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
          donut.scale.set(Math.random(), Math.random(), Math.random());
          scene.add(donut)
        }
      }

      generateTorus();
      // gui.add(textMaterial, 'wireframe');
      const text = new THREE.Mesh(textGeometry, material );
      text.position.set(0, 0, 0);
      scene.add(text)
      renderer.render(scene, camera);
    })

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
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Controls setup
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;

    // Animation loop
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }
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
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return <canvas className="webgl" ref={canvasRef}></canvas>;
}

export default App;
