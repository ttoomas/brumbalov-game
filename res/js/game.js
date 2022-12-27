import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from "three/examples/jsm/libs/stats.module";
import createScene from "../helpers/createScene";
import gsap from "gsap";
import { switchGameScene } from "../helpers/switchGameScene.js";

// VARIABLES
const gameParent = document.getElementById('game');
const gotoHouseBtn = document.querySelector('.game__gotoHouseBtn');

let gameCamera, gameScene, gameRenderer;

const gltfLoader = new GLTFLoader();

let gameControls;
let gameStarted = false;

let animateRequestFrame;
let playerProjectileInterval;
let voldemortPosInterval;
let voldemortShootInterval;
let updateVoldemortProjectilesInterval;

let playerControls = {};

let playerProjectiles = [];
let playerShooted = false;
let playerCanShoot = true;

// Things that can change for upgrades
let shootIntervalTime = 500;        // Player shoot timout
let voldemortMoveInterval = 2000;   // Voldemort automove time
let voldemortShootIntervalTime = 1000;  // Voldemort shoot interval

let voldemortProjectiles = [];


let player = {
    height: 1.4,
    sideSpeed: 0.1,
    frontSpeed: 0.06
};

const gameSection = document.querySelector('.gameSection');
const playerHealthText = document.querySelector('.game__playerHealth');
const voldemortHealthText = document.querySelector('.game__voldemortHealth');

const brumbalHealthBar = document.querySelector('.brumbal__healthBar');

let playerHealth = 100;
let voldemortHealth = 100;


// INIT
initGame();

async function initGame(){
    gameScene = new THREE.Scene();
    // const gameSceneBackgroundTexture = new THREE.TextureLoader().load('/images/library.png');
    const gameSceneBackgroundTexture = new THREE.Color(0x313131);
    gameCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(gameScene, gameSceneBackgroundTexture, gameCamera, [0, player.height, -13], gameRenderer, [0, 5, -20], gameParent);

    gameCamera.lookAt(new THREE.Vector3(0, player.height, 0));

    gameControls = new OrbitControls(gameCamera, gameRenderer.domElement);


    // Functions
    await importVoldemortModel();
    await importBrumbalModel();

    await createPlayerProjectile();
    await createVoldemortProjectile();

    createPlane();

    createVoldemortHealth();

    windowListenerHandler();
    gameControlsInit();

    gameRenderer.render(gameScene, gameCamera);

    // Just start game
    // startGame();
}



// FUNCTION TO START THE GAME
export function startGame(){
    playerCanShoot = true;
    gameStarted = true;

    voldemortShoot();

    updatePlayerProjectiles();
    updateVoldemortProjectiles();

    // voldemortRandomPos();

    animate();
}

// FUNCTION TO END THE GAME
function endGame(){
    cancelAnimationFrame(animateRequestFrame);

    gameStarted = false;

    clearInterval(playerProjectileInterval);
    clearInterval(voldemortPosInterval);
    clearInterval(voldemortShootInterval);
    clearInterval(updateVoldemortProjectilesInterval);
    clearInterval(shootInterval);
}


// Import voldemort model
let voldemortModel;
let voldemortInitialCoords;

async function importVoldemortModel(){
    const voldemortGLTF = await gltfLoader.loadAsync('/models/voldemort.glb');
    voldemortModel = voldemortGLTF.scene;
    
    gameScene.add(voldemortModel);

    voldemortInitialCoords = generateRandomCoord(-12, 12);

    voldemortModel.scale.set(0.3, 0.3, 0.3);
    voldemortModel.position.set(voldemortInitialCoords, 0, 0);
    voldemortModel.rotation.y = Math.PI;
}

// Import brumbal model
let brumbalModel;

async function importBrumbalModel(){
    const brumbalGLTF = await gltfLoader.loadAsync('/models/brumbal.glb');
    brumbalModel = brumbalGLTF.scene;

    gameScene.add(brumbalModel);

    brumbalModel.position.set(0, 0, -12);
    brumbalModel.scale.set(0.5, 0.5, 0.5);
}

// Create player projectile
let playerProjectileMesh;

async function createPlayerProjectile(){
    const playerProjectileGLTF = await gltfLoader.loadAsync('/models/blue_beam.glb');
    playerProjectileMesh = playerProjectileGLTF.scene;

    playerProjectileMesh.position.set(0, 0.5, -5);
    playerProjectileMesh.scale.set(0.15, 0.15, 0.15);
    playerProjectileMesh.rotation.y = Math.PI;
    playerProjectileMesh.rotation.x = -0.05;
}

// Create voldemrot projectile
let voldemortProjectileMesh;

async function createVoldemortProjectile(){
    const voldemortProjectileGLTF = await gltfLoader.loadAsync('/models/red_beam.glb');
    voldemortProjectileMesh = voldemortProjectileGLTF.scene;

    voldemortProjectileMesh.position.set(0, 2, 0);
    voldemortProjectileMesh.scale.set(0.2, 0.2, 0.2);
    voldemortProjectileMesh.rotation.x = -0.25;
}


function createPlane(){
    const geometry = new THREE.PlaneGeometry(15, 10);
    // const material = new THREE.MeshPhongMaterial({ color: "black", wireframe: false });
    const texture = new THREE.TextureLoader().load('/images/library.png', () => {
        gameRenderer.render(gameScene, gameCamera);
    });
    const material = new THREE.MeshBasicMaterial({ map: texture });
    // const material = new THREE.MeshLambertMaterial({color: "orange", transparent: true, opacity: 0});

    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x -= Math.PI / 2;
    plane.scale.x = 3;
    plane.scale.y = 3;
    plane.receiveShadow = true;

    plane.rotation.z = Math.PI;

    gameScene.add(plane);
}


// HEALTH BARS
// Voldemort Health Bar
let voldemortHealthBarBg;
let voldemortHealthBar;

function createVoldemortHealth(){
    const geometry = new THREE.BoxGeometry(3, 0.7, 0.25);
    const material = new THREE.MeshPhongMaterial({ color: "red", wireframe: false });
    const healtMaterial = new THREE.MeshPhongMaterial({ color: "green", wireframe: false });

    voldemortHealthBarBg = new THREE.Mesh(geometry, material);

    voldemortHealthBarBg.position.set(voldemortInitialCoords, 4, 0);

    // Health bar
    voldemortHealthBar = new THREE.Mesh(geometry, healtMaterial);

    voldemortHealthBar.position.set(voldemortInitialCoords, 4, 0);
    voldemortHealthBar.scale.x = 1;

    gameScene.add(voldemortHealthBarBg);
    gameScene.add(voldemortHealthBar);

    // voldemortHealthBar.scale.x = 0.1;
    // voldemortHealthBar.position.x = (voldemortInitialCoords - 1.5) + (3 / 2 * 0.1);
}


// PLAYER
// Window handler
function windowListenerHandler(){
    window.addEventListener('keydown', (e) => {
        if(e.repeat || !gameStarted) return;

        playerControls[e.code] = true;
    })
    
    window.addEventListener('keyup', (e) => {
        if(!gameStarted) return;

        playerControls[e.code] = false;

        if(e.code === 'Space'){
            playerShooted = false;
        }
    })
}

// Control player keyboard
function control(){
    // Right
    if((playerControls['KeyA'] || playerControls['ArrowLeft']) && brumbalModel.position.x <= 14){
        let xPos = Math.sin(gameCamera.rotation.y + Math.PI / 2) * player.sideSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y + Math.PI / 2) * player.sideSpeed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
    }

    // Left
    if((playerControls['KeyD'] || playerControls['ArrowRight']) && brumbalModel.position.x >= -14){
        let xPos = Math.sin(gameCamera.rotation.y - Math.PI / 2) * player.sideSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y - Math.PI / 2) * player.sideSpeed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
    }

    // Move Front
    if((playerControls['KeyW'] || playerControls['ArrowUp']) && brumbalModel.position.z <= -10){
        let xPos = Math.sin(gameCamera.rotation.y) * player.frontSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.frontSpeed;

        gameCamera.position.x -= xPos;
        gameCamera.position.z -= zPos;

        brumbalModel.position.x -= xPos;
        brumbalModel.position.z -= zPos;
    }   

    // Move Back
    if((playerControls['KeyS'] || playerControls['ArrowDown']) && brumbalModel.position.z >= -14){
        let xPos = Math.sin(gameCamera.rotation.y) * player.frontSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.frontSpeed;

        gameCamera.position.x += xPos;
        gameCamera.position.z += zPos;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
    }

    if(playerControls["Space"] && !playerShooted && playerCanShoot){
        playerShoot();

        playerShooted = true;
        playerCanShoot = false;

        setShootInterval();
    }
}

function playerShoot(){
    let projectileMeshClone = playerProjectileMesh.clone();

    projectileMeshClone.position.x = brumbalModel.position.x;
    projectileMeshClone.position.z = brumbalModel.position.z + 0.5;

    gameScene.add(projectileMeshClone);

    playerProjectiles.push(projectileMeshClone);
}

// Set interval to prevent spamming
let shootInterval;

function setShootInterval(){
    clearInterval(shootInterval);

    shootInterval = setInterval(() => {
        playerCanShoot = true;
    }, shootIntervalTime);
}


// Function to move projectiles
function updatePlayerProjectiles(){
    playerProjectileInterval = setInterval(() => {
        playerProjectiles.forEach((projectile, index) => {
            projectile.position.z += 0.5;
            projectile.position.y += 0.06;

            projectile.scale.x += 0.005;
            projectile.scale.y += 0.005;
            projectile.scale.z += 0.005;
    
            if(projectile.position.z >= 0){
                gameScene.remove(projectile);
    
                playerProjectiles.splice(index, 1);
            }
        })
    }, 10);
}

// Function to check collision
let voldemortBarScale = 1;

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

            // Update health bar
            voldemortBarScale -= 0.1; // TODO - dont write it here

            gsap.to(voldemortHealthBar.scale, {
                duration: 0.25,
                x: voldemortBarScale
            })

            gsap.to(voldemortHealthBar.position, {
                duration: 0.25,
                x: (voldemortInitialCoords - 1.5) + (3 / 2 * voldemortBarScale)
            })

            // Remove projectile from screen
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
    endGame();

    gameSection.classList.add('playerWin', 'gameIsOver');
}



// VOLDEMORT
// Update voldemort position
function voldemortRandomPos(){
    voldemortPosInterval = setInterval(() => {
        let newCoords = generateRandomCoord(-12, 12);

        gsap.to(voldemortModel.position, {
            duration: 0.8,
            x: newCoords
        })
    }, voldemortMoveInterval);
}

function generateRandomCoord(min, max){
    return (Math.random() * (max - min + 1)) + min;
}


// Voldemort shooting
function voldemortShoot(){
    voldemortShootInterval = setInterval(() => {
        let projectileMeshClone = voldemortProjectileMesh.clone();

        projectileMeshClone.position.x = voldemortModel.position.x;
        projectileMeshClone.position.z = voldemortModel.position.z;

        gameScene.add(projectileMeshClone);

        voldemortProjectiles.push(projectileMeshClone);
    }, voldemortShootIntervalTime);
}

// Moove with projectiles
function updateVoldemortProjectiles(){
    updateVoldemortProjectilesInterval = setInterval(() => {
        voldemortProjectiles.forEach((projectile, index) => {
            projectile.position.z -= 0.5;
            projectile.position.y -= 0.05;

            projectile.scale.x -= 0.005;
            projectile.scale.y -= 0.005;
            projectile.scale.z -= 0.005;

            if(projectile.position.z <= -14){
                gameScene.remove(projectile);

                voldemortProjectiles.splice(index, 1);
            }
        })
    }, 10);
}

// Check player collision
let brumbalBarScale = 1;

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

            // HealthBar
            brumbalBarScale -= 0.1 // TODO - SAME AS VOLDEMORT

            brumbalHealthBar.animate(
                {
                    width: (100 * brumbalBarScale) + '%'
                },
                {
                    duration: 250,
                    fill: "forwards"
                }
            )
            // brumbalHealthBar.style.width = (100 * brumbalBarScale) + '%';


            if(voldemortHealth <= 0){
                voldemortWin();
            }
        }
    })
}


// If voldemort win
function voldemortWin(){
    endGame();

    gameSection.classList.add('voldemortWin', 'gameIsOver');
}



function updatePlayer(){
    control();
    checkVoldemortCollision();
    checkPlayerCollision();
}



// Go back to house screen
gotoHouseBtn.addEventListener('click', () => {
    if(!gameStarted){
        switchGameScene();
    }
})



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

    // const axesHelper = new THREE.AxesHelper(10);
    // gameScene.add(axesHelper);
}

// ANIMATE
function animate(){
    stats.begin();

    gameRenderer.render(gameScene, gameCamera);

    updatePlayer();

    animateRequestFrame = requestAnimationFrame(animate);

    stats.end();
}