import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";
import { GLTFLoader } from "three/examples/jsm/loaders/gltfloader";
import Stats from "three/examples/jsm/libs/stats.module";
import createScene from "./createScene";
import gsap from "gsap";

// VARIABLES
const gameParent = document.getElementById('game');
let gameCamera, gameScene, gameRenderer;

const gltfLoader = new GLTFLoader();

let gameControls;


let playerControls = {};

let playerProjectiles = [];
let playerShooted = false;

let player = {
    height: 1.4,
    turnSpeed: 0.1,
    speed: 0.04,
    jumpHeight: 0.2,
    gravity: 0.01,
    velocity: 0,

    playerJumps: false
};

const gameSection = document.querySelector('.gameSection');
const gameScoreText = document.querySelector('.game__score');
let gameScore = 100;


// INIT
initGame();

async function initGame(){
    gameScene = new THREE.Scene();
    const sceneBackgroundTexture = new THREE.Color('white');
    gameCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(gameScene, sceneBackgroundTexture, gameCamera, [0, player.height, -15], gameRenderer, gameParent);

    gameCamera.lookAt(new THREE.Vector3(0, player.height, 0));


    gameControls = new OrbitControls(gameCamera, gameRenderer.domElement);


    // Functions
    await importVoldemortModel();
    await importBrumbalModel();

    createPlayerProjectile();

    createPlane();

    windowListenerHandler();
    
    gameControlsInit();
    
    // voldemortRandomPos();

    animate();
}


// Import voldemort model
let voldemortModel;

async function importVoldemortModel(){
    const voldemortGLTF = await gltfLoader.loadAsync('/models/voldemort.glb');
    voldemortModel = voldemortGLTF.scene;
    
    gameScene.add(voldemortModel);

    voldemortModel.scale.set(0.3, 0.3, 0.3);
    voldemortModel.position.set(0, 0, 0);
    voldemortModel.rotation.y = Math.PI;
}

// Import brumbal model
let brumbalModel;

async function importBrumbalModel(){
    const brumbalGLTF = await gltfLoader.loadAsync('/models/brumbal.glb');
    brumbalModel = brumbalGLTF.scene;

    gameScene.add(brumbalModel);

    brumbalModel.position.set(0, 0, -14);
    brumbalModel.scale.set(0.5, 0.5, 0.5);
}

// Create player projectile
let playerProjectileMesh;

function createPlayerProjectile(){
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 'violet', wireframe: false });
    
    playerProjectileMesh = new THREE.Mesh(geometry, material);

    playerProjectileMesh.position.set(0, 1, -2);
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


// Window handler
function windowListenerHandler(){
    window.addEventListener('keydown', (e) => {
        if(e.repeat) return;
        playerControls[e.code] = true;
    })
    
    window.addEventListener('keyup', (e) => {
        playerControls[e.code] = false;
        playerShooted = false;
    })
}

function control(){
    // Right
    if((playerControls['KeyA'] || playerControls['ArrowLeft']) && brumbalModel.position.x <= 14){
        let xPos = Math.sin(gameCamera.rotation.y + Math.PI / 2) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y + Math.PI / 2) * player.speed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
    }

    // Left
    if((playerControls['KeyD'] || playerControls['ArrowRight']) && brumbalModel.position.x >= -14){
        let xPos = Math.sin(gameCamera.rotation.y - Math.PI / 2) * player.speed;
        let zPos = -Math.cos(gameCamera.rotation.y - Math.PI / 2) * player.speed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
    }

    if(playerControls["Space"] && !playerShooted){
        playerShoot();
        playerShooted = true;
    }
}

function playerShoot(){
    let projectileMeshClone = playerProjectileMesh.clone();

    projectileMeshClone.position.x = brumbalModel.position.x;
    projectileMeshClone.position.y = brumbalModel.position.y;
    projectileMeshClone.position.z = brumbalModel.position.z;

    gameScene.add(projectileMeshClone);

    playerProjectiles.push(projectileMeshClone);
}


// Function to move projectiles
function updatePlayerProjectiles(){
    playerProjectiles.forEach((projectile, index) => {
        projectile.position.z += 0.5;

        if(projectile.position.z >= 0){
            gameScene.remove(projectile);

            playerProjectiles.splice(index, 1);
        }
    })
}

// Function to check collision
function checkPlayerCollision(){
    playerProjectiles.forEach((projectile, index) => {
        if(
            voldemortModel.position.x >= projectile.position.x - 1 &&
            voldemortModel.position.x <= projectile.position.x + 1 &&
            voldemortModel.position.z >= projectile.position.z - 1 &&
            voldemortModel.position.z <= projectile.position.z + 1
        ){
            gameScore -= 10;
            gameScoreText.innerText = gameScore;

            gameScene.remove(projectile);
            playerProjectiles.splice(index, 1);

            if(gameScore <= 0){
                playerWin();
            }
        }
    })
}


// If player win the match
function playerWin(){
    gameSection.classList.add('playerWin');
}



function updatePlayer(){
    control();
    updatePlayerProjectiles();
    checkPlayerCollision();
}


// Update voldemort position
let voldemortInterval = 1000;

function voldemortRandomPos(){
    setInterval(() => {
        let newCoords = generateRandomCoord(-12, 12);

        console.log(newCoords);

        gsap.to(voldemortModel.position, {
            duration: 0.4,
            x: newCoords
        })
    }, voldemortInterval);
}

function generateRandomCoord(min, max){
    return Math.floor((Math.random() * (max - min + 1)) + min);
}




// GAME CONTROLS
let stats;
function gameControlsInit(){
    // gameControls.enabled = false;

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