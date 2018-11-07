import vad from './vad'

var audioContext;


export default function requestMic(options) {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia({
            audio: true
        }, startUserMedia, handleMicConnectError);
    } catch (e) {
        handleUserMediaError();
    }

    function handleUserMediaError() {
        console.warn('Mic input is not supported by the browser.');
    }

    function handleMicConnectError() {
        console.warn('Could not connect microphone. Possible rejected by the user or is blocked by the browser.');
    }

    function startUserMedia(stream) {
        vad(audioContext, stream, options);
    }
}