import * as THREE from "three";

export default function (currentScene, currentSceneBackground, currentCamera, currentCameraPosition, currentRenderer, parentE){
    currentScene.background = currentSceneBackground;
    
    // Camera
    currentCamera.aspect = window.innerWidth / window.innerHeight;

    currentCamera.position.set(currentCameraPosition[0], currentCameraPosition[1], currentCameraPosition[2]);
    
    // Lights
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 50, 50);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    
    currentScene.add(pointLight, ambientLight);
    
    // Home Render    
    currentRenderer.setPixelRatio(window.innerWidth / window.innerHeight);
    currentRenderer.setSize(window.innerWidth, window.innerHeight);

    parentE.appendChild(currentRenderer.domElement);
}