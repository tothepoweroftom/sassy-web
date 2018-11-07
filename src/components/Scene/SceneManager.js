//The SceneManager is responsible for handling the Three.js side of the app,
//which is completely hidden from the main. It knows nothing about the DOM.
import Background from './sceneSubjects/Background'
import Sphere from './sceneSubjects/Sphere'
import * as THREE from 'three'

export default function SceneManager(canvas) {
    let container = document.getElementById('container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    var speechManager;


    var time = 0;

    var isActivity = false;
    var mousePosition = {
        x: 0,
        y: 0,
        disabled: false
    };

    var positions = [];

    var width = canvas.width;
    var height = canvas.height;

    var scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    var light = buildLights(scene);
    var camera = buildCamera(width, height);
    var renderer = buildRender(width, height);

    var sceneSubjects = new Array();
    sceneSubjects.push(new Background(scene));
    sceneSubjects.push(new Sphere(scene));

    function buildLights(scene) {


        var light = new THREE.SpotLight("#ffff00", 40);
        light.castShadow = true;
        light.position.y = 10;
        light.position.z = 18;

        light.decacy = 5;
        light.penumbra = 2;

        light.shadow.camera.near = 20;
        light.shadow.camera.far = 1000;
        light.shadow.camera.fov = 50;

        scene.add(light);

        //var spotLightHelper = new THREE.SpotLightHelper( light );
        //scene.add( spotLightHelper )

        return light;
    }

    function buildCamera(width, height) {
        var aspectRatio = width / height;
        var fieldOfView = 75;
        var nearPlane = 1;
        var farPlane = 500;
        var camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        camera.position.z = 6;

        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    function buildRender(width, height) {
        var renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        var DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        return renderer;
    }





    this.setActivity = function (value) {
        this.activityLevel = value;
        if(this.activityLevel <= 0.25) {
            this.isActivity = false;
        } else {
            this.isActivity = true;
            for (var i = 0; i < sceneSubjects.length; i++)
                sceneSubjects[i].updateEyeNum(Math.ceil(this.activityLevel));
        }



    }



    this.update = function () {
        time++;

        // camera position, relative to mouse position
        camera.position.x += ((mousePosition.x * 0.001) - camera.position.x) * 0.04;
        camera.position.y += (-(mousePosition.y * 0.002) - camera.position.y) * 0.04;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // move the light
        // light.position.x = Math.sin(time*0.01)*50;
        light.intensity = 40*THREE.Math.clamp(this.activityLevel, 0.0,1.0);


        for (var i = 0; i < sceneSubjects.length; i++)
            sceneSubjects[i].update(time, positions, this.isActivity);

        renderer.render(scene, camera);
    };

    this.onWindowResize = function () {
        var canvas = document.getElementById("canvas");
        var width = document.body.clientWidth;
        var height = document.body.clientHeight;
        canvas.width = width;
        canvas.height = height;

        camera = buildCamera(width, height);

        renderer.setSize(width, height);
    }

    var timeout = null;
    this.onMouseMove = function (mouseX, mouseY) {
        clearTimeout(timeout);

        mousePosition.x = mouseX;
        mousePosition.y = mouseY;
        mousePosition.disabled = false;

        timeout = setTimeout(function () {
            mousePosition.disabled = true;
        }, 2000);
    }


    this.setPositions = function (posePos) {
        for (let i = 0; i < posePos.length; i++) {
            if (isNaN(posePos[i].x) || isNaN(posePos[i].y)) {

            } else {
                positions[i] = posePos[i];
            }
        }



    }

}