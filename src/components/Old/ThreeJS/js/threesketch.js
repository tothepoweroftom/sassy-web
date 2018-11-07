import * as THREE from 'three'
import ml5 from 'ml5'
import requestMic from './vad/index.js'
import OBJLoader from 'three-obj-loader'
import arrayAverage from './helpers/helpers.js'
OBJLoader(THREE);

const BUFFER_SIZE = 24;
const MAX_MESHES = 10;


export default {
  name: 'ThreeTest',
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
      
    }
  },
  methods: {

    initPoseNet: function() {

        let promise1 = new Promise((resolve, reject) => {
        // POSENET
            var video = document.getElementById('video');
            // Create a webcam capture
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    // video.src = 'static/elevator.mp4';
                    // video.loop = true;
                    video.play();
                });
            }

            this.poseNet = ml5.poseNet(video, 'multiple', ()=>{
                    console.log("posenet LOADED")
                    resolve();
            });

            this.poseNet.on('pose', (results) => {
                this.poses = results;
                this.getNoses(results);
            });
        });

        return promise1;
    },

    // AUDIO ----------------------------------------------------------------------------------------------------------------
    initAudio: function() {
        this.inflateAudio = new Audio('static/audio/inflate.wav');
        this.deflateAudio = new Audio('static/audio/deflate.mp3');
    },


    //INIT THREE ------------------------------------------------------------------------------------------------------------
    init: function() {
        let container = document.getElementById('container');

        this.camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.01, 1000);
        this.camera.position.z = 1;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffff00 );
        this.scene.add(new THREE.AmbientLight(0xcccccc));

        this.mouse = new THREE.Vector2();
        let size = 10;
        let divisions = 200;
        let gridHelper = new THREE.GridHelper( size, divisions, 0x0000ff, 0x808080 );
        gridHelper.rotation.x = Math.PI/2;
        // this.scene.add( gridHelper );


        this.light = new THREE.PointLight( 0xcccccc, 1, 100 );
        this.light.position.set( 20, 20, 10 );
        this.scene.add( this.light );
        // plane.rotateZ( - Math.PI / 2);

        
        this.createMeshes();

        // this.getModel('static/textures/stone.png', 'static/models/AfricanMask.obj', this.scene, this.object);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        // VAD Controls
        var options = {
            onVoiceStart: () => {
                this.scale = 0.02;
                this.voiceState = 'speaking'
                // this.inflateAudio.play();

            },
            onVoiceStop: () => {
                this.scale = -0.5;
                // setTimeout(()=> {
                //     // this.deflateAudio.play();

                // }, 2000)
                this.voiceState = 'not speaking'


            },
            onUpdate: function (val) {
            // console.log('curr val:', val);
        }
        };
        requestMic(options);
    },


    animate0: function() {
        requestAnimationFrame(this.animate);
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        // console.log(this.mesh.scale);


        // Grow
        if(this.mesh.scale.x >= 1.0) {
        this.mesh.scale.x += this.scale;
        this.mesh.scale.y += this.scale;
        this.mesh.scale.z += this.scale;
        } else {
            this.mesh.scale.x = 1.0
            this.mesh.scale.y = 1.0;
            this.mesh.scale.z = 1.0;
        }
        

        // if(this.noseFilters.length === BUFFER_SIZE){
        //     this.mesh.position.x = THREE.Math.mapLinear(arrayAverage(this.noseFilters)[0], 0.0,640,1.7, -1.7);
        //     this.mesh.position.y = THREE.Math.mapLinear(arrayAverage(this.noseFilters)[1], 0.0,640,0.9, -0.9);

        // }
        this.renderer.render(this.scene, this.camera);
    },

    animate: function() {
        requestAnimationFrame(this.animate);
        this.checkNoseFilters()
        this.scaling();

        this.renderer.render(this.scene, this.camera);
    },

    scaling: function() {
        if (this.noseFilters) {
            for(let i=0; i<this.noseFilters.length; i++) {
                if(this.meshes[i].scale.x > 1.0) {
                    this.meshes[i].scale.x += this.scale;
                    this.meshes[i].scale.y += this.scale;
                    this.meshes[i].scale.z += this.scale;
                } else {
                    this.scale = 0.0;

                }
            }
        }
    },

    checkNoseFilters: function() {
        if (this.noseFilters) {
            for(let i=0; i<this.noseFilters.length; i++) {
                if(this.noseFilters[i].length === BUFFER_SIZE) {
                    let alive = this.checkIfAlive(this.noseFilters[i]);
                    this.meshes[i].position.x = THREE.Math.mapLinear(arrayAverage(this.noseFilters[i])[0], 0.0,640,1.7, -1.7);
                    this.meshes[i].position.y = THREE.Math.mapLinear(arrayAverage(this.noseFilters[i])[1], 0.0,640,0.9, -0.9);
                    this.meshes[i].rotation.x += 0.01;
                    this.meshes[i].rotation.y += 0.02;
                }
            }
        }
    },


    //Preload 10 meshes and add to scene, invisible
    createMeshes: function() {
        let geometry = new THREE.SphereGeometry(0.02, 10, 10);
        let material =  new THREE.MeshLambertMaterial({
            color:  0xaaaaaa,
            wireframe: false
         });

        for(let i=0; i<MAX_MESHES; i++) {
            // this.meshes.push(new THREE.Mesh(geometry, material));
            this.meshes.push(this.model.clone());
            this.scene.add(this.meshes[i]);
            this.meshes[i].position.set(0,0,0);
            // this.meshes[i].mesh.scale.set(0.2,0.2,0.2);
            this.meshes[i].visible = false;
        }

    },

    getModel: function(texture, obj, callback) {
       // instantiate a loader
        var loader = new THREE.OBJLoader();

        // load a resource
        loader.load(
            // resource URL
            obj,
            // called when resource is loaded
           callback,
            // called when loading is in progresses
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );

            }
        );
    },

    getJSONModel: function() {
        var loader = new THREE.JSONLoader();
        // load a resource
        loader.load(
            // resource URL
            'static/models/json/metaball-01.json',

            // onLoad callback
            function ( geometry, materials ) {
                var material = materials[ 0 ];
                var object = new THREE.Mesh( geometry, material );
                console.log("MTAER", material);
                // scene.add( object );
            },

            // onProgress callback
            function ( xhr ) {
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            // onError callback
            function( err ) {
                console.log( 'An error happened' );
            }
        );
    },

    // USER 1 ONLY_____
    getNose: function() {
        let noses = [];
        if(this.poses[0]){
            let pose = this.poses[0].pose;
            let nose = pose.keypoints.find(function (element) {
                return element.part == "nose";
            });
            if (pose.score > 0.3) {
                if(this.noseFilter.length < BUFFER_SIZE){
                    this.noseFilter.push(nose);
                } else {
                    this.noseFilter.shift();
                    this.noseFilter.push(nose);
                }
            }
        }
        
    },

    // Multiple Users
    getNoses: function(poses) {
        let noses = [];
        for(let i=0; i<poses.length; i++) {
            if(poses[i]){
                let pose = poses[i].pose;
                let nose = pose.keypoints.find(function (element) {
                    return element.part == "nose";
                });

                // if nosefilters doesn't exist
                if(this.noseFilters[i]) {
                    if (pose.score > 0.3) {
                        this.meshes[i].visible = true;
                        if(this.noseFilters[i].length < BUFFER_SIZE){
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

        for(let j=poses.length; j<MAX_MESHES; j++) {
            this.meshes[j].visible = false;
        }
        // console.log(this.noseFilters);
        
    },


    checkIfAlive: function(noseFilter) {
        // Check movement distance for death, little movement, dead
            // let temp = noseFilter.slice(Math.max(noseFilter.length - 2, 1))
            // // console.log(temp);

            // let a = new THREE.Vector2(temp[0].position.x, temp[0].position.y);
            // let b = new THREE.Vector2(temp[1].position.x, temp[1].position.y);
            

            // console.log("DISTANCE", a.distanceTo(b));

        

    },

    handleModel: function(object) {
        console.log("THIS Object", object);
        this.model = object;
    },

  },
  mounted() {
    this.model = this.getModel('static/models/metaball-01.obj.mtl', 'static/models/model.obj', this.handleModel);

    //   Wait until posenet sets up to launch three.
      this.initPoseNet().then(()=> {
        this.loading = false;
        this.initAudio();
        this.init();
        // this.getJSONModel();
        this.animate();
      });

  },
  created() {
            // this.getModel('static/textures/stone.png', 'static/models/AfricanMask.obj', this.scene);

  }
}