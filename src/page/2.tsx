import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

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

    // Scene setup
    const scene = new THREE.Scene();
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);


    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080808, 0.3);
    scene.add(hemisphereLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(1, 1, 2);
    scene.add(pointLight);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
    scene.add(pointLightHelper);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
    scene.add(directionalLightHelper);

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
    // Mesh setup
    const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    // const geometry = new THREE.SphereGeometry(1, 32, 32);
    // const geometry = new THREE.ConeGeometry(1, 1, 32);
    // const geometry = new THREE.TorusGeometry(1, 0.35, 32, 100);
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    // const material = new THREE.MeshBasicMaterial({ map: colorTexture });
    // const material = new THREE.MeshNormalMaterial();
    // const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
    // const material = new THREE.MeshLambertMaterial();
    // material.shininess = 100;
    // material.specular = new THREE.Color(0x1188ff);
    // const material = new THREE.MeshPhongMaterial();
    // const material = new THREE.MeshToonMaterial();
    // material.gradientMap = gradientTexture;
    // gradientTexture.minFilter = THREE.NearestFilter;
    // gradientTexture.magFilter = THREE.NearestFilter;
    // gradientTexture.generateMipmaps  = false;
    // const material = new THREE.MeshStandardMaterial();
    // material.metalness = 0;
    // material.roughness = 1;
    // material.map = colorTexture;
    // material.normalMap = normalTexture;
    // material.normalScale.set(0.5, 0.5);
    // material.transparent = true;
    // material.alphaMap = alphaTexture;
    // material.displacementMap = heightTexture;
    // material.displacementScale = 0.05;
    // material.metalnessMap = metalnessTexture;
    // material.roughnessMap = roughnessTexture;
    // material.flatShading = true;
    // material.side = THREE.DoubleSide;

    // material.metalness = 0.7;
    // material.roughness = 0.2;
    console.log(textures.environmentMaps[0])
    const environmentMapTexture = new THREE.CubeTextureLoader().load(textures.environmentMaps[1]);
    const material = new THREE.MeshStandardMaterial({ 
      envMap: environmentMapTexture,
      metalness: 0.7,
      roughness: 0.2,
      envMapIntensity: 1
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
    sphere.position.x = -1.5;
    sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.2, 64, 128), material);
    torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2));
    torus.position.x = 1.5;

    scene.add(sphere, plane, torus);


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

    // GUI setup
    const parameters = {
      color: 0xff0000,

    };

    const gui = new dat.GUI({ width: 400 });

    gui.add(material, 'wireframe');
    gui.add(material, 'opacity').min(0).max(1).step(0.001).name('opacity');
    gui.addColor(parameters, 'color').onChange(() => {
      material.color.set(parameters.color);
    });
    gui.add(material, 'metalness').min(0).max(1).step(0.001).name('metalness');
    gui.add(material, 'roughness').min(0).max(1).step(0.001).name('roughness');
    gui.add(material, 'envMapIntensity').min(0).max(10).step(0.001).name('envMapIntensity');

    // Animation loop
    let animationFrameId: number;
    // const tick = () => {
    //   controls.update();
    //   renderer.render(scene, camera);
    //   animationFrameId = window.requestAnimationFrame(tick);
    // };
    // tick();
    const clock = new THREE.Clock();
    const tick2 = () => {
      controls.update();
      renderer.render(scene, camera);
      const elapsedTime = clock.getElapsedTime();
      sphere.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);
      plane.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);
      torus.rotation.set(0.15 * elapsedTime, 0.1 * elapsedTime, 0);
      animationFrameId = window.requestAnimationFrame(tick2);
    }

    tick2();

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
