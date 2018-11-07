import * as THREE from 'three'

export default function User(scene) {
    let backgroundGeometry = new THREE.SphereGeometry(1, 32, 32 );
    let backgroundMaterial = new THREE.MeshStandardMaterial({ color: "#000", roughness: 0.9, metalness: .91, shading: THREE.flatShading, side: THREE.BackSide });
    let user = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(user);

    let speed = 0.0002;
    
    this.update = function(time, position) {

        // background.rotation.x += speed;
        // background.rotation.y += speed;
        // background.rotation.z += speed;
        user.position.set(position);
    }
}