/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */
import ml5 from 'ml5'

export default function (sketch) {

    let video;
    let poseNet;
    let poses = [];
    let pastPose = [];
    let width = 0;
    let height = 0;
    let cnvs;
    let ctx;
    let ratioScale = 1;

    sketch.setup = function () {
        width = window.innerWidth;
        height = window.innerHeight;
        video = document.getElementById('video');


        // width = 640;
        // height = 480;
        cnvs = sketch.createCanvas(width, height);
        ctx = cnvs.canvas.getContext('2d');
        // Create a webcam capture
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: true
            }).then((stream) => {
                video.src = window.URL.createObjectURL(stream);
                // video.src = 'static/elevator.mov';
                video.play();

            });
        }

        const poseNet = new ml5.poseNet(video, 'multiple', this.modelReady);
        // This sets up an event that fills the global variable "poses"
        // with an array every time new poses are detected
        poseNet.on('pose', function (results) {
            poses = results;
        });


        // Create a new poseNet method with a single detection

        // Hide the video element, and just show the canvas
        // video.hide();
    }

    sketch.windowResized = function () {
        width = window.innerWidth;
        height = window.innerHeight;
        sketch.resizeCanvas(width, height);


    }

    sketch.modelReady = function () {
        console.log("model loaded");
    }

    sketch.draw = function () {
        ctx.drawImage(video, 0, 0, width, height);
        sketch.background(0);
        // We can call both functions to draw all keypoints and the skeletons
        sketch.drawKeypoints();
        // sketch.drawSkeleton();
    }

    // A function to draw ellipses over the detected keypoints
    sketch.drawKeypoints = function () {
        // Loop through all the poses detected
        for (let i = 0; i < poses.length; i++) {
            // For each pose detected, loop through all the keypoints
            let pose = poses[i].pose;

            for (let j = 0; j < pose.keypoints.length; j++) {
                // A keypoint is an object describing a body part (like rightArm or leftShoulder)
                let keypoint = pose.keypoints[j];
                // Only draw an ellipse is the pose probability is bigger than 0.2
                if (keypoint.score > 0.2) {
                    sketch.stroke(255, 0, 0);
                    sketch.noFill();
                    sketch.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
                }
            }

        }
    }

    // A function to draw the skeletons
    sketch.drawSkeleton = function () {
        // Loop through all the skeletons detected
        for (let i = 0; i < poses.length; i++) {
            let skeleton = poses[i].skeleton;
            // For every skeleton, loop through all body connections
            for (let j = 0; j < skeleton.length; j++) {
                let partA = skeleton[j][0];
                let partB = skeleton[j][1];
                sketch.stroke(255, 0, 0);
                sketch.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
            }
        }
    }
}