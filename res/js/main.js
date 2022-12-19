import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from "gsap";
import createScene from "./createScene";
import Stats from 'three/examples/jsm/libs/stats.module';
import { CustomEase } from "gsap/all";

gsap.registerPlugin(CustomEase);


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

let houseObject,
    boardObject,
    brumbalObject;

let homeRaycaster = new THREE.Raycaster();
let homeMouse = new THREE.Vector2();

let mixer, clock;
let brumbalAnimation = true;

let houseModels = [];


// THREE INIT
let controlsVar;
homeSceneInit();

async function homeSceneInit(){
    homeScene = new THREE.Scene();
    const sceneBackgroundTexture = new THREE.TextureLoader().load('/images/homeSceneBg.jpg');
    homeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    homeRenderer = new THREE.WebGLRenderer({ antialias: true });

    createScene(homeScene, sceneBackgroundTexture, homeCamera, [6.5, 2, 0.5], homeRenderer, [5, 50, 50], homeParent);
    
    controlsVar = new OrbitControls(homeCamera, homeRenderer.domElement);

    clock = new THREE.Clock();

    // Functions
    await importHouseModel();
    await importBoardModel();
    await importBrumbalModel();

    // Change transparent, delete book and text
    updateHomeModel();
    setBoardPosition();

    controlsFunction();

    bodyMouseMove();
    animate();

    homeRenderer.domElement.addEventListener('click', handleHomeClick, false);
}


// Import house model
async function importHouseModel(){
    const houseGLTF = await gltfLoader.loadAsync('/models/house.glb');
    houseObject = houseGLTF.scene;

    homeScene.add(houseObject);
    houseModels.push(houseObject);
}

// Import board model
async function importBoardModel(){
    const boardGLTF = await gltfLoader.loadAsync('/models/board.glb');
    boardObject = boardGLTF.scene;

    homeScene.add(boardObject);
}

// Import brumbals model
async function importBrumbalModel(){
    const brumbalGLTF = await gltfLoader.loadAsync('/models/animated-brumbal.glb');
    brumbalObject = brumbalGLTF.scene;

    homeScene.add(brumbalObject);
    houseModels.push(homeScene);

    brumbalObject.traverse(function(object) {
        object.frustumCulled  = false;
    })

    // mixer = new THREE.AnimationMixer(brumbalObject);

    // brumbalGLTF.animations.forEach((clip) => {
    //     mixer.clipAction(clip).play();
    // })
}

// SET BOARD
function setBoardPosition(){
    boardObject.position.set(1, 1, 200);

    boardObject.rotation.y = Math.PI / 2;
}



// Change house model transparent, delete book
let bookCoverMesh;
let bookTextMesh;
let bookParent;
let doorTextMesh;
let doorTextParent;
let arsenalTextMesh;
let arsenalTextParent;
let cauldronTextMesh;
let cauldronTextParent;

let activeZoomIn = false;


function updateHomeModel(){
    // TODO - mesh.parent.name - smaze cely mesh (asi)

    // Book cover
    bookCoverMesh = deleteMeshFromHouse(bookCoverMesh, "Book_Open_Vocabulary_1");

    bookParent = bookCoverMesh.parent;
    bookParent.remove(bookCoverMesh);

    // Book text
    bookTextMesh = deleteMeshFromHouse(bookTextMesh, "Book_Open_Vocabulary_2");

    bookParent.remove(bookTextMesh);

    // Door Text
    doorTextMesh = deleteMeshFromHouse(doorTextMesh, "Brick_Door_7");

    doorTextParent = doorTextMesh.parent;
    doorTextParent.remove(doorTextMesh);

    // Arsenal Text
    arsenalTextMesh = deleteMeshFromHouse(arsenalTextMesh, "Arsenal_Change_10");

    arsenalTextParent = arsenalTextMesh.parent;
    arsenalTextParent.remove(arsenalTextMesh);

    // Heal Cauldron Text
    cauldronTextMesh = deleteMeshFromHouse(cauldronTextMesh, "Heal_Cauldron_2");

    cauldronTextParent = cauldronTextMesh.parent;
    cauldronTextParent.remove(cauldronTextMesh);
}

function deleteMeshFromHouse(variable, meshObjectName){
    variable = houseObject.getObjectByName(meshObjectName);
    variable.material.transparent = true;
    variable.material.depthWrite = false;
    variable.material.opacity = 0;

    return variable;
}


// Mooving house on cursor move
let moveY,
    moveZ;

function bodyMouseMove(){
    document.body.addEventListener('mousemove', (e) => {
        moveY = ((e.screenX / window.innerWidth) / 8) - 0.1;
        moveZ = ((e.screenY / window.innerHeight) / -6) + 0.1;

        if(!activeZoomIn){
            houseObject.rotation.y = moveY;
            houseObject.rotation.z = moveZ;

            brumbalObject.rotation.y = moveY;
            brumbalObject.rotation.z = moveZ;
        }
    })
}


// HOME ONCLICK
let activeVocabulary = false;
let activeDoor = false;
let activeArsenal = false;
let activeCauldron = false;
let activeBrumbal = false;

let activeBoard = false;

let runningCameraAnimation = false;


checkEscToResetCamera();

function handleHomeClick(e){
    e.preventDefault();

    homeMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    homeMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    homeRaycaster.setFromCamera(homeMouse, homeCamera);

    let intersects = homeRaycaster.intersectObjects(houseModels, true);

    console.log(houseModels);

    if(intersects.length > 0){
        let object = intersects[0].object;

        console.log(object);

        intersects.forEach((intersect) => {
            console.log(intersect.object.name);
        })

        // ACTIVE
        // if(runningCameraAnimation) return;
        
        // if(activeVocabulary) activeVocabularyHandler(object);
        // if(activeDoor) activeDoorHandler(object);
        // if(activeArsenal) activeArsenalHandler(object);
        // if(activeCauldron) activeCauldronHandler(object);
        // if(activeBrumbal) activeBrumbalHandler(object);

    
        // // Vocabulary table
        // else if(object.name.includes('Vocabulary_Table_')){
        //     console.log('Table');

        //     activeVocabulary = true;
        //     runningCameraAnimation = true;
        //     activeZoomIn = true;

        //     // Change camera position
        //     resetHouseModelRotation();

        //     gsap.to(homeCamera.position, {
        //         duration: 1,
        //         x: 2.927868438389019,
        //         y: 0.7513829103299781,
        //         z: 2.872406515072331
        //     })

        //     gsap.to(controlsVar.target, {
        //         duration: 1,
        //         x: 0.5699371461463288,
        //         y: -0.6995119320075021,
        //         z: 3.390770266589537,
        //         onComplete: function(){
        //             runningCameraAnimation = false;

        //             // Add book cover
        //             bookParent.add(bookCoverMesh);
        //             gsap.to(bookCoverMesh.material, {
        //                 duration: 0.8,
        //                 opacity: 1
        //             })
    
        //             // Add book text
        //             bookParent.add(bookTextMesh);
        //             gsap.to(bookTextMesh.material, {
        //                 duration: 0.8,
        //                 opacity: 1
        //             })
        //         }
        //     })
        // }

        // // Doors
        // else if(object.name.includes('Brick_Door_')){
        //     console.log('Door');

        //     activeDoor = true;
        //     runningCameraAnimation = true;
        //     activeZoomIn = true;

        //     // Change Camera position
        //     resetHouseModelRotation();

        //     gsap.to(homeCamera.position, {
        //         duration: 1,
        //         x: 1.8561061250509379,
        //         y: 0.8746107905845485,
        //         z: 0.32270146302434405
        //     })

        //     gsap.to(controlsVar.target, {
        //         duration: 1,
        //         x: -0.23839009429976987,
        //         y: 0.79998877865599,
        //         z: 0.3056575530841469,
        //         onComplete: function(){
        //             runningCameraAnimation = false;

        //             // Add door text
        //             doorTextParent.add(doorTextMesh);
        
        //             gsap.to(doorTextMesh.material, {
        //                 duration: 0.5,
        //                 opacity: 1
        //             })
        //         }
        //     })
        // }

        // // Arsenal
        // else if(object.name.includes('Arsenal_Change_')){
        //     console.log('Arsenal');

        //     activeArsenal = true;
        //     runningCameraAnimation = true;
        //     activeZoomIn = true;

        //     // Change camera position
        //     resetHouseModelRotation();

        //     gsap.to(homeCamera.position, {
        //         duration: 1,
        //         x: 2.727204473525794,
        //         y: 0.4604903396870391,
        //         z: -0.4367519428174377
        //     })
            
        //     gsap.to(controlsVar.target, {
        //         duration: 1,
        //         x: 0.09592168431359922,
        //         y: -0.17092384230219762,
        //         z: -0.556754032928711,
        //         onComplete: function(){
        //             runningCameraAnimation = false;

        //             // Add arsenal text
        //             arsenalTextParent.add(arsenalTextMesh);
        
        //             gsap.to(arsenalTextMesh.material, {
        //                 duration: 0.4,
        //                 opacity: 1
        //             })
        //         }
        //     })
        // }

        // // Cauldron
        // else if(object.name.includes('Heal_Cauldron')){
        //     console.log('Cauldron');

        //     activeCauldron = true;
        //     runningCameraAnimation = true;
        //     activeZoomIn = true;

        //     // Change Camera position
        //     resetHouseModelRotation();

        //     gsap.to(homeCamera.position, {
        //         duration: 1,
        //         x: 1.5537442158098573,
        //         y: 0.8886614372300705,
        //         z: -2.6065596795355184
        //     })

        //     gsap.to(controlsVar.target, {
        //         duration: 1,
        //         x: 0.25032504389107,
        //         y: 0.31893320797489727,
        //         z: -3.1983261882632883,
        //         onComplete: function(){
        //             runningCameraAnimation = false;

        //             // Add Cauldron text
        //             cauldronTextParent.add(cauldronTextMesh);

        //             gsap.to(cauldronTextMesh.material, {
        //                 duration: 0.4,
        //                 opacity: 1
        //             })
        //         }
        //     })
        // }

        // else if(object.name.includes('dumbledore_static_')){
        //     console.log('clicked on brumbal');

        //     activeBrumbal = true;
        //     runningCameraAnimation = true;
        //     activeZoomIn = true;

        //     resetHouseModelRotation();

        //     gsap.to(homeCamera.position, {
        //         duration: 1,
        //         x: 4.874892640511396,
        //         y: 0.2099456278851775,
        //         z: 1.0869296968530078
        //     })

        //     gsap.to(controlsVar.target, {
        //         duration: 1,
        //         x: 0.24827091173492438,
        //         y: 0.18892668074835495,
        //         z: -0.040375102900077474,
        //         onComplete: function(){
        //             runningCameraAnimation = false;

        //             // Add options to select battle from top / third person view
        //         }
        //     })
        // }
    }
    else{
        resetCameraAndDelete();
    }
}


// Active Vocabulary handler
function activeVocabularyHandler(object){
    if(object.name.includes('Vocabulary_Table_')) return;
    else if(object.name.includes('Book_Open_Vocabulary_')){
        moveCameraToBoard();
    }
    else{
        resetCameraAndDelete();
    }
}

// Active door handler
function activeDoorHandler(object){
    if(object.name.includes("Brick_Door_")){
        console.log('clicked on door');
    }
    else{
        resetCameraAndDelete();
    }
}

// Function arsenal handler
function activeArsenalHandler(object){
    if(object.name.includes("Arsenal_Change_")){
        console.log('Clicked on arsenal');
    }
    else{
        resetCameraAndDelete();
    }
}

// Function Cauldron handler
function activeCauldronHandler(object){
    if(object.name.includes("Heal_Cauldron_")){
        console.log("clicled on cauldron");
    }
    else{
        resetCameraAndDelete();
    }
}

// Function Brumbal handler
function activeBrumbalHandler(object){
    if(object.name.includes('dumbledore_static_')) return;
    else{
        resetCameraAndDelete();
    }
}



// Reset house model rotation
function resetHouseModelRotation(){
    gsap.to(houseObject.rotation, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0
    })
}


// Helpers
function checkEscToResetCamera(){
    window.addEventListener('keydown', (e) => {
        if(e.code === "Escape") resetCameraAndDelete();
    })
}

function resetCameraAndDelete(){
    if(activeVocabulary || activeDoor || activeArsenal || activeCauldron || activeBoard || activeBrumbal){
        // Delete all animations
        gsap.globalTimeline.clear();
        runningCameraAnimation = false;
    
        if(activeVocabulary){
            activeVocabulary = false;
            resetHomeCamera();
            bookDelete();
        }
        else if(activeDoor){
            activeDoor = false;
            resetHomeCamera();
            homeMeshTextDelete(doorTextMesh, doorTextParent);
        }
        else if(activeArsenal){
            activeArsenal = false;
            resetHomeCamera();
            homeMeshTextDelete(arsenalTextMesh, arsenalTextParent);
        }
        else if(activeCauldron){
            activeCauldron = false;
            resetHomeCamera();
            homeMeshTextDelete(cauldronTextMesh, cauldronTextParent);
        }
        else if(activeBoard){
            activeBoard = false;
            resetHomeCameraFromBoard();
        }
        else if(activeBrumbal){
            activeBrumbal = false;
            resetHomeCamera();
        }
    }
}

function bookDelete(){
    gsap.to(bookCoverMesh.material, {
        duration: 0.5,
        opacity: 0
    })
    
    // Add book text
    gsap.to(bookTextMesh.material, {
        duration: 0.5,
        opacity: 0,
        onComplete: function(){
            bookParent.remove(bookCoverMesh);
            bookParent.remove(bookTextMesh);
        }
    })
}

function homeMeshTextDelete(deleteMesh, deleteParent,){
    gsap.to(deleteMesh.material, {
        duration: 0.3,
        opacity: 0,
        onComplete: function(){
            deleteParent.remove(deleteMesh);
        }
    })
}


// Function to reset home camera settings
function resetHomeCamera(){
    gsap.to(homeCamera.position, {
        duration: 1,
        ease: "slow(0.7, 0.7, false)",
        x: 6.5,
        y: 2,
        z: 0.5
    })

    gsap.to(controlsVar.target, {
        duration: 1,
        ease: "slow(0.7, 0.7, false)",
        x: 0,
        y: 0,
        z: 0,
    })
    gsap.to(houseObject.rotation, {
        duration: 1,
        ease: "slow(0.1, 0.1, false)",
        y: moveY,
        z: moveZ,
    })
    activeZoomIn = false;
}

// Function to reset camera after escape from board view
function resetHomeCameraFromBoard(){
    boardContainer.style.animation = "fadeOut 300ms ease-in-out forwards";

    setTimeout(() => {
        gsap.to(homeCamera.position, {
            duration: 1,
            ease: CustomEase.create("custom", "M0,0 C0.334,0.206 0.458,0.294 0.6,0.4 0.852,0.588 0.986,0.724 1,1 "),
            x: 137,
            y: 2.2,
            z: 200,
            onComplete: function(){
                gsap.to(homeCamera.position, {
                    duration: 1,
                    ease: "slow(0.7, 0.7, false)",
                    x: 6.5,
                    y: 2,
                    z: 0.5
                })
            
                gsap.to(controlsVar.target, {
                    duration: 1,
                    ease: "slow(0.7, 0.7, false)",
                    x: 0,
                    y: 0,
                    z: 0,
                })

                gsap.to(houseObject.rotation, {
                    duration: 1,
                    ease: "slow(0.1, 0.1, false)",
                    y: moveY,
                    z: moveZ,
                })
            }
        })
    }, 300);

    activeZoomIn = false;
}



// Function to move with camera to board
const boardContainer = document.querySelector('.board');

function moveCameraToBoard(){
    activeVocabulary = false;

    gsap.to(homeCamera.position, {
        duration: 1.2,
        ease: "slow(0.1, 0.1, false)",
        x: 300,
        y: 90,
        z: 90,
        onComplete: function(){
            setTimeout(() => {
                gsap.to(homeCamera.position, {
                    duration: 1,
                    x: 10.434322404717985,
                    y: 0.9501287216120705,
                    z: 199.88687450682315
                })
                
                gsap.to(controlsVar.target, {
                    duration: 1,
                    x: -13.230311967635739,
                    y: 0.7191299825715989,
                    z: 199.79114296912672,
                    onComplete: function(){
                        boardContainer.style.animation = "fadeIn 300ms ease-in-out forwards 30ms";

                        setTimeout(() => {
                            activeBoard = true;
                        }, 330);
                    }
                })
            }, 50);

            bookDelete();
        }
    })
}



// ANIMATE
function animate(){
    stats.begin();

    homeRenderer.render(homeScene, homeCamera);
    controlsVar.update();

    let delta = clock.getDelta();
    if(mixer) mixer.update(delta);

    requestAnimationFrame(animate);

    stats.end();
}


// HOME CONTROLS
let stats;

function controlsFunction(){
    controlsVar.enabled = false;
    
    // controlsVar.addEventListener('change', () => {
    //     console.log(homeCamera.position);
    //     console.log('target (lookAt)');
    //     console.log(controlsVar.target);
    // })
    
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