import * as THREE from 'three'
import getRandom from '../libs/Utils'
export default function Sphere(scene) {
    // deformed sphere
    var icoGeometry = new THREE.CircleGeometry(0.5, 10);
    var icoMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
        wireframe: false
    });
    var eyeNum = 0;
    var baseSphere = new THREE.Mesh(icoGeometry, icoMaterial);
    scene.add(baseSphere);
    // baseSphere.visible = false;

    var envMap = new THREE.TextureLoader().load('static/textures/env2.png');
    envMap.mapping = THREE.SphericalReflectionMapping;

    var eyeTexture_red = new THREE.TextureLoader().load('static/textures/eye_red.jpg');
    eyeTexture_red.mapping = THREE.SphericalReflectionMapping;

    var eyeGeometry = new THREE.IcosahedronGeometry(0.3, 3);

    // modify UVs to accommodate texture
    var faceVertexUvs = eyeGeometry.faceVertexUvs[0];
    for (var i = 0; i < faceVertexUvs.length; i++) {

        var uvs = faceVertexUvs[i];
        var face = eyeGeometry.faces[i];

        for (var j = 0; j < 3; j++) {

            uvs[j].x = face.vertexNormals[j].x * 0.5 + 0.5;
            uvs[j].y = face.vertexNormals[j].y * 0.5 + 0.5;

        }
    }

    var eyeMaterial = new THREE.MeshStandardMaterial({
        color: "#222222",
        roughness: 0,
        metalness: .9,
        shading: THREE.SmoothShading,
        opacity: 1
    });
    eyeMaterial.envMap = envMap;
    eyeMaterial.map = eyeTexture_red;

    var eye = baseSphere.clone();

    eye.geometry = eyeGeometry;
    eye.material = eyeMaterial;

    var eyes = new Array();
    var randFactors = new Array();
    eyeNum = icoGeometry.vertices.length;
    // add an eye on each vertex
    for (var i = 0; i < eyeNum; i++) {
        var vertex = icoGeometry.vertices[i];

        if (vertex.z < 0)
            continue;

        var tEye = eye.clone();

        tEye.position.set(vertex.x, vertex.y, vertex.z);
        scene.add(tEye);
        tEye.visible = false;

        eyes.push(tEye);
        randFactors.push({
            x: getRandom(-0.4, 0.4),
            y: getRandom(-0.4, 0.4)
        });
    }

    var speed = 0.02;
    var follow = false;

    this.updateEyeNum = function (eyeAmount) {
        if (eyeAmount > 0) {
            for (var i = 0; i < eyeAmount; i++) {
                eyes[i].visible = true;
            }

            for(var i=eyeAmount; i<10; i++) {
                eyes[i].visible = false;

            }
        }
    }

    this.update = function (time, positions) {

        var rotationSpeed = 1.5;
        var rotation = Math.sin(time * rotationSpeed) / 2;

        for (var i = 0; i < eyes.length; i++) {
            if (positions.length > 1) {
                // var x = mousePosition.x / 1000;
                // var y = mousePosition.y / 1000;
                // var distance = Math.sqrt( Math.pow(eyes[i].position.x - x, 2) + Math.pow(eyes[i].position.y - y, 2) );
                // eyes[i].rotation.x += (( mousePosition.y/1000 * distance ) - eyes[i].rotation.x) * 0.06
                // eyes[i].rotation.y += (( mousePosition.x/1000 * distance ) - eyes[i].rotation.y) * 0.06
                for (let j = 1; j < positions.length + 1; j++) {
                    if (i % j === 0) {
                        eyes[i].rotation.x += ((positions[j - 1].y / 1000) - eyes[i].rotation.x) * 0.06
                        eyes[i].rotation.y += ((positions[j - 1].x / 1000) - eyes[i].rotation.y) * 0.06
                    }
                }




            } else if (positions.length === 1) {
                // var x = Math.sin(time * randFactors[i].x * speed);
                // var y = Math.sin(time * randFactors[i].y * speed)
                // eyes[i].rotation.x += ((x) - eyes[i].rotation.x) * 0.006
                // eyes[i].rotation.y += ((y) - eyes[i].rotation.y) * 0.006
                eyes[i].rotation.x += ((positions[0].y / 1000) - eyes[i].rotation.x) * 0.06
                eyes[i].rotation.y += ((positions[0].x / 1000) - eyes[i].rotation.y) * 0.06
            }
        }
    }
}