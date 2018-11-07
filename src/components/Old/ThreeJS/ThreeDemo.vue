<template>
    <div id="container">
        <h1 id="loading" v-if="loading">Loading files.. hold on.</h1>
        <video id="video" width="640" height="480" autoplay style="display: none"></video>

        <div id="overlay">

            <h5>DEBUG</h5>
            <table style="width:100%">
                <tr>
                     Poses = {{poses.length}}

                </tr>
                <tr>
                    Voice State = {{voiceState}}
                </tr>
            </table>
        </div>
    </div>
</template>

<script src='./js/threesketch.js'>
</script>

<style>
#container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    left:0px;
    top:0px;
}
#overlay {
    z-index: 10;
    position: fixed;
    width: 200px;
    height:200px;
    border:1px dashed gray;
}
</style>
