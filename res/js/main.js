import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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


// VARIABLES
const home = document.getElementById('home');
let camera, scene, renderer;

const gltfLoader = new GLTFLoader().setPath('./res/models/');

let houseObject, questionObject;
let homeMouse, homeRaycaster;


// THREE INIT
homeSceneInit();

async function homeSceneInit(){
    scene = new THREE.Scene();
    
    const sceneBackgroundTexture = new THREE.TextureLoader().load('./res/images/homeSceneBg.jpg');
    scene.background = sceneBackgroundTexture;
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.set(6.5, 2, 0.5);
    
    
    // Lights
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 50, 50);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    
    scene.add(pointLight, ambientLight);
    
    // Home Render
    homeRaycaster = new THREE.Raycaster();
    homeMouse = new THREE.Vector2();
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.innerWidth / window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    home.appendChild(renderer.domElement);

    // Functions
    await importHouseModel();
    await importQuestionModel();

    controlsFunction();

    bodyMouseMove();
    animate();


    renderer.domElement.addEventListener('click', handleHomeClick, false);
}

// Import house model
async function importHouseModel(){
    const houseGLTF = await gltfLoader.loadAsync('house.glb');
    houseObject = houseGLTF.scene;
    
    scene.add(houseObject);
}

// Mooving house on cursor move
function bodyMouseMove(){
    document.body.addEventListener('mousemove', (e) => {
        // Move with house
        let moveY = ((e.screenX / window.innerWidth) / 8) - 0.1;
        let moveZ = ((e.screenY / window.innerHeight) / -6) + 0.1;
        
        houseObject.rotation.y = moveY;
        houseObject.rotation.z = moveZ;
    
        // Question mark hover
        homeMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        homeMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
        homeRaycaster.setFromCamera(homeMouse, camera);
    
        let intersects = homeRaycaster.intersectObject(scene, true);
    
        if(intersects.length > 0){
            let object = intersects[0].object;
    
            if(object.name === "Torus002_Material001_0"){
                questionOnMouseEnterHandle();
            }
        }
    })
}

// Import question mark model
async function importQuestionModel(){
    const questioGLTF = await gltfLoader.loadAsync('question-mark.glb');
    questionObject = questioGLTF.scene;
    
    scene.add(questionObject);
    
    questionObject.position.set(5.63, 1, 1.48);
    questionObject.rotation.set(0.5, 1.75, -0.5);
    questionObject.scale.set(0.01, 0.01, 0.01);
}



// HOME ONCLICK
function handleHomeClick(e){
    e.preventDefault();

    homeMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    homeMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    homeRaycaster.setFromCamera(homeMouse, camera);

    let intersects = homeRaycaster.intersectObject(scene, true);

    if(intersects.length > 0){
        let object = intersects[0].object;
    
        console.log(object);

        // House

        // Question Mark
        if(object.name === "Torus002_Material001_0"){
            questionOnClickHandle();
        }
    }
}


// Question mark onclick handle
function questionOnClickHandle(){
    console.log('open help menu');
}

// Question mark onmouseenter handle
function questionOnMouseEnterHandle(){
    console.log('hover mark');
}





// CONTROLS - DEVELOPMENT ONLY
let controlsVar, stats;

function controlsFunction(){
    controlsVar = new OrbitControls(camera, renderer.domElement);
    
    scene.add(new THREE.AxesHelper(5));
    // red = x  green = y   blue = z
    
    controlsVar.addEventListener('change', () => {
        console.log(camera.position);
    })
    
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}


// ANIMATE
function animate(){
    stats.begin();

    renderer.render(scene, camera);
    controlsVar.update();

    requestAnimationFrame(animate);

    stats.end();
}