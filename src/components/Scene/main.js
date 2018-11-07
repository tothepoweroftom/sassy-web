import * as THREE from 'three'
import SceneManager from './SceneManager.js'
import PoseManager from './posenet/PoseManager.js'
import Artyom from 'artyom.js'
const artyom = new Artyom()

export default {
    name: 'Scene',

    data() {
        return {
            sceneManager: null,
            poseManager: null,
            loading: false,
            positions: [],
            poselength: 0,
            activityBuffer: [],
            debug: false,
            speechManager: null,
        }
    },

    created() {

    },

    mounted() {
        window.onresize = this.resize();
        window.onmousemove = this.onMouseMove();


        this.poseManager = new PoseManager(this.activityMonitor, this.onNewPosition).then(()=>{
            console.log("promise returned");
            this.initSceneManager();
            var UserDictation = artyom.newDictation({
                continuous:true, // Enable continuous if HTTPS connection
                onResult:function(text){
                    // Do something with the text
                    console.log(text);
                },
                onStart:function(){
                    console.log("Dictation started by the user");
                },
                onEnd:function(){
                    alert("Dictation stopped by the user");
                }
            });
            
            UserDictation.start();
        });

                // Now we can start the speech recognition
        // Supported only in Chrome
        // Once started, you need to allow Chrome to use the microphone
        var recognition = new webkitSpeechRecognition();
        // Be default, Chrome will only return a single result.
        // By enabling "continuous", Chrome will keep the microphone active.
        recognition.continuous = true;
        recognition.onresult = function(event) {
            // Get the current result from the results object
            var transcript = event.results[event.results.length-1][0].transcript;
            // Send the result string via WebSocket to the running Processing Sketch
            console.log(event);
        }
        // Start the recognition
        recognition.start();
        
        // Restart the recognition on timeout
        recognition.onend = function(){
            recognition.start();
        }

    },

    methods: {
        initSceneManager: function () {
            var canvas = document.getElementById("canvas");
            this.sceneManager = new SceneManager(canvas);
            console.log(this.sceneManager);
        },

        resize: function() {
            if(this.sceneManager)
                this.sceneManager.onWindowResize();
        },

        onNewPosition: function(positions) {
            this.sceneManager.setPositions(positions);
        },

    

        activityMonitor: function(activityLevel) {
            this.sceneManager.setActivity(activityLevel);
        },


        render: function() {
            requestAnimationFrame(this.render);
            this.sceneManager.update();
        },

        onMouseMove: function(event) {
            console.log(event);
        },
    },

}