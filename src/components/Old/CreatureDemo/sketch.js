import * as THREE from 'three'
import ml5 from 'ml5'
import OBJLoader from 'three-obj-loader'
import arrayAverage from './helpers/helpers.js'
import * as artyom from 'artyom.js'
OBJLoader(THREE);
import GLTFLoader from 'three-gltf-loader';

import ThreeCreator from './THREE_functions'

const BUFFER_SIZE = 24;
const MAX_MESHES = 10;

export default {
    name: 'CreatureDemo',

    data() {
        return {
            loading: true,
            camera: null,
            light: null,
            scene: null,
            renderer: null,
            mesh: null,
            meshes: [],
            mouse: null,
            video: null,
            posenet: null,
            poses: [],
            nose: null,
            noseFilter: [],
            noseFilters: [],
            scale: 0,
            object: null,
            inflateAudio: null,
            deflateAudio: null,
            creatures: [],
            voiceState: 'not speaking',
            model: null,
            clock: null,
            mesh: null,
            mixer: null,

        }
    },
    methods: {

        initPoseNet: function () {

            let promise1 = new Promise((resolve, reject) => {
                // POSENET
                var video = document.getElementById('video');
                // Create a webcam capture
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({
                        video: true
                    }).then(function (stream) {
                        video.src = window.URL.createObjectURL(stream);
                        // video.src = 'static/elevator.mp4';
                        // video.loop = true;
                        video.play();
                    });
                }

                this.poseNet = ml5.poseNet(video, 'multiple', () => {
                    console.log("posenet LOADED")
                    resolve();
                });

                this.poseNet.on('pose', (results) => {
                    this.poses = results;
                    this.getNoses(results);

                    // this.checkIfAlive(results);
                });
            });

            return promise1;
        },



        // AUDIO ----------------------------------------------------------------------------------------------------------------
        initAudio: function () {
            this.inflateAudio = new Audio('static/audio/inflate.wav');
            this.deflateAudio = new Audio('static/audio/deflate.mp3');
        },

        initSpeechRecogntion() {
            var UserDictation = artyom.newDictation({
                continuous: true, // Enable continuous if HTTPS connection
                onResult: function (text) {
                    // Do something with the text
                    console.log(text);
                },
                onStart: function () {
                    console.log("Dictation started by the user");
                },
                onEnd: function () {
                    alert("Dictation stopped by the user");
                }
            });

            UserDictation.start();
        },


        //INIT THREE ------------------------------------------------------------------------------------------------------------
        init: function () {
            let container = document.getElementById('container');

            this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.001, 1000);
            this.camera.position.z = 1;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.position.set(0, 0, 8.7);
            this.clock = new THREE.Clock();

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffff00);

            this.mouse = new THREE.Vector2();
            let size = 20;
            let divisions = 20;
            let gridHelper = new THREE.GridHelper(size, divisions, 0x0000ff, 0x808080);
            gridHelper.rotation.x = Math.PI / 2;
            this.scene.add( gridHelper );


            ThreeCreator.createLights(this.scene, THREE);
            ThreeCreator.createFloor(this.scene, THREE);
            ThreeCreator.getGLFTModel('static/models/gltf/AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf', this.handleGLTFModel, THREE);

            this.createMeshes();

            this.renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);

            this.renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(this.renderer.domElement);


        },

        animate: function () {
            requestAnimationFrame(this.animate);
            this.animateGLTF();
            this.checkNoseFilters()
            this.scaling();
            this.renderer.render(this.scene, this.camera);
        },

        animateGLTF: function () {
            if(this.mixer){
                this.mixer.update(this.clock.getDelta() * this.mixer.timeScale);
            }


        },

        scaling: function () {
            if (this.noseFilters) {
                for (let i = 0; i < this.noseFilters.length; i++) {
                    if (this.meshes[i].scale.x > 1.0) {
                        this.meshes[i].scale.x += this.scale;
                        this.meshes[i].scale.y += this.scale;
                        this.meshes[i].scale.z += this.scale;
                    } else {
                        this.scale = 0.0;

                    }
                }
            }
        },

        checkNoseFilters: function () {
            if (this.noseFilters) {
                for (let i = 0; i < this.noseFilters.length; i++) {
                    if (this.noseFilters[i].length === BUFFER_SIZE) {
                        this.meshes[i].position.x = THREE.Math.mapLinear(arrayAverage(this.noseFilters[i])[0], 0.0, 640, 9, -9);
                        this.meshes[i].position.y = THREE.Math.mapLinear(arrayAverage(this.noseFilters[i])[1], 0.0, 480, 7, -7);
                    }
                }
            }
        },


        //Preload 10 meshes and add to scene, invisible
        createMeshes: function () {
            let geometry = new THREE.SphereGeometry(1, 10, 10);
            let material = new THREE.MeshLambertMaterial({
                color: 0xaaaaaa,
                wireframe: false
            });

            for (let i = 0; i < MAX_MESHES; i++) {
                this.meshes.push(new THREE.Mesh(geometry, material));
                this.scene.add(this.meshes[i]);
                this.meshes[i].position.set(1, 1, 1);
                this.meshes[i].scale.set(0.2,0.2,0.2);
                this.meshes[i].visible = false;
            }
        },


        // Multiple Users
        getNoses: function (poses) {
            let noses = [];
            for (let i = 0; i < poses.length; i++) {
                if (poses[i]) {
                    let pose = poses[i].pose;
                    let nose = pose.keypoints.find(function (element) {
                        return element.part == "nose";
                    });

                    // if nosefilters doesn't exist
                    if (this.noseFilters[i]) {
                        if (pose.score > 0.3) {
                            this.meshes[i].visible = true;
                            if (this.noseFilters[i].length < BUFFER_SIZE) {
                                this.noseFilters[i].push(nose);
                            } else {
                                this.noseFilters[i].shift();
                                this.noseFilters[i].push(nose);
                            }
                        }
                    } else {
                        this.noseFilters[i] = []
                    }

                    // add to noses array

                }
            }

            //Hide excess
            for (let j = poses.length; j < MAX_MESHES; j++) {
                this.meshes[j].visible = false;
            }

        },

        handleModel: function (object) {
            console.log("THIS Object", object);
            this.model = object;
        },

        handleGLTFModel: function (gltf) {
            let mesh = null
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    // child.material = new THREE.MeshLambertMaterial({
                    //     color: 0xaaaaaa,
                    //     wireframe: false
                    // });
                }
                mesh = child;
            });
            this.mesh = mesh;
            if (gltf.animations && gltf.animations.length) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);
                for (var i = 0; i < gltf.animations.length; i++) {
                    var animation = gltf.animations[i];
                    this.mixer.clipAction(animation).play();
                }
            }

            this.scene.add(gltf.scene);
        }

    },


    mounted() {
        this.model = ThreeCreator.getModel('static/models/metaball-01.obj.mtl', 'static/models/model.obj', this.handleModel, THREE);
        //   Wait until posenet sets up to launch three.
        this.initPoseNet().then(() => {
            this.loading = false;
            this.initAudio();
            this.init();
            // this.getJSONModel();
            this.animate();
        });

    },


}