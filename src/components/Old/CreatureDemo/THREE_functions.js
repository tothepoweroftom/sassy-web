import GLTFLoader from 'three-gltf-loader';

export default {
    createLights: function (scene, THREE) {


        let shadowLight, backLight, light;

        // light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)

        shadowLight = new THREE.DirectionalLight(0xffffff, .8);
        shadowLight.position.set(30, 30, 40);
        shadowLight.castShadow = true;
        shadowLight.shadowDarkness = .7;

        backLight = new THREE.DirectionalLight(0xffffff, .4);
        backLight.position.set(-100, 200, 50);
        backLight.shadowDarkness = .1;
        backLight.castShadow = true;

        scene.add(backLight);
        // scene.add(light);
        scene.add(shadowLight);
    },

    createFloor: function (scene, THREE) {
        let floor;
        floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500), new THREE.MeshBasicMaterial({
            color: 0xeeee00
        }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -33;
        floor.receiveShadow = true;
        scene.add(floor);
    },

    getModel: function (texture, obj, callback, THREE) {
        // instantiate a loader
        var loader = new THREE.OBJLoader();

        // load a resource
        loader.load(
            // resource URL
            obj,
            // called when resource is loaded
            callback,
            // called when loading is in progresses
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );
    },


    getGLFTModel: function (gltfPath, callback, THREE) {
        // instantiate a loader
        var loader = new GLTFLoader();

        // load a resource
        loader.load(
            // resource URL
            gltfPath,
            // called when resource is loaded
            callback,

            // called when loading has errors
            function (error) {

                console.log('An error happened', error);

            }
        );
    },

   
}