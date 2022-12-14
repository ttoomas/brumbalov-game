import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";
import { GLTFLoader } from "three/examples/jsm/loaders/gltfloader";
import Stats from "three/examples/jsm/libs/stats.module";
import createScene from "./createScene";

// VARIABLES
const gameParent = document.getElementById('game');
let gameCamera, gameScene, gameRenderer;

const gltfLoader = new GLTFLoader();

let gameControls;


let playerControls = {};

let player = {
    height: 0.5,
    turnSpeed: 0.1,
    speed: 0.1,
    jumpHeight: 0.2,
    gravity: 0.01,
    velocity: 0,

    playerJumps: false
};


// INIT
initGame();

async function initGame(){
    gameScene = new THREE.Scene();
    const sceneBackgroundTexture = new THREE.Color('white');
    gameCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(gameScene, sceneBackgroundTexture, gameCamera, [0, player.height, -5], gameRenderer, gameParent);

    gameCamera.lookAt(new THREE.Vector3(0, player.height, 0));


    gameControls = new OrbitControls(gameCamera, gameRenderer.domElement);


    // Functions
    await importVoldemortModel();

    createPlane();
    createCube();
    createMoovingCube();

    gameControlsInit();

    animate();
}


// Import voldemort model
let voldemortModel;

async function importVoldemortModel(){
    // const voldemortGLTF = await gltfLoader.loadAsync('/models/voldemort.glb');
    // voldemortModel = voldemortGLTF.scene;
    
    // gameScene.add(voldemortModel);
}

function createPlane(){
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshPhongMaterial({ color: "black", wireframe: false });

    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x -= Math.PI / 2;
    plane.scale.x = 3;
    plane.scale.y = 3;
    plane.receiveShadow = true;

    gameScene.add(plane);
}

function createCube(){
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: "orange", wireframe: false });
    
    const cube = new THREE.Mesh(geometry, material);

    cube.position.y = 0.75;
    cube.position.x = 0;

    gameScene.add(cube);
}


let moovingCube;

function createMoovingCube(){
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: "green", wireframe: false });
    
    moovingCube = new THREE.Mesh(geometry, material);

    moovingCube.position.x = 0;
    moovingCube.position.y = 0.25;
    moovingCube.position.z = -2;

    gameScene.add(moovingCube);
}


function windowListenerHandler(){
    window.addEventListener('keydown', (e) => {
        playerControls[e.key] = true;
    })
    
    window.addEventListener('keyup', (e) => {
        playerControls[e.key] = false;
    })
}

function control(){
    // W
    if(playerControls['w']){
        let xPos = Math.sin(gameCamera.rotation.y) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.speed;

        gameCamera.position.x -= xPos;
        gameCamera.position.z -= zPos;

        moovingCube.position.x -= xPos;
        moovingCube.position.z -= zPos;
    }

    // S
    if(playerControls['s']){
        let xPos = Math.sin(gameCamera.rotation.y) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.speed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        moovingCube.position.x += xPos;
        moovingCube.position.z += zPos;
    }

    // A
    if(playerControls['a']){
        let xPos = Math.sin(gameCamera.rotation.y + Math.PI / 2) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y + Math.PI / 2) * player.speed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        moovingCube.position.x += xPos;
        moovingCube.position.z += zPos;
    }

    // D
    if(playerControls['d']){
        let xPos = Math.sin(gameCamera.rotation.y - Math.PI / 2) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y - Math.PI / 2) * player.speed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        moovingCube.position.x += xPos;
        moovingCube.position.z += zPos;
    }
}


function updatePlayer(){
    control();
    windowListenerHandler();
}




// GAME CONTROLS
let stats;
function gameControlsInit(){
    gameControls.enabled = false;

    gameControls.addEventListener('change', () => {
        console.log(gameCamera.position);
        console.log(`target:`);
        console.log(gameControls.target);
    })

    // Development only
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const axesHelper = new THREE.AxesHelper(10);
    gameScene.add(axesHelper);
}

// ANIMATE
function animate(){
    stats.begin();

    gameRenderer.render(gameScene, gameCamera);
    // gameControls.update();

    updatePlayer();

    requestAnimationFrame(animate);

    stats.end();
}