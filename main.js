import './style.css'
import * as THREE from 'three'
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap'
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha : true
});


renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding



const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030; // Adjust the amount of shift
composer.addPass(rgbShiftPass);



const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();



let model;

const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', (texture) => {
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  // scene.background = envMap; // Set as scene background
  scene.environment = envMap; // Set as scene environment
  texture.dispose();
  pmremGenerator.dispose();

  // Add a basic object (e.g., a sphere) to see the effects
  const loader = new GLTFLoader();
  loader.load('./DamagedHelmet.gltf', (gltf) => {
    model = gltf.scene;
    scene.add(model);
  }, undefined, (error) => {
    console.error('An error occurred while loading the GLTF  model : ', error)
  })
});

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: "red" } );
// const mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );


// const renderer = new THREE.WebGLRenderer({
//   canvas: document.querySelector('#canvas'),
//   antialias: true,
// });


// document.body.appendChild( renderer.domElement );

// const controls = new OrbitControls( camera, renderer.domElement );
// controls.enableDamping = true
window.addEventListener('mousemove', (e)=>{
  if(model){
    const rotationX = (e.clientX/window.innerWidth - .5) * (Math.PI * .2) ; 
    // 180degree ka 30%
    const rotationY = (e.clientY/window.innerHeight - .5)* (Math.PI * .2) ; 
    gsap.to(model.rotation,{
      x : rotationY,
      y : rotationX,
      duration: 0.6,
      ease : "power2.out"
    })

  }
})

window.addEventListener('resize', () => {
  // Update camera aspect ratio and projection matrix
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerHeight, window.innerWidth)
});

function animate() {
  window.requestAnimationFrame(animate)
  // mesh.rotation.y += 0.01
  // controls.update()
  composer.render()
  // renderer.render(scene, camera)
}
animate()