<template>
  <div id="wrapper">
    <div class='sketch' id="sketch"></div>
    <video id="video" width="1280" height="720" autoplay style="display: none"></video>
  </div>
</template>

<script>
/* ===
ml5 Example
PoseNet using p5.js
=== */
/* eslint-disable */

  import p5 from 'p5'
  import sketch from './js/posenetp5'

  export default {
    name: 'landing-page',
    components: {},
    methods: {},
    data () {
      return {
        myp5: null
      }
    },
    mounted () {
      this.myp5 = new p5(sketch, document.getElementById('sketch'))
    },
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    width: 100vw;
  }

  #sketch {

    width:1280px;
    height:720px;
  }

</style>
