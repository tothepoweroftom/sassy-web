<template>
    <div id="container">
        <h1 id="loading" v-if="loading">Loading files.. hold on.</h1>
        <video id="video" width="640" height="480" autoplay style="z-index:12;position:absolute: left:0; top:0; width:64; height:48;"></video>
        <canvas id="canvas"></canvas>
        <div v-if="true" id="overlay">

            <h5>DEBUG</h5>
            <table style="width:100%">
                <tr>
                    Poses = {{poselength}}

                </tr>
                <tr>
                    <!-- Voice State = {{voiceState}} -->
                </tr>
            </table>
        </div>
    </div>
</template>

<script src='./main.js'>
</script>


<style>
    #container {
        width: 100vw;
        height: 100vh;
        position: fixed;
        left: 0px;
        top: 0px;
    }

    #overlay {
        z-index: 10;
        position: fixed;
        width: 200px;
        height: 200px;
        border: 1px dashed gray;
        background: rgba(255,255,255,0.4);
    }

    #canvas {
        z-index: -1;
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0px;
        top: 0px;
    }
</style>