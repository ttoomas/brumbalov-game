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

let moovingCamera,
    slowMoovingCamera;

let endGameAnimationFrame = false;

// Things that can change for upgrades
let shootIntervalTime = 500;        // Player shoot timout - UPGRADE
let voldemortMoveInterval = 2000;   // Voldemort automove time
let voldemortShootIntervalTime = 1000;  // Voldemort shoot interval - UPGRADE

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

let playerHealthOnStart = 30; // 10 - 9 = 1 / 10 = 0.1      // Player health - UPGRADE
let voldemortHealthOnStart = 20; // 20 - 19 = 1 / 20 = 0.05   // Voldemort health - UPGRADE

let playerHealth,
    voldemortHealth,
    voldemortCurrCoords;

// Battle mode variables
let battleModeCameraPos,
    battleModeCameraLook,
    battleModeBrumbalScale;


// INIT
initGame();

async function initGame(){
    gameScene = new THREE.Scene();
    const gameSceneBackgroundTexture = new THREE.Color(0x313131);
    gameCamera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    gameRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(gameScene, gameSceneBackgroundTexture, gameCamera, [0, 0, 0], gameRenderer, [0, 5, -20], gameParent);

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
    // startGame('top-view');
}



// FUNCTION TO START THE GAME
export function startGame(gameModeType){
    // Reset game variables etc.
    resetGame();


    // Set game mode variables
    switch(gameModeType){
        case "top-view": {
            // Top view mode
            battleModeCameraPos = new THREE.Vector3(0, 25, -Math.PI * 4);
            battleModeCameraLook = new THREE.Vector3(0, 0, 0);
            battleModeBrumbalScale = 1;

            moovingCamera = true;
            slowMoovingCamera = true;

            break;
        }
        case "ovm-view": {
            // OverHead view mode
            battleModeCameraPos = new THREE.Vector3(0, 8.5, -18);
            battleModeCameraLook = new THREE.Vector3(0, player.height, -5);
            battleModeBrumbalScale = 0.75;

            moovingCamera = true;
            slowMoovingCamera = false
            
            break;
        }
        case "tps-view": {
            // Third person view mode
            battleModeCameraPos = new THREE.Vector3(0, player.height, -13);
            battleModeCameraLook = new THREE.Vector3(0, player.height, 0);
            battleModeBrumbalScale = 0.5;

            moovingCamera = true;
            slowMoovingCamera = false

            break;
        }
        default: {
            console.error('No battle mode like this (we are in game)');
        }
    }

    // Set variables into game
    gameCamera.position.set(battleModeCameraPos.x, battleModeCameraPos.y, battleModeCameraPos.z);
    gameCamera.lookAt(battleModeCameraLook.x, battleModeCameraLook.y, battleModeCameraLook.z);

    brumbalModel.scale.set(battleModeBrumbalScale, battleModeBrumbalScale, battleModeBrumbalScale);


    // START the game
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
    gameStarted = false;
    endGameAnimationFrame = true;

    clearInterval(playerProjectileInterval);
    clearInterval(voldemortPosInterval);
    clearInterval(voldemortShootInterval);
    clearInterval(updateVoldemortProjectilesInterval);
    clearInterval(shootInterval);
}


// FUNCTION TO RESET THE GAME
function resetGame(){
    // Reset positions
    brumbalModel.position.set(0, 0, -12);

    voldemortCurrCoords = generateRandomCoord(-12, 12);
    voldemortModel.position.set(voldemortCurrCoords, 0, 0);

    // Reset health bars
    playerHealth = playerHealthOnStart;
    voldemortHealth = voldemortHealthOnStart;

    console.log(voldemortHealth);

    brumbalHealthBar.style.width = 100 + '%';

    voldemortHealthBar.scale.x = 1;

    voldemortHealthGroup.position.set(voldemortCurrCoords, 4, 0);
    voldemortHealthBar.position.x = 0;

    voldemortBarScale = 1;
    brumbalBarScale = 1;

    // Reset animation frame
    endGameAnimationFrame = false;

    // Reset projectiles
    voldemortProjectiles.forEach((projectile) => {
        gameScene.remove(projectile);
    })

    playerProjectiles.forEach((projectile) => {
        gameScene.remove(projectile);
    })
    
    voldemortProjectiles = [];
    playerProjectiles = [];

    // Reset player moovements
    playerControls = {};
}



// Import voldemort model
let voldemortModel;

async function importVoldemortModel(){
    const voldemortGLTF = await gltfLoader.loadAsync('/models/voldemort.glb');
    voldemortModel = voldemortGLTF.scene;
    
    gameScene.add(voldemortModel);

    voldemortCurrCoords = generateRandomCoord(-12, 12);

    voldemortModel.scale.set(0.3, 0.3, 0.3);
    voldemortModel.position.set(voldemortCurrCoords, 0, 0);
    voldemortModel.rotation.y = Math.PI;
}

// Import brumbal model
let brumbalModel;

async function importBrumbalModel(){
    const brumbalGLTF = await gltfLoader.loadAsync('/models/brumbal.glb');
    brumbalModel = brumbalGLTF.scene;

    gameScene.add(brumbalModel);

    brumbalModel.position.set(0, 0, -12);
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
let voldemortHealthBar,
    voldemortHealthGroup;

function createVoldemortHealth(){
    const geometry = new THREE.BoxGeometry(3, 0.7, 0.25);
    const redMaterial = new THREE.MeshPhongMaterial({ color: "red", wireframe: false });
    const greenMaterial = new THREE.MeshPhongMaterial({ color: "green", wireframe: false });

    const voldemortHealthBarBg = new THREE.Mesh(geometry, redMaterial);
    voldemortHealthBar = new THREE.Mesh(geometry, greenMaterial);

    voldemortHealthGroup = new THREE.Group();

    voldemortHealthGroup.add(voldemortHealthBarBg);
    voldemortHealthGroup.add(voldemortHealthBar);
    
    voldemortHealthGroup.position.set(voldemortCurrCoords, 4, 0);
    
    gameScene.add(voldemortHealthGroup);

    // voldemortHealthBar.scale.setX(0.1);
    // voldemortHealthBar.position.setX((3 / 2 * 0.1) - 1.5);
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

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
        
        if(moovingCamera && !slowMoovingCamera){
            gameCamera.position.x += xPos;
            gameCamera.position.z += zPos;
        }
        // Slow camera moovement
        else if(moovingCamera && slowMoovingCamera){
            gameCamera.position.x += xPos / 2.5;
            gameCamera.position.z += zPos / 2.5;
        }
    }

    // Left
    if((playerControls['KeyD'] || playerControls['ArrowRight']) && brumbalModel.position.x >= -14){
        let xPos = Math.sin(gameCamera.rotation.y - Math.PI / 2) * player.sideSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y - Math.PI / 2) * player.sideSpeed;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
        
        if(moovingCamera && !slowMoovingCamera){
            gameCamera.position.x += xPos;
            gameCamera.position.z += zPos;
        }
        // Slow camera moovement
        else if(moovingCamera && slowMoovingCamera){
            gameCamera.position.x += xPos / 2.5;
            gameCamera.position.z += zPos / 2.5;
        }
    }

    // Move Front
    if((playerControls['KeyW'] || playerControls['ArrowUp']) && brumbalModel.position.z <= -10){
        let xPos = Math.sin(gameCamera.rotation.y) * player.frontSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.frontSpeed;

        brumbalModel.position.x -= xPos;
        brumbalModel.position.z -= zPos;
        
        if(moovingCamera && !slowMoovingCamera){
            gameCamera.position.x -= xPos;
            gameCamera.position.z -= zPos;
        }
        // Slow camera moovement
        else if(moovingCamera && slowMoovingCamera){
            gameCamera.position.x -= xPos / 2.5;
            gameCamera.position.z -= zPos / 2.5;
        }
    }   

    // Move Back
    if((playerControls['KeyS'] || playerControls['ArrowDown']) && brumbalModel.position.z >= -14){
        let xPos = Math.sin(gameCamera.rotation.y) * player.frontSpeed;
        let zPos = -Math.cos(gameCamera.rotation.y) * player.frontSpeed;

        brumbalModel.position.x += xPos;
        brumbalModel.position.z += zPos;
        
        if(moovingCamera && !slowMoovingCamera){
            gameCamera.position.x += xPos;
            gameCamera.position.z += zPos;
        }
        // Slow camera moovement
        else if(moovingCamera && slowMoovingCamera){
            gameCamera.position.x += xPos / 2.5;
            gameCamera.position.z += zPos / 2.5;
        }
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
let healthBarMoovingAnimation;

function checkVoldemortCollision(){
    playerProjectiles.forEach((projectile, index) => {
        if(
            voldemortModel.position.x >= projectile.position.x - 1 &&
            voldemortModel.position.x <= projectile.position.x + 1 &&
            voldemortModel.position.z >= projectile.position.z - 1 &&
            voldemortModel.position.z <= projectile.position.z + 1
        ){
            voldemortHealth -= 1;
            voldemortHealthText.innerText = voldemortHealth;

            // Update health bar
            voldemortBarScale -= (1 / voldemortHealthOnStart);

            gsap.to(voldemortHealthBar.scale, {
                duration: 0.25,
                x: voldemortBarScale
            })

            healthBarMoovingAnimation = gsap.to(voldemortHealthBar.position, {
                duration: 0.25,
                x: ((3 / 2 * voldemortBarScale) - 1.5)
            })

            console.log(voldemortHealth);

            // Remove projectile from screen
            gameScene.remove(projectile);
            playerProjectiles.splice(index, 1);

            if(voldemortHealth <= 0){
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
        voldemortCurrCoords = generateRandomCoord(-12, 12);

        gsap.to(voldemortModel.position, {
            duration: 0.8,
            x: voldemortCurrCoords
        })

        gsap.to(voldemortHealthGroup.position, {
            duration: 0.8,
            x: voldemortCurrCoords
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
            playerHealth -= 1;
            playerHealthText.innerText = playerHealth;

            gameScene.remove(projectile);
            voldemortProjectiles.splice(index, 1);

            // HealthBar
            brumbalBarScale -= (1 / playerHealthOnStart);

            brumbalHealthBar.style.width = (brumbalBarScale * 100) + '%';
            
            console.log(playerHealth);


            if(playerHealth <= 0){
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
    // End animation frame
    if(endGameAnimationFrame){
        cancelAnimationFrame(animateRequestFrame);
        return;
    }


    // Update game
    stats.begin();

    gameRenderer.render(gameScene, gameCamera);

    updatePlayer();

    animateRequestFrame = requestAnimationFrame(animate);

    stats.end();
}