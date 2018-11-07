import * as THREE from 'three'

export default function Background(scene) {
    let backgroundGeometry = new THREE.CubeGeometry(100, 50, 10);
    let backgroundMaterial = new THREE.MeshStandardMaterial({
        color: "#000",
        roughness: 0.6,
        metalness: .8,
        shading: THREE.SmoothShading,
        side: THREE.BackSide
    });
    let background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(background);

    let speed = 0.0002;

    this.updateEyeNum = function(val) {
        
    }

    this.update = function (time, positions, activityLevel) {
        if (positions.length > 1) {
            background.rotation.x += ((positions[0].y / 1000) - background.rotation.x) * 0.0009
            background.rotation.y += ((positions[0].x / 1000) - background.rotation.y) * 0.0009
        }

        // background.material.opacity = THREE.Math.mapLinear(activityLevel, ,1.0);
    }
}