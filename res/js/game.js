import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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

let voldemortProjectiles = [];


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
const playerHealthText = document.querySelector('.game__playerHealth');
const voldemortHealthText = document.querySelector('.game__voldemortHealth');

let playerHealth = 100;
let voldemortHealth = 100;


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

    await createPlayerProjectile();

    createVoldemortProjectile();

    createPlane();

    windowListenerHandler();
    
    gameControlsInit();
    voldemortShoot();
    
    updatePlayerProjectiles();
    updateVoldemortProjectiles();

    voldemortRandomPos();

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

async function createPlayerProjectile(){
    const playerProjectileGLTF = await gltfLoader.loadAsync('/models/fireball.glb');
    playerProjectileMesh = playerProjectileGLTF.scene;

    playerProjectileMesh.position.set(0, 0.5, 0);
    playerProjectileMesh.scale.set(0.04, 0.04, 0.04);
}

// Create voldemrot projectile
let voldemortProjectileMesh;

function createVoldemortProjectile(){
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: "violet", wireframe: false });

    voldemortProjectileMesh = new THREE.Mesh(geometry, material);

    voldemortProjectileMesh.position.set(0, 0.5, -3);
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


// PLAYER
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

// Control player keyboard
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
    projectileMeshClone.position.z = brumbalModel.position.z + 0.5;

    gameScene.add(projectileMeshClone);

    playerProjectiles.push(projectileMeshClone);
}


// Function to move projectiles
function updatePlayerProjectiles(){
    setInterval(() => {
        playerProjectiles.forEach((projectile, index) => {
            projectile.position.z += 0.5;
            projectile.position.y += 0.06;

            projectile.rotation.x += 0.1;
            projectile.rotation.y += 0.1;
            projectile.rotation.z += 0.1;
    
            if(projectile.position.z >= 0){
                gameScene.remove(projectile);
    
                playerProjectiles.splice(index, 1);
            }
        })
    }, 10);
}

// Function to check collision
function checkVoldemortCollision(){
    playerProjectiles.forEach((projectile, index) => {
        if(
            voldemortModel.position.x >= projectile.position.x - 1 &&
            voldemortModel.position.x <= projectile.position.x + 1 &&
            voldemortModel.position.z >= projectile.position.z - 1 &&
            voldemortModel.position.z <= projectile.position.z + 1
        ){
            playerHealth -= 10;
            playerHealthText.innerText = playerHealth;

            gameScene.remove(projectile);
            playerProjectiles.splice(index, 1);

            if(playerHealth <= 0){
                playerWin();
            }
        }
    })
}


// If player win the match
function playerWin(){
    gameSection.classList.add('playerWin');
}



// VOLDEMORT
// Update voldemort position
let voldemortMoveInterval = 2000;

function voldemortRandomPos(){
    setInterval(() => {
        let newCoords = generateRandomCoord(-12, 12);

        console.log(newCoords);

        gsap.to(voldemortModel.position, {
            duration: 0.8,
            x: newCoords
        })
    }, voldemortMoveInterval);
}

function generateRandomCoord(min, max){
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

// Voldemort shooting
let voldemortShootInterval = 1000;

function voldemortShoot(){
    setInterval(() => {
        let projectileMeshClone = voldemortProjectileMesh.clone();

        projectileMeshClone.position.x = voldemortModel.position.x;
        projectileMeshClone.position.z = voldemortModel.position.z;

        gameScene.add(projectileMeshClone);

        voldemortProjectiles.push(projectileMeshClone);
    }, voldemortShootInterval);
}

// Moove with projectiles
function updateVoldemortProjectiles(){
    setInterval(() => {
        voldemortProjectiles.forEach((projectile, index) => {
            projectile.position.z -= 0.5;

            if(projectile.position.z <= -14){
                gameScene.remove(projectile);

                voldemortProjectiles.splice(index, 1);
            }
        })
    }, 10);
}

function checkPlayerCollision(){
    voldemortProjectiles.forEach((projectile, index) => {
        if(
            brumbalModel.position.x >= projectile.position.x - 1 &&
            brumbalModel.position.x <= projectile.position.x + 1 &&
            brumbalModel.position.z >= projectile.position.z - 1 &&
            brumbalModel.position.z <= projectile.position.z + 1
        ){
            voldemortHealth -= 10;
            voldemortHealthText.innerText = voldemortHealth;

            gameScene.remove(projectile);
            voldemortProjectiles.splice(index, 1);

            if(voldemortHealth <= 0){
                voldemortWin();
            }
        }
    })
}


// If voldemort win
function voldemortWin(){
    gameSection.classList.add('voldemortWin');
}



function updatePlayer(){
    control();
    checkVoldemortCollision();
    checkPlayerCollision();
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