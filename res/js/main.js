import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from "gsap";
import createScene from "./createScene";
import Stats from 'three/examples/jsm/libs/stats.module';



// AUDIO
let battleAudio = new Audio('/audio/battle-sound.mp3');
let bossWelcomeRoundAudio = new Audio('/audio/boss-round-welcome-sound.mp3');
let dictionaryBgAudio = new Audio('/audio/dictionary-bg-sound.mp3');
let openingBgAudio = new Audio('/audio/opening-bg-sound.mp3');

battleAudio.volume = 0.25;
bossWelcomeRoundAudio.volume = 0.6;
dictionaryBgAudio.volume = 0.2;
openingBgAudio.volume = 0.3;


// VARIABLES
const homeParent = document.getElementById('home');
let homeCamera, homeScene, homeRenderer;

const gltfLoader = new GLTFLoader();

let houseObject;

let homeRaycaster = new THREE.Raycaster();
let homeMouse = new THREE.Vector2();

let selectedObject;
let parent;


// THREE INIT
let controlsVar;
homeSceneInit();

async function homeSceneInit(){
    homeScene = new THREE.Scene();
    const sceneBackgroundTexture = new THREE.TextureLoader().load('/images/homeSceneBg.jpg');
    homeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    homeRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(homeScene, sceneBackgroundTexture, homeCamera, [6.5, 2, 0.5], homeRenderer, homeParent);
    
    controlsVar = new OrbitControls(homeCamera, homeRenderer.domElement);

    // Functions
    await importHouseModel();

    selectedObject = houseObject.getObjectByName("Book_Open_Vocabulary_1");
    parent = selectedObject.parent;
    parent.remove(selectedObject);

    // selectedObject = houseObject.getObjectByName("Book_Open_Vocabulary_2");
    // parent = selectedObject.parent;
    // parent.remove(selectedObject);
        

    controlsFunction();

    // bodyMouseMove();
    animate();

    homeRenderer.domElement.addEventListener('click', handleHomeClick, false);
}


// Import house model
async function importHouseModel(){
    const houseGLTF = await gltfLoader.loadAsync('/models/new-house-model.glb');
    houseObject = houseGLTF.scene;
    
    homeScene.add(houseObject);
}

// Mooving house on cursor move
function bodyMouseMove(){
    document.body.addEventListener('mousemove', (e) => {
        let moveY = ((e.screenX / window.innerWidth) / 8) - 0.1;
        let moveZ = ((e.screenY / window.innerHeight) / -6) + 0.1;
        
        houseObject.rotation.y = moveY;
        houseObject.rotation.z = moveZ;
    })
}


// HOME ONCLICK
function handleHomeClick(e){
    e.preventDefault();

    homeMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    homeMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    homeRaycaster.setFromCamera(homeMouse, homeCamera);

    let intersects = homeRaycaster.intersectObject(homeScene, true);

    if(intersects.length > 0){
        let object = intersects[0].object;

        console.log(object);
    
        // Vocabulary table
        if(object.name.includes('Vocabulary_Table_')){
            console.log('Table');

            // Change camera position
            gsap.to(homeCamera.position, {
                duration: 1,
                x: 3.1770095122945516,
                y: 0.6126561661774869,
                z: 2.845686434734792
            })

            gsap.to(controlsVar.target, {
                duration: 1,
                x: 0.5206104737929833,
                y: -0.44962723446350095,
                z: 3.6240351733161136
            })

            setTimeout(() => {
                parent.add(selectedObject);
                selectedObject.material.transparent = true;
                selectedObject.material.opacity = 0;
                gsap.to(selectedObject.material, {
                    duration: 0.5,
                    opacity: 1
                })
            }, 1100);

        }

        // Doors
        if(object.name.includes('Brick_Door_')){
            console.log('Door');
        }

        // Arsenal
        if(object.name.includes('Arsenal_Change_')){
            console.log('Arsenal');
        }

        // Cauldron
        if(object.name.includes('Heal_Cauldron')){
            console.log('Cauldron');
        }
    }
}


// ANIMATE
function animate(){
    stats.begin();

    homeRenderer.render(homeScene, homeCamera);
    controlsVar.update();

    requestAnimationFrame(animate);

    stats.end();
}


// HOME CONTROLS
let stats;

function controlsFunction(){
    controlsVar.enabled = false;
    
    controlsVar.addEventListener('change', () => {
        console.log(homeCamera.position);
        console.log('target (lookAt)');
        console.log(controlsVar.target);
    })
    
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
}



// QUESTION MARK
let questionScene, questionCamera, questionRenderer;

questionSceneInit();

async function questionSceneInit(){
    questionScene = new THREE.Scene();
    
    questionScene.background = null;
    
    // Camera
    questionCamera = new THREE.PerspectiveCamera(75, 0.875, 0.1, 1000);
    questionCamera.aspect = 0.875;
    questionCamera.position.set(6.5, 2, 0.5);
    
    
    // Lights
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 50, 50);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    
    questionScene.add(pointLight, ambientLight);
    
    // Home Render    
    questionRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    questionRenderer.setPixelRatio(0.875);
    questionRenderer.setSize(70, 80);
    questionRenderer.domElement.classList.add('questionScene');
    home.appendChild(questionRenderer.domElement);

    // Functions
    await importQuestionModel();

    questionControlsFunction();

    questionAnimate();
}

// Question import
let questionObject;

async function importQuestionModel(){
    const questioGLTF = await gltfLoader.loadAsync('/models/question-mark.glb');
    questionObject = questioGLTF.scene;

    questionScene.add(questionObject);

    questionObject.scale.set(0.5, 0.5, 0.5);
    questionObject.position.set(0, -1, 0);
    questionObject.rotation.y = 1.5;
}

// Question mouseenter
questionRenderer.domElement.addEventListener('mouseenter', () => {
    gsap.to(questionObject.rotation, {
        duration: 0.8,
        y: 8
    })

    gsap.to(questionObject.scale, {
        duration: 0.8,
        x: 0.6,
        y: 0.6,
        z: 0.6
    })
})

// Question mouseleave
questionRenderer.domElement.addEventListener('mouseleave', () => {
    gsap.to(questionObject.rotation, {
        duration: 0.6,
        y: 1.5
    })

    gsap.to(questionObject.scale, {
        duration: 0.6,
        x: 0.5,
        y: 0.5,
        z: 0.5
    })
})

// Question onclick
const helpContainer = document.querySelector('.help');

questionRenderer.domElement.addEventListener('click', () => {
    helpContainer.style.animation = "fadeIn 300ms ease-in-out forwards";

    checkLeaveKey();
})

function checkLeaveKey(){
    window.addEventListener('keydown', (e) => {
        console.log(e);
        if(e.code === "Escape"){
            helpLeave();
        }
    })
}
// Leave help
const helpLeaveBx = document.querySelector('.help__leaveBx');

helpLeaveBx.addEventListener('click', helpLeave, false);

function helpLeave(){
    helpContainer.style.animation = "fadeOut 300ms ease-in-out forwards";
}



// QUESTION CONTROLS
let questionControlsVar;

function questionControlsFunction(){
    questionControlsVar = new OrbitControls(questionCamera, questionRenderer.domElement);
    questionControlsVar.enabled = false;
    
    questionControlsVar.addEventListener('change', () => {
        console.log(questionCamera.position);
    })
}


// QUESTION ANIMATE
function questionAnimate(){
    questionRenderer.render(questionScene, questionCamera);
    requestAnimationFrame(questionAnimate);

    questionControlsVar.update();
}