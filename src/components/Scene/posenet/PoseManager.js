import ml5 from 'ml5'
import {
    Math
} from 'three'
import arrayAverage from '../libs/ArrayAverage.js'
import arrayAverageInt from '../libs/ArrayAverage.js'

const BUFFER_SIZE = 8;
const MAX_MESHES = 10;

export default class PoseManager {


    constructor(activityCallback, onNewPosition) {
        this.poses = [];
        this.activityBuffer = [];
        this.noseFilters = []
        this.positions = [];
        let container = document.getElementById('container');
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.isPoses = false;

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
                let amount = this.filterPoses(results);
                this.averageNosePositions(onNewPosition);
                this.calculateActivity(amount, activityCallback);
            });
        });

        return promise1;

    };

    calculateActivity(length, activityCallback) {
        if (this.activityBuffer.length < BUFFER_SIZE) {
            this.activityBuffer.push(length);
        } else {
            this.activityBuffer.shift();
            this.activityBuffer.push(length);
        }

        if (this.activityBuffer != null && this.activityBuffer.length === BUFFER_SIZE) {
            activityCallback(this.arrayAverageInt(this.activityBuffer));
        }
    };




    filterPoses(results) {
        let truePoseAmount = 0;
        for (let i = 0; i < results.length; i++) {
            if (results[i]) {
                let pose = results[i].pose;
                let nose = pose.keypoints.find(function (element) {
                    return element.part == "nose";
                });

                // if nosefilters doesn't exist
                if (this.noseFilters[i]) {
                    if (pose.score > 0.3) {
                        truePoseAmount += 1;
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

        return truePoseAmount;
    };

    averageNosePositions(callback) {
        if (this.noseFilters) {

            for (let i = 0; i < this.noseFilters.length; i++) {
                if (this.noseFilters[i]) {
                    let a = arrayAverage(this.noseFilters[i])
                    this.positions[i] = {
                        user: i,
                        x: Math.mapLinear(a[0], 0, 640, this.width, -this.width),
                        y: Math.mapLinear(a[1], 0, 480, -this.height, this.height),
                    }
                }
            }
            callback(this.positions)
            // console.log(callback);



        }

    }


    arrayAverageInt(array) {
        let xsum = 0;
        for (var i = 0; i < array.length; i++) {
            xsum += array[i]
        }
        return xsum / array.length
    }





}