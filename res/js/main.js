import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import Stats from 'three/examples/jsm/libs/stats.module';

// AUDIO
let battleAudio = new Audio('./res/audio/battle-sound.mp3');
let bossWelcomeRoundAudio = new Audio('./res/audio/boss-round-welcome-sound.mp3');
let dictionaryBgAudio = new Audio('./res/audio/dictionary-bg-sound.mp3');
let openingBgAudio = new Audio('./res/audio/opening-bg-sound.mp3');

battleAudio.volume = 0.25;
bossWelcomeRoundAudio.volume = 0.6;
dictionaryBgAudio.volume = 0.2;
openingBgAudio.volume = 0.3;


// THREE INIT
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(6.5, 2, 0.5);


// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 50, 50);
const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight, ambientLight);

// Home Render
const home = document.getElementById('home');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.innerWidth / window.innerHeight);
renderer.setSize(window.innerWidth, window.innerHeight);
home.appendChild(renderer.domElement);


// Import house model
const gltfLoader = new GLTFLoader().setPath('./res/models/');
const houseGLTF = await gltfLoader.loadAsync('house.glb');
const houseObject = houseGLTF.scene;

scene.add(houseObject);

// Mooving house on cursor move
document.body.addEventListener('mousemove', (e) => {
    let moveY = ((e.screenX / window.innerWidth) / 8) - 0.1;
    let moveZ = ((e.screenY / window.innerHeight) / -6) + 0.1;
    
    houseObject.rotation.y = moveY;
    houseObject.rotation.z = moveZ;
})







// CONTROLS - DEVELOPMENT ONLY
const controls = new OrbitControls(camera, renderer.domElement);

controls.addEventListener('change', () => {
    console.log(camera.position);
})

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


// ANIMATE
function animate(callback){
    function loop(time){
        callback(time);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}


animate(() => {
    stats.begin();

    renderer.render(scene, camera);
    controls.update();

    stats.end();
})