/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const gui = new GUI()
/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader()
const loader = new GLTFLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#c8f0f9')

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true }) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding; // set color encoding
container.appendChild(renderer.domElement) // add the renderer to html div

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(3, 0, -5)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////


///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(2)
})

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)


/////////////////////////////////////////////////////////////////////////
///// RAYCASTER 
const raycaster = new THREE.Raycaster()

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-3, 2, 3)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
// loader.load('models/gltf/starter-scene.glb', function (gltf) {

//     scene.add(gltf.scene)
// })
let baseModel, baseTopFrame, baseBottomFrame, baseLeftFrame, baseRightFrame, centerTransom;
const interactables = [];
loader.load('models/shapedFrame.glb', function (gltf) {
    baseModel = gltf.scene;
    console.log("base model ", baseModel);
    scene.add(baseModel);
    baseTopFrame = baseModel.children[0];
    baseBottomFrame = baseModel.children[1];
    baseLeftFrame = baseModel.children[2];
    baseRightFrame = baseModel.children[3];
    addCenterObject(baseLeftFrame.position, baseRightFrame.position);
});

///////////////////////////////////////////////////////////////////////
/// SET CENTER BUTTON WITH CODE
function addCenterObject(LeftBound, RightBound) {
    const geometry = new THREE.BoxGeometry(.1, .1, .1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const centerObject = new THREE.Mesh(geometry, material);
    centerObject.name = "center";
    centerObject.userData.transomAdded = false;
    // centerObject.userData.centerObjectType = objectType;
    centerObject.userData.leftBound = LeftBound;
    centerObject.userData.rightBound = RightBound;
    scene.add(centerObject);
    var pos = [];
    pos.push(LeftBound);
    pos.push(RightBound);
    new THREE.Box3().setFromPoints(pos).getCenter(centerObject.position).multiplyScalar(1);
    console.log(centerObject);
    interactables.push(centerObject);
}

//introAnimation() // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI / 2.5
}

/////////////////////////////////////////////////////////////////////////
//////GUI 

// var params = {
//     color: sunLight.color.getHex(),
//     color2: ambient.color.getHex(),
//     color3: scene.background.getHex(),
// }

// // create a function to be called by GUI
// const params_update = function () {
//     var colorObj = new THREE.Color(params.color)
//     var colorObj2 = new THREE.Color(params.color2)
//     var colorObj3 = new THREE.Color(params.color3)
//     sunLight.color.set(colorObj)
//     ambient.color.set(colorObj2)
//     scene.background.set(colorObj3)
// }

//////////////////////////////////////////////////
//// GUI CONFIG
//gui.add(baseModel.scale,'frameObjScale').name('Frame Resize').onChange(params_update)
// gui.add(sunLight, 'intensity').min(0).max(10).step(0.0001).name('Dir intensity')
// gui.add(sunLight.position, 'x').min(-100).max(100).step(0.00001).name('Dir X pos')
// gui.add(sunLight.position, 'y').min(0).max(100).step(0.00001).name('Dir Y pos')
// gui.add(sunLight.position, 'z').min(-100).max(100).step(0.00001).name('Dir Z pos')
// gui.addColor(params, 'color').name('Dir color').onChange(params_update)
// gui.addColor(params, 'color2').name('Amb color').onChange(params_update)
// gui.add(ambient, 'intensity').min(0).max(10).step(0.001).name('Amb intensity')
// gui.addColor(params, 'color3').name('BG color').onChange(params_update)

/////////////////////////////////////////////////

////////////////////////////////////////////
//// Events
const transomModels = [];
const v = new THREE.Vector2()
renderer.domElement.addEventListener('click', onClick, false);
function onClick(event) {
    v.set(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(v, camera)

    const intersects = raycaster.intersectObjects(interactables, true)
    if (intersects.length > 0) {
        loader.load('models/transomsModel.glb', function (gltf) {
            console.log(intersects[0])
            var transomModel = gltf.scene;
            transomModel.scale.y = 100;
            scene.add(transomModel);
            intersects[0].object.userData.transomAdded = true;
            transomModel.position.copy(intersects[0].object.position);
            addCenterObject(transomModel.position,intersects[0].object.userData.leftBound);
            addCenterObject(transomModel.position,intersects[0].object.userData.rightBound);
        });

        // if (intersects[0].object.userData.centerObjectType == 0 &&  !intersects[0].object.userData.transomAdded) {
        //     loader.load('models/transomsModel.glb', function (gltf) {
        //         var transomModel = gltf.scene;
        //         transomModel.scale.y = 100;
        //         scene.add(transomModel);

        //         // const geometry = new THREE.BoxGeometry(.1, .1, .1);
        //         // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        //         // const centerObject = new THREE.Mesh(geometry, material);
        //         // centerObject.name = "center";
        //         // scene.add(centerObject);
        //         // var transomModel = gltf.scene;
        //         // transomModel.scale.y = 100;
        //         // transomModels.push(transomModel);
        //         // scene.add(transomModel);
        //         // centerTransom = transomModel;
        //         // intersects[0].object.userData.transomAdded = true;

        //         // transomModel.position.copy(intersects[0].object.position);
        //         // console.log("transom model", transomModel, intersects[0]);
        //         // // intersects[0].object.visible = false;
        //         // var pos = [];
        //         // pos.push(transomModel.position);
        //         // pos.push(baseLeftFrame.position);
        //         // new THREE.Box3().setFromPoints(pos).getCenter(centerObject.position).multiplyScalar(1);
        //         // centerObject.userData.centerObjectType = 1
        //         // centerObject.userData.transomAdded = false
        //         // centerObject.userData.box3 = pos
        //         // interactables.push(centerObject);
        //         // var pos1 = [];
        //         // pos1.push(transomModel.position);
        //         // pos1.push(baseRightFrame.position);
        //         // var centerObject2 = centerObject.clone();
        //         // new THREE.Box3().setFromPoints(pos1).getCenter(centerObject2.position).multiplyScalar(1);
        //         // interactables.push(centerObject2);
        //         // centerObject2.userData.centerObjectType = 2
        //         // centerObject2.userData.transomAdded = false
        //         // centerObject2.userData.box3 = pos1
        //         // scene.add(centerObject2);
        //     })

        // }
        // if (intersects[0].object.userData.centerObjectType == 1 && !intersects[0].object.userData.transomAdded) {
        //     loader.load('models/transomsModel.glb', function (gltf) {
        //         const geometry = new THREE.BoxGeometry(.1, .1, .1);
        //         const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        //         const centerObject = new THREE.Mesh(geometry, material);
        //         centerObject.name = "center";
        //         scene.add(centerObject);
        //         var transomModel = gltf.scene;
        //         transomModel.scale.y = 100;
        //         transomModels.push(transomModel);
        //         scene.add(transomModel);
        //         intersects[0].object.userData.transomAdded = true;

        //         transomModel.position.copy(intersects[0].object.position);
        //         console.log("transom model", transomModel, intersects[0]);
        //         // intersects[0].object.visible = false;
        //         var pos = [];
        //         pos.push(transomModel.position);
        //         pos.push(baseLeftFrame.position);
        //         new THREE.Box3().setFromPoints(pos).getCenter(centerObject.position).multiplyScalar(1);
        //         centerObject.userData.centerObjectType = 1
        //         centerObject.userData.transomAdded = false
        //         interactables.push(centerObject);
        //         var pos1 = [];
        //         pos1.push(transomModel.position);
        //         pos1.push(centerTransom.position);
        //         var centerObject2 = centerObject.clone();
        //         new THREE.Box3().setFromPoints(pos1).getCenter(centerObject2.position).multiplyScalar(1);
        //         interactables.push(centerObject2);
        //         centerObject2.userData.centerObjectType = 2
        //         centerObject2.userData.transomAdded = false
        //         scene.add(centerObject2);
        //     })
        // }
        // if (intersects[0].object.userData.centerObjectType == 2 && !intersects[0].object.userData.transomAdded) {
        //     loader.load('models/transomsModel.glb', function (gltf) {
        //         const geometry = new THREE.BoxGeometry(.1, .1, .1);
        //         const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        //         const centerObject = new THREE.Mesh(geometry, material);
        //         centerObject.name = "center";
        //         scene.add(centerObject);
        //         var transomModel = gltf.scene;
        //         transomModel.scale.y = 100;
        //         transomModels.push(transomModel);
        //         scene.add(transomModel);
        //         intersects[0].object.userData.transomAdded = true;

        //         transomModel.position.copy(intersects[0].object.position);
        //         console.log("transom model", transomModel, intersects[0]);
        //         // intersects[0].object.visible = false;
        //         var pos = [];
        //         pos.push(transomModel.position);
        //         pos.push(centerTransom.position);
        //         new THREE.Box3().setFromPoints(pos).getCenter(centerObject.position).multiplyScalar(1);
        //         centerObject.userData.centerObjectType = 1
        //         centerObject.userData.transomAdded = false
        //         interactables.push(centerObject);
        //         var pos1 = [];
        //         pos1.push(transomModel.position);
        //         pos1.push(baseRightFrame.position);
        //         var centerObject2 = centerObject.clone();
        //         new THREE.Box3().setFromPoints(pos1).getCenter(centerObject2.position).multiplyScalar(1);
        //         interactables.push(centerObject2);
        //         centerObject2.userData.centerObjectType = 2
        //         centerObject2.userData.transomAdded = false
        //         scene.add(centerObject2);
        //     })
        // }

    }
}


//////////////////////


//// RENDER LOOP FUNCTION
function rendeLoop() {

    TWEEN.update() // update animations

    controls.update() // update orbit controls

    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function

    labelRenderer.render(scene, camera)
}

rendeLoop() //start rendering


////get center point of mesh
/**
 * Compute the center of a THREE.Group by creating a bounding box
 * containing every children's bounding box.
 * @param {THREE.Group} group - the input group
 * @param {THREE.Vector3=} optionalTarget - an optional output point
 * @return {THREE.Vector3} the center of the group
 */
var computeGroupCenter = (function () {
    return function (group, optionalTarget) {
        if (!optionalTarget) optionalTarget = new THREE.Vector3();
        new THREE.Box3().setFromObject(group).getCenter(optionalTarget).multiplyScalar(-1);
        return optionalTarget;
    }
})();


var computeCenterOfTwoMesh = (function name() {
    return function (group1, group2) {

    }
})();