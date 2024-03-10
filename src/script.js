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
// dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
// dracoLoader.setDecoderConfig({ type: 'js' })
// loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#f2fdff')

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
camera.position.set(0, 0, -5)
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
setOrbitControlsLimits();

/////////////////////////////////////////////////////////////////////////
///// RAYCASTER 
const raycaster = new THREE.Raycaster()

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 1)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1)
sunLight.position.set(3, 2, 3)
scene.add(sunLight)

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL
let baseModel, baseTopFrame, baseBottomFrame, baseLeftFrame, baseRightFrame;
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
    centerObject.userData.leftBound = LeftBound;
    centerObject.userData.rightBound = RightBound;
    baseModel.add(centerObject);
    var pos = [];
    pos.push(LeftBound);
    pos.push(RightBound);
    new THREE.Box3().setFromPoints(pos).getCenter(centerObject.position).multiplyScalar(1);
    console.log(centerObject);
    interactables.push(centerObject);
}

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 1
    controls.maxDistance = 10
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI / 2
}

////////////////////////////////////////////
//// Events
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
        if (!intersects[0].object.userData.transomAdded) {
            loader.load('models/transomsModel.glb', function (gltf) {
                console.log(intersects[0])
                var transomModel = gltf.scene;
                transomModel.scale.y = 100;
                baseModel.add(transomModel);
                intersects[0].object.userData.transomModel = transomModel;
                intersects[0].object.userData.transomAdded = true;
                transomModel.position.copy(intersects[0].object.position);
                addCenterObject(transomModel.position, intersects[0].object.userData.leftBound);
                addCenterObject(transomModel.position, intersects[0].object.userData.rightBound);
            });
        }
        else {
            if (intersects[0].object.userData.transomModel.visible) {
                intersects[0].object.userData.transomModel.visible = false;
            }
            else {
                intersects[0].object.userData.transomModel.visible = true;
            }
        }
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