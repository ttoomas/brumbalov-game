import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap, { Power3 } from "gsap";
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

    // Change transparent, delete book and text
    updateHomeModel();        

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

// Change house model transparent, delete book
let bookCoverMesh;
let bookTextMesh;
let bookParent;
let doorTextMesh;
let doorTextParent;
let arsenalTextMesh;
let arsenalTextParent;
let healCauldronTextMesh;
let healCauldronTextParent;

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
    healCauldronTextMesh = deleteMeshFromHouse(healCauldronTextMesh, "Heal_Cauldron_2");

    healCauldronTextParent = healCauldronTextMesh.parent;
    healCauldronTextParent.remove(healCauldronTextMesh);
}

function deleteMeshFromHouse(variable, meshObjectName){
    variable = houseObject.getObjectByName(meshObjectName);
    variable.material.transparent = true;
    variable.material.depthWrite = false;
    variable.material.opacity = 0;

    return variable;
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
let activeVocabulary = false;
let activeDoor = false;
let activeArsenal = false;
let activeHealCauldron = false;

checkEscToResetCamera();

function handleHomeClick(e){
    e.preventDefault();

    homeMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    homeMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    homeRaycaster.setFromCamera(homeMouse, homeCamera);

    let intersects = homeRaycaster.intersectObject(homeScene, true);

    if(intersects.length > 0){
        let object = intersects[0].object;

        console.log(object);

        // ACTIVE
        // Active Vocabulary
        if(activeVocabulary) activeVocabularyHandler(object);
        if(activeDoor) activeDoorHandler(object);

    
        // Vocabulary table
        if(object.name.includes('Vocabulary_Table_')){
            console.log('Table');

            activeVocabulary = true;

            // Change camera position
            gsap.to(homeCamera.position, {
                duration: 1,
                x: 2.927868438389019,
                y: 0.7513829103299781,
                z: 2.872406515072331
            })

            gsap.to(controlsVar.target, {
                duration: 1,
                x: 0.5699371461463288,
                y: -0.6995119320075021,
                z: 3.390770266589537
            })

            setTimeout(() => {
                // Add book cover
                bookParent.add(bookCoverMesh);
                gsap.to(bookCoverMesh.material, {
                    duration: 0.8,
                    opacity: 1
                })

                // Add book text
                bookParent.add(bookTextMesh);
                gsap.to(bookTextMesh.material, {
                    duration: 0.8,
                    opacity: 1
                })
            }, 1100);
        }

        // Doors
        if(object.name.includes('Brick_Door_')){
            console.log('Door');

            activeDoor = true;

            // Change Camera position
            gsap.to(homeCamera.position, {
                duration: 1,
                x: 1.8561061250509379,
                y: 0.8746107905845485,
                z: 0.32270146302434405
            })

            gsap.to(controlsVar.target, {
                duration: 1,
                x: -0.23839009429976987,
                y: 0.79998877865599,
                z: 0.3056575530841469
            })

            // TODO - oncomplete - add active door to true
            // - when we zoom in and fast press esc, mesh (book...) will stay on screen
            // to it everywhere to replace settimeout after the animation is done

            setTimeout(() => {
                // Add door text
                doorTextParent.add(doorTextMesh);

                gsap.to(doorTextMesh.material, {
                    duration: 0.5,
                    opacity: 1
                })
            }, 1000);
        }

        // Arsenal
        if(object.name.includes('Arsenal_Change_')){
            console.log('Arsenal');

            activeArsenal = true;

            // Change camera position
            gsap.to(homeCamera.position, {
                duration: 1,
                x: 2.727204473525794,
                y: 0.4604903396870391,
                z: -0.4367519428174377
            })
            
            gsap.to(controlsVar.target, {
                duration: 1,
                x: 0.09592168431359922,
                y: -0.17092384230219762,
                z: -0.556754032928711
            })

            setTimeout(() => {
                // Add arsenal text
                arsenalTextParent.add(arsenalTextMesh);

                gsap.to(arsenalTextMesh.material, {
                    duration: 0.4,
                    opacity: 1
                })
            }, 1000);
        }

        // Cauldron
        if(object.name.includes('Heal_Cauldron')){
            console.log('Cauldron');
        }
    }
}


// Active Vocabulary handler
function activeVocabularyHandler(object){
    if(object.name.includes('Vocabulary_Table_')) return;
    else if(object.name.includes('Book_Open_Vocabulary_')){
        console.log('clicked on vocabulary book');
    }
    else{
        resetHomeCamera();
        bookDelete();
    }
}

// Active door handler
function activeDoorHandler(object){
    console.log(object);
}


// Helpers
function checkEscToResetCamera(){
    window.addEventListener('keydown', (e) => {
        if(e.code === "Escape" && activeVocabulary){
            resetHomeCamera();
            bookDelete();
        }
        else if(e.code === "Escape" && activeDoor){
            resetHomeCamera();
            homeMeshTextDelete(doorTextMesh, doorTextParent);
        }
        else if(e.code === "Escape" && activeArsenal){
            resetHomeCamera();
            homeMeshTextDelete(arsenalTextMesh, arsenalTextParent)
        }
    })
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
    activeVocabulary = false;
    activeDoor = false;

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
        z: 0
    })
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